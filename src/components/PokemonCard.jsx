import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PokemonCard.css';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const PokemonCard = ({ pokemon, currentUser, trainerId, onDeposit, onUpdate, onWithdraw, onDelete, isPokedexView = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    setEditData({
      level: pokemon.level ?? 1,
      xp: pokemon.xp ?? 0,
      max_hp: pokemon.max_hp ?? 10,
      current_hp: pokemon.current_hp ?? 10,
    });
  }, [pokemon]);

  const canManage = currentUser && trainerId && (currentUser.tipo_usuario === 'M' || currentUser.id === trainerId);
  
  const handleSaveClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`${apiUrl}/pokemon-stats/${pokemon.id}`, editData);
      if (onUpdate) {
        onUpdate(res.data.pokemon);
      }
      setIsEditing(false);
    } catch (error) {
      alert('Erro ao salvar os stats do Pokémon.');
      console.error(error);
    }
  };
  
  // ... (outras funções handle... do componente)

  return (
    <div className="pokemon-card">
      {/* ... (código JSX do card) ... */}
    </div>
  );
};

export default PokemonCard;