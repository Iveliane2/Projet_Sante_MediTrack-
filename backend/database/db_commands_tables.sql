-- Fichier : backend/database/db_commands_tables.sql
-- Usage : regrouper ici les commandes SQL pour créer la base et les tables
-- Base supposée : MySQL / MariaDB

CREATE DATABASE IF NOT EXISTS `medi_track` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `medi_track`;

-- Table `users` (exemple minimal conforme aux migrations Laravel)
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `remember_token` VARCHAR(100) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table `cache` (structure simple)
CREATE TABLE IF NOT EXISTS `cache` (
  `key` VARCHAR(255) NOT NULL PRIMARY KEY,
  `value` LONGTEXT,
  `expiration` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table `jobs` (extrait de la migration typique Laravel que vous avez)
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `queue` VARCHAR(255) NOT NULL,
  `payload` LONGTEXT NOT NULL,
  `attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `reserved_at` INT UNSIGNED NULL DEFAULT NULL,
  `available_at` INT UNSIGNED NOT NULL,
  `created_at` INT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajoutez ici d'autres commandes / tables (password_resets, sessions, etc.) selon vos besoins
-- Contenu réduit : uniquement les tables fournies par l'utilisateur


CREATE TABLE IF NOT EXISTS utilisateurs (
  id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telephone VARCHAR(20),
  mot_de_passe VARCHAR(255) NOT NULL,
  langue_preferee ENUM('FRANCAIS','ANGLAIS','LINGALA','KIKONGO') DEFAULT 'FRANCAIS',
  role ENUM('PATIENT','MEDECIN','INFIRMIER','ADMIN') NOT NULL,
  statut ENUM('ACTIF','INACTIF') DEFAULT 'ACTIF',
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Table pour les patients, avec des informations spécifiques à leur rôle (ex : numéro de dossier médical, date de naissance, sexe, adresse, groupe sanguin, etc.)

CREATE TABLE IF NOT EXISTS patients (
  id_patient INT AUTO_INCREMENT PRIMARY KEY,
  id_utilisateur INT UNIQUE NOT NULL,
  numero_dossier VARCHAR(50) UNIQUE,
  date_naissance DATE,
  sexe ENUM('M','F'),
  adresse TEXT,
  groupe_sanguin VARCHAR(5),

  FOREIGN KEY (id_utilisateur)
  REFERENCES utilisateurs(id_utilisateur)
  ON DELETE CASCADE
);

--Table pour les médecins, avec des informations spécifiques à leur rôle (ex : spécialité, numéro de matricule, etc.)

CREATE TABLE IF NOT EXISTS medecins (
  id_medecin INT AUTO_INCREMENT PRIMARY KEY,
  id_utilisateur INT UNIQUE NOT NULL,
  matricule VARCHAR(50),
  specialite VARCHAR(100),

  FOREIGN KEY (id_utilisateur)
  REFERENCES utilisateurs(id_utilisateur)
  ON DELETE CASCADE
);

--Table pour les infirmiers, avec des informations spécifiques à leur rôle

CREATE TABLE IF NOT EXISTS infirmiers (
  id_infirmier INT AUTO_INCREMENT PRIMARY KEY,
  id_utilisateur INT UNIQUE NOT NULL,
  matricule VARCHAR(50),
  service VARCHAR(100),

  FOREIGN KEY (id_utilisateur)
  REFERENCES utilisateurs(id_utilisateur)
  ON DELETE CASCADE
);

-- Table pour les administrateurs du système, avec des droits d'accès spécifiques

CREATE TABLE IF NOT EXISTS administrateurs (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  id_utilisateur INT UNIQUE NOT NULL,
  niveau_acces VARCHAR(50),

  FOREIGN KEY (id_utilisateur)
  REFERENCES utilisateurs(id_utilisateur)
  ON DELETE CASCADE
);

-- Table pour les dossiers médicaux des patients, contenant les informations de base et les antécédents médicaux

CREATE TABLE IF NOT EXISTS dossiers_medicaux (
  id_dossier INT AUTO_INCREMENT PRIMARY KEY,
  id_patient INT UNIQUE NOT NULL,
  date_ouverture DATE,
  antecedents TEXT,
  allergies TEXT,
  observations TEXT,

  FOREIGN KEY (id_patient)
  REFERENCES patients(id_patient)
  ON DELETE CASCADE
);

-- Table pour les constantes médicales mesurées (ex : tension, glycémie, poids, température, etc.) et enregistrées dans le dossier médical

CREATE TABLE IF NOT EXISTS constantes_medicales (
  id_constante INT AUTO_INCREMENT PRIMARY KEY,
  id_dossier INT NOT NULL,

  tension_arterielle VARCHAR(20),
  glycemie DECIMAL(5,2),
  poids DECIMAL(5,2),
  temperature DECIMAL(4,1),

  date_mesure DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_dossier)
  REFERENCES dossiers_medicaux(id_dossier)
  ON DELETE CASCADE
);

-- Table pour les symptômes déclarés par les patients (ex : fièvre, toux, etc.) et enregistrés dans le dossier médical
CREATE TABLE IF NOT EXISTS symptomes (
  id_symptome INT AUTO_INCREMENT PRIMARY KEY,
  id_dossier INT NOT NULL,

  description TEXT,
  date_declaration DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_dossier)
  REFERENCES dossiers_medicaux(id_dossier)
  ON DELETE CASCADE
);

-- Table pour les diagnostics posés par les médecins suite à l'examen des dossiers médicaux et des symptômes déclarés

CREATE TABLE IF NOT EXISTS diagnostics (
  id_diagnostic INT AUTO_INCREMENT PRIMARY KEY,

  id_dossier INT NOT NULL,
  id_medecin INT NOT NULL,

  conclusion TEXT,
  date_diagnostic DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_dossier)
  REFERENCES dossiers_medicaux(id_dossier)
  ON DELETE CASCADE,

  FOREIGN KEY (id_medecin)
  REFERENCES medecins(id_medecin)
);

-- Table pour les traitements prescrits suite à un diagnostic

CREATE TABLE IF NOT EXISTS traitements (
  id_traitement INT AUTO_INCREMENT PRIMARY KEY,

  id_diagnostic INT NOT NULL,

  medicament VARCHAR(150),
  posologie VARCHAR(255),

  date_debut DATE,
  date_fin DATE,

  statut ENUM(
    'EN_COURS',
    'TERMINE',
    'SUSPENDU'
  ) DEFAULT 'EN_COURS',

  FOREIGN KEY (id_diagnostic)
  REFERENCES diagnostics(id_diagnostic)
  ON DELETE CASCADE
);

-- Table pour les rendez-vous entre patients et médecins

CREATE TABLE IF NOT EXISTS rendez_vous (
  id_rdv INT AUTO_INCREMENT PRIMARY KEY,

  id_patient INT NOT NULL,
  id_medecin INT NOT NULL,

  date_heure DATETIME NOT NULL,
  motif TEXT,

  statut ENUM(
    'PLANIFIE',
    'ANNULE',
    'TERMINE'
  ) DEFAULT 'PLANIFIE',

  FOREIGN KEY (id_patient)
  REFERENCES patients(id_patient),

  FOREIGN KEY (id_medecin)
  REFERENCES medecins(id_medecin)
);

-- Table pour les alertes générées à partir des constantes médicales (ex : tension trop élevée)

CREATE TABLE IF NOT EXISTS alertes (
  id_alerte INT AUTO_INCREMENT PRIMARY KEY,

  id_constante INT NOT NULL,

  type_alerte VARCHAR(100),
  message TEXT,

  niveau ENUM(
    'FAIBLE',
    'MOYEN',
    'CRITIQUE'
  ),

  date_alerte DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_constante)
  REFERENCES constantes_medicales(id_constante)
  ON DELETE CASCADE
);

-- Table pour les notifications envoyées aux patients (ex : rappel de rendez-vous, alerte santé, etc.)  

CREATE TABLE IF NOT EXISTS notifications (
  id_notification INT AUTO_INCREMENT PRIMARY KEY,

  id_patient INT NOT NULL,

  type VARCHAR(50),
  message TEXT,

  lu BOOLEAN DEFAULT FALSE,

  date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_patient)
  REFERENCES patients(id_patient)
  ON DELETE CASCADE
);

-- Table pour suivre les synchronisations des données entre l'application et d'autres systèmes (ex : hôpitaux partenaires, laboratoires, etc.)

CREATE TABLE IF NOT EXISTS synchronisations (
  id_sync INT AUTO_INCREMENT PRIMARY KEY,

  id_patient INT NOT NULL,

  date_sync DATETIME DEFAULT CURRENT_TIMESTAMP,

  statut ENUM(
    'REUSSI',
    'ECHEC',
    'EN_ATTENTE'
  ),

  type_sync ENUM(
    'AUTOMATIQUE',
    'MANUELLE'
  ),

  FOREIGN KEY (id_patient)
  REFERENCES patients(id_patient)
  ON DELETE CASCADE
);
