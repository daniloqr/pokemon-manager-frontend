import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Mochila.css';

const Mochila = ({ user, onLogout }) => {
  const [itens, setItens] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user) {
      axios.get(`http://localhost:3001/mochila/${user.id}`)
        .then(response => {
          const sortedItens = response.data.sort((a, b) => a.item_nome.localeCompare(b.item_nome));
          setItens(sortedItens);
        })
        .catch(error => console.error("Erro ao buscar itens da mochila:", error));
    }
  }, [user]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim() || quantity < 1) return;
    try {
      const response = await axios.post('http://localhost:3001/mochila/item', {
        user_id: user.id,
        item_nome: newItem.trim(),
        quantidade: parseInt(quantity, 10)
      });
      const itemJaExiste = itens.find(item => item.id === response.data.id);
      let updatedItens;
      if (itemJaExiste) {
        updatedItens = itens.map(item => item.id === response.data.id ? response.data : item);
      } else {
        updatedItens = [...itens, response.data];
      }
      updatedItens.sort((a, b) => a.item_nome.localeCompare(b.item_nome));
      setItens(updatedItens);
      setNewItem('');
      setQuantity(1);
    } catch (error) {
      alert("Falha ao adicionar o item.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    const itemParaRemover = itens.find(i => i.id === itemId);
    if (itemParaRemover && !window.confirm(`Tem certeza que quer remover todos os ${itemParaRemover.quantidade}x ${itemParaRemover.item_nome}?`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/mochila/item/${itemId}`);
      setItens(itens.filter(item => item.id !== itemId));
    } catch (error) {
      alert("Falha ao remover o item.");
    }
  };

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setEditQuantity(item.quantidade);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleUpdateQuantity = async (itemId) => {
    try {
      const response = await axios.put(`http://localhost:3001/mochila/item/${itemId}`, {
        quantidade: parseInt(editQuantity, 10)
      });
      if (parseInt(editQuantity, 10) <= 0) {
        setItens(itens.filter(item => item.id !== itemId));
      } else {
        setItens(itens.map(item => item.id === itemId ? response.data : item).sort((a, b) => a.item_nome.localeCompare(b.item_nome)));
      }
      setEditingItemId(null);
    } catch (error) {
      alert("Falha ao atualizar o item.");
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="page-container">
        <div className="mochila-container">
          <h1 className="mochila-title">Minha Mochila</h1>
          <form className="add-item-form" onSubmit={handleAddItem}>
            <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Digite o nome do item" className="item-input" />
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" className="quantity-input" />
            <button type="submit">Adicionar</button>
          </form>
          <ul className="item-list">
            {itens.length > 0 ? (
              itens.map(item => (
                <li key={item.id}>
                  {editingItemId === item.id ? (
                    <>
                      <span className="item-name">{item.item_nome}</span>
                      <div className="edit-quantity-section">
                        <input type="number" className="quantity-input-edit" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} min="0" />
                        <button className="save-button" onClick={() => handleUpdateQuantity(item.id)}>Salvar</button>
                        <button className="cancel-edit-button" onClick={handleCancelEdit}>Cancelar</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="item-name">{item.item_nome} <span className="item-quantity">(x{item.quantidade})</span></span>
                      <div className="item-actions">
                        <button className="edit-item-button" onClick={() => handleEditClick(item)}>Editar</button>
                        <button className="remove-item-button" onClick={() => handleRemoveItem(item.id)}>Remover</button>
                      </div>
                    </>
                  )}
                </li>
              ))
            ) : (
              <p>Sua mochila está vazia.</p>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Mochila;