import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_URL = "https://djeli-backend.onrender.com";

function App() {
  const [page, setPage] = useState('dashboard');
  const [polices, setPolices] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    if (page === 'polices') {
      const res = await fetch(`${API_URL}/polices`);
      setPolices(await res.json());
    }
    if (page === 'reports') {
      const res = await fetch(`${API_URL}/reportings/prestataires`);
      setReports(await res.json());
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporting");
    XLSX.writeFile(wb, "Reporting_Prestataires.xlsx");
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2>Djeli Santé</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li onClick={() => setPage('dashboard')} style={{ cursor: 'pointer', padding: '10px 0' }}>Dashboard</li>
          <li onClick={() => setPage('polices')} style={{ cursor: 'pointer', padding: '10px 0' }}>Polices & Barèmes</li>
          <li onClick={() => setPage('reports')} style={{ cursor: 'pointer', padding: '10px 0' }}>Reportings Finance</li>
        </ul>
      </nav>

      <main style={{ flex: 1, padding: '30px' }}>
        {page === 'polices' && (
          <section>
            <h1>Configuration des Polices</h1>
            <p>Plafond Standard Famille : 5 000 000 CFA </p>
            {/* Formulaire de création avec montants positifs forcés */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              const payload = Object.fromEntries(new FormData(e.target));
              await fetch(`${API_URL}/polices`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
              });
              fetchData();
            }}>
              <input name="nom_police" placeholder="Nom Police" required />
              <input name="plafond_famille" type="number" min="0" placeholder="Plafond Famille" required />
              <button type="submit">Créer</button>
            </form>
          </section>
        )}

        {page === 'reports' && (
          <section>
            <h1>Reporting Prestataires</h1>
            <button onClick={exportExcel}>Exporter Excel</button>
            <table width="100%" border="1" style={{ marginTop: '20px' }}>
              <thead>
                <tr><th>Prestataire</th><th>Actes</th><th>CA Total (CFA)</th></tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i}><td>{r.nom_etablissement}</td><td>{r.nombre_actes}</td><td>{Number(r.ca_total).toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;