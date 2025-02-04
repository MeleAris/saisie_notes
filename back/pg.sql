CREATE DATABASE notes_scolaire;
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom_complet VARCHAR(100),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE matiere (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE classe (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE enseignement (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id),
    classe_id INTEGER REFERENCES classe(id),
    matiere_id INTEGER REFERENCES matiere(id),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    code_eleve VARCHAR(10) UNIQUE NOT NULL,
    nom_prenom VARCHAR(100) NOT NULL,
    classe_id INTEGER REFERENCES classe(id),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    matiere_id INTEGER REFERENCES matiere(id),
    note_classe NUMERIC(4, 2) CHECK (note_classe <= 20.00),
    note_devoir NUMERIC(4, 2) CHECK (note_devoir <= 20.00),
    note_compo NUMERIC(4, 2) CHECK (note_compo <= 20.00),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, matiere_id)
);

-- Ajouter les nouvelles colonnes
ALTER TABLE notes
ADD COLUMN note_classe NUMERIC(4, 2) CHECK (note_classe <= 20.00),
ADD COLUMN note_devoir NUMERIC(4, 2) CHECK (note_devoir <= 20.00),
ADD COLUMN note_compo NUMERIC(4, 2) CHECK (note_compo <= 20.00);

-- Supprimer l'ancienne colonne
ALTER TABLE notes
DROP COLUMN note;

-- Ajouter la contrainte d'unicité sur les colonnes student_id et matiere_id
ALTER TABLE notes
ADD CONSTRAINT unique_student_matiere UNIQUE (student_id, matiere_id);