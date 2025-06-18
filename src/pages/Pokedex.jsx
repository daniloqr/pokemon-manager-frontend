import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PokemonCard from '../components/PokemonCard';
import './Pokedex.css';

const Pokedex = ({ user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [pokedexList, setPokedexList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:3001/pokedex/${user.id}`)
        .then(response => {
          setPokedexList(response.data);
        })
        .catch(error => {
          console.error("Erro ao carregar a Pokédex:", error);
          setError("Não foi possível carregar os dados da sua Pokédex.");
        });
    }
  }, [user]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsLoading(true);
    setError('');
    setSearchResult(null);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      const data = response.data;
      setSearchResult({
        id: data.id,
        name: data.name,
        type: data.types.map(t => t.type.name).join(', '),
        level: 1,
        image_url: data.sprites.other['official-artwork'].front_default,
      });
    } catch (err) {
      setError('Pokémon não encontrado. Tente outro nome ou número.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToList = async () => {
    if (searchResult) {
      if (pokedexList.some(p => p.id === searchResult.id)) {
        alert(`${searchResult.name} já está na sua Pokédex!`);
        return;
      }
      const pokemonData = { ...searchResult, user_id: user.id };
      try {
        await axios.post('http://localhost:3001/pokedex', pokemonData);
        setPokedexList(currentList => {
          const newList = [...currentList, searchResult];
          newList.sort((a, b) => a.id - b.id);
          return newList;
        });
        setSearchResult(null);
        setSearchTerm('');
      } catch (error) {
        alert("Erro ao salvar o Pokémon na Pokédex.");
      }
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="page-container">
        <h1 className="pokedex-title">Minha Pokédex</h1>
        <div className="pokedex-search-bar">
          <input
            type="text"
            placeholder="Digite o nome ou número do Pokémon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && <p className="pokedex-error">{error}</p>}

        {searchResult && (
          <div className="pokedex-search-result">
            <h3>Resultado da Busca:</h3>
            <PokemonCard pokemon={searchResult} isPokedexView={true} />
            <button className="add-to-pokedex-button" onClick={handleAddToList}>
              Adicionar à Pokédex
            </button>
          </div>
        )}

        <div className="pokedex-grid">
          {pokedexList.map(pokemon => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} isPokedexView={true} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Pokedex;