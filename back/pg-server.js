const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration PostgreSQL
const postgresConfig = {
    host: process.env.DB_HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: 'notes_scolaire',
    port: 5432
};

const db = new Pool(postgresConfig);

const JWT_SECRET = '7e980435dedb7f49bd1949dd9315d67aa0b2e333fff25e0e3f09400110e817d51eeb1e1348003f002c00acf56e4f6c2ec8d920c9eb7225fb724c353bd9970cbe';

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, JWT_SECRET, (err, teacher) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.teacher = teacher;
        next();
    });
};

// Route d'inscription
app.post('/api/register', async (req, res) => {
    const { login, password, nom_complet } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO teachers (login, password, nom_complet) VALUES ($1, $2, $3)',
            [login, hashedPassword, nom_complet]
        );

        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
});

// Route de connexion
app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;

    try {
        const result = await db.query(
            'SELECT * FROM teachers WHERE login = $1',
            [login]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const teacher = result.rows[0];
        const validPassword = await bcrypt.compare(password, teacher.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const token = jwt.sign(
            { id: teacher.id, login: teacher.login },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            teacher: {
                id: teacher.id,
                login: teacher.login,
                nom_complet: teacher.nom_complet
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

// Route pour récupérer tous les eleves d'une classe
app.get('/api/students/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM students WHERE classe_id = $1', [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des eleves:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des eleves' });
    }
});

//Pour récupérer les classes
app.get('/api/classes', authenticateToken, async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM classe ORDER BY libelle ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des élèves' });
    }
});

//Pour récupérer les matières
app.get('/api/matieres', authenticateToken, async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM matiere ORDER BY libelle ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des matières:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des matières' });
    }
});

//Pour récupérer les données de l'enseignement
app.get('/api/enseignement', authenticateToken, async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM enseignement'
        );
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des données' });
    }
});

//Pour récupérer les données de l'enseignement
app.get('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM notes WHERE matiere_id = $1', [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des données' });
    }
});

// Route pour ajouter une note
app.post('/api/notes', authenticateToken, async (req, res) => {
    const { eleve, matiere, note_classe, note_devoir, note_compo } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO notes (student_id, matiere_id, note_classe, note_devoir, note_compo) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [eleve, matiere, note_classe, note_devoir, note_compo]
        );

        res.status(201).json({
            message: 'Notes ajoutées avec succès',
            id: result.rows[0].id
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la note:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la note' });
    }
});

// Route pour modifier une note
app.put('/api/notes', authenticateToken, async (req, res) => {
    const { id, eleve, matiere, note_classe, note_devoir, note_compo } = req.body;

    try {
        await db.query(
            'UPDATE notes SET student_id = $1, matiere_id = $2, note_classe = $3, note_devoir = $4, note_compo = $5 WHERE id = $6',
            [eleve, matiere, note_classe, note_devoir, note_compo, id]
        );

        res.json({ message: 'Notes modifiées avec succès' });
    } catch (error) {
        console.error('Erreur lors de la modification des notes:', error);
        res.status(500).json({ message: 'Erreur lors de la modification des notes' });
    }
});

const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});