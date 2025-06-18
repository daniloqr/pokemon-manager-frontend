import React, { useState } from 'react';
import './DeletePokemonModal.css';

const DeletePokemonModal = ({ pokemonName, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    // Passa a razão para a função de confirmação
    onConfirm(reason);
  };

  return (
    <div className="delete-modal-content">
      <h2>Confirmar Exclusão</h2>
      <p>Você tem certeza que deseja excluir permanentemente <strong>{pokemonName}</strong>?</p>
      <p>Esta ação não pode ser desfeita.</p>
      
      <div className="reason-input-group">
        <label htmlFor="delete-reason">Motivo da Exclusão (obrigatório):</label>
        <textarea
          id="delete-reason"
          rows="3"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: Liberado na natureza, trocado com outro treinador, etc."
        ></textarea>
      </div>

      <div className="delete-modal-actions">
        <button className="cancel-button" onClick={onClose}>Cancelar</button>
        {/* O botão de confirmar só fica ativo se um motivo for inserido */}
        <button 
          className="confirm-delete-button" 
          onClick={handleConfirm}
          disabled={!reason.trim()}
        >
          Confirmar Exclusão
        </button>
      </div>
    </div>
  );
};

export default DeletePokemonModal;