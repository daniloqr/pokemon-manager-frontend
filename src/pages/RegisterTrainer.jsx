import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './RegisterTrainer.css';

const RegisterTrainer = ({ user, onLogout }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // 1. O estado agora armazena o objeto do arquivo, não uma string de URL
  const [imageFile, setImageFile] = useState(null); 
  const navigate = useNavigate();

  // Use a variável de ambiente VITE_API_BASE_URL
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      const response = await axios.post(`${API_URL}/users/register`, formData);

      alert(response.data.message);
      navigate('/');
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert('Não foi possível conectar ao servidor.');
      }
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <h1>Cadastrar Novo Treinador</h1>
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
            <label htmlFor="password">Senha Provisória</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="imageFile">Imagem do Treinador (Opcional)</label>
            <input
              type="file"
              id="imageFile"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
            />
          </div>
          <button type="submit">Cadastrar Treinador</button>
        </form>
      </div>
    </>
  );
};

export default RegisterTrainer;
