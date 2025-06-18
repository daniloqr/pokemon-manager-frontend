import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainerCard.css';

const TrainerCard = ({ name, imageUrl, currentUser, trainerId, onDelete }) => {
  const navigate = useNavigate();

  // Função para navegar para a página do treinador ao clicar no card
  const handleCardClick = (e) => {
    // Impede a navegação se o clique for em um botão
    if (e.target.tagName === 'BUTTON') {
      e.stopPropagation(); // Impede que o evento de clique "borbulhe" para o div pai
      return;
    }
    navigate(`/trainer/${trainerId}`);
  };

  // Função para o botão de editar
  const handleEdit = () => {
    navigate(`/edit-trainer/${trainerId}`);
  };

  // Função para o botão de excluir
  const handleDelete = () => {
    onDelete(trainerId, name);
  };

  return (
    <div className="trainer-card" onClick={handleCardClick}>
      <div
        className="card-image"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-label={`Foto de ${name}`}
      ></div>

      <h3 className="card-name">{name}</h3>

      {/* --- ESTE BLOCO DE CÓDIGO ESTAVA FALTANDO --- */}
      <div className="card-actions">
        {/* Botão de Editar: visível para Master OU para o próprio Treinador */}
        {(currentUser?.tipo_usuario === 'M' || (currentUser?.tipo_usuario === 'T' && currentUser.id === trainerId)) && (
          <button className="edit-button" onClick={handleEdit}>
            Editar
          </button>
        )}
        
        {/* Botão de Excluir: visível apenas para Master */}
        {currentUser?.tipo_usuario === 'M' && (
          <button className="delete-button" onClick={handleDelete}>
            Excluir
          </button>
        )}
      </div>
      {/* --- FIM DO BLOCO FALTANTE --- */}
      
    </div>
  );
};

export default TrainerCard;