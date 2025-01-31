// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');  // Pour MySQL
// OU
const { Pool } = require('pg');  // Pour PostgreSQL

const app = express();
app.use(cors());
app.use(express.json());

// Configuration MySQL
const mysqlConfig = {
    host: process.env.DB_HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DB_NAME
};

// Configuration PostgreSQL
const postgresConfig = {
    host: process.env.DB_HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: 'notes',
    port: 5432
};

// Choix du type de base de données (décommentez celui que vous utilisez)
//const db = mysql.createPool(mysqlConfig);
const db = new Pool(postgresConfig);

// Route pour enregistrer une note
app.post('/api/notes', async (req, res) => {
    const { nomEleve, matiere, note, commentaire } = req.body;

    try {
        // Pour MySQL
        /* const [result] = await db.execute(
            'INSERT INTO notes (nom_eleve, matiere, note, commentaire) VALUES (?, ?, ?, ?)',
            [nomEleve, matiere, note, commentaire]
        ); */

        // Pour PostgreSQL
        const result = await db.query(
            'INSERT INTO notes (nom_eleve, matiere, note, commentaire) VALUES ($1, $2, $3, $4) RETURNING id',
            [nomEleve, matiere, note, commentaire]
        );

        res.status(201).json({
            message: 'Note enregistrée avec succès',
            //id: result.insertId // Pour MySQL
            id: result.rows[0].id // Pour PostgreSQL
        });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la note' });
    }
});

// Route pour récupérer toutes les notes
app.get('/api/notes', async (req, res) => {
    try {
        // Pour MySQL
        const [rows] = await db.query('SELECT * FROM notes ORDER BY date_creation DESC');

        // Pour PostgreSQL
        // const { rows } = await db.query('SELECT * FROM notes ORDER BY date_creation DESC');

        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des notes' });
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});