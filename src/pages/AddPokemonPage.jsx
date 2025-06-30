import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
// Importa o CSS do Register para os inputs e o novo CSS para o layout
import './RegisterTrainer.css';
import './AddPokemonPage.css';

// Define a URL base da API do seu backend a partir da variável de ambiente Vite
const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

  // Função para buscar dados na PokeAPI
  const handleFetchPokemon = async () => {
    if (!pokedexNumber) return;
    setIsFetching(true);
    setFetchError(null);
    setPokemonPreview(null);
    try {
      // A chamada para a PokeAPI externa continua a mesma
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokedexNumber.toLowerCase()}`);
      const data = response.data;
      
      setPokemonPreview({
        name: data.name,
        imageUrl: data.sprites.other['official-artwork'].front_default,
        type: data.types.map(t => t.type.name).join(', '),
      });
    } catch (error) {
      setFetchError('Pokémon não encontrado. Verifique o número ou nome.');
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
      level: Number(level),
      trainer_id: trainerId,
      xp: 0,
      max_hp: 10,
      current_hp: 10,
      especial: 10,
      especial_total: 10,
      vigor: 10,
      vigor_total: 10
    };

    try {
      // Envia os dados para a nossa API (agora usando a variável apiUrl)
      await axios.post(`${apiUrl}/pokemons`, pokemonData);
      alert('Pokémon adicionado com sucesso!');
      navigate(`/trainer/${trainerId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao adicionar pokémon.');
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="page-container">
        <div className="add-pokemon-container">
            <form className="add-pokemon-form" onSubmit={handleSubmit}>
            <h1>Adicionar Novo Pokémon</h1>
            
            <div className="input-group">
                <label htmlFor="pokedexNumber">Nome ou Número do Pokémon</label>
                <div className="search-section">
                <input
                    type="text"
                    id="pokedexNumber"
                    value={pokedexNumber}
                    onChange={(e) => setPokedexNumber(e.target.value)}
                    placeholder="Ex: 25 ou Pikachu"
                />
                <button type="button" onClick={handleFetchPokemon} disabled={isFetching}>
                    {isFetching ? 'Buscando...' : 'Buscar'}
                </button>
                </div>
            </div>
            
            {fetchError && <p className="error-message">{fetchError}</p>}
            
            {pokemonPreview && (
                <div className="preview-section">
                <img src={pokemonPreview.imageUrl} alt={pokemonPreview.name} className="preview-image" />
                <h2 className="preview-name">{pokemonPreview.name}</h2>
                <p className="preview-type">{pokemonPreview.type}</p>
                </div>
            )}

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
      </div>
    </>
  );
};

export default AddPokemonPage;