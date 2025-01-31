CREATE DATABASE notes_scolaires;
USE notes_scolaires;

CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_eleve VARCHAR(100) NOT NULL,
    matiere VARCHAR(50) NOT NULL,
    note DECIMAL(4,2) NOT NULL,
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);