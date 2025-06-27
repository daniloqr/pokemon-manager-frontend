// PokemonManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonCard from './PokemonCard'; // Importa o card
import DeletePokemonModal from './DeletePokemonModal'; // Importa o modal
import Modal from 'react-modal'; // Você precisará de uma biblioteca de modal, como 'react-modal'

// Configure o react-modal
Modal.setAppElement('#root'); // Evita problemas de acessibilidade

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const PokemonManager = ({ trainerId, currentUser }) => {
  const [pokemons, setPokemons] = useState([]);
  const [pokemonToDelete, setPokemonToDelete] = useState(null); // Guarda o Pokémon para exclusão

  // Efeito para buscar os pokémons do treinador quando o componente carrega
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

  // Abre o modal de confirmação
  const handleOpenDeleteModal = (pokemon) => {
    setPokemonToDelete(pokemon);
  };

  // Fecha o modal
  const handleCloseModal = () => {
    setPokemonToDelete(null);
  };

  // Função chamada pelo modal para confirmar e executar a exclusão
  const handleConfirmDelete = async (reason) => {
    if (!pokemonToDelete) return;
    
    try {
      // Faz a chamada DELETE para o backend
      const response = await axios.delete(`${apiUrl}/pokemon/${pokemonToDelete.id}`);
      
      const { deletedPokemonId } = response.data;

      // ATUALIZA A TELA: Remove o pokémon da lista local
      setPokemons(currentPokemons =>
        currentPokemons.filter(p => p.id !== parseInt(deletedPokemonId))
      );

      alert(`Pokémon ${pokemonToDelete.name} foi liberado pelo motivo: ${reason}`);
      
    } catch (error) {
      console.error('Falha ao excluir o Pokémon:', error);
      alert(error.response?.data?.message || 'Ocorreu um erro ao excluir.');
    } finally {
      handleCloseModal(); // Fecha o modal
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
            // A prop 'onDelete' agora chama a função que abre o modal
            onDelete={handleOpenDeleteModal}
            // ... (outras props como onUpdate, onDeposit, etc.)
          />
        ))}
      </div>

      <Modal
        isOpen={!!pokemonToDelete}
        onRequestClose={handleCloseModal}
        className="modal"
        overlayClassName="overlay"
      >
        {pokemonToDelete && (
          <DeletePokemonModal
            pokemonName={pokemonToDelete.name}
            onClose={handleCloseModal}
            // A prop 'onConfirm' agora chama a função que deleta de verdade
            onConfirm={handleConfirmDelete}
          />
        )}
      </Modal>
    </div>
  );
};

export default PokemonManager;
