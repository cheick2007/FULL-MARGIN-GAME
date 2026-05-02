'use client'; // Indique que ce composant s'exécute côté client (navigateur)

// Importation des hooks React nécessaires pour la gestion d'état et du canvas
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Trophy, TrendingUp, Target, Shield, Zap, Gem, Crown, Star, 
    Sword, Flame, Rocket, Activity, BarChart3, PieChart, 
    Wallet, Coins, Key, Lock, Unlock, Heart, Skull, Ghost, 
    Eye, Smile, Compass, Map, Flag, Anchor, ZapOff, AlertTriangle, 
    CheckCircle2, Award, Menu, X, Settings, LogOut, ChevronRight, 
    User, Layers, Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const IconMap: { [key: string]: React.ElementType } = {
    Trophy, TrendingUp, Target, Shield, Zap, Gem, Crown, Star, 
    Sword, Flame, Rocket, Activity, BarChart3, PieChart, 
    Wallet, Coins, Key, Lock, Unlock, Heart, Skull, Ghost, 
    Eye, Smile, Compass, Map, Flag, Anchor, ZapOff, AlertTriangle, 
    CheckCircle2, Award, User, Layers, Info
};

// Définition des types pour les modes de jeu : Standard (Vies, Checkpoints) ou Hardcore (1 Vie, Permadeath)
type GameMode = 'standard' | 'hardcore' | null;

// Définition des Thèmes de Cartes (Environnements)
const MAP_THEMES = [
  { name: "The Support Line", bg: "#111827", grid: "#1f2937", platformSafe: "#22c55e", platformDanger: "#ef4444", enemy: "#ef4444" },
  { name: "Bull Run", bg: "#064e3b", grid: "#047857", platformSafe: "#10b981", platformDanger: "#f59e0b", enemy: "#f59e0b" },
  { name: "Bear Winter", bg: "#0f172a", grid: "#1e293b", platformSafe: "#38bdf8", platformDanger: "#0ea5e9", enemy: "#e0f2fe" },
  { name: "Crypto Mine", bg: "#451a03", grid: "#78350f", platformSafe: "#fbbf24", platformDanger: "#b45309", enemy: "#f59e0b" },
  { name: "The Dark Pool", bg: "#2e1065", grid: "#4c1d95", platformSafe: "#8b5cf6", platformDanger: "#d946ef", enemy: "#f0abfc" },
  { name: "Flash Crash", bg: "#450a0a", grid: "#7f1d1d", platformSafe: "#f87171", platformDanger: "#ef4444", enemy: "#fca5a5" },
  { name: "DeFi Jungle", bg: "#14532d", grid: "#166534", platformSafe: "#84cc16", platformDanger: "#eab308", enemy: "#bef264" },
  { name: "High Frequency", bg: "#082f49", grid: "#0369a1", platformSafe: "#0ea5e9", platformDanger: "#ec4899", enemy: "#f472b6" },
  { name: "Leverage Peak", bg: "#171717", grid: "#404040", platformSafe: "#d4d4d8", platformDanger: "#a1a1aa", enemy: "#ffffff" },
  { name: "Margin Call Abyss", bg: "#000000", grid: "#220000", platformSafe: "#991b1b", platformDanger: "#dc2626", enemy: "#ff0000" },
];

// Définition des Skins
const SKINS = [
    { id: 'default', name: 'Trader Base', price: 0, type: 'basic', desc: 'Le modèle classique.' },
    { id: 'crypto_bro', name: 'Crypto Bro', price: 2000, type: 'pro', desc: 'Lunettes laser activées.' },
    { id: 'trader_pro', name: 'Wall Street', price: 5000, type: 'pro', desc: 'Costume chic.' },
    { id: 'paper_hands', name: 'Paper Hands', price: 10000, type: 'pro', desc: 'Mains fragiles.' },
    { id: 'diamond_hands', name: 'Diamond Hands', price: 20000, type: 'pro', desc: 'HODL jusqu\'au bout.' },
    { id: 'satoshi', name: 'Satoshi', price: 40000, type: 'pro', desc: 'Anonyme et mythique.' },
    { id: 'golden_whale', name: 'Golden Whale', price: 500, type: 'premium', desc: 'Statut VIP.' },
    { id: 'bear_market', name: 'Bear Market', price: 500, type: 'premium', desc: 'Avatar massif.' },
    { id: 'bull_market', name: 'Bull Market', price: 500, type: 'premium', desc: 'Prêt à charger.' },
    { id: 'degen_ape', name: 'Degen Ape', price: 500, type: 'premium', desc: 'Singe rebelle.' },
    { id: 'liquidator', name: 'The Liquidator', price: 500, type: 'premium', desc: 'Robot impitoyable.' },
    { id: 'day_trader', name: 'Day Trader', price: 6000, type: 'pro', desc: 'Rapide et stressé.' },
    { id: 'swing_trader', name: 'Swing Trader', price: 8000, type: 'pro', desc: 'Patient et calme.' },
    { id: 'scalper', name: 'Scalper', price: 12000, type: 'pro', desc: 'Toujours à l\'affût.' },
    { id: 'altcoin_maxi', name: 'Altcoin Maxi', price: 16000, type: 'pro', desc: 'Risque maximum.' },
    { id: 'broke_student', name: 'Étudiant Fauché', price: 2000, type: 'pro', desc: 'Trade avec 10$.' },
    { id: 'cyber_ninja', name: 'Cyber Ninja', price: 500, type: 'premium', desc: 'Furtif.' },
    { id: 'illuminati', name: 'Illuminati', price: 500, type: 'premium', desc: 'Il contrôle tout.' },
    { id: 'astronaut', name: 'Astronaut', price: 500, type: 'premium', desc: 'To the moon.' },
    { id: 'vampire', name: 'Vampire', price: 500, type: 'premium', desc: 'Suce la liquidité.' },
    { id: 'ghost', name: 'Ghost', price: 500, type: 'premium', desc: 'Invisible.' },
    { id: 'glitch', name: 'Glitch', price: 500, type: 'premium', desc: 'Erreur système.' },
    { id: 'neon_god', name: 'Neon God', price: 500, type: 'premium', desc: 'Brille de mille feux.' },
    { id: 'king_midas', name: 'King Midas', price: 500, type: 'premium', desc: 'Tout en or.' },
    { id: 'zombie', name: 'Zombie', price: 500, type: 'premium', desc: 'Revenu des morts.' },
    { id: 'demon', name: 'Demon', price: 500, type: 'premium', desc: 'L\'enfer rouge.' },
    { id: 'angel', name: 'Angel', price: 500, type: 'premium', desc: 'Le paradis vert.' },
    { id: 'alien', name: 'Alien', price: 500, type: 'premium', desc: 'Venu d\'ailleurs.' },
    { id: 'samurai', name: 'Samurai', price: 500, type: 'premium', desc: 'Honneur et katana.' },
    { id: 'pharaoh', name: 'Pharaoh', price: 500, type: 'premium', desc: 'Maître des pyramides.' },
    { id: 'cyborg', name: 'Cyborg', price: 500, type: 'premium', desc: 'Moitié machine.' }
];

// Définition des Gadgets
const GADGETS = [
    { id: 'none', name: 'Aucun Gadget', price: 0, type: 'basic', desc: 'Rien.' },
    { id: 'blue_aura', name: 'Aura Bleue', price: 1000, type: 'pro', desc: 'Aura basique.' },
    { id: 'green_aura', name: 'Aura Verte', price: 2000, type: 'pro', desc: 'Aura nature.' },
    { id: 'red_aura', name: 'Aura Rouge', price: 3000, type: 'pro', desc: 'Aura de feu.' },
    { id: 'yellow_aura', name: 'Aura Jaune', price: 4000, type: 'pro', desc: 'Aura électrique.' },
    { id: 'purple_aura', name: 'Aura Violette', price: 5000, type: 'pro', desc: 'Aura sombre.' },
    { id: 'white_aura', name: 'Aura Blanche', price: 6000, type: 'pro', desc: 'Aura pure.' },
    { id: 'black_aura', name: 'Aura Noire', price: 7000, type: 'pro', desc: 'Aura ténébreuse.' },
    { id: 'cap_blue', name: 'Casquette Bleue', price: 8000, type: 'pro', desc: 'Style décontracté.' },
    { id: 'cap_red', name: 'Casquette Rouge', price: 9000, type: 'pro', desc: 'Style urbain.' },
    { id: 'cap_green', name: 'Casquette Verte', price: 10000, type: 'pro', desc: 'Style nature.' },
    { id: 'trail_smoke', name: 'Traînée Fumée', price: 12000, type: 'pro', desc: 'Laisse de la fumée.' },
    { id: 'trail_spark', name: 'Traînée Étincelles', price: 14000, type: 'pro', desc: 'Petites étincelles.' },
    { id: 'trail_pixel', name: 'Traînée Pixels', price: 16000, type: 'pro', desc: 'Style rétro.' },
    { id: 'pet_cube', name: 'Mini-Cube', price: 20000, type: 'pro', desc: 'Un cube qui flotte.' },
    { id: 'pet_orb', name: 'Orbe Magique', price: 24000, type: 'pro', desc: 'Une orbe brillante.' },
    { id: 'pet_ghost', name: 'Petit Fantôme', price: 30000, type: 'pro', desc: 'Un fantôme mignon.' },
    { id: 'glasses_nerd', name: 'Lunettes Nerd', price: 4000, type: 'pro', desc: 'Intello.' },
    { id: 'glasses_sun', name: 'Lunettes Soleil', price: 6000, type: 'pro', desc: 'Cool attitude.' },
    { id: 'headband', name: 'Bandeau Ninja', price: 16000, type: 'pro', desc: 'Prêt au combat.' },
    { id: 'crown', name: 'Couronne Royale', price: 500, type: 'premium', desc: 'Le roi du marché.' },
    { id: 'halo', name: 'Auréole Dorée', price: 500, type: 'premium', desc: 'Un ange pur.' },
    { id: 'horns', name: 'Cornes Démon', price: 500, type: 'premium', desc: 'Démon du marché.' },
    { id: 'wings_angel', name: 'Ailes d\'Ange', price: 500, type: 'premium', desc: 'Vole au-dessus de tout.' },
    { id: 'wings_demon', name: 'Ailes de Démon', price: 500, type: 'premium', desc: 'Sombres et puissantes.' },
    { id: 'aura_super', name: 'Aura Saiyan', price: 500, type: 'premium', desc: 'Puissance maximale.' },
    { id: 'aura_matrix', name: 'Aura Matrix', price: 500, type: 'premium', desc: 'Hacker l\'algorithme.' },
    { id: 'trail_fire', name: 'Traînée de Feu', price: 500, type: 'premium', desc: 'Brûle le sol.' },
    { id: 'trail_rainbow', name: 'Traînée Arc-en-ciel', price: 500, type: 'premium', desc: 'Couleurs vibrantes.' },
    { id: 'trail_money', name: 'Traînée Billets', price: 500, type: 'premium', desc: 'Sème la richesse.' },
    { id: 'trail_crypto', name: 'Traînée Crypto', price: 500, type: 'premium', desc: 'Logos crypto.' },
    { id: 'pet_dragon', name: 'Mini-Dragon', price: 500, type: 'premium', desc: 'Crache du feu.' },
    { id: 'pet_doge', name: 'Doge Flottant', price: 500, type: 'premium', desc: 'To the moon.' },
    { id: 'pet_whale', name: 'Baleine Volante', price: 500, type: 'premium', desc: 'La mascotte VIP.' },
    { id: 'helmet_knight', name: 'Casque Chevalier', price: 500, type: 'premium', desc: 'Armure lourde.' },
    { id: 'helmet_space', name: 'Casque Spatial', price: 500, type: 'premium', desc: 'Prêt pour le décollage.' },
    { id: 'mask_hacker', name: 'Masque Anonyme', price: 500, type: 'premium', desc: 'Nous sommes légion.' },
    { id: 'mask_gas', name: 'Masque à Gaz', price: 500, type: 'premium', desc: 'Survie toxique.' },
    { id: 'laser_eyes_gold', name: 'Laser Or', price: 500, type: 'premium', desc: 'Vision de richesse.' },
    { id: 'sword_back', name: 'Épée Dorsale', price: 500, type: 'premium', desc: 'Prêt à trancher.' }
];

