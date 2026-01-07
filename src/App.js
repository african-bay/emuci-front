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
    const data = await res.json();
    setReports(data);
  };

  const handlePoliceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // VALIDATION LOGIQUE DES PLAFONDS
    if (Number(data.plafond_famille) < Number(data.plafond_individuel)) {
      setError("Erreur : Le plafond FAMILLE doit être supérieur au plafond INDIVIDUEL.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/polices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        alert("Police créée avec succès !");
        e.target.reset();
      } else {
        const err = await res.json();
        setError(err.error);
      }
    } catch (err) { setError("Erreur de connexion au serveur."); }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporting_Financier");
    XLSX.writeFile(wb, `Djeli_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* NAVIGATION */}
      <nav style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2>🛡️ Djeli Santé</h2>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
          <li onClick={() => setPage('dashboard')} style={{ padding: '10px', cursor: 'pointer' }}>👥 Adhérents</li>
          <li onClick={() => setPage('polices')} style={{ padding: '10px', cursor: 'pointer' }}>📜 Polices</li>
          <li onClick={() => setPage('reports')} style={{ padding: '10px', cursor: 'pointer' }}>📊 Reportings</li>
        </ul>
      </nav>

      {/* CONTENU */}
      <main style={{ flex: 1, padding: '40px' }}>
        {page === 'polices' && (
          <section>
            <h1>Configuration des Polices (Barème EMCI)</h1>
            {error && <div style={{ color: 'white', background: '#e74c3c', padding: '10px', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={handlePoliceSubmit} style={{ display: 'grid', gap: '15px', maxWidth: '500px' }}>
              <input name="nom_police" placeholder="Nom de la Police" required />
              <input name="entreprise" placeholder="Entreprise" required />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input name="date_debut" type="date" required />
                <input name="date_fin" type="date" required />
              </div>
              <label>Plafond Individuel (CFA) :</label>
              <input name="plafond_individuel" type="number" min="0" required />
              <label>Plafond Famille (CFA) :</label>
              <input name="plafond_famille" type="number" min="0" required />
              <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px', borderRadius: '5px' }}>
                Enregistrer la Police
              </button>
            </form>
          </section>
        )}

        {page === 'reports' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h1>Reporting Financier Prestataires</h1>
              <button onClick={exportToExcel} style={{ background: '#3498db', color: 'white', padding: '10px' }}>📥 Export Excel</button>
            </div>
            <table width="100%" style={{ background: 'white', marginTop: '20px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#eee' }}><th>Établissement</th><th>Actes</th><th>CA Total</th><th>Part Assurance</th></tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{r.nom_etablissement}</td>
                    <td>{r.nombre_actes}</td>
                    <td>{Number(r.ca_total).toLocaleString()} CFA</td>
                    <td style={{ color: '#27ae60', fontWeight: 'bold' }}>{Number(r.total_assurance).toLocaleString()} CFA</td>
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