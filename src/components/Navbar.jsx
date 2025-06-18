import React from 'react';
import { Link, useNavigate, useMatch } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const matchTreinador = useMatch('/trainer/:id');

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
        {user && (
          <>
            <span className="welcome-message">Bem-vindo, {user.username}!</span>
            <Link to="/deposito">Depósito</Link>
            {/* Se todos podem ver a Pokédex, deixe assim: */}
            <Link to="/pokedex">Pokédex</Link>
            {/* Se só treinadores veem Mochila */}
            {user.tipo_usuario === 'T' && 
            <Link to="/mochila">Mochila</Link>
            }
            {user.tipo_usuario === 'M' && (
              <>
                <Link to="/register-trainer">Cadastrar Treinador</Link>
                <Link to="/auditoria">Auditoria</Link>
              </>
            )}
            {matchTreinador && (
              <Link to={`/trainer/${matchTreinador.params.id}/ficha`}>Ficha do Treinador</Link>
            )}
            <button onClick={handleLogout} className="logout-button">Sair</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