const ACHIEVEMENTS: any[] = [
    // --- Unique & Legacy ---
    {
        id: 'first_trade',
        title: { en: 'First Entry', fr: 'Première Entrée' },
        desc: { en: 'Enter the market for the first time.', fr: 'Entrez sur le marché pour la première fois.' },
        reward: 50,
        icon: 'Activity'
    },
    {
        id: 'risk_manager',
        title: { en: 'Risk Manager', fr: 'Gestionnaire de Risque' },
        desc: { en: 'Reach Level 2 in Standard mode.', fr: 'Atteignez le niveau 2 en mode Standard.' },
        reward: 100,
        icon: 'Shield'
    },
    {
        id: 'diamond_hands',
        title: { en: 'Diamond Hands', fr: 'Mains de Diamant' },
        desc: { en: 'Reach Level 5 in any mode.', fr: 'Atteignez le niveau 5 dans n\'importe quel mode.' },
        reward: 500,
        icon: 'Gem'
    },
    {
        id: 'hardcore_trader',
        title: { en: 'Hardcore Trader', fr: 'Trader Hardcore' },
        desc: { en: 'Reach Level 3 in Hardcore mode.', fr: 'Atteignez le niveau 3 en mode Hardcore.' },
        reward: 300,
        icon: 'Skull'
    },
    {
        id: 'whale_status',
        title: { en: 'Whale Status', fr: 'Statut de Baleine' },
        desc: { en: 'Accumulate $5,000 P&L.', fr: 'Accumulez 5 000 $ de P&L.' },
        reward: 1000,
        icon: 'Coins'
    },
    {
        id: 'skin_enthusiast',
        title: { en: 'Skin Enthusiast', fr: 'Passionné de Skins' },
        desc: { en: 'Unlock 5 different skins.', fr: 'Débloquez 5 skins différents.' },
        reward: 250,
        icon: 'User'
    },
    // --- Level Milestones (50 levels) ---
    ...Array.from({ length: 50 }).map((_, i) => ({
        id: `lvl_milestone_${i + 1}`,
        title: { en: `Survivor Lvl ${i + 1}`, fr: `Survivant Niv ${i + 1}` },
        desc: { en: `Reach level ${i + 1}.`, fr: `Atteignez le niveau ${i + 1}.` },
        reward: (i + 1) * 10,
        icon: 'Flag'
    })),
    // --- Profit Milestones (25 milestones) ---
    ...Array.from({ length: 25 }).map((_, i) => {
        const amount = (i + 1) * 1000;
        return {
            id: `profit_milestone_${amount}`,
            title: { en: `Profit Booster $${amount}`, fr: `Boost de Profit $${amount}` },
            desc: { en: `Reach $${amount} in P&L.`, fr: `Atteignez $${amount} de P&L.` },
            reward: 500,
            icon: 'TrendingUp'
        };
    }),
    // --- Game Count Milestones (20 milestones) ---
    ...Array.from({ length: 20 }).map((_, i) => {
        const count = (i + 1) * 10;
        return {
            id: `games_played_${count}`,
            title: { en: `${count} Session veteran`, fr: `Vétéran de ${count} sessions` },
            desc: { en: `Play ${count} total games.`, fr: `Jouez un total de ${count} parties.` },
            reward: 100,
            icon: 'Activity'
        };
    }),
    // --- Special Challenges ---
    {
        id: 'max_leverage',
        title: { en: 'Max Leverage', fr: 'Levier Maximum' },
        desc: { en: 'Accumulate $100,000 P&L.', fr: 'Accumulez 100 000 $ de P&L.' },
        reward: 5000,
        icon: 'Zap'
    },
    {
        id: 'market_legend',
        title: { en: 'Market Legend', fr: 'Légende du Marché' },
        desc: { en: 'Accumulate $1,000,000 P&L.', fr: 'Accumulez 1 000 000 $ de P&L.' },
        reward: 50000,
        icon: 'Crown'
    }
];

// --- Système de Traduction ---
const TRANSLATIONS: any = {
    fr: {
        welcome: "BIENVENUE",
        play: "JOUER",
        standard: "STANDARD",
        hardcore: "HARDCORE",
        shop: "BOUTIQUE",
        leaderboard: "CLASSEMENT",
        profile: "PROFIL",
        achievements: "SUCCÈS",
        language: "LANGUE",
        logout: "DÉCONNEXION",
        lives: "VIES",
        score: "P&L",
        level: "ZONE",
        coins: "MONNAIE",
        game_speed: "VITESSE DU JEU",
        high_volatility: "SURVIE EN HAUTE VOLATILITÉ",
        back: "RETOUR",
        unlocked: "DÉBLOQUÉ",
        locked: "VERROUILLÉ",
        reward: "RÉCOMPENSE",
        claim: "RÉCUPÉRER",
        progression: "PROGRESSION",
        best_score: "MEILLEUR P&L",
        max_level: "NIVEAU MAX",
        total_games: "PARTIES TOTALES",
        settings: "RÉGLAGES",
        account_settings: "MON COMPTE",
        status: "STATUT",
        active: "ACTIF",
        banned: "BANNI",
        login_title: "BON RETOUR",
        login_button: "CONNEXION",
        register_title: "CRÉER UN COMPTE",
        register_button: "S'INSCRIRE",
        email_label: "EMAIL",
        password_label: "MOT DE PASSE",
        show: "VOIR",
        hide: "CACHER",
        no_account: "Pas de compte ?",
        has_account: "Déjà un compte ?",
        sign_up: "S'inscrire",
        sign_in: "Se connecter",
        execute_order: "EXÉCUTER L'ORDRE",
        liquidated: "LIQUIDÉ",
        profit: "PROFIT",
        pause: "PAUSE",
        resume: "REPRENDRE",
        abandon: "ABANDONNER",
        return_menu: "RETOUR AU MENU"
    },
    en: {
        welcome: "WELCOME",
        play: "PLAY",
        standard: "STANDARD",
        hardcore: "HARDCORE",
        shop: "SHOP",
        leaderboard: "LEADERBOARD",
        profile: "PROFILE",
        achievements: "ACHIEVEMENTS",
        language: "LANGUAGE",
        logout: "LOGOUT",
        lives: "LIVES",
        score: "P&L",
        level: "ZONE",
        coins: "COINS",
        game_speed: "GAME SPEED",
        high_volatility: "HIGH VOLATILITY SURVIVAL",
        back: "BACK",
        unlocked: "UNLOCKED",
        locked: "LOCKED",
        reward: "REWARD",
        claim: "CLAIM",
        progression: "PROGRESSION",
        best_score: "BEST P&L",
        max_level: "MAX ZONE",
        total_games: "TOTAL GAMES",
        settings: "SETTINGS",
        account_settings: "ACCOUNT",
        status: "STATUS",
        active: "ACTIVE",
        banned: "BANNED",
        login_title: "WELCOME BACK",
        login_button: "LOGIN",
        register_title: "CREATE ACCOUNT",
        register_button: "SIGN UP",
        email_label: "EMAIL",
        password_label: "PASSWORD",
        show: "SHOW",
        hide: "HIDE",
        no_account: "No account?",
        has_account: "Have an account?",
        sign_up: "Sign up",
        sign_in: "Sign in",
        execute_order: "EXECUTE ORDER",
        liquidated: "LIQUIDATED",
        profit: "PROFIT",
        pause: "PAUSE",
        resume: "RESUME",
        abandon: "ABANDON",
        return_menu: "RETURN TO MENU"
    }
};

