import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FichaTreinador.css'; // Reutiliza o CSS da ficha do treinador

// Estrutura de dados para uma nova ficha de pokémon
const dadosIniciaisSheet = {
    tamanho: '', peso: '', vinculacao: 0, natureza: '', pontos_felicidade: 0,
    atributos: { Def: 0, Speed: 0, Força: 0, Vigor: 0, Concentração: 0, Percepção: 0, Intelecto: 0, Especial: 0 },
    movimentos: [],
    habilidades: [],
    vantagens: [],
    desvantagens: []
};

const PokemonSheet = ({ pokemon }) => {
    const [sheetData, setSheetData] = useState(dadosIniciaisSheet);
    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:3001/pokemon-sheet/${pokemon.id}`)
            .then(res => {
                setSheetData(res.data);
            })
            .catch(err => {
                if(err.response && err.response.status === 404){
                    console.log("Nenhuma ficha encontrada, usando dados iniciais.");
                    setSheetData(dadosIniciaisSheet);
                }
            })
            .finally(() => setLoading(false));
    }, [pokemon.id]);
    
    const handleSave = async () => {
        try {
            await axios.put(`http://localhost:3001/pokemon-sheet/${pokemon.id}`, sheetData);
            alert('Ficha do Pokémon salva com sucesso!');
            setEditando(false);
        } catch (error) {
            alert('Erro ao salvar a ficha do Pokémon.');
        }
    };

    // Placeholder para as funções de edição dos dados
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSheetData(prev => ({ ...prev, [name]: value }));
    };
    
    return (
        <div className="ficha-container" style={{ margin: 0, boxShadow: 'none', border: 'none' }}>
            <div className="ficha-header">
                <h1>Ficha de {pokemon.name}</h1>
                <button className="botao-editar" onClick={() => editando ? handleSave() : setEditando(true)}>
                    {editando ? 'Salvar' : 'Editar'}
                </button>
            </div>

            {loading ? <p>Carregando ficha...</p> : (
                <div>
                    <div className="secao">
                        <h2>Informações Gerais</h2>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Nível</label>
                                <span>{pokemon.level}</span>
                            </div>
                            <div className="form-field">
                                <label>Tipo</label>
                                <span style={{textTransform: 'capitalize'}}>{pokemon.type}</span>
                            </div>
                            <div className="form-field">
                                <label>Natureza</label>
                                {editando ? <input name="natureza" value={sheetData.natureza} onChange={handleChange} /> : <span>{sheetData.natureza || '-'}</span>}
                            </div>
                             <div className="form-field">
                                <label>Pontos de Felicidade</label>
                                {editando ? <input name="pontos_felicidade" type="number" value={sheetData.pontos_felicidade} onChange={handleChange} /> : <span>{sheetData.pontos_felicidade}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="secao">
                        <h2>Atributos e Movimentos</h2>
                        <p>(Funcionalidade de edição de atributos e movimentos em breve)</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PokemonSheet;