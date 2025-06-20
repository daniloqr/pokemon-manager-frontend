import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
// Importa o CSS do Register para os inputs e o novo CSS para o layout
import './RegisterTrainer.css';
import './AddPokemonPage.css';

const AddPokemonPage = ({ user, onLogout }) => {
  const { id: trainerId } = useParams();
  const navigate = useNavigate();

  // Estados para a busca
  const [pokedexNumber, setPokedexNumber] = useState('');
  const [pokemonPreview, setPokemonPreview] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Estado para o único campo manual que restou
  const [level, setLevel] = useState('');

  // Define a URL base da API do seu backend a partir da variável de ambiente Vite
  const API_URL = import.meta.env.VITE_API_URL;

  // Função para buscar dados na PokeAPI
  const handleFetchPokemon = async () => {
    if (!pokedexNumber) return;
    setIsFetching(true);
    setFetchError(null);
    setPokemonPreview(null);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokedexNumber}`);
      const data = response.data;
      
      // Monta o objeto de preview com os dados da API
      setPokemonPreview({
        name: data.name,
        // Pega a URL da arte oficial, que é de alta qualidade
        imageUrl: data.sprites.other['official-artwork'].front_default,
        // Junta os tipos (ex: "grass, poison")
        type: data.types.map(t => t.type.name).join(', '),
      });
    } catch (error) {
      setFetchError('Pokémon não encontrado. Verifique o número.');
      console.error("Erro ao buscar na PokeAPI:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Função para submeter o formulário para o NOSSO backend
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!pokemonPreview || !level) {
      alert('Por favor, busque um Pokémon e defina seu nível.');
      return;
    }

    const pokemonData = {
      name: pokemonPreview.name,
      type: pokemonPreview.type,
      image_url: pokemonPreview.imageUrl,
      level: level,
      trainer_id: trainerId,
    };

    try {
      // Envia os dados para a nossa API (agora com API_URL)
      await axios.post(`${API_URL}/pokemons`, pokemonData);
      alert('Pokémon adicionado com sucesso!');
      navigate(`/trainer/${trainerId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao adicionar pokémon.');
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="add-pokemon-container">
        <form className="add-pokemon-form" onSubmit={handleSubmit}>
          <h1>Adicionar Novo Pokémon</h1>
          
          {/* Seção de Busca */}
          <div className="input-group">
            <label htmlFor="pokedexNumber">Número do Pokémon na Pokédex</label>
            <div className="search-section">
              <input
                type="number"
                id="pokedexNumber"
                value={pokedexNumber}
                onChange={(e) => setPokedexNumber(e.target.value)}
                placeholder="Ex: 25 para Pikachu"
              />
              <button type="button" onClick={handleFetchPokemon} disabled={isFetching}>
                {isFetching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
          
          {/* Seção de Preview e Erro */}
          {fetchError && <p className="error-message">{fetchError}</p>}
          
          {pokemonPreview && (
            <div className="preview-section">
              <img src={pokemonPreview.imageUrl} alt={pokemonPreview.name} className="preview-image" />
              <h2 className="preview-name">{pokemonPreview.name}</h2>
              <p className="preview-type">{pokemonPreview.type}</p>
            </div>
          )}

          {/* Seção de Nível (só aparece após a busca) */}
          {pokemonPreview && (
            <div className="input-group">
              <label htmlFor="level">Nível do Pokémon</label>
              <input
                type="number"
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" disabled={!pokemonPreview || !level}>
            Adicionar à Equipe
          </button>
        </form>
      </div>
    </>
  );
};

export default AddPokemonPage;
