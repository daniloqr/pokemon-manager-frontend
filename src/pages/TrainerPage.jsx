import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PokemonCard from '../components/PokemonCard';
import Modal from '../components/Modal';
import DeletePokemonModal from '../components/DeletePokemonModal';
import './TrainerPage.css';

const TrainerPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPokemon, setEditingPokemon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingPokemon, setDeletingPokemon] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  
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
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_URL]);

  const handleDepositPokemon = async (pokemonId, pokemonName) => {
    const isConfirmed = window.confirm(`Tem certeza que deseja depositar ${pokemonName}?`);
    if (!isConfirmed) return;
    try {
      await axios.put(`${API_URL}/pokemon/${pokemonId}/deposit`);
      setPokemonTeam(currentTeam => currentTeam.filter(p => p.id !== pokemonId));
      alert(`${pokemonName} foi enviado para o depósito.`);
    } catch (error) {
      alert('Erro ao depositar o Pokémon.');
    }
  };

  const handlePokemonUpdate = (updatedPokemon) => {
    setPokemonTeam(currentTeam =>
      currentTeam.map(p => (p.id === updatedPokemon.id ? updatedPokemon : p))
    );
  };

  const handleOpenDeleteModal = (pokemon) => {
    console.log("Abrindo modal de exclusão:", pokemon);
    setDeletingPokemon(pokemon);
  };
  
  const handleCloseDeleteModal = () => {
    setDeletingPokemon(null);
  };

  const handleConfirmDelete = async (reason) => {
    if (!deletingPokemon) return;
    console.log(`Excluindo ${deletingPokemon.name} pelo motivo: ${reason}`);
    try {
      await axios.delete(`${API_URL}/pokemon/${deletingPokemon.id}`);
      setPokemonTeam(currentTeam => currentTeam.filter(p => p.id !== deletingPokemon.id));
      alert(`${deletingPokemon.name} foi excluído com sucesso!`);
      handleCloseDeleteModal();
    } catch (error) {
      alert('Erro ao excluir o Pokémon.');
    }
  };

  const handleOpenEditModal = (pokemon) => {
    setEditingPokemon(pokemon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPokemon(null);
  };

  if (loading) return <p style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Carregando...</p>;
  if (!trainerInfo) return <p style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Treinador não encontrado.</p>;

  const isOwner = user.id === parseInt(id);
  const isMaster = user.tipo_usuario === 'M';
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
                  onDelete={handleOpenDeleteModal} 
                  onEdit={() => handleOpenEditModal(pokemon)}
                />
              ))}
            </div>
          ) : (
            <div className="pokemon-list-placeholder">
              <p>Nenhum Pokémon cadastrado na equipe.</p>
              {canManageTeam && <Link to={`/trainer/${id}/add-pokemon`} className="add-pokemon-button">Adicionar Pokémon</Link>}
            </div>
          )}

          {pokemonTeam.length > 0 && canManageTeam && canAddPokemon && (
            <div className="add-more-container">
              <Link to={`/trainer/${id}/add-pokemon`} className="add-pokemon-button">Adicionar Novo Pokémon</Link>
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {editingPokemon && (
          <PokemonSheet pokemon={editingPokemon} onClose={handleCloseModal} />
        )}
      </Modal>

      <Modal isOpen={!!deletingPokemon} onClose={handleCloseDeleteModal}>
        {deletingPokemon && (
          <DeletePokemonModal
            pokemonName={deletingPokemon.name}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
          />
        )}
      </Modal>
    </>
  );
};

export default TrainerPage;
