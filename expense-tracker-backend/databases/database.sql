-- =====================================
-- Création de la base
-- =====================================
CREATE DATABASE personal_expense_tracker;
\c personal_expense_tracker;

-- Extension pour emails insensibles à la casse
CREATE EXTENSION IF NOT EXISTS citext;

-- =====================================
-- 1. Utilisateurs & Authentification
-- =====================================

-- Table utilisateur
CREATE TABLE utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL, -- hashé avec bcrypt/argon2
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table refresh token (optionnelle pour JWT)
CREATE TABLE refresh_token (
    id_token SERIAL PRIMARY KEY,
    id_utilisateur INT REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL, -- string opaque (UUID ou random)
    date_expiration TIMESTAMP NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- 2. Catégories de revenus/dépenses
-- =====================================
CREATE TABLE categorie (
    id_categorie SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    type_categorie VARCHAR(20) NOT NULL CHECK (type_categorie IN ('revenu','depense')),
    id_utilisateur INT REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- =====================================
-- 3. Comptes financiers
-- =====================================
CREATE TABLE compte (
    id_compte SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    solde_initial NUMERIC(12,2) DEFAULT 0,
    id_utilisateur INT REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE
);

-- =====================================


-- 4. Transactions
-- =====================================
CREATE TABLE transaction (
    id_transaction SERIAL PRIMARY KEY,
    id_utilisateur INT REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    id_categorie INT REFERENCES categorie(id_categorie) ON DELETE SET NULL,
    id_compte INT REFERENCES compte(id_compte) ON DELETE SET NULL,
    montant NUMERIC(12,2) NOT NULL,
    type_transaction VARCHAR(20) NOT NULL CHECK (type_transaction IN ('revenu','depense')),
    description TEXT,
    date_transaction DATE NOT NULL DEFAULT CURRENT_DATE
);

-- =====================================
-- 5. Budgets par catégorie
-- =====================================
CREATE TABLE budget (
    id_budget SERIAL PRIMARY KEY,
    id_utilisateur INT REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    id_categorie INT REFERENCES categorie(id_categorie) ON DELETE CASCADE,
    montant_max NUMERIC(12,2) NOT NULL,
    mois INT NOT NULL CHECK (mois BETWEEN 1 AND 12),
    annee INT NOT NULL
);

-- =====================================
-- 6. Objectifs d’épargne
-- =====================================
CREATE TABLE objectif (
    id_objectif SERIAL PRIMARY KEY,
    id_utilisateur INT REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    nom VARCHAR(150) NOT NULL,
    montant_cible NUMERIC(12,2) NOT NULL,
    montant_actuel NUMERIC(12,2) DEFAULT 0,
    date_limite DATE
);

-- =====================================
-- 7. Données de test
-- =====================================

-- Utilisateurs
INSERT INTO utilisateur (nom, email, mot_de_passe)
VALUES 
('Alice', 'alice@mail.com', 'hashed_pwd1'),
('Bob', 'bob@mail.com', 'hashed_pwd2');

-- Refresh tokens (exemple)
INSERT INTO refresh_token (id_utilisateur, token, date_expiration)
VALUES
(1, 'uuid_refresh_token_user1', '2025-12-31'),
(2, 'uuid_refresh_token_user2', '2025-12-31');

-- Catégories
INSERT INTO categorie (nom, type_categorie, id_utilisateur) VALUES
('Salaire', 'revenu', 1),
('Courses', 'depense', 1),
('Transport', 'depense', 1),
('Loisir', 'depense', 1),
('Investissement', 'revenu', 2);

-- Comptes
INSERT INTO compte (nom, solde_initial, id_utilisateur) VALUES
('Cash', 200.00, 1),
('Banque', 1000.00, 1),
('Mobile Money', 500.00, 2);

-- Transactions
INSERT INTO transaction (id_utilisateur, id_categorie, id_compte, montant, type_transaction, description, date_transaction)
VALUES
(1, 1, 2, 1200.00, 'revenu', 'Salaire mensuel', '2025-09-01'),
(1, 2, 1, 150.00, 'depense', 'Courses supermarché', '2025-09-02'),
(1, 3, 1, 50.00, 'depense', 'Taxi', '2025-09-03'),
(2, 5, 3, 300.00, 'revenu', 'Petit business', '2025-09-04');

-- Budgets
INSERT INTO budget (id_utilisateur, id_categorie, montant_max, mois, annee) VALUES
(1, 2, 500.00, 9, 2025),
(1, 3, 200.00, 9, 2025);

-- Objectifs
INSERT INTO objectif (id_utilisateur, nom, montant_cible, montant_actuel, date_limite) VALUES
(1, 'Acheter un vélo', 400.00, 100.00, '2025-12-31'),
(2, 'Voyage', 1000.00, 300.00, '2026-06-30');
