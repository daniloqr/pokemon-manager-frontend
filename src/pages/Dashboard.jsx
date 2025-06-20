import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import TrainerCard from '../components/TrainerCard';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define a URL base da API a partir da variável de ambiente Vite
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios.get(`${apiUrl}/users/${user.id}`)
      .then(response => { setTrainers(response.data); })
      .catch(error => { console.error("Erro ao buscar treinadores:", error); })
      .finally(() => { setLoading(false); });
  }, [user, apiUrl]);

  const handleDeleteTrainer = async (trainerId, trainerName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o treinador "${trainerName}" e todos os seus dados?`)) return;
    try {
      await axios.delete(`${apiUrl}/user/${trainerId}`);
      setTrainers(currentTrainers => currentTrainers.filter(t => t.id !== trainerId));
      alert(`Treinador '${trainerName}' excluído com sucesso.`);
    } catch (error) { alert('Falha ao excluir o treinador.'); }
  };

  return (
    <>
      {/* 2. ADICIONADO: Renderiza a Navbar no topo da página */}
      <Navbar user={user} onLogout={onLogout} />

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
    </>
  );
};

export default Dashboard;