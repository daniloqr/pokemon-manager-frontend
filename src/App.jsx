import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importação de todas as páginas da aplicação

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterTrainer from './pages/RegisterTrainer';
import EditTrainer from './pages/EditTrainer';
import TrainerPage from './pages/TrainerPage';
import AddPokemonPage from './pages/AddPokemonPage';
import FichaTreinador from './pages/FichaTreinador';
import Deposito from './pages/Deposito';
import Pokedex from './pages/Pokedex';
import Mochila from './pages/Mochila';
import Auditoria from './pages/Auditoria';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) { setUser(JSON.parse(storedUser)); }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Opcional: Redirecionamento forçado para login após logout
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/register-trainer" element={ user?.tipo_usuario === 'M' ? <RegisterTrainer user={user} onLogout={handleLogout} /> : <Navigate to="/" /> } />
          <Route path="/edit-trainer/:id" element={ user ? <EditTrainer user={user} onLogout={handleLogout} /> : <Navigate to="/login" /> } />
          <Route path="/trainer/:id" element={ user ? <TrainerPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" /> } />
          <Route path="/trainer/:id/add-pokemon" element={  user ? <AddPokemonPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" /> } />
          <Route path="/trainer/:id/ficha" element={ user ? <FichaTreinador user={user} onLogout={handleLogout} /> : <Navigate to="/login" /> } />
          <Route path="/deposito" element={ user ? <Deposito user={user} onLogout={handleLogout} /> : <Navigate to="/login" /> } />
          <Route path="/pokedex" element={ user?.tipo_usuario === 'T' ? <Pokedex user={user} onLogout={handleLogout} /> : <Navigate to="/" /> } />
          <Route path="/mochila" element={ user?.tipo_usuario === 'T' ? <Mochila user={user} onLogout={handleLogout} /> : <Navigate to="/" /> } />
          <Route path="/auditoria" element={ user?.tipo_usuario === 'M' ? <Auditoria user={user} onLogout={handleLogout} /> : <Navigate to="/" /> } />
          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
    
  );
  <ToastContainer position="top-right" autoClose={2000} theme="dark" />
}

export default App;
