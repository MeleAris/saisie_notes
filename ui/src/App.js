import React, { useContext } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthContext } from './context/authContext';

import { NotFound, ServerError } from './pages/Error';
import Form from './pages/Form';
import Login from './pages/Login';

import ClasseList from './pages/ClassList';
import StudentList from './pages/StudentList';
import './styles/App.css';

const App = () => {
  const { token } = useContext(AuthContext)

  const RequireAuth = ({ children }) => {
    return token ? (children) : <Navigate to={'/login'} />
  }

  return (
    <Router basename='/'>
      <Routes>
        <Route exact path='/login' element={<Login />} />
        <Route exact path='/' element={<RequireAuth children={<ClasseList />} />} />
        <Route exact path='/students/:id' element={<RequireAuth children={<StudentList />} />} />
        <Route exact path='/saisie' element={<RequireAuth children={<Form />} />} />

        <Route exact path='/*' element={<NotFound />} />
        <Route exact path='/error' element={<ServerError />} />
      </Routes>
    </Router>
  );
};

export default App;