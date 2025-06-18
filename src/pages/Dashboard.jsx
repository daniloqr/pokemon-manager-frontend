// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrainerCard from '../components/TrainerCard';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios.get(`http://localhost:3001/users/${user.id}`)
      .then(response => { setTrainers(response.data); })
      .catch(error => { console.error("Erro ao buscar treinadores:", error); })
      .finally(() => { setLoading(false); });
  }, [user]);

  const handleDeleteTrainer = async (trainerId, trainerName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o treinador "${trainerName}" e todos os seus dados?`)) return;
    try {
      await axios.delete(`http://localhost:3001/user/${trainerId}`);
      setTrainers(currentTrainers => currentTrainers.filter(t => t.id !== trainerId));
      alert(`Treinador '${trainerName}' excluído com sucesso.`);
    } catch (error) { alert('Falha ao excluir o treinador.'); }
  };

  return (
    <div className="page-container">
      <h1 className="dashboard-title">
        {user?.tipo_usuario === 'M' ? 'Painel de Treinadores' : 'Meu Perfil'}
      </h1>
      {loading ? (
        <p className="loading-text">Carregando...</p>
      ) : (
        <div className="trainers-grid">
          {trainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              trainerId={trainer.id}
              name={trainer.username}
              imageUrl={trainer.image_url}
              currentUser={user}
              onDelete={handleDeleteTrainer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
