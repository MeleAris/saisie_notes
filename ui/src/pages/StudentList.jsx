import { PlusIcon, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/StudentList.css';

const StudentList = () => {
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [note, setNote] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/students/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error('Erreur lors de la récupération des données');
                const data = await response.json();
                setStudents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        const fetchNotes = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/notes/${localStorage.getItem('subject')}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error('Erreur lors de la récupération des données');
                const data = await response.json();

                setNotes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
        fetchNotes();
    }, [id]);

    const filteredStudents = students.filter(student =>
        student.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    const handleSaveNote = async () => {
        if (!note.trim()) {
            alert("Veuillez entrer une note valide.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eleve: selectedStudent.id,
                    matiere: localStorage.getItem('subject'),
                    note: note
                })
            });

            if (!response.ok) throw new Error('Erreur lors de l\'enregistrement de la note');

            setShowModal(false);
            setNote('');
            window.location.reload();
        } catch (err) {
            alert(err.message);
        }
    };

    let maxN = 0;

    const studentsInClass = students.filter(s => s.classe_id === parseInt(id)).map(e => e.id);

    // Compter le nombre de notes pour chaque étudiant
    const countNotesPerStudent = notes.reduce((acc, { student_id }) => {
        if (studentsInClass.includes(student_id)) {
            acc[student_id] = (acc[student_id] || 0) + 1;
        }
        return acc;
    }, {});

    const studentIds = Object.keys(countNotesPerStudent);
    if (studentIds.length > 0) {
        const maxNotesStudentId = studentIds.reduce((maxId, studentId) => {
            return countNotesPerStudent[studentId] > countNotesPerStudent[maxId] ? studentId : maxId;
        });
        maxN = countNotesPerStudent[maxNotesStudentId];
    }

    //Grouper les notes par étudiant
    const notesByStudent = notes.reduce((acc, note) => {
        if (!acc[note.student_id]) {
            acc[note.student_id] = [];
        }
        acc[note.student_id].push(note);
        return acc;
    }, {});


    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">Une erreur est survenue : {error}</div>;

    return (
        <div className="student-list-container">
            <div className="student-header">
                <h1>Liste des élèves [{localStorage.getItem('classe')}]</h1>
                <h2>Notes de {localStorage.getItem('subjectName')}</h2>
                <div className="search-add-container">
                    <div className="search-bar">
                        <Search className="icon" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un élève..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Nom et prénoms</th>
                            {Array.from({ length: maxN }, (_, i) => (
                                <th key={i}>Note {i + 1}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td>{student.nom_prenom}</td>
                                {Array.from({ length: maxN }, (_, i) => (
                                    <td key={i}>
                                        {notesByStudent[student.id] && notesByStudent[student.id][i] ? notesByStudent[student.id][i].note : '-'}
                                    </td>
                                ))}
                                <td className="actions">
                                    <button onClick={() => handleOpenModal(student)} className="view-btn">
                                        <PlusIcon size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && selectedStudent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Ajouter une note pour {selectedStudent.nom_prenom}</h2>
                        <input
                            type="number"
                            placeholder="Entrer la note"
                            value={note}
                            min={0}
                            max={20}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button onClick={handleSaveNote} className="save-btn">Enregistrer</button>
                            <button onClick={() => setShowModal(false)} className="close-btn">Annuler</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StudentList;
