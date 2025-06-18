import React from 'react';
import { Link, useNavigate, useMatch } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const match = useMatch('/trainer/:id');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">PokéManager</Link>
      </div>
      <div className="navbar-links">
        {user && <span className="welcome-message">Bem-vindo, {user.username}!</span>}
        
        {user && (<Link to="/deposito">Depósito</Link>)}

        {/* O link da Pokédex agora só aparece para Treinadores */}
        {user?.tipo_usuario === 'T' && (
          <Link to="/pokedex">Pokédex</Link>
        )}

        {match && (
          <Link to={`/trainer/${match.params.id}/ficha`}>Ficha do Treinador</Link>
        )}
        
        {user?.tipo_usuario === 'M' && (
          <Link to="/register-trainer">Cadastrar Treinador</Link>
        )}
        
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </div>
    </nav>
  );
};

export default Navbar;