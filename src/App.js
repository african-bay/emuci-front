import React, { useEffect, useState } from 'react';

const API_URL = "https://votre-url-render.onrender.com";

function App() {
  const [salaries, setSalaries] = useState([]);
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', poste: '', situation_familiale: 'Celibataire' });

  useEffect(() => { fetchSalaries(); }, []);

  const fetchSalaries = async () => {
    const res = await fetch(`${API_URL}/salaries`);
    const data = await res.json();
    setSalaries(data);
  };

  const handleAffilier = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/salaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ nom: '', prenom: '', email: '', poste: '', situation_familiale: 'Celibataire' });
    fetchSalaries();
  };

  const handleRadier = async (id) => {
    const dateSortie = prompt("Date de sortie (AAAA-MM-JJ) :");
    if (dateSortie) {
      await fetch(`${API_URL}/salaries/${id}/radier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_sortie: dateSortie })
      });
      fetchSalaries();
    }
  };

  const handleUpdateFamille = async (id) => {
    const nouvelleSit = prompt("Nouvelle situation (Mariage, PACS, etc.) :");
    const ayantsDroit = prompt("Noms des ayants droit (conjoint, enfants) :");
    if (nouvelleSit) {
      await fetch(`${API_URL}/salaries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation_familiale: nouvelleSit, ayants_droit_noms: ayantsDroit })
      });
      fetchSalaries();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Gestion Administrative des Salariés</h1>

      {/* FORMULAIRE D'AFFILIATION */}
      <section style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <h3>Affilier un nouveau salarié</h3>
        <form onSubmit={handleAffilier} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <input placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required />
          <input placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required />
          <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input placeholder="Poste" value={formData.poste} onChange={e => setFormData({...formData, poste: e.target.value})} />
          <select value={formData.situation_familiale} onChange={e => setFormData({...formData, situation_familiale: e.target.value})}>
            <option value="Celibataire">Célibataire</option>
            <option value="Marié">Marié</option>
            <option value="PACS">PACS</option>
          </select>
          <button type="submit" style={{ background: 'blue', color: 'white' }}>Affilier au contrat</button>
        </form>
      </section>

      {/* LISTE ET ACTIONS */}
      <h3>Fichier des bénéficiaires à jour</h3>
      <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nom & Prénom</th>
            <th>Poste</th>
            <th>Situation Familiale</th>
            <th>Ayants Droit</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map(s => (
            <tr key={s.id} style={{ background: s.statut_contrat === 'Radie' ? '#ffebee' : 'white' }}>
              <td>{s.nom} {s.prenom}</td>
              <td>{s.poste}</td>
              <td>{s.situation_familiale}</td>
              <td>{s.ayants_droit_noms || 'Aucun'}</td>
              <td><strong>{s.statut_contrat}</strong></td>
              <td>
                <button onClick={() => handleUpdateFamille(s.id)}>Maj Famille</button>
                {s.statut_contrat !== 'Radie' && (
                  <button onClick={() => handleRadier(s.id)} style={{ color: 'red' }}>Radier</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;