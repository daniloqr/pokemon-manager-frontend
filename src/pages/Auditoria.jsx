import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Auditoria.css';

const Auditoria = ({ user, onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define a URL base da API a partir da variável de ambiente Vite
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/auditoria`)
      .then(response => { setLogs(response.data); })
      .catch(error => console.error("Erro ao buscar logs de auditoria:", error))
      .finally(() => setLoading(false));
  }, [API_URL]);

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString('pt-BR');
  };

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="page-container">
        <h1 className="auditoria-title">Log de Auditoria do Sistema</h1>
        <div className="log-table-container">
          {loading ? <p style={{textAlign: 'center'}}>Carregando logs...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Data e Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td data-label="Data e Hora">{formatTimestamp(log.timestamp)}</td>
                    <td data-label="Usuário">{log.username} (ID: {log.user_id})</td>
                    <td data-label="Ação"><span className={`action-tag action-${log.action.toLowerCase()}`}>{log.action.replace(/_/g, ' ')}</span></td>
                    <td data-label="Detalhes">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Auditoria;
