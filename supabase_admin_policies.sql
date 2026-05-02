-- ============================================================
-- TP HIT - Politiques RLS Admin pour Supabase
-- À exécuter dans: Supabase > SQL Editor > New Query
-- ============================================================

-- 1. PROFILES : Permettre à l'admin de voir TOUS les profils
-- ============================================================

-- Supprimer l'ancienne politique admin si elle existe
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

-- Créer la politique : l'admin peut lire tous les profils
CREATE POLICY "Admin can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'maguiragacheick2@gmail.com'
);

-- 2. PROFILES : Permettre à chaque utilisateur de voir son propre profil
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- 3. PROFILES : Permettre à chaque utilisateur de mettre à jour son profil
-- ============================================================

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
);

-- 4. PROFILES : Permettre à l'admin de mettre à jour tous les profils (bannir, etc.)
-- ============================================================

DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;

CREATE POLICY "Admin can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'maguiragacheick2@gmail.com'
);

-- 5. TRANSACTIONS : Permettre à l'admin de voir TOUTES les transactions
-- ============================================================

DROP POLICY IF EXISTS "Admin can view all transactions" ON transactions;

CREATE POLICY "Admin can view all transactions"
ON transactions
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'maguiragacheick2@gmail.com'
);

-- 6. TRANSACTIONS : Permettre à chaque utilisateur de voir ses propres transactions
-- ============================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
ON transactions
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- 7. TRANSACTIONS : Permettre aux utilisateurs authentifiés de créer des transactions
-- ============================================================

DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;

CREATE POLICY "Users can insert transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 8. Activer le RLS sur les tables (si pas déjà fait)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FAIT ! Votre panel admin affichera maintenant toutes les données.
-- ============================================================
