const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

env = require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'notes_scolaire',
});

const JWT_SECRET = process.env.JWT_SECRET;

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
            'INSERT INTO teachers (login, password, nom_complet) VALUES (?, ?, ?)',
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
        const [rows] = await db.query('SELECT * FROM teachers WHERE login = ?', [login]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const teacher = rows[0];
        const validPassword = await bcrypt.compare(password, teacher.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const token = jwt.sign({ id: teacher.id, login: teacher.login }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, teacher: { id: teacher.id, login: teacher.login, nom_complet: teacher.nom_complet } });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

// Routes pour récupérer les données
app.get('/api/students/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM students WHERE classe_id = ?', [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des élèves:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des élèves' });
    }
});

app.get('/api/classes', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM classe ORDER BY libelle ASC');
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des classes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des classes' });
    }
});

app.get('/api/matieres', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM matiere ORDER BY libelle ASC');
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des matières:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des matières' });
    }
});

app.get('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM notes WHERE matiere_id = ?', [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des notes' });
    }
});

// Routes pour la gestion des notes
app.post('/api/notes', authenticateToken, async (req, res) => {
    const { eleve, matiere, note } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO notes (student_id, matiere_id, note) VALUES (?, ?, ?)',
            [eleve, matiere, note]
        );
        res.status(201).json({ message: 'Note ajoutée avec succès', id: result.insertId });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la note:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la note' });
    }
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { eleve, matiere, note } = req.body;

    try {
        await db.query(
            'UPDATE notes SET student_id = ?, matiere_id = ?, note = ? WHERE id = ?',
            [eleve, matiere, note, id]
        );
        res.json({ message: 'Note modifiée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la modification de la note:', error);
        res.status(500).json({ message: 'Erreur lors de la modification de la note' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
