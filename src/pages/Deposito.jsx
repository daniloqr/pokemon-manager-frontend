import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PokemonCard from '../components/PokemonCard';
import './Deposito.css';
import './TrainerPage.css';

const Deposito = ({ user, onLogout }) => {
  const [allTrainers, setAllTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [depositedPokemons, setDepositedPokemons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define a URL base da API a partir da variável de ambiente Vite
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    if (user.tipo_usuario === 'M') {
      axios.get(`${API_URL}/users/${user.id}`)
        .then(response => {
          setAllTrainers(response.data);
          setLoading(false);
        })
        .catch(error => { setLoading(false); });
    } else if (user.tipo_usuario === 'T') {
      axios.get(`${API_URL}/deposito/${user.id}`)
        .then(response => {
          setDepositedPokemons(response.data);
          setLoading(false);
        })
        .catch(error => { setLoading(false); });
    }
  }, [user, API_URL]);

  const handleTrainerSelect = (trainer) => {
    setSelectedTrainer(trainer);
    setLoading(true);
    setDepositedPokemons([]);
    axios.get(`${API_URL}/deposito/${trainer.id}`)
      .then(response => { setDepositedPokemons(response.data); })
      .catch(error => { alert('Não foi possível carregar o depósito deste treinador.'); })
      .finally(() => { setLoading(false); });
  };

  const handleWithdrawPokemon = async (pokemonId, pokemonName) => {
    try {
      const response = await axios.put(`${API_URL}/pokemon/${pokemonId}/withdraw`);
      setDepositedPokemons(currentPokemons => currentPokemons.filter(p => p.id !== pokemonId));
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Ocorreu um erro.');
    }
  };

  const renderMasterView = () => (
    <div className="deposito-layout">
      <aside className="trainer-list-sidebar">
        <h3>Treinadores</h3>
        <ul>
          {allTrainers.map(trainer => (
            <li key={trainer.id}>
              <button onClick={() => handleTrainerSelect(trainer)} className={selectedTrainer?.id === trainer.id ? 'active' : ''}>
                {trainer.username}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="pokemon-box-main">
        {loading ? ( <p className="pokemon-box-placeholder">Carregando...</p> ) : 
        selectedTrainer ? (
          depositedPokemons.length > 0 ? (
            <div className="pokemon-grid">
              {depositedPokemons.map(pokemon => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} currentUser={user} trainerId={selectedTrainer.id} onWithdraw={handleWithdrawPokemon} />
              ))}
            </div>
          ) : ( <p className="pokemon-box-placeholder">O depósito de {selectedTrainer.username} está vazio.</p> )
        ) : ( <p className="pokemon-box-placeholder">Selecione um treinador para ver seu depósito.</p> )}
      </main>
    </div>
  );

  const renderTrainerView = () => (
     <main className="pokemon-section" style={{paddingTop: '20px'}}>
      {loading ? ( <p style={{ color: 'white', textAlign: 'center' }}>Carregando depósito...</p> ) : (
        depositedPokemons.length > 0 ? (
          <div className="pokemon-grid">
            {depositedPokemons.map(pokemon => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} currentUser={user} trainerId={user.id} onWithdraw={handleWithdrawPokemon} />
            ))}
          </div>
        ) : ( <div className="pokemon-list-placeholder"><p>Seu depósito está vazio.</p></div> )
      )}
    </main>
  );

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="page-container">
        <h1 className="deposito-title">
          {user?.tipo_usuario === 'M' ? 'PC Central de Depósitos' : 'Meu Depósito'}
        </h1>
        {user && (user.tipo_usuario === 'M' ? renderMasterView() : renderTrainerView())}
      </div>
    </>
  );
};

export default Deposito;
