import React, { useState, useEffect } from 'react';
// 1. Importe 'useNavigate' junto com 'useParams'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './FichaTreinador.css';

const dadosIniciais = {
  nome: '', peso: '', idade: '', altura: '', cidade: '', regiao: '', xp: '0', hp: '10', level: '1',
  vantagens: [],
  atributos: { forca: 1, speed: 1, vigor: 1, percepcao: 1, intelecto: 1, concentracao: 1, carisma: 1, aparencia: 1, blefe: 1 },
  pericias: { ladinagem: 0, historia: 0, sobrevivencia: 0, investigacao: 0, culinaria: 0, psiquismo: 0, geografia: 0, informatica: 0, intuicao: 0, atletismo: 0, diplomacia: 0, medicina: 0, religiao: 0 },
};

const FichaTreinador = ({ user, onLogout }) => {
  const { id: userId } = useParams();
  // 2. Inicialize o hook de navegação
  const navigate = useNavigate();
  
  const [editando, setEditando] = useState(false);
  const [dados, setDados] = useState(dadosIniciais);
  const [loading, setLoading] = useState(true);

  // Use a variável de ambiente VITE_API_BASE_URL
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios.get(`${API_URL}/ficha/${userId}`)
      .then(response => { setDados(response.data); })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          axios.get(`${API_URL}/user/${userId}`).then(res => {
            setDados(prev => ({ ...prev, nome: res.data.username }));
          });
        } else { console.error('Erro ao buscar a ficha!', error); }
      })
      .finally(() => setLoading(false));
  }, [userId, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const togglePonto = (categoria, chave, index) => {
    setDados((prev) => {
      const atual = prev[categoria][chave];
      const novoValor = index < atual ? index : index + 1;
      return { ...prev, [categoria]: { ...prev[categoria], [chave]: novoValor } };
    });
  };

  const renderCheckboxes = (categoria, chave) => {
    const valor = dados[categoria]?.[chave] ?? 0;
    return (
      <span className="checkbox-linha">
        {Array.from({ length: 10 }, (_, i) => (
          <input key={i} type="checkbox" checked={i < valor} disabled={!editando} onChange={() => togglePonto(categoria, chave, i)} />
        ))}
        <span className="soma-total">({valor}/10)</span>
      </span>
    );
  };
  
  // 3. A função de salvar agora também redireciona
  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/ficha/${userId}`, dados);
      alert('Ficha salva com sucesso!');
      navigate(`/trainer/${userId}`);
    } catch (error) {
      console.error('Erro ao salvar a ficha!', error);
      alert('Houve um erro ao salvar a ficha.');
    }
  };

  const handleEditToggle = () => {
    if (editando) {
      handleSave();
    } else {
      setEditando(true);
    }
  };

  if (loading) return <p style={{color: 'white', padding: '100px', textAlign: 'center'}}>Carregando Ficha...</p>;
  
  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="ficha-body">
        <div className="ficha-container">
          <div className="ficha-header">
            <h1>FICHÁRIO DO TREINADOR</h1>
            <button className="botao-editar" onClick={handleEditToggle}>
              {editando ? 'Salvar Alterações' : 'Editar Ficha'}
            </button>
          </div>
          
          {/* O restante do JSX do formulário continua o mesmo */}
          <div className="secao">
            <h2>Dados Gerais:</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Nome:</label>
                {editando ? <input name="nome" value={dados.nome} onChange={handleChange} /> : <span>{dados.nome}</span>}
              </div>
              <div className="form-field">
                <label>Peso:</label>
                {editando ? <input name="peso" value={dados.peso} onChange={handleChange} /> : <span>{dados.peso}</span>}
              </div>
              <div className="form-field">
                <label>Idade:</label>
                {editando ? <input name="idade" value={dados.idade} onChange={handleChange} /> : <span>{dados.idade}</span>}
              </div>
              <div className="form-field">
                <label>Altura:</label>
                {editando ? <input name="altura" value={dados.altura} onChange={handleChange} /> : <span>{dados.altura}</span>}
              </div>
              <div className="form-field">
                <label>Cidade:</label>
                {editando ? <input name="cidade" value={dados.cidade} onChange={handleChange} /> : <span>{dados.cidade}</span>}
              </div>
              <div className="form-field">
                <label>Região:</label>
                {editando ? <input name="regiao" value={dados.regiao} onChange={handleChange} /> : <span>{dados.regiao}</span>}
              </div>
            </div>
          </div>

          <div className="secao">
            <h2>Dados de Treinador:</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Level:</label>
                {editando ? <input name="level" type="number" value={dados.level} onChange={handleChange} /> : <span>{dados.level}</span>}
              </div>
              <div className="form-field">
                <label>HP:</label>
                {editando ? <input name="hp" type="number" value={dados.hp} onChange={handleChange} /> : <span>{dados.hp}</span>}
              </div>
              <div className="form-field full-width">
                <label>XP:</label>
                {editando ? <input name="xp" value={dados.xp} onChange={handleChange} /> : <span>{dados.xp}</span>}
              </div>
            </div>
          </div>

          <div className="secao">
            <h2>Vantagens:</h2>
            {editando ? (
              <textarea name="vantagens" value={dados.vantagens.join('\n')} onChange={(e) => setDados((prev) => ({ ...prev, vantagens: e.target.value.split('\n') }))} />
            ) : (
              <ul>{dados.vantagens.map((v, idx) => <li key={idx}>{v}</li>)}</ul>
            )}
          </div>

          <div className="grid-colunas">
            <div className="coluna">
              <h3>Atributos</h3>
              <div className="atributo-bloco">
                <strong>Físicos</strong>
                <p>Força: {renderCheckboxes('atributos', 'forca')}</p>
                <p>Speed: {renderCheckboxes('atributos', 'speed')}</p>
                <p>Vigor: {renderCheckboxes('atributos', 'vigor')}</p>
              </div>
              <div className="atributo-bloco">
                <strong>Mentais</strong>
                <p>Percepção: {renderCheckboxes('atributos', 'percepcao')}</p>
                <p>Intelecto: {renderCheckboxes('atributos', 'intelecto')}</p>
                <p>Concentração: {renderCheckboxes('atributos', 'concentracao')}</p>
              </div>
              <div className="atributo-bloco">
                <strong>Sociais</strong>
                <p>Carisma: {renderCheckboxes('atributos', 'carisma')}</p>
                <p>Aparência: {renderCheckboxes('atributos', 'aparencia')}</p>
                <p>Blefe: {renderCheckboxes('atributos', 'blefe')}</p>
              </div>
            </div>
            <div className="coluna">
              <h3>Perícias Treinadas</h3>
              <ul className="pericias">
                {Object.entries(dados.pericias).map(([nome, _]) => (
                  <li key={nome}>
                    <span>{nome.charAt(0).toUpperCase() + nome.slice(1)}</span>
                    {renderCheckboxes('pericias', nome)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default FichaTreinador;
