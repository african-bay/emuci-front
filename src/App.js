import React, { useState, useEffect } from 'react';

const API_URL = "https://djeli-backend.onrender.com";

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [polices, setPolices] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [reportings, setReportings] = useState([]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    if (currentPage === 'polices') {
        const res = await fetch(`${API_URL}/polices`);
        setPolices(await res.json());
    }
    if (currentPage === 'prestataires') {
        const res = await fetch(`${API_URL}/prestataires`);
        setPrestataires(await res.json());
    }
    if (currentPage === 'reports') {
        const res = await fetch(`${API_URL}/reportings/prestataires`);
        setReportings(await res.json());
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <nav style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2>Djeli Santé</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => setCurrentPage('dashboard')}>👥 Adhérents</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => setCurrentPage('polices')}>📜 Polices & Barèmes</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => setCurrentPage('prestataires')}>🏢 Prestataires</li>
          <li style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => setCurrentPage('reports')}>📊 Reportings</li>
        </ul>
      </nav>

      {/* CONTENT AREA */}
      <main style={{ flex: 1, padding: '30px', background: '#f4f7f6' }}>
        {currentPage === 'polices' && (
          <div>
            <h3>Configuration des Polices</h3>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const data = {
                    nom_police: e.target.nom.value,
                    entreprise: e.target.ent.value,
                    date_debut: e.target.deb.value,
                    date_fin: e.target.fin.value,
                    plafond_famille: Math.abs(e.target.pf.value), // Force le positif
                    plafond_individuel: Math.abs(e.target.pi.value)
                };
                await fetch(`${API_URL}/polices`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
                fetchData();
            }}>
                <input name="nom" placeholder="Nom Police" required />
                <input name="pf" type="number" placeholder="Plafond Famille" required min="0" />
                <button type="submit">Créer la Police</button>
            </form>
          </div>
        )}

        {currentPage === 'prestataires' && (
          <div>
            <h3>Réseau des Prestataires</h3>
            <table width="100%" style={{ background: 'white', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#eee' }}>
                    <tr><th>Nom</th><th>Type</th><th>Contact</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {prestataires.map(p => (
                        <tr key={p.id}>
                            <td>{p.nom_etablissement}</td>
                            <td>{p.type_etablissement}</td>
                            <td>{p.telephone}</td>
                            <td><button>Accès Police</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}

        {currentPage === 'reports' && (
          <div>
            <h3>Reporting Financier</h3>
            <table width="100%" border="1" cellPadding="10">
                <thead>
                    <tr><th>Établissement</th><th>Actes</th><th>CA Total</th><th>Part Assurance</th></tr>
                </thead>
                <tbody>
                    {reportings.map((r, i) => (
                        <tr key={i}>
                            <td>{r.nom_etablissement}</td>
                            <td>{r.nombre_actes}</td>
                            <td>{Number(r.ca_total).toLocaleString()} CFA</td>
                            <td>{Number(r.total_assurance).toLocaleString()} CFA</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;