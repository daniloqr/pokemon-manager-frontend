import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './RegisterTrainer.css'; 

const EditTrainer = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Define a URL base da API a partir da variável de ambiente Vite
  const API_URL = import.meta.env.VITE_API_URL;

  // --- VERIFICAÇÃO DE SEGURANÇA ---
  useEffect(() => {
    // Se o usuário não for Master E o ID do usuário logado for diferente do ID na URL
    if (user && user.tipo_usuario !== 'M' && user.id !== parseInt(id)) {
      alert("Você não tem permissão para editar este perfil.");
      navigate('/'); // Redireciona para o dashboard
    }
  }, [user, id, navigate]);

  // Busca os dados do treinador
  useEffect(() => {
    // Garante que a busca só ocorra se o usuário tiver permissão
    if (user && (user.tipo_usuario === 'M' || user.id === parseInt(id))) {
      axios.get(`${API_URL}/user/${id}`)
        .then(response => {
          setUsername(response.data.username);
          setCurrentImageUrl(response.data.image_url);
          setLoading(false);
        })
        .catch(error => {
          console.error("Erro ao buscar dados do treinador:", error);
          alert('Não foi possível carregar os dados do treinador.');
          setLoading(false);
        });
    }
  }, [id, user, API_URL]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    if (password) {
      formData.append('password', password);
    }
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      const response = await axios.put(`${API_URL}/user/${id}`, formData);
      alert(response.data.message);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar treinador.');
    }
  };
  
  // Exibe o loading enquanto os dados e permissões são checados
  if (loading) return <p style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Carregando...</p>;

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h1>Editar Perfil</h1>
          {currentImageUrl && (
            <div className="current-image-preview">
              <p>Imagem Atual:</p>
              <img
                src={currentImageUrl}
                alt="Imagem atual"
                className="image-preview"
              />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="username">Nome de Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Nova Senha (deixe em branco para não alterar)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="imageFile">Alterar Imagem (opcional)</label>
            <input
              type="file"
              id="imageFile"
              accept="image/png, image/jpeg, image/gif"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>
          <button type="submit">Salvar Alterações</button>
        </form>
      </div>
    </>
  );
};

export default EditTrainer;
