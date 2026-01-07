import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Pour l'export Excel

const API_URL = "https://djeli-backend.onrender.com";

// Liste exhaustive des garanties selon votre document
const GARANTIES_LISTE = [
  "CONSULTATION GENERALISTE", "CONSULTATION SPECIALISTE", "CONSULTATION PROFESSEUR",
  "VISITE GENERALISTE", "VISITE SPECIALISTE", "VISITE PROFESSEUR", "CONSULTATION URGENCE/GARDE",
  "FRAIS PHARMACEUTIQUES", "RADIOLOGIE & IMAGERIE", "ANALYSES BIOLOGIQUES", "PETITE CHIRURGIE/SOINS",
  "AUXILIAIRES MEDICAUX", "TRAITEMENTS PREVENTIFS (VACCINS)", "DENTISTERIE", "HOSPITALISATION (HEBERGEMENT)",
  "MATERNITE", "FRAIS D'OPTIQUE ADULTES", "FRAIS D'OPTIQUE ENFANT", "AMBULANCE / SAMU"
];

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [polices, setPolices] = useState([]);
  const [adherents, setAdherents] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [reportings, setReportings] = useState([]);

  // Chargement des données selon la page
  useEffect(() => {
    fetchGlobalData();
  }, [currentPage]);

  const fetchGlobalData = async () => {
    try {
      if (currentPage === 'dashboard') {
        const res = await fetch(`${API_URL}/adherents-complet`);
        setAdherents(await res.json());
      }
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
    } catch (err) { console.error("Erreur de chargement:", err); }
  };

  // --- LOGIQUE EXPORT EXCEL ---
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportings);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporting_Prestataires");
    XLSX.writeFile(workbook, `Reporting_Djeli_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <nav style={{ width: '260px', background: '#1a252f', color: '#ecf0f1', padding: '20px' }}>
        <h2 style={{ color: '#3498db', marginBottom: '30px' }}>🛡️ Djeli Santé</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li className="nav-item" onClick={() => setCurrentPage('dashboard')}>👥 Gestion Adhérents</li>
          <li className="nav-item" onClick={() => setCurrentPage('polices')}>📜 Polices & Barèmes</li>
          <li className="nav-item" onClick={() => setCurrentPage('prestataires')}>🏢 Réseau Prestataires</li>
          <li className="nav-item" onClick={() => setCurrentPage('reports')}>📊 Finance & Reporting</li>
        </ul>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '40px', background: '#f8f9fa' }}>
        
        {/* --- PAGE DASHBOARD ADHERENTS --- */}
        {currentPage === 'dashboard' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Gestion Administrative</h1>
                <button className="btn-primary">+ Nouvel Adhérent</button>
            </div>
            <table className="main-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Adhérent Principal</th>
                  <th>Police</th>
                  <th>Ayants Droit</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adherents.map(a => (
                  <tr key={a.id}>
                    <td><img src={a.photo_url} width="45" style={{borderRadius: '50%'}} alt="p" /></td>
                    <td><strong>{a.nom} {a.prenom}</strong><br/><small>{a.telephone}</small></td>
                    <td><span className="badge">{a.nom_police}</span></td>
                    <td>
                        {a.ayants_droit?.map(ad => (
                            <div key={ad.id} style={{fontSize: '11px'}}>• {ad.prenom} ({ad.lien_parente})</div>
                        ))}
                    </td>
                    <td>{a.statut}</td>
                    <td><button>Mise à jour famille</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* --- PAGE CONFIGURATION POLICES --- */}
        {currentPage === 'polices' && (
          <section>
            <h1>Configuration des Polices & Barèmes</h1>
            <div className="card">
              <h3>Créer une nouvelle police (Validité 1 an max)</h3>
              <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }} 
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const data = Object.fromEntries(new FormData(e.target));
                        await fetch(`${API_URL}/polices`, { 
                            method: 'POST', 
                            headers: {'Content-Type': 'application/json'}, 
                            body: JSON.stringify(data)
                        });
                        fetchGlobalData();
                    }}>
                <input name="nom_police" placeholder="Nom (ex: Danone Santé)" required />
                <input name="entreprise" placeholder="Entreprise" required />
                <input name="date_debut" type="date" required />
                <input name="date_fin" type="date" required />
                <input name="plafond_famille" type="number" placeholder="Plafond Famille (CFA)" min="0" required />
                <input name="plafond_individuel" type="number" placeholder="Plafond Individuel (CFA)" min="0" required />
                <button type="submit" className="btn-success" style={{ gridColumn: 'span 3' }}>Générer la Police et le Barème</button>
              </form>
            </div>
          </section>
        )}

        {/* --- PAGE PRESTATAIRES --- */}
        {currentPage === 'prestataires' && (
          <section>
            <h1>Réseau des Prestataires</h1>
            <div className="card">
              <form style={{ display: 'flex', gap: '10px' }} onSubmit={async (e) => {
                  e.preventDefault();
                  const data = Object.fromEntries(new FormData(e.target));
                  await fetch(`${API_URL}/prestataires`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
                  fetchGlobalData();
              }}>
                <input name="nom" placeholder="Nom Clinique/Pharmacie" required />
                <select name="type">
                    <option value="PHARMACIE">Pharmacie</option>
                    <option value="CLINIQUE">Clinique</option>
                    <option value="HOPITAL">Hôpital Public</option>
                </select>
                <input name="tel" placeholder="Téléphone CI" />
                <button type="submit">Ajouter Prestataire</button>
              </form>
            </div>
            <table className="main-table" style={{marginTop: '20px'}}>
                <thead><tr><th>Nom</th><th>Type</th><th>Contact</th><th>Dépenses Total</th></tr></thead>
                <tbody>
                    {prestataires.map(p => (
                        <tr key={p.id}>
                            <td><strong>{p.nom_etablissement}</strong></td>
                            <td>{p.type_etablissement}</td>
                            <td>{p.telephone}</td>
                            <td>{p.total_depenses || 0} CFA</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </section>
        )}

        {/* --- PAGE REPORTING --- */}
        {currentPage === 'reports' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Reporting & Finance</h1>
                <button onClick={exportToExcel} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
                    📥 Exporter en Excel (.xlsx)
                </button>
            </div>
            <table className="main-table">
                <thead style={{background: '#f39c12', color: 'white'}}>
                    <tr>
                        <th>Établissement</th>
                        <th>Nombre d'actes</th>
                        <th>Chiffre d'Affaires</th>
                        <th>Part Assurance (À payer)</th>
                        <th>Part Patient (Cash)</th>
                    </tr>
                </thead>
                <tbody>
                    {reportings.map((r, i) => (
                        <tr key={i}>
                            <td>{r.nom_etablissement}</td>
                            <td>{r.nombre_actes}</td>
                            <td>{Number(r.ca_total).toLocaleString()} CFA</td>
                            <td style={{color: '#e67e22', fontWeight: 'bold'}}>{Number(r.total_assurance).toLocaleString()} CFA</td>
                            <td>{Number(r.ca_total - r.total_assurance).toLocaleString()} CFA</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </section>
        )}

      </main>

      {/* STYLES CSS IN-JS RAPIDES */}
      <style>{`
        .nav-item { padding: 15px; cursor: pointer; border-radius: 8px; transition: 0.3s; }
        .nav-item:hover { background: #34495e; color: #3498db; }
        .main-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .main-table th { padding: 15px; text-align: left; background: #f2f2f2; }
        .main-table td { padding: 15px; border-bottom: 1px solid #eee; }
        .btn-primary { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        .btn-success { background: #27ae60; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; }
        .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .badge { background: #e1f5fe; color: #0288d1; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        input, select { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
      `}</style>
    </div>
  );
}

export default App;