// Fonction utilitaire pour dessiner le personnage et ses gadgets
const drawPlayerAndGadget = (ctx: CanvasRenderingContext2D, frames: number, skinId: string, gadgetId: string, isJumping: boolean) => {
    let primaryColor = '#3b82f6';
    let secondaryColor = '#1d4ed8';
    let accentColor = '#60a5fa';
    let specialHead = 'none';

    switch(skinId) {
        case 'trader_pro': primaryColor = '#1f2937'; secondaryColor = '#111827'; accentColor = '#facc15'; specialHead = 'glasses'; break;
        case 'golden_whale': primaryColor = '#eab308'; secondaryColor = '#ca8a04'; accentColor = '#fef08a'; specialHead = 'whale'; break;
        case 'crypto_bro': primaryColor = '#10b981'; secondaryColor = '#047857'; accentColor = '#ef4444'; specialHead = 'laser'; break;
        case 'paper_hands': primaryColor = '#fde047'; secondaryColor = '#eab308'; accentColor = '#fef08a'; specialHead = 'paper'; break;
        case 'diamond_hands': primaryColor = '#38bdf8'; secondaryColor = '#0284c7'; accentColor = '#bae6fd'; specialHead = 'diamond'; break;
        case 'satoshi': primaryColor = '#171717'; secondaryColor = '#0a0a0a'; accentColor = '#f97316'; specialHead = 'hood'; break;
        case 'bear_market': primaryColor = '#78350f'; secondaryColor = '#451a03'; accentColor = '#b45309'; specialHead = 'bear'; break;
        case 'bull_market': primaryColor = '#7f1d1d'; secondaryColor = '#450a0a'; accentColor = '#ef4444'; specialHead = 'bull'; break;
        case 'degen_ape': primaryColor = '#8b5cf6'; secondaryColor = '#5b21b6'; accentColor = '#d8b4fe'; specialHead = 'ape'; break;
        case 'liquidator': primaryColor = '#dc2626'; secondaryColor = '#991b1b'; accentColor = '#000000'; specialHead = 'robot'; break;
        case 'day_trader': primaryColor = '#f87171'; secondaryColor = '#b91c1c'; accentColor = '#fca5a5'; specialHead = 'glasses'; break;
        case 'swing_trader': primaryColor = '#34d399'; secondaryColor = '#059669'; accentColor = '#6ee7b7'; specialHead = 'none'; break;
        case 'scalper': primaryColor = '#fbbf24'; secondaryColor = '#d97706'; accentColor = '#fcd34d'; specialHead = 'laser'; break;
        case 'altcoin_maxi': primaryColor = '#c084fc'; secondaryColor = '#7e22ce'; accentColor = '#d8b4fe'; specialHead = 'ape'; break;
        case 'broke_student': primaryColor = '#9ca3af'; secondaryColor = '#4b5563'; accentColor = '#d1d5db'; specialHead = 'paper'; break;
        case 'cyber_ninja': primaryColor = '#020617'; secondaryColor = '#000000'; accentColor = '#06b6d4'; specialHead = 'hood'; break;
        case 'illuminati': primaryColor = '#14532d'; secondaryColor = '#064e3b'; accentColor = '#22c55e'; specialHead = 'diamond'; break;
        case 'astronaut': primaryColor = '#f8fafc'; secondaryColor = '#94a3b8'; accentColor = '#38bdf8'; specialHead = 'helmet_space'; break;
        case 'vampire': primaryColor = '#000000'; secondaryColor = '#450a0a'; accentColor = '#dc2626'; specialHead = 'demon'; break;
        case 'ghost': primaryColor = '#f8fafc'; secondaryColor = '#e2e8f0'; accentColor = '#cbd5e1'; specialHead = 'ghost_head'; break;
        case 'glitch': primaryColor = '#10b981'; secondaryColor = '#ec4899'; accentColor = '#3b82f6'; specialHead = 'robot'; break;
        case 'neon_god': primaryColor = '#fbbf24'; secondaryColor = '#f59e0b'; accentColor = '#fcd34d'; specialHead = 'whale'; break;
        case 'king_midas': primaryColor = '#facc15'; secondaryColor = '#ca8a04'; accentColor = '#fef08a'; specialHead = 'crown'; break;
        case 'zombie': primaryColor = '#166534'; secondaryColor = '#14532d'; accentColor = '#4ade80'; specialHead = 'bear'; break;
        case 'demon': primaryColor = '#7f1d1d'; secondaryColor = '#450a0a'; accentColor = '#ef4444'; specialHead = 'horns'; break;
        case 'angel': primaryColor = '#f0fdf4'; secondaryColor = '#bbf7d0'; accentColor = '#fff'; specialHead = 'halo'; break;
        case 'alien': primaryColor = '#4ade80'; secondaryColor = '#22c55e'; accentColor = '#000000'; specialHead = 'glasses'; break;
        case 'samurai': primaryColor = '#450a0a'; secondaryColor = '#000000'; accentColor = '#facc15'; specialHead = 'hood'; break;
        case 'pharaoh': primaryColor = '#f59e0b'; secondaryColor = '#b45309'; accentColor = '#3b82f6'; specialHead = 'crown'; break;
        case 'cyborg': primaryColor = '#64748b'; secondaryColor = '#334155'; accentColor = '#0ea5e9'; specialHead = 'robot'; break;
        default: break;
    }

    // 1. Dessin de l'Aura ou Traînée (Arrière-plan)
    if (gadgetId.includes('aura')) {
        let auraColor = 'rgba(59, 130, 246, 0.4)';
        if (gadgetId === 'green_aura') auraColor = 'rgba(34, 197, 94, 0.4)';
        if (gadgetId === 'red_aura') auraColor = 'rgba(239, 68, 68, 0.4)';
        if (gadgetId === 'yellow_aura') auraColor = 'rgba(234, 179, 8, 0.4)';
        if (gadgetId === 'purple_aura') auraColor = 'rgba(168, 85, 247, 0.4)';
        if (gadgetId === 'white_aura') auraColor = 'rgba(255, 255, 255, 0.4)';
        if (gadgetId === 'black_aura') auraColor = 'rgba(0, 0, 0, 0.6)';
        if (gadgetId === 'aura_super') auraColor = 'rgba(250, 204, 21, 0.6)';
        if (gadgetId === 'aura_matrix') auraColor = 'rgba(16, 185, 129, 0.6)';
        
        ctx.beginPath();
        ctx.arc(14, 14, 24 + Math.sin(frames * 0.2) * 4, 0, Math.PI * 2);
        ctx.fillStyle = auraColor;
        ctx.fill();
    }
    
    // Ailes
    if (gadgetId === 'wings_angel') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-10, 0, 10, 20); ctx.fillRect(-15, 5, 5, 10);
    }
    if (gadgetId === 'wings_demon') {
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(-12, -5, 12, 10); ctx.fillRect(-8, 5, 4, 10);
    }

    // Traînées (Trails)
    if (gadgetId.includes('trail')) {
        const trailOffset = isJumping ? 10 : 0;
        if (gadgetId === 'trail_fire') { 
            ctx.fillStyle = '#ef4444'; ctx.fillRect(-10 - (frames % 10), 20 + trailOffset + Math.sin(frames * 0.5) * 5, 8, 8); 
            ctx.fillStyle = '#facc15'; ctx.fillRect(-5 - (frames % 5), 25 + trailOffset, 4, 4); 
        }
        if (gadgetId === 'trail_smoke') { 
            ctx.fillStyle = 'rgba(156, 163, 175, 0.5)'; ctx.fillRect(-15 - (frames % 15), 15 + trailOffset + Math.sin(frames * 0.3) * 5, 15, 15); 
        }
        if (gadgetId === 'trail_rainbow') { 
            ctx.fillStyle = `hsl(${frames * 5 % 360}, 100%, 50%)`; ctx.fillRect(-12, 10 + trailOffset, 10, 20); 
        }
        if (gadgetId === 'trail_money') { 
            ctx.fillStyle = '#22c55e'; ctx.font = 'bold 12px Arial'; ctx.fillText('$', -15 - (frames % 12), 25 + trailOffset + Math.sin(frames * 0.4) * 5); 
        }
        if (gadgetId === 'trail_crypto') { 
            ctx.fillStyle = '#facc15'; ctx.font = 'bold 12px Arial'; ctx.fillText('₿', -15 - (frames % 12), 25 + trailOffset + Math.sin(frames * 0.4) * 5); 
        }
        if (gadgetId === 'trail_pixel') { 
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(-10 - (frames % 8), 10 + trailOffset + Math.sin(frames * 0.6) * 10, 5, 5); 
        }
        if (gadgetId === 'trail_spark') { 
            ctx.fillStyle = '#fef08a'; ctx.fillRect(-10 - (frames % 5), 10 + trailOffset + Math.sin(frames * 0.8) * 10, 3, 3); 
        }
    }

    // 2. Dessin du Corps
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(4, 4, 28, 28);
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, 0, 28, 28);

    // 3. Yeux / Tête (Skin par défaut)
    ctx.fillStyle = '#fff';
    if (specialHead === 'glasses') { ctx.fillStyle = '#000'; ctx.fillRect(16, 6, 12, 5); }
    else if (specialHead === 'laser') { ctx.fillStyle = '#ef4444'; ctx.fillRect(16, 6, 16, 4); }
    else if (specialHead === 'hood') { ctx.fillStyle = '#000'; ctx.fillRect(12, 0, 16, 16); ctx.fillStyle = '#f97316'; ctx.fillRect(20, 8, 4, 4); }
    else if (specialHead === 'bear') { ctx.fillStyle = '#451a03'; ctx.fillRect(4, -4, 6, 6); ctx.fillRect(18, -4, 6, 6); ctx.fillStyle = '#000'; ctx.fillRect(20, 8, 4, 4); }
    else if (specialHead === 'bull') { ctx.fillStyle = '#e5e7eb'; ctx.fillRect(24, -6, 2, 8); ctx.fillRect(6, -6, 2, 8); ctx.fillStyle = '#000'; ctx.fillRect(20, 8, 4, 4); }
    else if (specialHead === 'robot') { ctx.fillStyle = '#000'; ctx.fillRect(12, 4, 12, 8); ctx.fillStyle = '#ef4444'; ctx.fillRect(16, 6, 4, 4); }
    else if (specialHead === 'ape') { ctx.fillStyle = '#fcd34d'; ctx.fillRect(16, 12, 12, 8); ctx.fillStyle = '#000'; ctx.fillRect(20, 6, 6, 4); }
    else if (specialHead === 'ghost_head') { ctx.fillStyle = '#000'; ctx.fillRect(18, 6, 4, 4); ctx.fillRect(24, 6, 4, 4); }
    else if (specialHead === 'helmet_space') { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(-4, -4, 36, 36); ctx.fillStyle = 'rgba(56,189,248,0.5)'; ctx.fillRect(14, 4, 16, 16); }
    else if (specialHead === 'demon') { ctx.fillStyle = '#000'; ctx.fillRect(20, 6, 4, 4); ctx.fillStyle = '#ef4444'; ctx.fillRect(14, 20, 2, 4); ctx.fillRect(20, 20, 2, 4); }
    else { ctx.fillRect(20, 6, 5, 5); }

    // 4. Accessoire (Cravate, logo)
    ctx.fillStyle = accentColor;
    if (specialHead === 'diamond') { ctx.fillRect(8, 12, 12, 12); }
    else { ctx.fillRect(12, 12, 4, 8); }

    // 5. Gadget: Chapeau ou Tête
    if (gadgetId === 'cap_blue') { ctx.fillStyle = '#3b82f6'; ctx.fillRect(0, -6, 28, 8); ctx.fillRect(28, -2, 6, 4); }
    if (gadgetId === 'cap_red') { ctx.fillStyle = '#ef4444'; ctx.fillRect(0, -6, 28, 8); ctx.fillRect(28, -2, 6, 4); }
    if (gadgetId === 'cap_green') { ctx.fillStyle = '#22c55e'; ctx.fillRect(0, -6, 28, 8); ctx.fillRect(28, -2, 6, 4); }
    if (gadgetId === 'crown' || specialHead === 'crown') { ctx.fillStyle = '#facc15'; ctx.fillRect(4, -10, 20, 10); ctx.fillRect(2, -14, 4, 6); ctx.fillRect(12, -14, 4, 6); ctx.fillRect(22, -14, 4, 6); }
    if (gadgetId === 'halo' || specialHead === 'halo') { ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(14, -12, 12, 4, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (gadgetId === 'horns' || specialHead === 'horns') { ctx.fillStyle = '#ef4444'; ctx.fillRect(4, -10, 4, 10); ctx.fillRect(20, -10, 4, 10); }
    if (gadgetId === 'glasses_nerd') { ctx.fillStyle = '#000'; ctx.fillRect(14, 4, 16, 8); ctx.fillStyle = '#fff'; ctx.fillRect(16, 6, 4, 4); ctx.fillRect(22, 6, 4, 4); }
    if (gadgetId === 'glasses_sun') { ctx.fillStyle = '#000'; ctx.fillRect(14, 4, 16, 8); }
    if (gadgetId === 'headband') { ctx.fillStyle = '#ef4444'; ctx.fillRect(0, 0, 28, 6); ctx.fillStyle = '#fff'; ctx.fillRect(12, 1, 4, 4); }
    if (gadgetId === 'helmet_knight') { ctx.fillStyle = '#94a3b8'; ctx.fillRect(-2, -2, 32, 32); ctx.fillStyle = '#0f172a'; ctx.fillRect(16, 6, 4, 12); }
    if (gadgetId === 'mask_hacker') { ctx.fillStyle = '#fff'; ctx.fillRect(12, 0, 16, 28); ctx.fillStyle = '#000'; ctx.fillRect(18, 8, 6, 2); ctx.fillRect(18, 20, 6, 4); }
    if (gadgetId === 'mask_gas') { ctx.fillStyle = '#4b5563'; ctx.fillRect(12, 8, 16, 20); ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(20, 18, 6, 0, Math.PI*2); ctx.fill(); }
    if (gadgetId === 'laser_eyes_gold') { ctx.fillStyle = '#facc15'; ctx.fillRect(16, 6, 24, 4); }
    if (gadgetId === 'sword_back') { ctx.fillStyle = '#94a3b8'; ctx.save(); ctx.translate(14, 14); ctx.rotate(Math.PI/4); ctx.fillRect(-2, -20, 4, 40); ctx.fillStyle = '#facc15'; ctx.fillRect(-6, 0, 12, 4); ctx.restore(); }

    // 6. Jambes
    ctx.fillStyle = secondaryColor;
    if (isJumping) {
        ctx.fillRect(4, 28, 8, 8);
        ctx.fillRect(16, 24, 12, 8);
    } else {
        const legAnim = Math.sin(frames * 0.2) * 6;
        ctx.fillRect(8 + legAnim, 28, 6, 12);
        ctx.fillRect(16 - legAnim, 28, 6, 12);
    }

    // 7. Familiers (Pets)
    if (gadgetId.includes('pet_')) {
        const petY = 10 + Math.sin(frames * 0.1) * 5;
        if (gadgetId === 'pet_cube') { ctx.fillStyle = '#06b6d4'; ctx.fillRect(-20, petY, 10, 10); }
        if (gadgetId === 'pet_orb') { ctx.fillStyle = '#d946ef'; ctx.beginPath(); ctx.arc(-15, petY + 5, 6, 0, Math.PI*2); ctx.fill(); }
        if (gadgetId === 'pet_ghost') { ctx.fillStyle = '#f8fafc'; ctx.fillRect(-20, petY, 12, 12); ctx.fillStyle = '#000'; ctx.fillRect(-16, petY + 4, 2, 2); }
        if (gadgetId === 'pet_dragon') { ctx.fillStyle = '#ef4444'; ctx.fillRect(-24, petY, 14, 8); ctx.fillStyle = '#facc15'; ctx.fillRect(-14, petY + 2, 4, 2); }
        if (gadgetId === 'pet_doge') { ctx.fillStyle = '#f59e0b'; ctx.fillRect(-22, petY, 12, 12); ctx.fillStyle = '#000'; ctx.fillRect(-16, petY + 4, 2, 2); }
        if (gadgetId === 'pet_whale') { ctx.fillStyle = '#3b82f6'; ctx.fillRect(-26, petY, 16, 10); ctx.fillStyle = '#fff'; ctx.fillRect(-14, petY + 2, 2, 2); }
    }
};

// Composant de prévisualisation des skins (Canvas animé)
const SkinPreview = ({ skinId, gadgetId = 'none' }: { skinId: string, gadgetId?: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameId: number;
        let frames = 0;

        const draw = () => {
            frames++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            // Centrer le personnage
            ctx.translate(canvas.width / 2 - 16, canvas.height / 2 - 20);

            // Ombre portée au sol
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(4, 38, 24, 4);

            drawPlayerAndGadget(ctx, frames, skinId, gadgetId, false);

            ctx.restore();

            frameId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(frameId);
    }, [skinId, gadgetId]);

    return <canvas ref={canvasRef} width={80} height={80} className="mx-auto block mb-2" />;
};

// Composant principal du jeu
export default function TradingGame() {
  // Référence vers l'élément Canvas HTML pour dessiner le jeu
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Gestion de l'État du Jeu (Variables React) ---

  // Mode de jeu actuel (Standard, Hardcore ou null si menu principal)
  const [gameMode, setGameMode] = useState<GameMode>(null);

  // État global du jeu : menu, démarrage, en jeu, game over, ou niveau terminé
  const [gameState, setGameState] = useState<'menu' | 'start' | 'playing' | 'gameover' | 'levelcomplete' | 'shop'>('menu');

  // Score du joueur (P&L - Profit & Loss)
  const [score, setScore] = useState(0);

  // Niveau actuel de difficulté
  const [level, setLevel] = useState(1);

  // Vies restantes du joueur
  const [lives, setLives] = useState(3);

  // Progression actuelle dans le niveau (distance parcourue en pixels logiques)
  const [levelProgress, setLevelProgress] = useState(0);

  // Distance cible à atteindre pour finir le niveau
  const [targetDistance, setTargetDistance] = useState(1000);

  // --- Nouveaux Réglages ---

  // Vitesse du jeu définie par l'utilisateur (par défaut 5)
  const [speedSetting, setSpeedSetting] = useState(5);

  // Zoom du jeu (Plus grand = plus proche)
  const [zoomSetting, setZoomSetting] = useState(1.4);

  // Indique si le joueur a atteint le checkpoint (pour le mode Standard)
  const [checkpointReached, setCheckpointReached] = useState(false);
  const [showCheckpointAnim, setShowCheckpointAnim] = useState(false);

  // --- Nouveaux États : Boutique, Skins, Gadgets, Monétisation ---
  const [totalCoins, setTotalCoins] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['default']);
  const [activeSkin, setActiveSkin] = useState<string>('default');
  const [unlockedGadgets, setUnlockedGadgets] = useState<string[]>(['none']);
  const [activeGadget, setActiveGadget] = useState<string>('none');
  const [shopTab, setShopTab] = useState<'skins' | 'gadgets'>('skins');
  const [notification, setNotification] = useState<{ title: string; reward: number; icon: string } | null>(null);
  const [showWaveModal, setShowWaveModal] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [maxDistance, setMaxDistance] = useState(1);
  const [isBanned, setIsBanned] = useState(false);
  const [adminView, setAdminView] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState({ users: 0, transactions: 0 });
  const [adminTransactionsList, setAdminTransactionsList] = useState<any[]>([]);
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  
  // États Auth
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // États formulaire paiement
  const [paymentName, setPaymentName] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');

  // --- Nouveaux États : Menu Hamburger, Succès, Langues ---
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [hamburgerTab, setHamburgerTab] = useState<'profile' | 'achievements' | 'settings'>('profile');
  const [userStats, setUserStats] = useState({ totalGames: 0, bestScore: 0, maxLevel: 1 });
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  // Effet pour charger l'utilisateur actif au démarrage
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        loadUserData(user.id);
      }
    };
    checkUser();
  }, []);

  const fetchAdminData = async () => {
    console.log("Fetching admin data...");
    // 1. Stats
    const { count: userCount, error: uErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: transCount, error: tErr } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
    
    if (uErr) console.error("Admin: Error fetching user count", uErr);
    
    setAdminStats({ users: userCount || 0, transactions: transCount || 0 });

    // 2. Transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
    setAdminTransactionsList(transactions || []);

    // 3. Utilisateurs
    const { data: users, error: lErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500); // Augmenté pour voir plus de monde
        
    if (lErr) console.error("Admin: Error fetching users list", lErr);
    setAdminUsersList(users || []);
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
        .from('profiles')
        .select('email, coins')
        .order('coins', { ascending: false })
        .limit(10);
    if (data) setLeaderboardData(data);
  };

  const loadUserData = async (userId: string) => {
    // 1. Charger le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setCurrentUser({ ...profile, id: userId }); 
      setTotalCoins(profile.coins || 0);
      setActiveSkin(profile.active_skin || 'default');
      setActiveGadget(profile.active_gadget || 'none');
      setIsBanned(profile.is_banned || false);

      // Charger les métadonnées (Stats, Succès, Langue)
      if (profile.metadata) {
          const meta = profile.metadata;
          if (meta.stats) setUserStats(meta.stats);
          if (meta.achievements) setUnlockedAchievements(meta.achievements);
          if (meta.claimed) setClaimedRewards(meta.claimed);
          if (meta.lang) setLang(meta.lang);
      }

      // 2. Charger les skins débloqués
      const { data: skins } = await supabase
        .from('unlocked_skins')
        .select('skin_id')
        .eq('user_id', userId);
      
      if (skins) setUnlockedSkins(skins.map((s: any) => s.skin_id));

      // 3. Charger les gadgets débloqués
      const { data: gadgets } = await supabase
        .from('unlocked_gadgets')
        .select('gadget_id')
        .eq('user_id', userId);
      
      if (gadgets) setUnlockedGadgets(gadgets.map((g: any) => g.gadget_id));
    }
  };

  // Fonction utilitaire pour sauvegarder la progression globale
  const saveGlobalState = async (
      coins: number, 
      skins: string[], 
      active: string, 
      gadgets: string[] = unlockedGadgets, 
      activeG: string = activeGadget,
      stats: any = userStats,
      achievements: string[] = unlockedAchievements,
      claimed: string[] = claimedRewards,
      currentLang: string = lang
  ) => {
    if (!currentUser) return;

    // 1. Update Profile
    await supabase
      .from('profiles')
      .update({
        coins: coins,
        active_skin: active,
        active_gadget: activeG,
        metadata: {
            stats,
            achievements,
            claimed,
            lang: currentLang
        }
      })
      .eq('id', currentUser.id);

    // 2. Sync Skins (Seulement si nouveau)
    const currentSkinsInDB = unlockedSkins;
    const newSkinsToSync = skins.filter((s: string) => !currentSkinsInDB.includes(s));
    for (const sId of newSkinsToSync) {
        await supabase.from('unlocked_skins').insert({ user_id: currentUser.id, skin_id: sId });
    }

    // 3. Sync Gadgets (Seulement si nouveau)
    const currentGadgetsInDB = unlockedGadgets;
    const newGadgetsToSync = gadgets.filter((g: string) => !currentGadgetsInDB.includes(g));
    for (const gId of newGadgetsToSync) {
        await supabase.from('unlocked_gadgets').insert({ user_id: currentUser.id, gadget_id: gId });
    }

    // Mise à jour de l'état local pour la réactivité
    setCurrentUser((prev: any) => ({ ...prev, coins, active_skin: active, active_gadget: activeG }));
  };

  // --- Logique des Succès & Stats ---
  const checkAchievements = (currentStats: any, currentUnlocked: string[], currentCoins: number) => {
      // Map for O(1) lookup
      const unlockedMap = new Set(currentUnlocked);
      let newlyUnlocked = [...currentUnlocked];
      let hasChanged = false;

      for (const ach of ACHIEVEMENTS) {
          if (unlockedMap.has(ach.id)) continue;

          let shouldUnlock = false;
          if (ach.id === 'first_trade' && currentStats.totalGames >= 1) shouldUnlock = true;
          else if (ach.id === 'risk_manager' && currentStats.maxLevel >= 2) shouldUnlock = true;
          else if (ach.id === 'diamond_hands' && currentStats.maxLevel >= 5) shouldUnlock = true;
          else if (ach.id === 'hardcore_trader' && gameMode === 'hardcore' && currentStats.maxLevel >= 3) shouldUnlock = true;
          else if (ach.id === 'whale_status' && currentCoins >= 5000) shouldUnlock = true;
          else if (ach.id === 'skin_enthusiast' && unlockedSkins.length >= 5) shouldUnlock = true;
          else if (ach.id === 'max_leverage' && currentCoins >= 100000) shouldUnlock = true;
          else if (ach.id === 'market_legend' && currentCoins >= 1000000) shouldUnlock = true;
          else if (ach.id.startsWith('lvl_milestone_') && currentStats.maxLevel >= parseInt(ach.id.split('_')[2])) shouldUnlock = true;
          else if (ach.id.startsWith('profit_milestone_') && currentCoins >= parseInt(ach.id.split('_')[2])) shouldUnlock = true;
          else if (ach.id.startsWith('games_played_') && currentStats.totalGames >= parseInt(ach.id.split('_')[2])) shouldUnlock = true;

          if (shouldUnlock) {
              newlyUnlocked.push(ach.id);
              unlockedMap.add(ach.id);
              hasChanged = true;
          }
      }

      return hasChanged ? newlyUnlocked : null;
  };

  const handleLevelComplete = () => {
    setGameState('levelcomplete');
    const newStats = {
        ...userStats,
        maxLevel: Math.max(userStats.maxLevel, level + 1)
    };
    setUserStats(newStats);
    const newlyUnlocked = checkAchievements(newStats, unlockedAchievements, totalCoins);
    if (newlyUnlocked) {
        const lastAchId = newlyUnlocked[newlyUnlocked.length - 1];
        const lastAch = ACHIEVEMENTS.find(a => a.id === lastAchId);
        if (lastAch) {
            setNotification({ title: lastAch.title[lang], reward: lastAch.reward, icon: lastAch.icon });
            setTimeout(() => setNotification(null), 5000);
        }
        setUnlockedAchievements(newlyUnlocked);
        saveGlobalState(totalCoins, unlockedSkins, activeSkin, unlockedGadgets, activeGadget, newStats, newlyUnlocked);
    }
    
    // Auto-transition après 2.5 secondes
    setTimeout(() => {
        setGameState(current => {
            if (current === 'levelcomplete') {
                nextLevel();
                return 'playing';
            }
            return current;
        });
    }, 2500);
  };

  const handleGameOver = () => {
    setGameState('gameover');
    const newStats = {
      ...userStats,
      totalGames: userStats.totalGames + 1,
      bestScore: Math.max(userStats.bestScore, score)
    };
    setUserStats(newStats);
    const newlyUnlocked = checkAchievements(newStats, unlockedAchievements, totalCoins);
    if (newlyUnlocked) {
        const lastAchId = newlyUnlocked[newlyUnlocked.length - 1];
        const lastAch = ACHIEVEMENTS.find(a => a.id === lastAchId);
        if (lastAch) {
            setNotification({ title: lastAch.title[lang], reward: lastAch.reward, icon: lastAch.icon });
            setTimeout(() => setNotification(null), 5000);
        }
        setUnlockedAchievements(newlyUnlocked);
        saveGlobalState(totalCoins, unlockedSkins, activeSkin, unlockedGadgets, activeGadget, newStats, newlyUnlocked);
    }
  };

  // --- Fonctions de Gestion ---

  // Fonction pour sélectionner le mode de jeu depuis le menu
  const selectMode = (mode: GameMode) => {
    setGameMode(mode); // Définit le mode
    setLives(mode === 'standard' ? 3 : 1); // 3 vies en Standard, 1 en Hardcore
    setGameState('start'); // Passe à l'écran de "Démarrage" (Start)
  };

  // Fonction pour retourner au menu principal
  const returnToMenu = () => {
    setGameMode(null); // Réinitialise le mode
    setGameState('menu'); // Affiche le menu
    setLevel(1); // Remet le niveau à 1
    setScore(0); // Remet le score à 0
    setCheckpointReached(false); // Réinitialise le checkpoint
  };

  // --- Effets (useEffect) ---

  // Effet pour gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Sécurité si le canvas n'existe pas

    // Fonction qui ajuste la taille du canvas à la taille de la fenêtre
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      
      // Update CSS size to match window
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    // Appel initial et ajout de l'écouteur d'événement
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Nettoyage de l'événement lors du démontage du composant
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []); // [] signifie que cela ne s'exécute qu'une fois au chargement

  useEffect(() => {
    if (gameState === 'menu' || gameState === 'shop') return; 

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); 
    if (!ctx) return;

    // Si on est en pause, on ne lance pas la boucle de dessin
    if (isPaused) return;

    // --- Variables de Contrôle ---
    let animationFrameId: number;
    let frames = 0;

    // On fixe une largeur logique de référence (Plus petit = plus zoomé)
    // On utilise zoomSetting pour calculer la largeur logique : 1000 / zoom
    const logicalWidth = Math.round(1000 / zoomSetting); 
    const dpr = window.devicePixelRatio || 1;
    // On calcule le ratio pour que 1000 unités logiques remplissent la largeur réelle de l'écran.
    const viewScale = (canvas.width / dpr) / logicalWidth; 
    // La hauteur logique dépend de la taille de l'écran pour garder le bon ratio.
    const logicalHeight = (canvas.height / dpr) / viewScale;

    const gameSpeed = speedSetting + (level * 0.4);
    let currentScore = score;
    let currentLives = lives;
    let distanceTraveled = levelProgress; 
    let isGameOverTriggered = false;

    const levelLength = 2000 + (level * 800);
    let currentTargetDistance = levelLength;

    // --- Entités du Jeu ---
    const player = {
      x: 100,
      y: logicalHeight / 2,
      width: 40,
      height: 40,
      dy: 0,
      jumpStrength: 13,
      gravity: 0.7,
      grounded: false,
      jumpCount: 0,
      color: '#3b82f6',
      invulnerable: 0,
    };

    interface LevelObstacle { worldX: number; y: number; width: number; height: number; color: string; isCheckpoint: boolean; passed: boolean; type: 'candle'; }
    interface LevelEnemy { worldX: number; y: number; width: number; height: number; startY: number; offset: number; active: boolean; type: 'drone'; }
    interface Projectile { x: number; y: number; dx: number; dy: number; type: 'SL'; width: number; height: number; }

    // --- Génération Déterministe du Niveau ---
    // Utilisation d'un PRNG basé sur le niveau pour que le parcours soit toujours identique
    let seed = level * 123456 + (gameMode === 'hardcore' ? 1 : 0);
    function random() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    const generatedObstacles: LevelObstacle[] = [];
    const generatedEnemies: LevelEnemy[] = [];
    const groundLevel = logicalHeight * 0.75;
    
    // Thème de la carte actuelle
    const currentTheme = MAP_THEMES[(level - 1) % MAP_THEMES.length];
    
    // Plateforme de départ (safe)
    generatedObstacles.push({
      worldX: 50,
      y: groundLevel,
      width: 600,
      height: logicalHeight,
      color: currentTheme.platformSafe,
      isCheckpoint: false,
      passed: false,
      type: 'candle'
    });
    
    let currentWorldX = 50 + 600;
    let lastY = groundLevel;
    let checkpointAssigned = false;
    
    while (currentWorldX < currentTargetDistance) {
      let gap, yVar;
      if (gameMode === 'hardcore') {
        gap = random() * 140 + 50;
        yVar = 220;
      } else {
        gap = random() * 180 + 70;
        yVar = 300;
      }

      let width = random() * 120 + 40;
      let y = lastY + (random() * yVar - (yVar / 2));

      if (y < logicalHeight * 0.25) y = logicalHeight * 0.25;
      if (y > logicalHeight * 0.85) y = logicalHeight * 0.85;

      let color = random() > 0.45 ? currentTheme.platformSafe : currentTheme.platformDanger;
      let isCheckpoint = false;
      
      const isCheckpointZone = gameMode === 'standard' && Math.abs(currentWorldX - currentTargetDistance / 2) < 500 && !checkpointAssigned;
      
      if (isCheckpointZone) {
          width = 600;
          color = '#3b82f6';
          isCheckpoint = true;
          checkpointAssigned = true;
      }

      currentWorldX += gap;
      
      generatedObstacles.push({
        worldX: currentWorldX,
        y: y,
        width: width,
        height: logicalHeight,
        color: color,
        isCheckpoint: isCheckpoint,
        passed: false,
        type: 'candle'
      });
      
      currentWorldX += width;
      lastY = y;
      
      if (random() < (0.015 + (level * 0.005))) {
          generatedEnemies.push({
              worldX: currentWorldX + 100,
              y: y - 250 - random() * 100,
              width: 45,
              height: 45,
              startY: y - 250,
              offset: random() * 100,
              active: true,
              type: 'drone'
          });
      }
    }
    
    const tpPlatform = {
      worldX: currentWorldX + 50,
      y: lastY,
      width: 800,
      height: logicalHeight,
      type: 'tp_platform'
    };
    
    // Mise à jour du maximum de distance pour la barre de progression
    setMaxDistance(tpPlatform.worldX);

    let projectiles: Projectile[] = [];
    let localCheckpointReached = checkpointReached;

    // --- Fonctions Utilitaires Internes ---
    const spawnProjectile = (enemy: LevelEnemy, screenX: number) => {
      projectiles.push({
        x: screenX,
        y: enemy.y + enemy.height / 2,
        dx: -6 - (level * 0.6),
        dy: (player.y - enemy.y) * 0.015,
        type: 'SL',
        width: 25,
        height: 12
      });
    };

    const respawnAtCheckpoint = () => {
      projectiles = [];
      player.dy = 0;
      player.jumpCount = 0;
      player.invulnerable = 120;
      frames = 0;
      generatedEnemies.forEach(e => e.active = true);

      if (gameMode === 'standard' && localCheckpointReached) {
        const cpObs = generatedObstacles.find(o => o.isCheckpoint);
        if (cpObs) {
            distanceTraveled = cpObs.worldX - 50;
            player.y = cpObs.y - 100;
            generatedObstacles.forEach(o => {
                if (o.worldX < cpObs.worldX) o.passed = true;
            });
        } else {
            distanceTraveled = 0;
            player.y = groundLevel - 100;
        }
      } else {
        distanceTraveled = 0;
        player.y = groundLevel - 100;
      }
    };

    // Positionnement initial du joueur au chargement de l'effet
    if (distanceTraveled === 0 || !localCheckpointReached) {
        player.y = groundLevel - 100;
    } else if (localCheckpointReached) {
        const cpObs = generatedObstacles.find(o => o.isCheckpoint);
        if (cpObs) {
            player.y = cpObs.y - 100;
        } else {
            player.y = groundLevel - 100;
        }
    }

    // Gestion des entrées Clavier (Saut)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (gameState === 'start') {
          respawnAtCheckpoint();
          setGameState('playing');
        } else if (gameState === 'levelcomplete' || gameState === 'gameover') {
          // Géré par l'UI
        } else if (player.grounded || player.jumpCount < 2) {
          player.dy = -player.jumpStrength;
          player.grounded = false;
          player.jumpCount++;
        }
      }
    };

    // Gestion des entrées Tactiles (Mobile)
    const handleTouch = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      if (gameState === 'start') {
        respawnAtCheckpoint();
        setGameState('playing');
      } else if (player.grounded || player.jumpCount < 2) {
        player.dy = -player.jumpStrength;
        player.grounded = false;
        player.jumpCount++;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    // --- Coeur du Jeu (Si en train de jouer) ---
    if (gameState === 'playing') {
      const update = () => {
        frames++;
        distanceTraveled += gameSpeed;

        // Progression réelle = (distance parcourue par le monde + position X du perso) / distance totale
        if (frames % 10 === 0) {
            const actualProgress = distanceTraveled + player.x;
            setLevelProgress(actualProgress);
        }

        // Application du transform en tenant compte du DPR et du ViewScale
        ctx.setTransform(dpr * viewScale, 0, 0, dpr * viewScale, 0, 0);

        // Arrière-plan (Remplit tout l'espace logique)
        ctx.fillStyle = currentTheme.bg;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);

        // Grille Premium Ultra-Subtile
        ctx.strokeStyle = currentTheme.grid;
        ctx.globalAlpha = 0.15; // Grille très discrète
        ctx.lineWidth = 1 / (dpr * viewScale); 
        ctx.beginPath();
        const gridSize = 100;
        const offset = distanceTraveled % gridSize;

        for (let x = -offset; x < logicalWidth; x += gridSize) {
          ctx.moveTo(x, 0); ctx.lineTo(x, logicalHeight);
        }
        for (let y = 0; y < logicalHeight; y += gridSize) {
          ctx.moveTo(0, y); ctx.lineTo(logicalWidth, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Physique Joueur
        player.dy += player.gravity;
        player.y += player.dy;
        player.grounded = false;
        if (player.invulnerable > 0) player.invulnerable--;

        // Mise à jour des Obstacles
        for (let i = 0; i < generatedObstacles.length; i++) {
          const obs = generatedObstacles[i];
          const screenX = obs.worldX - distanceTraveled;

          if (screenX + obs.width < -100) {
            if (!obs.passed) {
              obs.passed = true;
              currentScore += 15;
              setScore(currentScore);
            }
            continue;
          }
          if (screenX > logicalWidth + 200) continue;

          ctx.fillStyle = obs.color;
          ctx.fillRect(screenX, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#fff';
          ctx.fillRect(screenX + obs.width / 2 - 1, obs.y - 20, 2, 20);

          if (
            player.x < screenX + obs.width &&
            player.x + player.width > screenX &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
          ) {
            if (player.dy > 0 && player.y + player.height - player.dy <= obs.y + 25) {
              player.grounded = true;
              player.dy = 0;
              player.y = obs.y - player.height;
              player.jumpCount = 0;

              if (obs.isCheckpoint && !localCheckpointReached && gameMode === 'standard') {
                localCheckpointReached = true;
                setCheckpointReached(true);
                setShowCheckpointAnim(true);
                setTimeout(() => setShowCheckpointAnim(false), 2000);
              }
            } else {
              if (player.x + player.width > screenX && player.x < screenX + 10) {
                player.x = screenX - player.width;
              }
            }
          }
        }

        // Mise à jour des Ennemis
        for (let i = 0; i < generatedEnemies.length; i++) {
          const drone = generatedEnemies[i];
          if (!drone.active) continue;

          const triggerDistance = drone.worldX - (logicalWidth + 100);
          if (distanceTraveled < triggerDistance) continue;

          const screenX = (logicalWidth + 100) - (distanceTraveled - triggerDistance) * 1.3;

          if (screenX + drone.width < -100) {
              drone.active = false;
              continue;
          }

          drone.y = drone.startY + Math.sin((frames + drone.offset) * 0.08) * 80;

          ctx.fillStyle = currentTheme.enemy;
          ctx.fillRect(screenX, drone.y, drone.width, drone.height);
          ctx.fillStyle = '#e5e7eb';
          ctx.fillRect(screenX - 15, drone.y - 8, 75, 4);

          if (frames % (100 - Math.min(50, level * 5)) === 0) {
            if (screenX > 0 && screenX < logicalWidth) spawnProjectile(drone, screenX);
          }

          if (player.invulnerable === 0 &&
            player.x < screenX + drone.width &&
            player.x + player.width > screenX &&
            player.y < drone.y + drone.height &&
            player.y + player.height > drone.y
          ) {
            currentLives--;
            setLives(currentLives);
            player.invulnerable = 120;
            if (currentLives <= 0) handleGameOver();
          }
        }

        // Mise à jour des Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const proj = projectiles[i];
          proj.x += proj.dx;
          proj.y += proj.dy;

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px "Arial Black"';
          ctx.fillText('SL', proj.x, proj.y);

          if (player.invulnerable === 0 &&
            player.x < proj.x + proj.width &&
            player.x + player.width > proj.x &&
            player.y < proj.y + proj.height &&
            player.y + player.height > proj.y
          ) {
            currentLives--;
            setLives(currentLives);
            player.invulnerable = 120;
            projectiles.splice(i, 1);
            if (currentLives <= 0) handleGameOver();
            continue;
          }

          if (proj.x < 0 || proj.y > logicalHeight || proj.y < 0) projectiles.splice(i, 1);
        }

        // Mise à jour Plateforme de Fin
        const tpScreenX = tpPlatform.worldX - distanceTraveled;
        if (tpScreenX < logicalWidth + 200) {
          ctx.fillStyle = currentTheme.platformSafe;
          ctx.shadowColor = currentTheme.platformSafe;
          ctx.shadowBlur = 20;
          ctx.fillRect(tpScreenX, tpPlatform.y, tpPlatform.width, tpPlatform.height);
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#facc15';
          ctx.fillRect(tpScreenX + 200, tpPlatform.y - 150, 10, 150);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 30px Arial';
          ctx.fillText('FINISH / TP', tpScreenX + 150, tpPlatform.y - 170);

          if (
            player.x < tpScreenX + tpPlatform.width &&
            player.x + player.width > tpScreenX &&
            player.y < tpPlatform.y + tpPlatform.height &&
            player.y + player.height > tpPlatform.y
          ) {
            if (player.dy > 0 && player.y + player.height - player.dy <= tpPlatform.y + 50) {
              player.grounded = true;
              player.dy = 0;
              player.y = tpPlatform.y - player.height;
              player.jumpCount = 0;
            }
          }

          if (player.x > tpScreenX + 200) {
            handleLevelComplete();
          }
        }

        // Mort par le bas
        if (player.y > logicalHeight) {
          currentLives--;
          setLives(currentLives);
          if (currentLives <= 0 && !isGameOverTriggered) {
            isGameOverTriggered = true;
            const newTotal = totalCoins + currentScore;
            setTotalCoins(newTotal);
            saveGlobalState(newTotal, unlockedSkins, activeSkin);
            setGameState('gameover');
          } else if (currentLives > 0) {
            if (gameMode === 'standard') respawnAtCheckpoint();
            else { player.y = 0; player.dy = 0; player.invulnerable = 120; }
          }
        }

        // Mort par la gauche
        if (player.x + player.width < 0) {
          currentLives--;
          setLives(currentLives);
          if (currentLives <= 0 && !isGameOverTriggered) {
            isGameOverTriggered = true;
            const newTotal = totalCoins + currentScore;
            setTotalCoins(newTotal);
            saveGlobalState(newTotal, unlockedSkins, activeSkin);
            setGameState('gameover');
          } else if (currentLives > 0) {
            if (gameMode === 'standard') respawnAtCheckpoint();
            else { player.x = 100; player.y = 0; player.invulnerable = 120; }
          }
        }

        // --- Dessin du Joueur (Pseudo-3D Animé) ---
        if (player.invulnerable % 10 < 5) {
          ctx.save();
          ctx.translate(player.x, player.y);
          drawPlayerAndGadget(ctx, frames, activeSkin, activeGadget, !player.grounded);
          ctx.restore();
        }

        animationFrameId = requestAnimationFrame(update);
      };

      update();
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas?.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, level, gameMode, speedSetting, isPaused]); // Ajout de isPaused ici !

  // --- Fonction pour passer au niveau suivant ---
  const nextLevel = () => {
    setLevel(l => l + 1); // Augmente le niveau
    setTargetDistance(d => d + 800); // Augmente la distance
    if (gameMode === 'standard') setLives(3); // Rend les vies en Standard
    setCheckpointReached(false); // Reset checkpoint
    setLevelProgress(0); // Reset progression
    setGameState('playing'); // Relance
  };

  // --- Rendu de l'Interface Utilisateur (JSX) ---
  if (isBanned) {
    return (
      <div className="fixed inset-0 bg-red-950 flex items-center justify-center p-6 text-center z-[1000]">
        <div className="max-w-md">
          <h1 
            className="text-6xl font-black text-white mb-6 cursor-pointer select-none"
            onClick={(e) => {
                const clicks = parseInt(e.currentTarget.dataset.clicks || '0') + 1;
                e.currentTarget.dataset.clicks = clicks.toString();
                if (clicks >= 5) {
                    localStorage.removeItem('fm_isBanned');
                    window.location.reload();
                }
            }}
          >
            ACCÈS REFUSÉ
          </h1>
          <p className="text-xl text-red-400 font-bold mb-8">Votre compte a été banni pour tentative de fraude sur le système de paiement.</p>
          <div className="p-4 bg-black/40 rounded-xl border border-red-500/30 text-red-200 text-sm italic">
            "Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur avec vos preuves de paiement réelles."
          </div>
          <p className="text-[10px] text-red-900 mt-10 uppercase tracking-widest">Admin Secret: 5 Clicks on Title to Unban</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden font-mono select-none bg-black text-white touch-none">
      {/* Le Canvas où le jeu est dessiné */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Notification de Succès */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-sm animate-bounce-in px-4">
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-green-500/50 p-4 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 shrink-0">
               {React.createElement((IconMap as any)[notification.icon] || Trophy, { size: 28 })}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Succès Débloqué !</p>
              <h4 className="text-sm font-bold text-white uppercase leading-tight">{notification.title}</h4>
              <p className="text-[10px] text-gray-400 font-mono">+${notification.reward} P&L Reward</p>
            </div>
          </div>
        </div>
      )}

      {/* Écran d'Authentification */}
      {!currentUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black px-4 overflow-y-auto">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="w-full max-w-md relative z-10 animate-fade-in-up my-auto">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 md:p-12 rounded-3xl md:rounded-[2.5rem] shadow-2xl text-center">
              <div className="mb-8">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-zinc-900 rounded-2xl md:rounded-[2.5rem] border border-white/10 mx-auto mb-4 md:mb-6 overflow-hidden shadow-2xl">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase mb-1">
                  {authMode === 'login' ? TRANSLATIONS[lang].login_title : TRANSLATIONS[lang].register_title}
                </h2>
                <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-bold">TP HIT Trading Protocol</p>
              </div>

              <div className="space-y-4 mb-8 text-left">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 mb-2 block">{TRANSLATIONS[lang].email_label}</label>
                  <input 
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl focus:border-green-500 outline-none transition-all text-sm placeholder:text-gray-700"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center ml-1 mb-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">{TRANSLATIONS[lang].password_label}</label>
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[9px] font-bold text-gray-400 hover:text-green-500 uppercase tracking-widest transition-colors"
                    >
                      {showPassword ? TRANSLATIONS[lang].hide : TRANSLATIONS[lang].show}
                    </button>
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl focus:border-green-500 outline-none transition-all text-sm placeholder:text-gray-700"
                  />
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!emailInput || !passwordInput) {
                    alert(lang === 'fr' ? 'Veuillez remplir tous les champs.' : 'Please fill in all fields.');
                    return;
                  }
                  
                  if (authMode === 'register') {
                    const { data, error } = await supabase.auth.signUp({
                      email: emailInput,
                      password: passwordInput,
                    });
                    
                    if (error) {
                      alert(error.message);
                    } else if (data.user) {
                      alert(lang === 'fr' ? 'Compte créé !' : 'Account created!');
                      loadUserData(data.user.id);
                    }
                  } else {
                    const { data, error } = await supabase.auth.signInWithPassword({
                      email: emailInput,
                      password: passwordInput,
                    });

                    if (error) {
                      alert(lang === 'fr' ? 'Email ou mot de passe invalide.' : 'Invalid email or password.');
                    } else if (data.user) {
                      loadUserData(data.user.id);
                    }
                  }
                }}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-xl active:scale-95 mb-6"
              >
                {authMode === 'login' ? TRANSLATIONS[lang].login_button : TRANSLATIONS[lang].register_button}
              </button>

              <p className="text-gray-500 text-xs">
                {authMode === 'login' ? TRANSLATIONS[lang].no_account : TRANSLATIONS[lang].has_account}{' '}
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-white font-bold hover:text-blue-500 transition-colors ml-1"
                >
                  {authMode === 'login' ? TRANSLATIONS[lang].sign_up : TRANSLATIONS[lang].sign_in}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HUD - Interface de Jeu */}
      {gameState === 'playing' && (
        <div className="fixed inset-x-0 top-0 z-[150] p-4 md:p-8 flex flex-col pointer-events-none">
          <div className="flex items-start justify-between w-full">
            {/* Statuts & Barre de Progression */}
            <div className="flex flex-col gap-3 w-full max-w-[140px] md:max-w-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black text-green-500 uppercase tracking-widest">{TRANSLATIONS[lang].active}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <div className="flex gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 md:w-4 md:h-4 rounded-sm border ${i < lives ? 'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-white/5 border-white/10 opacity-20'}`} />
                      ))}
                   </div>
                   <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase italic tracking-widest">{gameMode === 'standard' ? 'STD' : 'HC'}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-end text-[7px] md:text-[9px] font-black text-white/50 uppercase tracking-tighter">
                    <span>Margin Level</span>
                    <span className="text-white">{Math.floor((levelProgress / maxDistance) * 100)}%</span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                    <div 
                      className={`h-full transition-all duration-300 ${checkpointReached ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}
                      style={{ width: `${Math.min(100, (levelProgress / maxDistance) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Score & Niveau (Card Premium) */}
            <div className="flex flex-col items-end gap-2">
              <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl text-center min-w-[90px] md:min-w-[150px]">
                <div className="text-2xl md:text-5xl font-black text-white tracking-tighter leading-none">${score.toLocaleString()}</div>
                <div className="text-[7px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">{TRANSLATIONS[lang].profit} • ZONE {level}</div>
              </div>
              
              <button 
                onClick={() => setIsPaused(true)}
                className="pointer-events-auto p-2.5 md:p-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl text-yellow-500 hover:scale-105 transition-all shadow-xl active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm">⏸</span>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{TRANSLATIONS[lang].pause}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Alertes visuelles (Checkpoint) */}
          {showCheckpointAnim && gameMode === 'standard' && (
            <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-pulse z-50">
              <div className="text-blue-500 text-3xl md:text-6xl font-black uppercase tracking-[0.3em] drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                CHECKPOINT<br />SECURED
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay de Pause */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center pointer-events-auto animate-fade-in">
          <div className="text-center p-6 md:p-8 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl max-w-sm w-full mx-4">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <span className="text-blue-500 text-4xl">⏸</span>
            </div>
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-white">SYSTEM PAUSED</h2>
            <p className="text-gray-500 text-sm mb-8 uppercase tracking-widest">Market Volatility Frozen</p>
            
            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => setIsPaused(false)}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95"
                >
                    {TRANSLATIONS[lang].resume}
                </button>
                <button 
                    onClick={() => { setIsPaused(false); returnToMenu(); }}
                    className="w-full py-3 text-gray-500 font-bold uppercase text-xs hover:text-white transition-colors"
                >
                    {TRANSLATIONS[lang].abandon}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton Hamburger (Top Left) */}
      {currentUser && gameState !== 'playing' && (
        <button 
          onClick={() => setIsHamburgerOpen(true)}
          className="fixed top-6 left-6 z-[100] w-10 h-10 md:w-12 md:h-12 bg-zinc-900 border border-white/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1 md:gap-1.5 hover:bg-zinc-800 transition-all shadow-xl"
        >
          <div className="w-5 md:w-6 h-0.5 bg-green-500 rounded-full"></div>
          <div className="w-5 md:w-6 h-0.5 bg-green-500 rounded-full"></div>
          <div className="w-5 md:w-6 h-0.5 bg-green-500 rounded-full"></div>
        </button>
      )}

      {/* Menu Principal */}
      {gameState === 'menu' && !adminView && (
        <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-auto z-50 overflow-y-auto">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="text-center relative z-10 w-full max-w-4xl px-4 py-8">
            <div className="mb-4 md:mb-10 relative inline-block group">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full group-hover:bg-green-500/30 transition-all duration-700"></div>
              <div className="relative z-10 w-20 h-20 md:w-36 md:h-36 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-4xl md:text-8xl font-black mt-4 md:mt-8 mb-1 md:mb-2 tracking-tighter flex items-center justify-center gap-2 md:gap-3">
              <span className="text-white">TP</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">HIT</span>
            </h1>
            <p className="text-gray-500 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-10 md:mb-20 text-[8px] md:text-xs font-bold bg-white/5 px-4 py-1 rounded-full inline-block border border-white/5">{TRANSLATIONS[lang].high_volatility}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
              {/* Bouton Mode Standard */}
              <button
                onClick={() => selectMode('standard')}
                className="group w-full p-6 md:p-10 border border-gray-600 hover:border-green-400 hover:bg-green-900/10 transition-all rounded-3xl relative overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-4xl">🛡️</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-black mb-1 text-green-400 uppercase tracking-tighter">{TRANSLATIONS[lang].standard}</h3>
                <div className="h-px w-16 bg-gray-700 my-4 group-hover:w-full transition-all duration-500 group-hover:bg-green-500/50"></div>
                <p className="text-xs md:text-base text-gray-300 font-bold uppercase tracking-widest">3 {TRANSLATIONS[lang].lives} • Checkpoints</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-2 uppercase tracking-[0.2em]">Safe Trading Entry</p>
              </button>

              {/* Bouton Mode Hardcore */}
              <button
                onClick={() => selectMode('hardcore')}
                className="group w-full p-6 md:p-10 border border-gray-600 hover:border-red-500 hover:bg-red-900/10 transition-all rounded-3xl relative overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-4xl">💀</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-black mb-1 text-red-500 uppercase tracking-tighter">{TRANSLATIONS[lang].hardcore}</h3>
                <div className="h-px w-16 bg-gray-700 my-4 group-hover:w-full transition-all duration-500 group-hover:bg-red-500/50"></div>
                <p className="text-xs md:text-base text-gray-300 font-bold uppercase tracking-widest">1 {TRANSLATIONS[lang].lives} • No Stop Loss</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-2 uppercase tracking-[0.2em]">High Volatility Protocol</p>
              </button>
            </div>

            {/* Bouton vers la Boutique */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-6">
                <button 
                    onClick={() => setGameState('shop')}
                    className="w-full sm:w-auto px-8 py-3.5 border border-green-500/50 text-green-500 hover:bg-green-900/20 transition-all rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-sm"
                >
                    {TRANSLATIONS[lang].shop}
                </button>
                <button 
                    onClick={() => {
                        setLeaderboardView(true);
                        fetchLeaderboard();
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-green-600 text-white hover:bg-green-500 transition-all rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-sm shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                >
                    <span>🏆</span> {TRANSLATIONS[lang].leaderboard}
                </button>
                <button 
                    onClick={() => setShowInstallPopup(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white hover:bg-blue-500 transition-all rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                    <span>📲</span> {lang === 'fr' ? 'INSTALLER' : 'INSTALL APP'}
                </button>
            </div>

            {/* User Info & Logout */}
            <div className="mt-8 md:mt-12 flex flex-col items-center gap-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{TRANSLATIONS[lang].active}: <span className="text-green-500">{currentUser?.email}</span></p>
                <button 
                    onClick={async () => {
                        await supabase.auth.signOut();
                        setCurrentUser(null);
                        setEmailInput('');
                        setPasswordInput('');
                    }}
                    className="text-[10px] text-gray-600 hover:text-white underline underline-offset-4 transition-colors uppercase tracking-widest font-black"
                >
                    {TRANSLATIONS[lang].logout}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Écran Boutique (Shop) */}
      {gameState === 'shop' && (
        <div className="fixed inset-0 bg-black z-50 pointer-events-auto flex flex-col">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            {/* Header Fixe / Collant */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-gray-800 p-3 md:p-6 z-30">
                <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-xl md:text-4xl font-black text-white leading-none">BOUTIQUE</h2>
                        <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Personnalisation</p>
                    </div>
                    
                    <div className="flex bg-gray-900 p-0.5 md:p-1 rounded-lg md:rounded-xl border border-gray-800">
                        <button 
                            onClick={() => setShopTab('skins')}
                            className={`px-3 md:px-5 py-1.5 md:py-2 rounded-md md:rounded-lg font-bold uppercase text-[9px] md:text-[10px] transition-all flex items-center gap-1 md:gap-2 ${shopTab === 'skins' ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <span>👤</span> Skins
                        </button>
                        <button 
                            onClick={() => setShopTab('gadgets')}
                            className={`px-3 md:px-5 py-1.5 md:py-2 rounded-md md:rounded-lg font-bold uppercase text-[9px] md:text-[10px] transition-all flex items-center gap-1 md:gap-2 ${shopTab === 'gadgets' ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <span>✨</span> Gadgets
                        </button>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0">
                        <span className="hidden md:block text-[9px] text-gray-500 uppercase tracking-widest mb-1">Solde Disponible</span>
                        <div className="bg-green-950/30 border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm md:text-xl font-bold text-green-400">${totalCoins}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Corps de la Boutique (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 mb-12">
                        {shopTab === 'skins' ? (
                          SKINS.map(skin => {
                            const isUnlocked = unlockedSkins.includes(skin.id) || skin.price === 0;
                            const isEquipped = activeSkin === skin.id;
                            const isPremium = skin.type === 'premium';
                            
                            return (
                                <div key={skin.id} className={`p-3 flex flex-col justify-between rounded-xl border transition-all ${isEquipped ? 'border-blue-500 bg-blue-900/20 scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.2)]' : isPremium ? 'border-yellow-600/50 bg-yellow-950/20 hover:border-yellow-500 hover:bg-yellow-900/30' : 'border-gray-800 bg-gray-900/40 hover:border-gray-600 hover:bg-gray-800/60'}`}>
                                    {isPremium && <div className="text-center text-[7px] bg-yellow-500 text-black py-0.5 font-black mb-2 rounded tracking-tighter">PREMIUM</div>}
                                    
                                    <SkinPreview skinId={skin.id} gadgetId={activeGadget} />
                                    
                                    <h3 className={`text-xs font-black text-center mb-1 leading-tight uppercase ${isPremium ? 'text-yellow-500' : 'text-white'}`}>{skin.name}</h3>
                                    <p className="text-[8px] text-gray-500 text-center mb-3 line-clamp-2 h-4">{skin.desc}</p>
                                    
                                    {isUnlocked ? (
                                        <button 
                                            onClick={() => { setActiveSkin(skin.id); saveGlobalState(totalCoins, unlockedSkins, skin.id); }}
                                            className={`w-full py-2 font-bold uppercase text-[9px] rounded transition-all ${isEquipped ? 'bg-blue-600 text-white shadow-inner' : 'bg-white text-black hover:bg-gray-200'}`}
                                        >
                                            {isEquipped ? 'Équipé ✓' : 'Sélectionner'}
                                        </button>
                                    ) : isPremium ? (
                                        <button 
                                            onClick={() => setShowWaveModal(skin.id)}
                                            className="w-full py-2 bg-black border border-gray-800 text-white font-bold uppercase text-[8px] rounded hover:border-blue-500 hover:text-blue-400 transition-all flex items-center justify-center gap-1"
                                        >
                                            <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] font-black">W</span>
                                            {skin.price} FCFA
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                if (totalCoins >= skin.price) {
                                                    const newCoins = totalCoins - skin.price;
                                                    const newSkins = [...unlockedSkins, skin.id];
                                                    setTotalCoins(newCoins);
                                                    setUnlockedSkins(newSkins);
                                                    setActiveSkin(skin.id);
                                                    saveGlobalState(newCoins, newSkins, skin.id);
                                                }
                                            }}
                                            className={`w-full py-2 font-bold uppercase text-[8px] rounded transition-all ${totalCoins >= skin.price ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                                        >
                                            Buy (${skin.price})
                                        </button>
                                    )}
                                </div>
                            );
                          })
                        ) : (
                          GADGETS.map(gadget => {
                            const isUnlocked = unlockedGadgets.includes(gadget.id) || gadget.price === 0;
                            const isEquipped = activeGadget === gadget.id;
                            const isPremium = gadget.type === 'premium';
                            
                            return (
                                <div key={gadget.id} className={`p-3 flex flex-col justify-between rounded-xl border transition-all ${isEquipped ? 'border-blue-500 bg-blue-900/20 scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.2)]' : isPremium ? 'border-yellow-600/50 bg-yellow-950/20 hover:border-yellow-500 hover:bg-yellow-900/30' : 'border-gray-800 bg-gray-900/40 hover:border-gray-600 hover:bg-gray-800/60'}`}>
                                    {isPremium && <div className="text-center text-[7px] bg-yellow-500 text-black py-0.5 font-black mb-2 rounded tracking-tighter">PREMIUM</div>}
                                    
                                    <SkinPreview skinId={activeSkin} gadgetId={gadget.id} />
                                    
                                    <h3 className={`text-xs font-black text-center mb-1 leading-tight uppercase ${isPremium ? 'text-yellow-500' : 'text-white'}`}>{gadget.name}</h3>
                                    <p className="text-[8px] text-gray-500 text-center mb-3 line-clamp-2 h-4">{gadget.desc}</p>
                                    
                                    {isUnlocked ? (
                                        <button 
                                            onClick={() => { setActiveGadget(gadget.id); saveGlobalState(totalCoins, unlockedSkins, activeSkin, unlockedGadgets, gadget.id); }}
                                            className={`w-full py-2 font-bold uppercase text-[9px] rounded transition-all ${isEquipped ? 'bg-blue-600 text-white shadow-inner' : 'bg-white text-black hover:bg-gray-200'}`}
                                        >
                                            {isEquipped ? 'Activé ✓' : 'Activer'}
                                        </button>
                                    ) : isPremium ? (
                                        <button 
                                            onClick={() => setShowWaveModal(gadget.id)}
                                            className="w-full py-2 bg-black border border-gray-800 text-white font-bold uppercase text-[8px] rounded hover:border-blue-500 hover:text-blue-400 transition-all flex items-center justify-center gap-1"
                                        >
                                            <span className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-[7px] font-black">W</span>
                                            {gadget.price} FCFA
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                if (totalCoins >= gadget.price) {
                                                    const newCoins = totalCoins - gadget.price;
                                                    const newGadgets = [...unlockedGadgets, gadget.id];
                                                    setTotalCoins(newCoins);
                                                    setUnlockedGadgets(newGadgets);
                                                    setActiveGadget(gadget.id);
                                                    saveGlobalState(newCoins, unlockedSkins, activeSkin, newGadgets, gadget.id);
                                                }
                                            }}
                                            className={`w-full py-2 font-bold uppercase text-[8px] rounded transition-all ${totalCoins >= gadget.price ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                                        >
                                            Buy (${gadget.price})
                                        </button>
                                    )}
                                </div>
                            );
                          })
                        )}
                    </div>


                    <div className="text-center pb-12">
                        <button 
                            onClick={() => setGameState('menu')}
                            className="px-12 py-4 bg-gray-900 text-gray-500 font-bold hover:text-white hover:bg-gray-800 uppercase tracking-widest text-xs transition-all rounded-xl border border-gray-800 hover:border-gray-600 shadow-lg"
                        >
                            {TRANSLATIONS[lang].return_menu}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Vue Leaderboard Global */}
      {leaderboardView && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 md:p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl animate-fade-in-up my-auto">
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-5 md:p-8 text-center border-b border-white/5">
                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-yellow-500 mb-1">Wall Street Top Traders</h2>
                    <p className="text-gray-500 text-[8px] md:text-[10px] uppercase tracking-[0.3em]">Global Rankings • All Time P&L</p>
                </div>
                
                <div className="p-6 md:p-10">
                    <div className="space-y-3">
                        {leaderboardData.map((player, index) => (
                            <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/50 scale-[1.02]' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-orange-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                                        {index + 1}
                                    </span>
                                    <span className={`font-bold ${index === 0 ? 'text-white text-lg' : 'text-gray-300'}`}>
                                        {player.email.split('@')[0]}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black font-mono ${index === 0 ? 'text-yellow-500 text-xl' : 'text-green-500'}`}>${player.coins.toLocaleString()}</p>
                                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Total Margin Profit</p>
                                </div>
                            </div>
                        ))}
                        {leaderboardData.length === 0 && <p className="text-center py-20 text-gray-600 italic">Analysing market data...</p>}
                    </div>

                    <button 
                        onClick={() => setLeaderboardView(false)}
                        className="w-full mt-10 py-4 border border-white/10 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                        Return to Terminal
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal Paiement Wave */}
      {showWaveModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/95 z-[100] pointer-events-auto px-4 backdrop-blur-md">
              <div className="bg-white text-black p-6 md:p-10 max-w-md w-full rounded-3xl text-center shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-center mb-6">
                      <img src="/wave-qr.jpg" alt="Wave QR Code" className="w-40 h-auto rounded-2xl shadow-lg border-4 border-[#1cc6ff]" />
                  </div>
                  <h3 className="text-3xl font-black mb-1">PAIEMENT WAVE</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">Validation Manuelle (Admin)</p>
                  
                  {/* Formulaire Utilisateur */}
                  <div className="space-y-4 mb-8 text-left">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Votre Nom Complet</label>
                        <input 
                            type="text" 
                            value={paymentName}
                            onChange={(e) => setPaymentName(e.target.value)}
                            placeholder="Ex: Jean Dupont"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#1cc6ff] outline-none transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Votre Numéro Wave</label>
                        <input 
                            type="text" 
                            value={paymentPhone}
                            onChange={(e) => setPaymentPhone(e.target.value)}
                            placeholder="Ex: 0707070707"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#1cc6ff] outline-none transition-all text-sm"
                        />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Envoyez 500 FCFA à :</p>
                      <p className="text-xl font-black font-mono text-[#1cc6ff]">+225 01 53 66 94 94</p>
                  </div>

                  <div className="bg-red-50 border border-red-100 p-3 rounded-xl mb-8">
                    <p className="text-[10px] text-red-600 font-bold leading-tight">
                        ⚠️ AVERTISSEMENT : Toute fausse déclaration de paiement entraînera un BANNISSEMENT définitif de votre compte.
                    </p>
                  </div>

                  <button 
                      onClick={async () => {
                          if (!paymentName || !paymentPhone) {
                              alert('Veuillez remplir votre nom et numéro avant de confirmer.');
                              return;
                          }
                          
                          const itemName = SKINS.find(s => s.id === showWaveModal)?.name || GADGETS.find(g => g.id === showWaveModal)?.name;
                          
                          // Logique de transaction réelle avec Supabase
                          await supabase.from('transactions').insert({
                              user_id: currentUser.id,
                              user_name: paymentName,
                              user_phone: paymentPhone,
                              item_id: showWaveModal,
                              item_name: itemName,
                              status: 'pending'
                          });

                          alert(`Demande envoyée ! L'objet "${itemName}" a été débloqué. L'admin vérifiera votre paiement sous peu.`);
                          
                          if (shopTab === 'skins') {
                            const newSkins = [...unlockedSkins, showWaveModal!];
                            setUnlockedSkins(newSkins);
                            setActiveSkin(showWaveModal!);
                            saveGlobalState(totalCoins, newSkins, showWaveModal!);
                          } else {
                            const newGadgets = [...unlockedGadgets, showWaveModal!];
                            setUnlockedGadgets(newGadgets);
                            setActiveGadget(showWaveModal!);
                            saveGlobalState(totalCoins, unlockedSkins, activeSkin, newGadgets, showWaveModal!);
                          }
                          
                          setPaymentName('');
                          setPaymentPhone('');
                          setShowWaveModal(null);
                      }}
                      className="w-full py-5 bg-[#1cc6ff] text-white font-black uppercase tracking-widest rounded-2xl mb-4 hover:bg-[#15a0d1] shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                  >
                      Confirmer l'envoi
                  </button>
                  <button 
                      onClick={() => setShowWaveModal(null)}
                      className="w-full py-2 text-gray-400 font-bold uppercase text-[10px] hover:text-gray-600 transition-colors"
                  >
                      Annuler
                  </button>
              </div>
          </div>
      )}

      {/* Écran de Démarrage (Start) */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40 pointer-events-auto backdrop-blur-sm px-4">
          <div className="text-center animate-fade-in-up p-6 md:p-12 border border-white/10 bg-black/80 rounded-2xl w-full max-w-md">
            <h2 className="text-xl md:text-4xl font-bold mb-3 uppercase text-white">
              {gameMode === 'standard' ? <span className="text-green-400">Standard Protocol</span> : <span className="text-green-500 font-black">TP HIT PRO</span>}
            </h2>
            <p className="text-gray-400 mb-6 md:mb-8 tracking-widest font-mono text-[10px] md:text-sm">
              {gameMode === 'standard' ? 'SYSTEM CHECK: STOPS ACTIVE. HEDGING ENABLED.' : 'WARNING: LIQUIDATION IMMINENT. NO STOPS.'}
            </p>
            <button
              onClick={() => setGameState('playing')}
              className="w-full px-8 py-3 md:py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition shadow-[0_0_20px_rgba(34,197,94,0.2)] text-xs md:text-base"
            >
              {TRANSLATIONS[lang].execute_order}
            </button>
          </div>
        </div>
      )}

      {/* Écran Game Over (Liquidation) */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 z-50 pointer-events-auto px-4 overflow-y-auto">
          <div className="text-center p-6 md:p-12 bg-black border border-red-800 shadow-[0_0_50px_rgba(220,38,38,0.5)] max-w-md md:max-w-xl w-full my-auto rounded-3xl">
            <h2 className="text-4xl md:text-8xl font-black text-red-600 mb-2 md:mb-4 uppercase tracking-tighter leading-none">{TRANSLATIONS[lang].liquidated}</h2>
            <p className="text-gray-400 mb-4 md:mb-10 uppercase tracking-widest border-b border-red-900/50 pb-4 text-[10px] md:text-base">Account Balance Zeroed</p>

            <div className="grid grid-cols-2 gap-3 md:gap-8 mb-4 md:mb-10">
              <div className="bg-red-900/10 p-3 md:p-4 rounded-xl">
                <span className="block text-[8px] md:text-xs uppercase text-gray-500 mb-1">Final P&L</span>
                <span className="text-xl md:text-3xl font-bold text-white">${score}</span>
              </div>
              <div className="bg-red-900/10 p-3 md:p-4 rounded-xl">
                <span className="block text-[8px] md:text-xs uppercase text-gray-500 mb-1">Zone Level</span>
                <span className="text-xl md:text-3xl font-bold text-white">{level}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 mt-6">
              <button
                onClick={() => {
                  alert('[Simulation AdSense] Publicité visionnée. Vous gagnez une seconde chance !');
                  setLives(1);
                  setGameState('playing');
                }}
                className="w-full py-3 bg-purple-600 border border-purple-500 text-white font-bold uppercase tracking-widest hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] text-xs md:text-sm flex items-center justify-center gap-2"
              >
                <span className="text-lg">▶</span> Regarder Pub (Revivre)
              </button>
              <button
                onClick={() => {
                  setGameState('playing');
                  setLives(gameMode === 'standard' ? 3 : 1);
                  setScore(0);
                  // En Standard, on garde le niveau actuel. En Hardcore, retour niveau 1.
                  if (gameMode !== 'standard') setLevel(1);
                  setCheckpointReached(false); // Reset checkpoint
                  setLevelProgress(0); // Reset progression
                }}
                className="w-full py-3 md:py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition text-xs md:text-sm"
              >
                Re-Deposit (Retry)
              </button>
              <button
                onClick={returnToMenu}
                className="w-full py-3 md:py-4 border border-zinc-700 text-zinc-400 font-bold uppercase tracking-widest hover:border-white hover:text-white transition text-xs md:text-sm"
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Écran Niveau Terminé (Take Profit) */}
      {gameState === 'levelcomplete' && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-900/90 z-[300] pointer-events-auto backdrop-blur-sm px-4">
          <div className="text-center p-6 md:p-12 bg-black/90 border border-yellow-500/50 shadow-2xl w-full max-w-lg rounded-3xl animate-bounce-in">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
                <Trophy size={40} className="text-yellow-500" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-yellow-500 mb-4 tracking-tighter">TAKE PROFIT</h2>
            <p className="text-base md:text-xl text-white font-bold mb-8 uppercase tracking-widest">Zone {level} Secured</p>
            <button
              onClick={nextLevel}
              className="w-full px-8 py-4 bg-yellow-500 text-black font-black uppercase tracking-widest hover:bg-yellow-400 shadow-lg transition-all active:scale-95"
            >
              Next Level
            </button>
            <p className="text-[10px] text-gray-500 mt-4 uppercase animate-pulse">Auto-transitioning...</p>
          </div>
        </div>
      )}

      {/* Dashboard Admin (Secret) */}
      {adminView && (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[200] overflow-y-auto p-4 md:p-10 pointer-events-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6 flex-wrap gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-white">ADMIN DASHBOARD</h2>
                        <p className="text-gray-500 text-sm uppercase tracking-widest">Gestion des Transactions & Bannissements</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchAdminData}
                            className="px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2 border border-white/5"
                        >
                            <span>🔄</span> Actualiser
                        </button>
                        <button 
                            onClick={() => setAdminView(false)}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
                        >
                            Quitter
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Total Utilisateurs</p>
                        <h3 className="text-3xl font-black text-blue-500">{adminStats.users}</h3>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Transactions Totales</p>
                        <h3 className="text-3xl font-black text-green-500">{adminStats.transactions}</h3>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Statut Système</p>
                        <h3 className="text-3xl font-black text-white">CLOUD ACTIF</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Liste des Transactions */}
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 md:p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Transactions Récentes (Supabase)
                        </h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-white/5 uppercase text-[10px] tracking-widest">
                                        <th className="py-4 px-2">Date</th>
                                        <th className="py-4 px-2">Utilisateur</th>
                                        <th className="py-4 px-2">Numéro</th>
                                        <th className="py-4 px-2">Objet</th>
                                        <th className="py-4 px-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminTransactionsList.map((t: any) => (
                                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                            <td className="py-4 px-2 text-gray-400">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="py-4 px-2 font-bold">{t.user_name}</td>
                                            <td className="py-4 px-2 font-mono text-blue-400">{t.user_phone}</td>
                                            <td className="py-4 px-2">
                                                <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase font-bold">{t.item_name}</span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <button 
                                                    onClick={async () => {
                                                        if (confirm(`Voulez-vous vraiment bannir ${t.user_name} ?`)) {
                                                            await supabase.from('profiles').update({ is_banned: true }).eq('id', t.user_id);
                                                            alert('Utilisateur banni dans le Cloud !');
                                                            fetchAdminData();
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
                                                >
                                                    Bannir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {adminTransactionsList.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-gray-600 italic">Aucune transaction Cloud.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Liste des Comptes Utilisateurs */}
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 md:p-8">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Comptes Cloud Enregistrés
                        </h3>
                        
                        <div className="overflow-y-auto max-h-[400px]">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-gray-500 border-b border-white/5 uppercase text-[10px] tracking-widest">
                                        <th className="py-4 px-2">Email</th>
                                        <th className="py-4 px-2">Solde</th>
                                        <th className="py-4 px-2">Banni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminUsersList.map((u: any) => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                            <td className="py-4 px-2 font-bold text-gray-300">{u.email}</td>
                                            <td className="py-4 px-2 text-green-400 font-mono">${u.coins}</td>
                                            <td className="py-4 px-2">
                                                {u.is_banned ? (
                                                    <span className="text-red-500 text-[10px] font-bold uppercase">Banni</span>
                                                ) : (
                                                    <span className="text-green-500 text-[10px] font-bold uppercase">Actif</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
      {/* Menu Hamburger Overlay */}
      {isHamburgerOpen && (
          <div className="fixed inset-0 z-[300] flex">
              <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setIsHamburgerOpen(false)}
              ></div>
              
              <div className="relative w-full max-w-[280px] md:max-w-sm bg-zinc-950 border-r border-white/10 h-full flex flex-col animate-slide-in-left shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
                  {/* Header Menu */}
                  <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-br from-green-900/20 to-black">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-800 rounded-xl md:rounded-2xl border border-white/10 overflow-hidden shadow-xl flex items-center justify-center">
                              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                          </div>
                          <div>
                              <h2 className="text-lg md:text-xl font-black text-white leading-tight">TP HIT</h2>
                              <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest truncate max-w-[120px] md:max-w-[180px]">{currentUser?.email?.split('@')[0]}</p>
                          </div>
                      </div>
                      
                      <div className="flex bg-black/40 p-1 rounded-lg md:rounded-xl border border-white/5">
                          {['profile', 'achievements', 'settings'].map((tab: any) => (
                              <button
                                  key={tab}
                                  onClick={() => setHamburgerTab(tab)}
                                  className={`flex-1 py-1.5 md:py-2 text-[8px] md:text-[10px] font-bold uppercase rounded-md md:rounded-lg transition-all ${hamburgerTab === tab ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                              >
                                  {TRANSLATIONS[lang][tab]}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                      {hamburgerTab === 'profile' && (
                          <div className="space-y-6">
                              <div>
                                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{TRANSLATIONS[lang].progression}</h3>
                                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                                      <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 hover:border-green-500/20 transition-all">
                                          <span className="block text-[8px] text-gray-500 uppercase mb-1">{TRANSLATIONS[lang].total_games}</span>
                                          <span className="text-lg md:text-xl font-bold text-white">{userStats.totalGames}</span>
                                      </div>
                                      <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 hover:border-green-500/20 transition-all">
                                          <span className="block text-[8px] text-gray-500 uppercase mb-1">{TRANSLATIONS[lang].max_level}</span>
                                          <span className="text-lg md:text-xl font-bold text-white">{userStats.maxLevel}</span>
                                      </div>
                                      <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 col-span-2 hover:border-green-500/20 transition-all">
                                          <span className="block text-[8px] text-gray-500 uppercase mb-1">{TRANSLATIONS[lang].best_score}</span>
                                          <span className="text-lg md:text-xl font-bold text-green-400">${userStats.bestScore}</span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="pt-6 border-t border-white/5">
                                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{TRANSLATIONS[lang].account_settings}</h3>
                                  <div className="flex flex-col gap-3">
                                      <div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl">
                                          <span className="text-[10px] md:text-xs text-gray-400">{TRANSLATIONS[lang].status}</span>
                                          <span className="text-[9px] md:text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full uppercase">{TRANSLATIONS[lang].active}</span>
                                      </div>
                                      
                                      {/* Bouton Admin Dashboard - Accès sécurisé */}
                                      {currentUser?.email === 'maguiragacheick2@gmail.com' && (
                                          <button 
                                              onClick={() => {
                                                  setAdminView(true);
                                                  setIsHamburgerOpen(false);
                                                  fetchAdminData();
                                              }}
                                              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-red-500/30"
                                          >
                                              <Shield size={16} />
                                              ADMIN PANEL
                                          </button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      )}

                      {hamburgerTab === 'achievements' && (
                          <div className="space-y-4">
                              {ACHIEVEMENTS.map(ach => {
                                  const isUnlocked = unlockedAchievements.includes(ach.id);
                                  const isClaimed = claimedRewards.includes(ach.id);
                                  const IconComponent = (IconMap as any)[ach.icon] || Trophy;
                                  
                                  return (
                                      <div key={ach.id} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${isUnlocked ? 'bg-zinc-900 border-green-500/30' : 'bg-black/40 border-white/5 opacity-60'}`}>
                                          <div className="flex items-center gap-3 md:gap-4">
                                              <div className={`p-2 rounded-lg ${isUnlocked ? 'text-green-400 bg-green-500/10' : 'text-gray-600 bg-white/5'}`}>
                                                <IconComponent size={24} />
                                              </div>
                                              <div className="flex-1">
                                                  <h4 className={`text-[10px] md:text-xs font-bold uppercase ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title[lang]}</h4>
                                                  <p className="text-[8px] md:text-[9px] text-gray-500">{ach.desc[lang]}</p>
                                              </div>
                                          </div>
                                          {isUnlocked && (
                                              <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/5 flex items-center justify-between">
                                                  <span className="text-[8px] md:text-[9px] font-bold text-green-500 uppercase tracking-widest">+ ${ach.reward} P&L</span>
                                                  {!isClaimed && (
                                                      <button 
                                                          onClick={() => {
                                                              const newCoins = totalCoins + ach.reward;
                                                              const newClaimed = [...claimedRewards, ach.id];
                                                              setTotalCoins(newCoins);
                                                              setClaimedRewards(newClaimed);
                                                              saveGlobalState(newCoins, unlockedSkins, activeSkin, unlockedGadgets, activeGadget, userStats, unlockedAchievements, newClaimed);
                                                          }}
                                                          className="px-3 md:px-4 py-1 md:py-1.5 bg-green-600 text-white text-[8px] md:text-[9px] font-black uppercase rounded-md md:rounded-lg hover:bg-green-500 transition-all active:scale-95 shadow-lg shadow-green-500/20"
                                                      >
                                                          {TRANSLATIONS[lang].claim}
                                                      </button>
                                                  )}
                                                  {isClaimed && <span className="text-[8px] md:text-[9px] text-gray-600 uppercase font-black italic">Claimed ✓</span>}
                                              </div>
                                          )}
                                      </div>
                                  );
                              })}
                          </div>
                      )}

                      {hamburgerTab === 'settings' && (
                          <div className="space-y-8">
                              <div>
                                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{TRANSLATIONS[lang].language}</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                      <button 
                                          onClick={() => setLang('fr')}
                                          className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${lang === 'fr' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10'}`}
                                      >
                                          FRANÇAIS
                                      </button>
                                      <button 
                                          onClick={() => setLang('en')}
                                          className={`py-2.5 text-[10px] font-black rounded-xl border transition-all ${lang === 'en' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10'}`}
                                      >
                                          ENGLISH
                                      </button>
                                  </div>
                              </div>

                              <div>
                                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">ENGINE PROTOCOL</h3>
                                  <div className="space-y-6">
                                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                          <div className="flex justify-between items-center mb-3">
                                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{TRANSLATIONS[lang].game_speed}</label>
                                              <span className="text-xs font-bold text-green-400">{speedSetting}</span>
                                          </div>
                                          <input
                                              type="range"
                                              min="3"
                                              max="10"
                                              step="0.5"
                                              value={speedSetting}
                                              onChange={(e) => setSpeedSetting(parseFloat(e.target.value))}
                                              className="w-full accent-green-500 h-1.5 bg-black rounded-lg appearance-none"
                                          />
                                      </div>

                                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                          <div className="flex justify-between items-center mb-3">
                                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang === 'fr' ? 'ZOOM DU JEU' : 'GAME ZOOM'}</label>
                                              <span className="text-xs font-bold text-blue-400">x{zoomSetting.toFixed(2)}</span>
                                          </div>
                                          <input
                                              type="range"
                                              min="1"
                                              max="2.5"
                                              step="0.1"
                                              value={zoomSetting}
                                              onChange={(e) => setZoomSetting(parseFloat(e.target.value))}
                                              className="w-full accent-blue-500 h-1.5 bg-black rounded-lg appearance-none"
                                          />
                                      </div>
                                  </div>
                              </div>

                              <div className="pt-6 border-t border-white/5">
                                  <button 
                                      onClick={async () => {
                                          await supabase.auth.signOut();
                                          setCurrentUser(null);
                                          setIsHamburgerOpen(false);
                                      }}
                                      className="w-full py-4 bg-red-900/10 border border-red-900/20 text-red-500 text-[10px] md:text-xs font-black uppercase rounded-xl md:rounded-2xl hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                                  >
                                      <span>🚪</span> {TRANSLATIONS[lang].logout}
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
      {/* Popup Installation App */}
      {showInstallPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
            <button 
              onClick={() => setShowInstallPopup(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/30">
                <img src="/logo.png" alt="App Logo" className="w-14 h-14 rounded-xl" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">TP HIT APP</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed font-bold">
              {lang === 'fr' 
                ? "Pour installer l'application sur votre mobile, appuyez sur 'Partager' (iOS) ou sur les trois points (Android) puis sélectionnez 'Ajouter à l'écran d'accueil'."
                : "To install the app on your mobile, tap 'Share' (iOS) or the three dots (Android) and select 'Add to Home Screen'."}
            </p>
            
            <button 
              onClick={() => setShowInstallPopup(false)}
              className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              {lang === 'fr' ? 'COMPRIS !' : 'GOT IT !'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
