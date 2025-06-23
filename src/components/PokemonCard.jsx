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
      especial: pokemon.especial ?? 10,
      especial_total: pokemon.especial_total ?? 10,
      vigor: pokemon.vigor ?? 10,
      vigor_total: pokemon.vigor_total ?? 10,
    });
  }, [pokemon]);

  const canManage = currentUser && trainerId && (currentUser.tipo_usuario === 'M' || currentUser.id === trainerId);

  const hpPercentage = (pokemon.max_hp ?? 10) > 0 ? ((pokemon.current_hp ?? 0) / (pokemon.max_hp ?? 10)) * 100 : 0;
  const getHpBarColorClass = (percentage) => {
    if (percentage > 50) return 'hp-high';
    if (percentage > 20) return 'hp-medium';
    return 'hp-low';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`${apiUrl}/pokemon-stats/${pokemon.id}`, editData);
      if (onUpdate) onUpdate(res.data.pokemon);
      setIsEditing(false);
    } catch (error) {
      alert('Erro ao salvar os stats do Pokémon.');
    }
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    setEditData({
      level: pokemon.level,
      xp: pokemon.xp,
      max_hp: pokemon.max_hp,
      current_hp: pokemon.current_hp,
      especial: pokemon.especial,
      especial_total: pokemon.especial_total,
      vigor: pokemon.vigor,
      vigor_total: pokemon.vigor_total
    });
    setIsEditing(false);
  };
  
  const handleDeposit = (e) => { e.stopPropagation(); if (onDeposit) onDeposit(pokemon.id, pokemon.name); };
  const handleWithdraw = (e) => { e.stopPropagation(); if (onWithdraw) onWithdraw(pokemon.id, pokemon.name); };
  const handleDelete = (e) => { e.stopPropagation(); if (onDelete) onDelete(pokemon); };
  
  return (
    <div className="pokemon-card">
      <div className="pokemon-card-image" style={{ backgroundImage: `url(${pokemon.image_url})`}}></div>
      <div className="pokemon-card-info">
        <h3 className="pokemon-name">{pokemon.name}</h3>

        {!isPokedexView && (
          isEditing ? (
            <div className="edit-stats-form">
              <div className="edit-field"><label>Level</label><input type="number" name="level" value={editData.level} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>XP</label><input type="number" name="xp" value={editData.xp} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>HP Atual</label><input type="number" name="current_hp" value={editData.current_hp} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>HP Máximo</label><input type="number" name="max_hp" value={editData.max_hp} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>Especial</label><input type="number" name="especial" value={editData.especial} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>Especial Total</label><input type="number" name="especial_total" value={editData.especial_total} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>Vigor</label><input type="number" name="vigor" value={editData.vigor} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>Vigor Total</label><input type="number" name="vigor_total" value={editData.vigor_total} onChange={handleInputChange} /></div>
            </div>
          ) : (
            <div>
              <p className="pokemon-details">Nível: {pokemon.level ?? 1}</p>
              <p className="pokemon-details">XP: {pokemon.xp ?? 0}</p>
              <div className="hp-bar-container">
                <div className="hp-bar-label">HP</div>
                <div className="hp-bar-background">
                  <div 
                    className={`hp-bar-progress ${getHpBarColorClass(hpPercentage)}`}
                    style={{ width: `${hpPercentage}%` }}
                  ></div>
                  <span className="hp-bar-text">
                    {pokemon.current_hp ?? 0} / {pokemon.max_hp ?? 10} ({Math.round(hpPercentage)}%)
                  </span>
                </div>
              </div>
              <p className="pokemon-details">
                Especial: {pokemon.especial ?? 10} / {pokemon.especial_total ?? 10}
              </p>
              <p className="pokemon-details">
                Vigor: {pokemon.vigor ?? 10} / {pokemon.vigor_total ?? 10}
              </p>
              <p className="pokemon-details">Tipo: {pokemon.type}</p>
            </div>
          )
        )}
      </div>

      {canManage && (
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
              {currentUser?.tipo_usuario === 'M' && onDelete && (
                <button className="pokemon-delete-button" onClick={handleDelete}>Excluir</button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PokemonCard;
