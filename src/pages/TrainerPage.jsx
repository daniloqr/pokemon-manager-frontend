// TrainerPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PokemonCard from '../components/PokemonCard';
import Modal from 'react-modal'; // Usando uma biblioteca de Modal
import DeletePokemonModal from '../components/DeletePokemonModal';
// import PokemonSheet from '../components/PokemonSheet'; // Descomente se tiver este componente
import './TrainerPage.css';

// Configuração da URL da API a partir de variáveis de ambiente
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Configura o elemento raiz para o Modal (melhora a acessibilidade)
Modal.setAppElement('#root');

const TrainerPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pokemonToDelete, setPokemonToDelete] = useState(null); // Guarda o objeto do pokémon para exclusão

  // Busca os dados do treinador e sua equipe
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trainerRes, pokemonsRes] = await Promise.all([
          axios.get(`${API_URL}/user/${id}`),
          axios.get(`${API_URL}/trainer/${id}/pokemons`)
        ]);
        setTrainerInfo(trainerRes.data);
        setPokemonTeam(pokemonsRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados do treinador:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_URL]);

  // Lida com o depósito de um Pokémon
  const handleDepositPokemon = async (pokemonId, pokemonName) => {
    const isConfirmed = window.confirm(`Tem certeza que deseja depositar ${pokemonName}?`);
    if (!isConfirmed) return;

    try {
      await axios.put(`${API_URL}/pokemon/${pokemonId}/deposit`);
      setPokemonTeam(currentTeam => currentTeam.filter(p => p.id !== pokemonId));
      alert(`${pokemonName} foi enviado para o depósito.`);
    } catch (error) {
      console.error("Erro ao depositar o Pokémon:", error);
      alert(error.response?.data?.message || 'Erro ao depositar o Pokémon.');
    }
  };

  // Atualiza a lista quando um pokémon é editado no PokemonCard
  const handlePokemonUpdate = (updatedPokemon) => {
    setPokemonTeam(currentTeam =>
      currentTeam.map(p => (p.id === updatedPokemon.id ? updatedPokemon : p))
    );
  };

  // --- LÓGICA DE EXCLUSÃO ---

  // 1. Abre o modal de confirmação
  const handleOpenDeleteModal = (pokemon) => {
    setPokemonToDelete(pokemon);
  };
  
  // 2. Fecha o modal
  const handleCloseDeleteModal = () => {
    setPokemonToDelete(null);
  };

  // 3. Confirma e executa a exclusão
  const handleConfirmDelete = async (reason) => {
    if (!pokemonToDelete) return;

    console.log(`Excluindo ${pokemonToDelete.name} pelo motivo: ${reason}`);
    try {
      // **AQUI ESTÁ A LÓGICA CORRIGIDA**
      const response = await axios.delete(`${API_URL}/pokemon/${pokemonToDelete.id}`);
      
      // Usa o ID retornado pelo backend para garantir que o pokémon correto seja removido da tela
      const { deletedPokemonId } = response.data;
      
      setPokemonTeam(currentTeam => currentTeam.filter(p => p.id !== parseInt(deletedPokemonId)));
      
      alert(`${pokemonToDelete.name} foi liberado com sucesso!`);
    
    } catch (error) {
      console.error('Erro ao excluir o Pokémon:', error);
      alert(error.response?.data?.message || 'Erro ao excluir o Pokémon.');
    } finally {
      handleCloseDeleteModal(); // Fecha o modal após a tentativa
    }
  };

  if (loading) return <div className="loading-message">Carregando...</div>;
  if (!trainerInfo) return <div className="error-message">Treinador não encontrado.</div>;

  // Verifica as permissões do usuário logado
  const isOwner = user && user.id === parseInt(id);
  const isMaster = user && user.tipo_usuario === 'M';
  const canManageTeam = isOwner || isMaster;
  const canAddPokemon = pokemonTeam.length < 6;

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="trainer-page-container">
        <header className="trainer-header">
          <div className="trainer-header-avatar" style={{ backgroundImage: `url(${trainerInfo.image_url})` }}></div>
          <h1 className="trainer-header-name">{trainerInfo.username}</h1>
        </header>

        <main className="pokemon-section">
          <h2>Equipe de Pokémon</h2>
          {pokemonTeam.length > 0 ? (
            <div className="pokemon-grid">
              {pokemonTeam.map(pokemon => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  currentUser={user}
                  trainerId={trainerInfo.id}
                  onDeposit={handleDepositPokemon}
                  onUpdate={handlePokemonUpdate}
                  onDelete={handleOpenDeleteModal} // A prop onDelete agora só abre o modal
                />
              ))}
            </div>
          ) : (
            <div className="pokemon-list-placeholder">
              <p>Nenhum Pokémon na equipe.</p>
            </div>
          )}

          {canManageTeam && canAddPokemon && (
            <div className="add-more-container">
              <Link to={`/trainer/${id}/add-pokemon`} className="add-pokemon-button">Adicionar Novo Pokémon</Link>
            </div>
          )}
        </main>
      </div>

      {/* O Modal de exclusão, que é controlado pelo estado 'pokemonToDelete' */}
      <Modal
        isOpen={!!pokemonToDelete}
        onRequestClose={handleCloseDeleteModal}
        className="modal" // Classe para estilizar o conteúdo do modal
        overlayClassName="overlay" // Classe para estilizar o fundo
      >
 {pokemonToDelete && (
 <DeletePokemonModal
 pokemonName={pokemonToDelete.name}
 onClose={handleCloseDeleteModal}
 onConfirm={handleConfirmDelete}
/>
)}
 </Modal>
 </>
 );
};

export default TrainerPage;
