import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_URL = "https://djeli-backend.onrender.com";

function App() {
  const [page, setPage] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (page === 'reports') fetchReports();
  }, [page]);

  const fetchReports = async () => {
    const res = await fetch(`${API_URL}/reportings/prestataires`);
    setReports(await res.json());
  };

  const handlePoliceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(e.target));

    // Validation des plafonds entièrement modifiables
    if (Number(data.plafond_famille) < Number(data.plafond_individuel)) {
      setError("Le plafond famille ne peut pas être inférieur au plafond individuel.");
      return;
    }

    const res = await fetch(`${API_URL}/polices`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    
    if (res.ok) alert("Police enregistrée !");
    else setError("Erreur lors de l'enregistrement.");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporting_Finance");
    XLSX.writeFile(wb, "Reporting_Djeli.xlsx");
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
      <nav style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2>DJELI SANTÉ</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li onClick={() => setPage('dashboard')} style={{cursor:'pointer', padding:'10px'}}>Dashboard</li>
          <li onClick={() => setPage('polices')} style={{cursor:'pointer', padding:'10px'}}>Polices</li>
          <li onClick={() => setPage('reports')} style={{cursor:'pointer', padding:'10px'}}>Reports</li>
        </ul>
      </nav>

      <main style={{ flex: 1, padding: '30px' }}>
        {page === 'polices' && (
          <section>
            <h1>Configuration Police</h1>
            {error && <p style={{color:'red'}}>{error}</p>}
            <form onSubmit={handlePoliceSubmit} style={{display:'grid', gap:'10px', maxWidth:'400px'}}>
              <input name="nom_police" placeholder="Nom Police" required />
              <input name="entreprise" placeholder="Entreprise" required />
              <input name="date_debut" type="date" required />
              <input name="date_fin" type="date" required />
              <label>Plafond Individuel (Modifiable)</label>
              <input name="plafond_individuel" type="number" min="0" required />
              <label>Plafond Famille (Modifiable)</label>
              <input name="plafond_famille" type="number" min="0" required />
              <button type="submit" style={{background:'#27ae60', color:'white', padding:'10px'}}>Créer la Police</button>
            </form>
          </section>
        )}

        {page === 'reports' && (
          <section>
            <h1>Reporting Financier</h1>
            <button onClick={exportExcel} style={{marginBottom:'20px'}}>📥 Télécharger Excel</button>
            <table width="100%" border="1" style={{borderCollapse:'collapse'}}>
              <thead>
                <tr><th>Prestataire</th><th>Actes</th><th>CA Total</th><th>Part Assurance</th></tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i}>
                    <td>{r.nom_etablissement}</td>
                    <td>{r.nombre_actes}</td>
                    <td>{r.ca_total} CFA</td>
                    <td>{r.total_assurance} CFA</td>
                  </tr>
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