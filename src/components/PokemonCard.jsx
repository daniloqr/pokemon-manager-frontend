// PokemonCard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PokemonCard.css'; // Certifique-se de que o caminho para o CSS está correto

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const PokemonCard = ({ pokemon, currentUser, trainerId, onDeposit, onUpdate, onWithdraw, onDelete, isPokedexView = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Inicializa o estado de edição com os dados do pokémon
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

  // Determina se o usuário logado pode gerenciar este card
  const canManage = currentUser && trainerId && (currentUser.tipo_usuario === 'M' || currentUser.id === parseInt(trainerId));

  // Lógica para as barras de progresso
  const hpPercentage = (pokemon.max_hp || 1) > 0 ? ((pokemon.current_hp || 0) / (pokemon.max_hp || 1)) * 100 : 0;
  const especialPercentage = (pokemon.especial_total || 1) > 0 ? ((pokemon.especial || 0) / (pokemon.especial_total || 1)) * 100 : 0;
  const vigorPercentage = (pokemon.vigor_total || 1) > 0 ? ((pokemon.vigor || 0) / (pokemon.vigor_total || 1)) * 100 : 0;

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

  const handleCancelClick = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    // Restaura os dados originais ao cancelar
    setEditData({
      level: pokemon.level, xp: pokemon.xp, max_hp: pokemon.max_hp, current_hp: pokemon.current_hp,
      especial: pokemon.especial, especial_total: pokemon.especial_total, vigor: pokemon.vigor, vigor_total: pokemon.vigor_total
    });
  };

  const handleSaveClick = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`${apiUrl}/pokemon-stats/${pokemon.id}`, editData);
      if (onUpdate) onUpdate(res.data.pokemon); // Avisa o componente pai sobre a atualização
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar os stats do Pokémon.', error);
      alert('Erro ao salvar os stats do Pokémon.');
    }
  };
  
  // --- Funções que chamam as props do componente pai ---
  const handleDeposit = (e) => { e.stopPropagation(); if (onDeposit) onDeposit(pokemon.id, pokemon.name); };
  const handleWithdraw = (e) => { e.stopPropagation(); if (onWithdraw) onWithdraw(pokemon.id, pokemon.name); };
  const handleDelete = (e) => { e.stopPropagation(); if (onDelete) onDelete(pokemon); }; // Apenas passa o pokemon para o pai
  
  return (
    <div className="pokemon-card">
      <div className="pokemon-card-image" style={{ backgroundImage: `url(${pokemon.image_url})`}}></div>
      <div className="pokemon-card-info">
        <h3 className="pokemon-name">{pokemon.name}</h3>
        <p className="pokemon-details">Tipo: {pokemon.type}</p>

        {!isPokedexView && (
          isEditing ? (
            <div className="edit-stats-form">
              <div className="edit-field"><label>Level</label><input type="number" name="level" value={editData.level} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>XP</label><input type="number" name="xp" value={editData.xp} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>HP Atual</label><input type="number" name="current_hp" value={editData.current_hp} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>HP Máx</label><input type="number" name="max_hp" value={editData.max_hp} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>Especial</label><input type="number" name="especial" value={editData.especial} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>Especial Total</label><input type="number" name="especial_total" value={editData.especial_total} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>Vigor</label><input type="number" name="vigor" value={editData.vigor} onChange={handleInputChange} /></div>
              <div className="edit-field"><label>Vigor Total</label><input type="number" name="vigor_total" value={editData.vigor_total} onChange={handleInputChange} /></div>
            </div>
          ) : (
            <div>
              <p className="pokemon-details">Nível: {pokemon.level ?? 1}</p>
              <p className="pokemon-details">XP: {pokemon.xp ?? 0}</p>
              {/* Barra de HP */}
              <div className="hp-bar-container">
                <div className="hp-bar-label">HP</div>
                <div className="hp-bar-background">
                  <div className={`hp-bar-progress ${getHpBarColorClass(hpPercentage)}`} style={{ width: `${hpPercentage}%` }}></div>
                  <span className="hp-bar-text">{pokemon.current_hp ?? 0} / {pokemon.max_hp ?? 10}</span>
                </div>
              </div>
              {/* Barra de Especial */}
              <div className="hp-bar-container">
                <div className="hp-bar-label">Especial</div>
                <div className="hp-bar-background">
                  <div className="hp-bar-progress special-bar" style={{ width: `${especialPercentage}%` }}></div>
                  <span className="hp-bar-text">{pokemon.especial ?? 10} / {pokemon.especial_total ?? 10}</span>
                </div>
              </div>
              {/* Barra de Vigor */}
              <div className="hp-bar-container">
                <div className="hp-bar-label">Vigor</div>
                <div className="hp-bar-background">
                  <div className="hp-bar-progress vigor-bar" style={{ width: `${vigorPercentage}%` }}></div>
                  <span className="hp-bar-text">{pokemon.vigor ?? 10} / {pokemon.vigor_total ?? 10}</span>
                </div>
              </div>
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
