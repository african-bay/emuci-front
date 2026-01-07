import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Importation pour l'export Excel

const API_URL = "https://djeli-backend.onrender.com";

function App() {
  const [page, setPage] = useState('dashboard');
  const [polices, setPolices] = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      if (page === 'dashboard') {
        const res = await fetch(`${API_URL}/adherents-complet`);
        setAdherents(await res.json());
      } else if (page === 'polices') {
        const res = await fetch(`${API_URL}/polices`);
        setPolices(await res.json());
      } else if (page === 'prestataires') {
        const res = await fetch(`${API_URL}/prestataires`);
        setPrestataires(await res.json());
      } else if (page === 'reports') {
        const res = await fetch(`${API_URL}/reportings/prestataires`);
        setReports(await res.json());
      }
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
    }
  };

  // --- FONCTION EXPORT EXCEL ---
  const exportExcel = () => {
    if (reports.length === 0) return alert("Rien à exporter");
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporting_Finance");
    XLSX.writeFile(wb, `Reporting_Djeli_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
      
      {/* BARRE DE NAVIGATION LATERALE */}
      <nav style={{ width: '260px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ color: '#3498db', textAlign: 'center' }}>DJELI SANTÉ</h2>
        <hr border="0.5px solid #34495e" />
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
          <li onClick={() => setPage('dashboard')} className="nav-link">👥 Adhérents & Familles</li>
          <li onClick={() => setPage('polices')} className="nav-link">📜 Polices & Barèmes</li>
          <li onClick={() => setPage('prestataires')} className="nav-link">🏢 Réseau Prestataires</li>
          <li onClick={() => setPage('reports')} className="nav-link">📊 Reporting Financier</li>
        </ul>
      </nav>

      {/* ZONE DE CONTENU PRINCIPALE */}
      <main style={{ flex: 1, padding: '40px' }}>
        
        {/* PAGE POLICES : Gestion des plafonds positifs */}
        {page === 'polices' && (
          <section>
            <h1>📜 Configuration des Polices d'Assurance</h1>
            <div className="card">
              <h3>Nouvelle Police (Ex: Danone Santé)</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const data = Object.fromEntries(fd.entries());
                // Forcer les valeurs positives
                data.plafond_famille = Math.abs(data.plafond_famille);
                data.plafond_individuel = Math.abs(data.plafond_individuel);

                await fetch(`${API_URL}/polices`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                fetchData();
                e.target.reset();
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input name="nom_police" placeholder="Nom de la Police" required />
                  <input name="entreprise" placeholder="Entreprise" required />
                  <input name="date_debut" type="date" required />
                  <input name="date_fin" type="date" required />
                  <input name="plafond_famille" type="number" placeholder="Plafond Famille (CFA)" min="0" required />
                  <input name="plafond_individuel" type="number" placeholder="Plafond Individuel (CFA)" min="0" required />
                </div>
                <button type="submit" className="btn-save">Enregistrer la Police</button>
              </form>
            </div>
          </section>
        )}

        {/* PAGE PRESTATAIRES */}
        {page === 'prestataires' && (
          <section>
            <h1>🏢 Gestion du Réseau (Pharmacies & Cliniques)</h1>
            <div className="card">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.target));
                await fetch(`${API_URL}/prestataires`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                fetchData();
              }}>
                <input name="nom" placeholder="Nom de l'établissement" required />
                <select name="type">
                  <option value="PHARMACIE">Pharmacie</option>
                  <option value="CLINIQUE">Clinique</option>
                  <option value="HOPITAL">Hôpital Public</option>
                </select>
                <input name="tel" placeholder="Téléphone" />
                <button type="submit">Ajouter Prestataire</button>
              </form>
            </div>
            <table className="table">
              <thead>
                <tr><th>Nom</th><th>Type</th><th>Contact</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {prestataires.map(p => (
                  <tr key={p.id}>
                    <td>{p.nom_etablissement}</td>
                    <td>{p.type_etablissement}</td>
                    <td>{p.telephone}</td>
                    <td><button>Gérer Accès</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* PAGE REPORTING : Export Excel */}
        {page === 'reports' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>📊 Reporting & Dépenses Prestataires</h1>
              <button onClick={exportExcel} className="btn-excel">📥 Exporter vers Excel</button>
            </div>
            <table className="table">
              <thead style={{ background: '#f39c12', color: 'white' }}>
                <tr>
                  <th>Prestataire</th>
                  <th>Type</th>
                  <th>Nombre d'actes</th>
                  <th>Total Dépensé (CFA)</th>
                  <th>Part Assurance</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i}>
                    <td>{r.nom_etablissement}</td>
                    <td>{r.type_etablissement}</td>
                    <td>{r.nombre_actes}</td>
                    <td><strong>{Number(r.ca_total).toLocaleString()}</strong></td>
                    <td style={{ color: '#27ae60' }}>{Number(r.total_assurance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

      </main>

      <style>{`
        .nav-link { padding: 15px; cursor: pointer; border-radius: 5px; margin-bottom: 5px; transition: 0.3s; }
        .nav-link:hover { background: #34495e; color: #3498db; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .table { width: 100%; border-collapse: collapse; background: white; margin-top: 20px; border-radius: 8px; overflow: hidden; }
        .table th, .table td { padding: 15px; border-bottom: 1px solid #eee; text-align: left; }
        .btn-save { margin-top: 15px; background: #2c3e50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%; }
        .btn-excel { background: #27ae60; color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        input, select { padding: 12px; border: 1px solid #ddd; border-radius: 5px; width: 100%; box-sizing: border-box; }
      `}</style>
    </div>
  );
}

export default App;