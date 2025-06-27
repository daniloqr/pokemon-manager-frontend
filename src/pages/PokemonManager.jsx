// PokemonManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonCard from './PokemonCard';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const PokemonManager = ({ trainerId, currentUser }) => {
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    if (trainerId) {
      axios.get(`${apiUrl}/trainer/${trainerId}/pokemons`)
        .then(response => {
          setPokemons(response.data);
        })
        .catch(error => {
          console.error("Erro ao buscar pokémons:", error);
        });
    }
  }, [trainerId]);

  // Remove o pokémon da lista se foi deletado, atualiza se só editou
  const handlePokemonUpdate = (updatedPokemon) => {
    if (updatedPokemon.deleted) {
      setPokemons(currentPokemons =>
        currentPokemons.filter(p => p.id !== updatedPokemon.id)
      );
    } else {
      setPokemons(currentPokemons =>
        currentPokemons.map(p =>
          p.id === updatedPokemon.id ? updatedPokemon : p
        )
      );
    }
  };

  return (
    <div>
      <h2>Equipe Pokémon</h2>
      <div className="pokemon-grid">
        {pokemons.map(pokemon => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            currentUser={currentUser}
            trainerId={trainerId}
            onUpdate={handlePokemonUpdate}
            // Pode passar onDeposit, onWithdraw etc, se precisar
          />
        ))}
      </div>
    </div>
  );
};

export default PokemonManager;
