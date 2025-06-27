// TrainerPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; // Usando a versão compatível com React 18
import Navbar from '../components/Navbar';
import PokemonCard from '../components/PokemonCard';
import Modal from 'react-modal';
import DeletePokemonModal from '../components/DeletePokemonModal';
import './TrainerPage.css'; // O CSS correspondente está abaixo

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
Modal.setAppElement('#root');

// --- Componente para o Painel de Informações do Treinador ---
const TrainerInfoPanel = ({ trainerInfo, trainerSheet }) => (
  <aside className="trainer-info-panel">
    <div className="trainer-header-avatar" style={{ backgroundImage: `url(${trainerInfo.image_url})` }} />
    <h1 className="trainer-header-name">{trainerInfo.username}</h1>
    {trainerSheet && (
      <div className="trainer-stats">
        <p><strong>Nível:</strong> {trainerSheet.level || 'N/A'}</p>
        <p><strong>Cidade:</strong> {trainerSheet.cidade || 'N/A'}</p>
        <p><strong>Região:</strong> {trainerSheet.regiao || 'N/A'}</p>
      </div>
    )}
    <div className="trainer-actions">
      <Link to={`/deposito/${trainerInfo.id}`} className="action-button">Ver Depósito</Link>
      <Link to={`/mochila/${trainerInfo.id}`} className="action-button">Ver Mochila</Link>
      <Link to={`/pokedex/${trainerInfo.id}`} className="action-button">Ver Pokédex</Link>
    </div>
  </aside>
);

// --- Componente Principal da Página ---
const TrainerPage = ({ user, onLogout = () => {} }) => {
  const { id } = useParams();
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [trainerSheet, setTrainerSheet] = useState(null); // Novo estado para a ficha
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingPokemon, setDeletingPokemon] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Agora busca a ficha do treinador junto com as outras informações
        const [trainerRes, pokemonsRes, sheetRes] = await Promise.all([
          axios.get(`${API_URL}/user/${id}`),
          axios.get(`${API_URL}/trainer/${id}/pokemons`),
          axios.get(`${API_URL}/ficha/${id}`).catch(() => ({ data: null })) // Evita quebrar se a ficha não existir
        ]);
        setTrainerInfo(trainerRes.data);
        setPokemonTeam(pokemonsRes.data);
        setTrainerSheet(sheetRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_URL]);

  const handlePokemonUpdate = (updatedPokemon) => {
    setPokemonTeam(currentTeam =>
      currentTeam.map(p => (p.id === updatedPokemon.id ? updatedPokemon : p))
    );
  };
  
  const handleOpenDeleteModal = (pokemon) => setDeletingPokemon(pokemon);
  const handleCloseDeleteModal = () => setDeletingPokemon(null);

  const handleConfirmDelete = async (reason) => {
    if (!deletingPokemon || !reason.trim()) return alert("O motivo é obrigatório.");
    try {
      const response = await axios.delete(`${API_URL}/pokemon/${deletingPokemon.id}`);
      setPokemonTeam(team => team.filter(p => p.id !== parseInt(response.data.deletedPokemonId)));
      alert(`${deletingPokemon.name} foi liberado!`);
    } catch (error) {
      alert('Erro ao excluir o Pokémon.');
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(pokemonTeam);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setPokemonTeam(reordered);
  };

  if (loading) return <div className="loading-message">Carregando...</div>;
  if (!trainerInfo) return <div className="error-message">Treinador não encontrado.</div>;

  const canManageTeam = user && (user.id === parseInt(id) || user.tipo_usuario === 'M');
  const canAddPokemon = pokemonTeam.length < 6;

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="trainer-page-layout">
        <TrainerInfoPanel trainerInfo={trainerInfo} trainerSheet={trainerSheet} />
        
        <main className="pokemon-section">
          <header className="pokemon-section-header">
            <h2>Equipe de Pokémon</h2>
            {canManageTeam && canAddPokemon && (
              <Link to={`/trainer/${id}/add-pokemon`} className="add-pokemon-button">Adicionar Pokémon</Link>
            )}
          </header>
          
          {pokemonTeam.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pokemon-team">
                {(provided) => (
                  <div className="pokemon-grid" ref={provided.innerRef} {...provided.droppableProps}>
                    {pokemonTeam.map((pokemon, index) => (
                      <Draggable key={pokemon.id} draggableId={String(pokemon.id)} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <PokemonCard
                              pokemon={pokemon}
                              currentUser={user}
                              trainerId={trainerInfo.id}
                              onUpdate={handlePokemonUpdate}
                              onDelete={handleOpenDeleteModal}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="pokemon-list-placeholder">
              <p>Nenhum Pokémon na equipe.</p>
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={!!deletingPokemon} onRequestClose={handleCloseDeleteModal} className="modal" overlayClassName="overlay">
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
