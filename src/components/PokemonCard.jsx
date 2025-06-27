import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBar from '../components/StatusBar'; // ajuste o caminho se necessário
import { toast } from 'react-toastify';
import './PokemonCard.css';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const PokemonCard = ({
  pokemon,
  currentUser,
  trainerId,
  onDeposit,
  onUpdate,
  onWithdraw,
  isPokedexView = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setEditData({
      level: pokemon.level ?? 1,
      xp: pokemon.xp ?? 0,
      max_hp: pokemon.max_hp ?? 10,
      current_hp: pokemon.current_hp ?? 10,
      especial: pokemon.especial ?? 10,
      especial_total: pokemon.especial_total ?? 10,
      vigor: pokemon.vigor ?? 10,
      vigor_total: pokemon.vigor_total ?? 10,
    });
  }, [pokemon]);

  const canManage = currentUser && trainerId && (currentUser.tipo_usuario === 'M' || currentUser.id === parseInt(trainerId));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditData({
      level: pokemon.level, xp: pokemon.xp, max_hp: pokemon.max_hp, current_hp: pokemon.current_hp,
      especial: pokemon.especial, especial_total: pokemon.especial_total, vigor: pokemon.vigor, vigor_total: pokemon.vigor_total
    });
  };

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`${apiUrl}/pokemon-stats/${pokemon.id}`, editData);
      if (onUpdate) onUpdate(res.data.pokemon);
      setIsEditing(false);
      toast.success('Status salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar os stats do Pokémon.');
    }
  };

  const handleDeposit = (e) => { e.stopPropagation(); if (onDeposit) onDeposit(pokemon.id, pokemon.name); };
  const handleWithdraw = (e) => { e.stopPropagation(); if (onWithdraw) onWithdraw(pokemon.id, pokemon.name); };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Tem certeza que deseja excluir o Pokémon "${pokemon.name}"?`);
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      await axios.delete(`${apiUrl}/pokemon/${pokemon.id}`);
      if (onUpdate) {
        onUpdate({ ...pokemon, deleted: true });
      }
      toast.success(`Pokémon "${pokemon.name}" excluído com sucesso!`);
    } catch (err) {
      toast.error('Erro ao excluir o Pokémon.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para auto-salvar campo individual ao soltar a barra (com toastify)
  const autoSave = async (key, value) => {
    setEditData(prev => ({ ...prev, [key]: value }));
    try {
      await axios.put(`${apiUrl}/pokemon-stats/${pokemon.id}`, {
        [key]: value,
      });
      // Mensagem personalizada para cada campo
      let label = '';
      if (key === 'current_hp') label = 'HP Atual';
      else if (key === 'especial') label = 'Especial';
      else if (key === 'vigor') label = 'Vigor';
      else label = key.charAt(0).toUpperCase() + key.slice(1);

      toast.success(`${label} salvo com sucesso!`);
    } catch (error) {
      toast.error(`Erro ao salvar ${key === 'current_hp' ? 'HP Atual' : key.charAt(0).toUpperCase() + key.slice(1)}!`);
    }
  };

  if (pokemon.deleted) return null;

  return (
    <div className="pokemon-card">
      <div className="pokemon-card-image" style={{ backgroundImage: `url(${pokemon.image_url})` }}></div>
      <div className="pokemon-card-info">
        <h3 className="pokemon-name">{pokemon.name}</h3>
        <p className="pokemon-details">Tipo: {pokemon.type}</p>
        {!isPokedexView && (
          isEditing ? (
            <div>
              <StatusBar
                value={editData.current_hp}
                max={editData.max_hp}
                color="#ff4a4a"
                label="HP"
                disabled={false}
                onChange={(e, newValue) =>
                  setEditData(prev => ({ ...prev, current_hp: newValue }))
                }
                onChangeCommitted={(e, newValue) =>
                  autoSave('current_hp', newValue)
                }
              />
              <StatusBar
                value={editData.especial}
                max={editData.especial_total}
                color="#00ff99"
                label="Especial"
                disabled={false}
                onChange={(e, newValue) =>
                  setEditData(prev => ({ ...prev, especial: newValue }))
                }
                onChangeCommitted={(e, newValue) =>
                  autoSave('especial', newValue)
                }
              />
              <StatusBar
                value={editData.vigor}
                max={editData.vigor_total}
                color="#2196f3"
                label="Vigor"
                disabled={false}
                onChange={(e, newValue) =>
                  setEditData(prev => ({ ...prev, vigor: newValue }))
                }
                onChangeCommitted={(e, newValue) =>
                  autoSave('vigor', newValue)
                }
              />
              <div className="edit-field">
                <label>HP Máx</label>
                <input
                  type="number"
                  name="max_hp"
                  value={editData.max_hp}
                  onChange={handleInputChange}
                />
              </div>
              <div className="edit-field">
                <label>Especial Total</label>
                <input
                  type="number"
                  name="especial_total"
                  value={editData.especial_total}
                  onChange={handleInputChange}
                />
              </div>
              <div className="edit-field">
                <label>Vigor Total</label>
                <input
                  type="number"
                  name="vigor_total"
                  value={editData.vigor_total}
                  onChange={handleInputChange}
                />
              </div>
              <div className="edit-field">
                <label>Nível</label>
                <input
                  type="number"
                  name="level"
                  value={editData.level}
                  onChange={handleInputChange}
                />
              </div>
              <div className="edit-field">
                <label>XP</label>
                <input
                  type="number"
                  name="xp"
                  value={editData.xp}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          ) : (
            <div>
              <StatusBar value={pokemon.current_hp ?? 0} max={pokemon.max_hp ?? 10} color="#ff4a4a" label="HP" disabled={true} />
              <StatusBar value={pokemon.especial ?? 10} max={pokemon.especial_total ?? 10} color="#00ff99" label="Especial" disabled={true} />
              <StatusBar value={pokemon.vigor ?? 10} max={pokemon.vigor_total ?? 10} color="#2196f3" label="Vigor" disabled={true} />
              <p className="pokemon-details">Nível: {pokemon.level ?? 1}</p>
              <p className="pokemon-details">XP: {pokemon.xp ?? 0}</p>
            </div>
          )
        )}
      </div>
      {canManage && !isPokedexView && (
        <div className="pokemon-card-actions">
          {isEditing ? (
            <>
              <button className="pokemon-cancel-button" onClick={handleCancelClick}>Cancelar</button>
              <button className="pokemon-save-button" onClick={handleSaveClick}>Salvar</button>
            </>
          ) : (
            <>
              <button className="pokemon-edit-button" onClick={handleEditClick}>Editar</button>
              {onDeposit && <button className="pokemon-deposit-button" onClick={handleDeposit}>Depositar</button>}
              {onWithdraw && <button className="pokemon-withdraw-button" onClick={handleWithdraw}>Retirar</button>}
              {currentUser?.tipo_usuario === 'M' && (
                <button
                  className="pokemon-delete-button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Excluir
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PokemonCard;
