CREATE DATABASE notes_scolaires;

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    nom_eleve VARCHAR(100) NOT NULL,
    matiere VARCHAR(50) NOT NULL,
    note NUMERIC(4,2) NOT NULL,
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);