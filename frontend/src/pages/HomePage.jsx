import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Droplet,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Users,
  WifiOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const roles = [
  {
    icon: Stethoscope,
    title: 'Médecin',
    description: 'Consultez les dossiers, diagnostics, prescriptions et constantes de vos patients.',
    tone: 'blue',
  },
  {
    icon: Activity,
    title: 'Infirmier·ère',
    description: 'Effectuez le triage et saisissez les mesures au poste de suivi ambulatoire.',
    tone: 'teal',
  },
  {
    icon: ShieldCheck,
    title: 'Administration',
    description: 'Suivez les comptes professionnels et l’activité générale de la plateforme.',
    tone: 'slate',
  },
];

export default function HomePage() {
  return (
    <div className="public-home">
      <div className="hospital-ribbon">
        <div className="ribbon-inner">
          <span className="online-indicator" />
          <strong>Hôpital Général de Loandjili</strong>
          <span className="ribbon-location">Pointe-Noire, République du Congo</span>
          <span className="ribbon-unit">Unité de suivi ambulatoire HTA & diabète</span>
        </div>
      </div>

      <header className="public-header">
        <Link to="/" className="public-brand" aria-label="MediTrack, accueil">
          <span className="public-brand-mark"><HeartPulse size={23} /></span>
          <span><strong>MediTrack</strong><small>Hôpital Général de Loandjili</small></span>
        </Link>
        <nav className="public-nav" aria-label="Navigation principale">
          <a href="#pathologies">HTA & diabète</a>
          <a href="#fonctionnement">La plateforme</a>
          <a href="#espaces">Espaces professionnels</a>
        </nav>
        <Link to="/login" className="public-login-link"><LockKeyhole size={15} /> Connexion professionnelle</Link>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <span className="hero-label"><ShieldCheck size={15} /> Plateforme médicale de l’HGL</span>
              <h1>Le suivi clinique de l’<em>HTA</em> et du <em>diabète</em>, au plus près des patients.</h1>
              <p className="hero-description">
                MediTrack relie les consultations de l’Hôpital Général de Loandjili au suivi ambulatoire à Pointe-Noire. Les équipes soignantes disposent d’un espace commun pour les dossiers, les rendez-vous, les traitements et les constantes.
              </p>
              <div className="hero-actions">
                <Link to="/login" className="home-primary-action">Accéder à mon espace <ArrowRight size={17} /></Link>
                <a href="#espaces" className="home-secondary-action">Découvrir les espaces</a>
              </div>
              <div className="hero-trust-row">
                <span><CheckCircle2 size={15} /> API sécurisée Laravel Sanctum</span>
                <span><CheckCircle2 size={15} /> Données centralisées</span>
              </div>
            </div>

            <div className="portal-preview" aria-label="Aperçu des objectifs cliniques">
              <div className="preview-header">
                <div className="preview-brand-mark"><HeartPulse size={18} /></div>
                <div><strong>Portail Hospitalier HGL</strong><span>Bâtiment C · Consultations</span></div>
                <span className="preview-live"><i /> En ligne</span>
              </div>
              <div className="preview-metrics">
                <article className="preview-metric pressure-metric">
                  <span><HeartPulse size={16} /> Repère tensionnel</span>
                  <strong>&lt; 140/90 <small>mmHg</small></strong>
                  <p>Repère clinique indicatif</p>
                </article>
                <article className="preview-metric glucose-metric">
                  <span><Droplet size={16} /> Glycémie à jeun</span>
                  <strong>0,70–1,26 <small>g/L</small></strong>
                  <p>À interpréter selon le dossier</p>
                </article>
              </div>
              <div className="preview-workflow">
                <span className="preview-overline">Un suivi coordonné</span>
                <div><Check size={15} /><span>Dossiers médicaux et diagnostics</span></div>
                <div><Check size={15} /><span>Mesures et historique des constantes</span></div>
                <div><Check size={15} /><span>Rendez-vous et traitements</span></div>
              </div>
              <Link to="/login" className="preview-cta">Ouvrir l’espace professionnel <ArrowRight size={15} /></Link>
              <p className="preview-caption">Accès réservé au personnel habilité de l’Hôpital Général de Loandjili.</p>
            </div>
          </div>
        </section>

        <section className="home-facts" aria-label="Principes de la plateforme">
          <article><strong><Users size={20} /> Suivi coordonné</strong><span>Équipes médicales et soignantes</span></article>
          <article><strong><Activity size={20} /> Mesures centralisées</strong><span>Tension, glycémie, poids et température</span></article>
          <article><strong><Smartphone size={20} /> Accès web et mobile</strong><span>Portail professionnel et application patient</span></article>
          <article><strong><ShieldCheck size={20} /> Accès par rôle</strong><span>Espaces adaptés aux responsabilités</span></article>
        </section>

        <section className="home-section pathologies-section" id="pathologies">
          <div className="home-section-heading">
            <span>Spécialités cliniques</span>
            <h2>Une prise en charge centrée sur les maladies chroniques</h2>
            <p>Des informations regroupées pour faciliter le suivi dans le temps et la coordination entre les consultations et le domicile.</p>
          </div>
          <div className="condition-grid">
            <article className="condition-panel">
              <span className="condition-icon condition-heart"><HeartPulse size={23} /></span>
              <h3>Hypertension artérielle</h3>
              <p>Suivi de la pression systolique et diastolique, historique des mesures et repérage des valeurs qui nécessitent une attention clinique.</p>
              <div className="condition-tags"><span>Auto-mesure</span><span>Historique</span><span>Suivi thérapeutique</span></div>
            </article>
            <article className="condition-panel">
              <span className="condition-icon condition-drop"><Droplet size={23} /></span>
              <h3>Diabète</h3>
              <p>Centralisation des glycémies, des traitements prescrits et des consultations pour accompagner le suivi métabolique.</p>
              <div className="condition-tags"><span>Glycémie</span><span>Traitements</span><span>Consultations</span></div>
            </article>
          </div>
        </section>

        <section className="platform-band" id="fonctionnement">
          <div className="platform-band-inner">
            <span className="platform-icon"><WifiOff size={20} /></span>
            <div>
              <span className="platform-overline">Continuité du suivi</span>
              <h2>Un même parcours, à l’hôpital et au domicile.</h2>
              <p>Le portail professionnel et l’application mobile patient s’appuient sur l’API MediTrack pour consulter et transmettre les informations de suivi.</p>
            </div>
            <Link to="/login" className="platform-link">Accès professionnel <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="home-section roles-section" id="espaces">
          <div className="home-section-heading">
            <span>Accès professionnels</span>
            <h2>Un espace dédié à chaque rôle hospitalier</h2>
            <p>Les tableaux de bord s’adaptent au profil connecté.</p>
          </div>
          <div className="role-grid">
            {roles.map(({ icon: Icon, title, description, tone }) => (
              <article className="role-panel" key={title}>
                <span className={`role-icon role-${tone}`}><Icon size={21} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
                <Link to="/login">Connexion sécurisée <ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <Link to="/" className="footer-brand"><HeartPulse size={17} /> MediTrack</Link>
        <span>Hôpital Général de Loandjili · Pointe-Noire, République du Congo</span>
        <Link to="/login">Espace professionnel <ArrowRight size={14} /></Link>
      </footer>
    </div>
  );
}