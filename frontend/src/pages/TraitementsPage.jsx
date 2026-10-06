import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export default function TraitementsPage() {
  const [traitements, setTraitements] = useState([]);

  useEffect(() => {
    api.get('/traitements')
      .then((response) => setTraitements(response.data?.data ?? response.data ?? []))
      .catch(() => setTraitements([]));
  }, []);

  const activeCount = useMemo(
    () => traitements.filter((item) => item.status !== 'terminé').length,
    [traitements],
  );

  return (
    <div className="page-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Traitements</p>
          <h2>Suivi des prescriptions</h2>
        </div>
      </div>

      <div className="summary-grid">
        <article className="stat-card">
          <p className="stat-label">Total</p>
          <p className="stat-value">{traitements.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Actifs</p>
          <p className="stat-value">{activeCount}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Patients</p>
          <p className="stat-value">{new Set(traitements.map((item) => item.diagnostic?.dossier_medical?.patient?.id)).size}</p>
        </article>
      </div>

      <section className="table-card">
        <div className="card-header">
          <div>
            <p className="section-title">Traitements récents</p>
            <p className="small">Prescriptions et état des patients.</p>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Médicament</th>
              <th>Patient</th>
              <th>Posologie</th>
              <th>Etat</th>
            </tr>
          </thead>
          <tbody>
            {traitements.map((traitement) => (
              <tr key={traitement.id}>
                <td>{traitement.medicament || '—'}</td>
                <td>{traitement.diagnostic?.dossier_medical?.patient?.utilisateur?.prenom} {traitement.diagnostic?.dossier_medical?.patient?.utilisateur?.nom}</td>
                <td>{traitement.posologie || 'Non précisée'}</td>
                <td><span className={`status-pill ${traitement.status === 'terminé' ? 'status-closed' : 'status-confirmed'}`}>{traitement.status || 'Actif'}</span></td>
              </tr>
            ))}
            {traitements.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-row">Aucun traitement enregistré.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
