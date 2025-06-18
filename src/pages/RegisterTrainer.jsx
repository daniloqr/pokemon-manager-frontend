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

  const handleFileChange = (event) => {
    // Pega o primeiro arquivo selecionado pelo usuário
    setImageFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 2. Cria um objeto FormData
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    // 3. Adiciona o arquivo ao FormData, se um tiver sido selecionado
    // O nome 'imageFile' DEVE ser o mesmo que usamos no multer no backend
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      // 4. Envia o objeto FormData para o backend
      // O Axios se encarrega de definir o 'Content-Type' como 'multipart/form-data'
      const response = await axios.post('http://localhost:3001/users/register', formData);

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
        {/* 5. O formulário agora precisa do atributo encType */}
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
            {/* 6. O input de texto foi trocado por um input do tipo 'file' */}
            <label htmlFor="imageFile">Imagem do Treinador (Opcional)</label>
            <input
              type="file"
              id="imageFile"
              accept="image/png, image/jpeg, image/gif" // Aceita os formatos de imagem mais comuns
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