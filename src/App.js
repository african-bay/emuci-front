import React, { useEffect, useState } from 'react';

// Assurez-vous que cette URL est bien celle de votre DASHBOARD Render (sans /salaries à la fin)
const API_URL = "https://djeli-backend.onrender.com";

function App() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true); // Ajout d'un état de chargement
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', poste: '', situation_familiale: 'Celibataire' });

  const fetchSalaries = async () => {
    try {
      const res = await fetch(`${API_URL}/salaries`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      // On vérifie que data est bien un tableau avant de le stocker
      setSalaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur de récupération:", err);
      setSalaries([]); // Évite que le .map() échoue
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const handleAffilier = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/salaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({ nom: '', prenom: '', email: '', poste: '', situation_familiale: 'Celibataire' });
      fetchSalaries();
    } catch (err) {
      alert("Erreur lors de l'affiliation");
    }
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

  // Empêche la page blanche pendant le chargement
  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Connexion au serveur Djeli en cours...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Gestion Administrative des Salariés</h1>

      <section style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Affilier un nouveau salarié</h3>
        <form onSubmit={handleAffilier} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <input placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required />
          <input placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required />
          <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input placeholder="Poste" value={formData.poste} onChange={e => setFormData({...formData, poste: e.target.value})} />
          <select value={formData.situation_familiale} onChange={e => setFormData({...formData, situation_familiale: e.target.value})}>
            <option value="Celibataire">Célibataire</option>
            <option value="Marié">Marié</option>
            <option value="PACS">PACS</option>
          </select>
          <button type="submit" style={{ background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>Affilier au contrat</button>
        </form>
      </section>

      <h3>Fichier des bénéficiaires à jour ({salaries.length})</h3>
      <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{background: '#eee'}}>
            <th>Nom & Prénom</th>
            <th>Poste</th>
            <th>Situation Familiale</th>
            <th>Ayants Droit</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.length > 0 ? (
            salaries.map(s => (
              <tr key={s.id} style={{ background: s.statut_contrat === 'Radie' ? '#ffebee' : 'white' }}>
                <td style={{padding: '10px'}}>{s.nom} {s.prenom}</td>
                <td>{s.poste}</td>
                <td>{s.situation_familiale}</td>
                <td>{s.ayants_droit_noms || 'Aucun'}</td>
                <td><strong>{s.statut_contrat}</strong></td>
                <td>
                  <button onClick={() => handleUpdateFamille(s.id)}>Maj Famille</button>
                  {s.statut_contrat !== 'Radie' && (
                    <button onClick={() => handleRadier(s.id)} style={{ color: 'red', marginLeft: '5px' }}>Radier</button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Aucun salarié trouvé.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;