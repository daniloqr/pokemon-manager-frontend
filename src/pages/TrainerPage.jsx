import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PokemonCard from '../components/PokemonCard';
import Modal from '../components/Modal';

// DND-KIT IMPORTS:
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './TrainerPage.css';

function SortablePokemon({ pokemon, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: pokemon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    minWidth: 250,
    maxWidth: 300,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PokemonCard {...props} pokemon={pokemon} />
    </div>
  );
}

const TrainerPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const [trainerInfo, setTrainerInfo] = useState(null);
  const [pokemonTeam, setPokemonTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPokemon, setEditingPokemon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Remove da lista se foi deletado, atualiza se só editou
  const handlePokemonUpdate = (updatedPokemon) => {
    if (updatedPokemon.deleted) {
      setPokemonTeam(currentTeam => currentTeam.filter(p => p.id !== updatedPokemon.id));
    } else {
      setPokemonTeam(currentTeam =>
        currentTeam.map(p => (p.id === updatedPokemon.id ? updatedPokemon : p))
      );
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

  // DnD-kit setup
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = pokemonTeam.findIndex(p => p.id === active.id);
      const newIndex = pokemonTeam.findIndex(p => p.id === over.id);
      setPokemonTeam((pokemons) => arrayMove(pokemons, oldIndex, newIndex));
      // Aqui, se quiser, envie para o backend a nova ordem
    }
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pokemonTeam.map(p => p.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="pokemon-grid" style={{ display: 'flex', gap: '16px', minHeight: 300 }}>
                  {pokemonTeam.map((pokemon) => (
                    <SortablePokemon
                      key={pokemon.id}
                      pokemon={pokemon}
                      currentUser={user}
                      trainerId={trainerInfo.id}
                      onDeposit={handleDepositPokemon}
                      onUpdate={handlePokemonUpdate}
                      onEdit={() => handleOpenEditModal(pokemon)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
    </>
  );
};

export default TrainerPage;
