'use client';

import React, { useEffect, useRef, useState } from 'react';

type GameMode = 'standard' | 'hardcore' | null;

export default function TradingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameMode, setGameMode] = useState<GameMode>(null); // Start in Menu (null)
  const [gameState, setGameState] = useState<'menu' | 'start' | 'playing' | 'gameover' | 'levelcomplete'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);

  const [levelProgress, setLevelProgress] = useState(0);
  const [targetDistance, setTargetDistance] = useState(1000);

  // New Settings
  const [speedSetting, setSpeedSetting] = useState(5); // Default 5
  const [checkpointReached, setCheckpointReached] = useState(false);

  // Initialize Game Mode
  const selectMode = (mode: GameMode) => {
    setGameMode(mode);
    setLives(mode === 'standard' ? 3 : 1);
    setGameState('start'); // Go to "Initialize" screen
  };

  const returnToMenu = () => {
    setGameMode(null);
    setGameState('menu');
    setLevel(1);
    setScore(0);
    setCheckpointReached(false);
  };

  useEffect(() => {
    // Resize handler outside game loop to always work
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (gameState === 'menu') return; // Don't run game physics in menu

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Variables
    let animationFrameId: number;
    let frames = 0;
    // Slower Speed base + adjustment
    let gameSpeed = speedSetting + (level * 0.4);
    let currentScore = score;
    let currentLives = lives;
    let distanceTraveled = levelProgress; // Init from state for checkpoint sync

    const levelLength = 2000 + (level * 800);
    let currentTargetDistance = levelLength;

    // Scale Logic
    const viewScale = canvas.width < 768 ? 0.6 : 1;
    const logicalWidth = canvas.width / viewScale;
    const logicalHeight = canvas.height / viewScale;

    // Player
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

    interface Candle { x: number; y: number; width: number; height: number; color: string; type: 'candle'; }
    interface Drone { x: number; y: number; width: number; height: number; type: 'drone'; startY: number; offset: number; }
    interface Projectile { x: number; y: number; dx: number; dy: number; type: 'SL'; width: number; height: number; }
    interface TPPlatform { x: number; y: number; width: number; height: number; type: 'tp_platform'; }

    let obstacles: Candle[] = [];
    let enemies: Drone[] = [];
    let projectiles: Projectile[] = [];
    let tpPlatform: TPPlatform | null = null;
    let localCheckpointReached = checkpointReached; // Sync with state

    // Initial Platform function
    const spawnSafePlatform = (xPos: number) => {
      const groundLevel = logicalHeight * 0.75;
      obstacles.push({
        x: xPos,
        y: groundLevel,
        width: 600,
        height: logicalHeight,
        color: '#22c55e',
        type: 'candle'
      });
      player.y = groundLevel - 100;
      player.x = xPos + 50;
      player.dy = 0;
    };

    // Initial Spawn
    if (obstacles.length === 0) spawnSafePlatform(50);

    const spawnProjectile = (drone: Drone) => {
      projectiles.push({
        x: drone.x,
        y: drone.y + drone.height / 2,
        dx: -6 - (level * 0.6),
        dy: (player.y - drone.y) * 0.015,
        type: 'SL',
        width: 25,
        height: 12
      });
    };

    // Respawn / Reset
    const respawnAtCheckpoint = () => {
      obstacles = [];
      enemies = [];
      projectiles = [];
      tpPlatform = null;
      player.dy = 0;
      player.jumpCount = 0;
      player.invulnerable = 120; // Safety frames

      if (gameMode === 'standard') {
        if (localCheckpointReached) {
          // Respawn at Middle
          distanceTraveled = currentTargetDistance / 2;
          spawnSafePlatform(100);
        } else {
          // Respawn at Start
          distanceTraveled = 0;
          spawnSafePlatform(50);
        }
      } else {
        // Hardcore - shouldn't happen usually as life=1, but if we reuse logic
        distanceTraveled = 0;
        spawnSafePlatform(50);
      }
    };

    const resetLevel = (newLevel: boolean) => {
      player.dy = 0;
      player.jumpCount = 0;
      player.invulnerable = 0;
      obstacles = [];
      enemies = [];
      projectiles = [];
      tpPlatform = null;
      localCheckpointReached = false;
      setCheckpointReached(false);

      frames = 0;
      distanceTraveled = 0;
      setLevelProgress(0);

      spawnSafePlatform(50);

      if (newLevel) {
        // Keep Score
      } else {
        currentScore = 0;
        gameSpeed = speedSetting;
        currentTargetDistance = 2000;
        currentLives = lives;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (gameState === 'start' || gameState === 'gameover') {
          if (gameState === 'start') {
            // Reset done via effect mostly, but ensure clean start
            respawnAtCheckpoint(); // Uses state 0 usually
            setGameState('playing');
          }
          // gameover handled by button usually
        } else if (gameState === 'levelcomplete') {
          // handled by button
        } else if (player.grounded || player.jumpCount < 2) {
          player.dy = -player.jumpStrength;
          player.grounded = false;
          player.jumpCount++;
        }
      }
    };

    const handleTouch = (e: TouchEvent) => {
      // Don't prevent default everywhere to allow UI interaction if needed, 
      // but usually nice for games
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

    if (gameState === 'playing') {
      const update = () => {
        frames++;
        distanceTraveled += gameSpeed;
        if (frames % 10 === 0) setLevelProgress(distanceTraveled);

        // Checkpoint Logic (Standard Mode)
        if (gameMode === 'standard' && !localCheckpointReached && distanceTraveled > currentTargetDistance / 2) {
          localCheckpointReached = true;
          setCheckpointReached(true);
        }

        // Apply Scale for Mobile Loop
        ctx.setTransform(viewScale, 0, 0, viewScale, 0, 0);

        // Background
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);

        // Grid
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
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

        // Player Physics
        player.dy += player.gravity;
        player.y += player.dy;
        player.grounded = false;
        if (player.invulnerable > 0) player.invulnerable--;

        // Obstacle Spawning
        const lastObstacle = obstacles[obstacles.length - 1];
        if (lastObstacle && lastObstacle.x < logicalWidth + 100 && !tpPlatform) {

          if (distanceTraveled >= currentTargetDistance) {
            // Spawn TP Platform logic - HUGE GREEN PLATFORM
            tpPlatform = {
              x: lastObstacle.x + lastObstacle.width + 100, // Small gap
              y: logicalHeight * 0.6, // Accessible height
              width: 500,
              height: logicalHeight,
              type: 'tp_platform'
            };
          } else {
            // Balancing for Modes
            let gap, yVar;
            if (gameMode === 'hardcore') {
              gap = Math.random() * 140 + 50; // Reduced gap for Hardcore (Easier jumps since 1 life)
              yVar = 220; // Reduced verticality
            } else {
              gap = Math.random() * 180 + 70; // Standard
              yVar = 300;
            }

            // Checkpoint Marker Object
            const isCheckpointZone = gameMode === 'standard' && Math.abs(distanceTraveled - (currentTargetDistance / 2)) < 500;

            const width = Math.random() * 120 + 40;
            const lastY = lastObstacle.y;
            let y = lastY + (Math.random() * yVar - (yVar / 2));

            if (y < logicalHeight * 0.25) y = logicalHeight * 0.25;
            if (y > logicalHeight * 0.85) y = logicalHeight * 0.85;

            const isGreen = Math.random() > 0.45;
            let color = isGreen ? '#22c55e' : '#ef4444';

            if (isCheckpointZone && !localCheckpointReached) {
              color = '#3b82f6'; // Blue for Checkpoint
            }

            obstacles.push({
              x: lastObstacle.x + lastObstacle.width + gap,
              y: y,
              width: width,
              height: logicalHeight,
              color: color,
              type: 'candle'
            });

            if (Math.random() < (0.015 + (level * 0.005))) {
              enemies.push({
                x: logicalWidth + 100,
                y: y - 250 - Math.random() * 100,
                width: 45,
                height: 45,
                type: 'drone',
                startY: y - 250,
                offset: Math.random() * 100
              });
            }
          }
        }

        // Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= gameSpeed;

          ctx.fillStyle = obs.color;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#fff';
          ctx.fillRect(obs.x + obs.width / 2 - 1, obs.y - 20, 2, 20); // Wick

          if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
          ) {
            if (player.dy > 0 && player.y + player.height - player.dy <= obs.y + 25) {
              player.grounded = true;
              player.dy = 0;
              player.y = obs.y - player.height;
              player.jumpCount = 0;

              if (obs.color === '#3b82f6' && !localCheckpointReached && gameMode === 'standard') {
                localCheckpointReached = true;
                setCheckpointReached(true);
              }

            } else {
              if (player.x + player.width > obs.x && player.x < obs.x + 10) {
                player.x = obs.x - player.width;
              }
            }
          }

          if (obs.x + obs.width < -100) {
            obstacles.splice(i, 1);
            currentScore += 15;
            setScore(currentScore);
          }
        }

        // Update Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
          const drone = enemies[i];
          drone.x -= gameSpeed * 1.3;
          drone.y = drone.startY + Math.sin((frames + drone.offset) * 0.08) * 80;

          ctx.fillStyle = '#ef4444';
          ctx.fillRect(drone.x, drone.y, drone.width, drone.height);
          ctx.fillStyle = '#e5e7eb';
          ctx.fillRect(drone.x - 15, drone.y - 8, 75, 4);

          if (frames % (100 - Math.min(50, level * 5)) === 0) {
            if (drone.x > 0 && drone.x < logicalWidth) spawnProjectile(drone);
          }

          if (player.invulnerable === 0 &&
            player.x < drone.x + drone.width &&
            player.x + player.width > drone.x &&
            player.y < drone.y + drone.height &&
            player.y + player.height > drone.y
          ) {
            currentLives--;
            setLives(currentLives);
            player.invulnerable = 120;
            if (currentLives <= 0) setGameState('gameover');
          }

          if (drone.x + drone.width < -100) enemies.splice(i, 1);
        }

        // Update Projectiles
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
            if (currentLives <= 0) setGameState('gameover');
            continue;
          }

          if (proj.x < 0 || proj.y > logicalHeight || proj.y < 0) projectiles.splice(i, 1);
        }

        // Update TP Platform
        if (tpPlatform) {
          tpPlatform.x -= gameSpeed;

          // Draw Green Platform
          ctx.fillStyle = '#22c55e'; // Green
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 20;
          ctx.fillRect(tpPlatform.x, tpPlatform.y, tpPlatform.width, tpPlatform.height);
          ctx.shadowBlur = 0;

          // TP Line/Goal
          ctx.fillStyle = '#facc15'; // Gold Line
          ctx.fillRect(tpPlatform.x + 200, tpPlatform.y - 150, 10, 150);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 30px Arial';
          ctx.fillText('FINISH / TP', tpPlatform.x + 150, tpPlatform.y - 170);

          // Collision
          if (
            player.x < tpPlatform.x + tpPlatform.width &&
            player.x + player.width > tpPlatform.x &&
            player.y < tpPlatform.y + tpPlatform.height &&
            player.y + player.height > tpPlatform.y
          ) {
            if (player.dy > 0 && player.y + player.height - player.dy <= tpPlatform.y + 25) {
              player.grounded = true;
              player.dy = 0;
              player.y = tpPlatform.y - player.height;
              player.jumpCount = 0;
            }
          }

          // Win Condition: Cross the line
          if (player.x > tpPlatform.x + 200) {
            setGameState('levelcomplete');
          }
        }

        // Player Fall
        if (player.y > logicalHeight) {
          currentLives--;
          setLives(currentLives);
          if (currentLives <= 0) {
            setGameState('gameover');
          } else {
            // Standard Mode Checkpoint Respawn
            if (gameMode === 'standard') {
              respawnAtCheckpoint();
            } else {
              player.y = 0; player.dy = 0; player.invulnerable = 120;
            }
          }
        }

        // Wall Death
        if (player.x + player.width < 0) {
          currentLives--;
          setLives(currentLives);
          if (currentLives <= 0) {
            setGameState('gameover');
          } else {
            if (gameMode === 'standard') {
              respawnAtCheckpoint();
            } else {
              player.x = 100; player.y = 0; player.invulnerable = 120;
            }
          }
        }

        // Draw Player
        if (player.invulnerable % 10 < 5) {
          ctx.fillStyle = player.color;
          ctx.fillRect(player.x, player.y, player.width, player.height);
          ctx.fillStyle = '#fff';
          ctx.fillRect(player.x + 28, player.y + 10, 6, 6);
        }

        animationFrameId = requestAnimationFrame(update);
      };
      update();
    } else {
      // Menu or BG rendering
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animationFrameId);
    };
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, level, gameMode, speedSetting]); // Added speedSetting dep

  const nextLevel = () => {
    setLevel(l => l + 1);
    setTargetDistance(d => d + 800);
    if (gameMode === 'standard') setLives(3); // Regenerate Lives
    setCheckpointReached(false);
    setGameState('playing');
  };

  return (
    <div className="relative w-full h-full overflow-hidden font-mono select-none bg-black text-white touch-none">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* HUD */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 pointer-events-none">
          {/* Visual notification for Checkpoint */}
          {checkpointReached && gameMode === 'standard' && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-blue-500 font-bold tracking-widest animate-pulse">
              CHECKPOINT SECURED
            </div>
          )}

          <div className="flex justify-between items-end border-b-2 border-slate-700/50 pb-2 md:pb-4">
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">Level Progress</span>
              <div className="w-32 md:w-64 h-2 bg-slate-800 mt-1 relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${checkpointReached ? 'bg-blue-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, (levelProgress / targetDistance) * 100)}%` }}
                />
                {/* Mid Checkpoint Marker */}
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/50"></div>
              </div>
            </div>

            {/* Lives */}
            {gameMode === 'standard' && (
              <div className="flex gap-1 text-lg md:text-2xl">
                {Array.from({ length: Math.max(0, lives) }).map((_, i) => <span key={i}>❤️</span>)}
              </div>
            )}

            <div className="text-right">
              <div className="text-2xl md:text-4xl font-bold">${score}</div>
              <div className="text-[10px] md:text-xs text-green-400 uppercase tracking-widest">
                P&L • Level {level}
              </div>
            </div>
          </div>
          {gameMode === 'hardcore' && (
            <div className="absolute top-16 md:top-20 right-4 md:right-6 text-[10px] md:text-sm text-red-500 font-bold bg-black/50 px-2 py-1 rounded border border-red-500/30">
              HARDCORE
            </div>
          )}
        </div>
      )}

      {/* Main Menu */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-auto z-50 overflow-y-auto">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="text-center relative z-10 w-full max-w-4xl px-4 py-8">
            <div className="mb-4 md:mb-8">
              <img src="/logo.png" alt="Logo" className="w-24 h-24 md:w-40 md:h-40 mx-auto object-contain animate-pulse-slow drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
            </div>
            <h1 className="text-4xl md:text-7xl font-black mb-2 tracking-tighter">FULL<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">MARGIN</span></h1>
            <p className="text-gray-400 tracking-[0.2em] md:tracking-[0.3em] uppercase mb-8 md:mb-16 text-xs md:text-base">High Volatility Survival</p>

            {/* Speed Slider */}
            <div className="mb-8 max-w-xs mx-auto">
              <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">Game Speed: {speedSetting}</label>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={speedSetting}
                onChange={(e) => setSpeedSetting(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-600 px-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center">
              <button
                onClick={() => selectMode('standard')}
                className="group w-full max-w-xs md:w-80 p-6 md:p-8 border border-gray-600 hover:border-green-400 hover:bg-green-900/10 transition-all rounded-xl relative overflow-hidden"
              >
                <h3 className="text-2xl md:text-3xl font-black mb-2 text-green-400">STANDARD</h3>
                <div className="h-px w-full bg-gray-700 my-2 md:my-4 group-hover:bg-green-500/50"></div>
                <p className="text-xs md:text-sm text-gray-300 mb-1">3 Lives System</p>
                <p className="text-xs md:text-sm text-gray-300 mb-1">Forgiving Mechanics</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-4 uppercase tracking-widest">Recommended for Learners</p>
              </button>

              <button
                onClick={() => selectMode('hardcore')}
                className="group w-full max-w-xs md:w-80 p-6 md:p-8 border border-gray-600 hover:border-red-500 hover:bg-red-900/10 transition-all rounded-xl relative overflow-hidden"
              >
                <h3 className="text-2xl md:text-3xl font-black mb-2 text-red-500">FULL MARGIN</h3>
                <div className="h-px w-full bg-gray-700 my-2 md:my-4 group-hover:bg-red-500/50"></div>
                <p className="text-xs md:text-sm text-gray-300 mb-1">1 Life Only</p>
                <p className="text-xs md:text-sm text-gray-300 mb-1">No Second Chances</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-4 uppercase tracking-widest">High Risk / High Reward</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Confirmation */}
      {gameState === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40 pointer-events-auto backdrop-blur-sm px-4">
          <div className="text-center animate-fade-in-up p-8 md:p-12 border border-white/10 bg-black/80 rounded-2xl w-full max-w-md">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 uppercase text-white">
              {gameMode === 'standard' ? <span className="text-green-400">Standard Protocol</span> : <span className="text-red-500">Full Margin Logic</span>}
            </h2>
            <p className="text-gray-400 mb-8 tracking-widest font-mono text-xs md:text-sm">
              {gameMode === 'standard' ? 'SYSTEM CHECK: STOPS ACTIVE. HEDGING ENABLED.' : 'WARNING: LIQUIDATION IMMINENT. NO STOPS.'}
            </p>
            <button
              onClick={() => setGameState('playing')}
              className="w-full px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm md:text-base"
            >
              Execute Order
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 z-50 pointer-events-auto px-4">
          <div className="text-center p-8 md:p-12 bg-black border border-red-800 shadow-[0_0_50px_rgba(220,38,38,0.5)] max-w-xl w-full">
            <h2 className="text-5xl md:text-8xl font-black text-red-600 mb-4 uppercase tracking-tighter">LIQUIDATED</h2>
            <p className="text-gray-400 mb-6 md:mb-10 uppercase tracking-widest border-b border-red-900/50 pb-4 text-sm md:text-base">Account Balance Zeroed</p>

            <div className="grid grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10">
              <div className="bg-red-900/10 p-2 md:p-4 rounded">
                <span className="block text-[10px] md:text-xs uppercase text-gray-500 mb-1 md:mb-2">Final P&L</span>
                <span className="text-xl md:text-3xl font-bold text-white">${score}</span>
              </div>
              <div className="bg-red-900/10 p-2 md:p-4 rounded">
                <span className="block text-[10px] md:text-xs uppercase text-gray-500 mb-1 md:mb-2">Highest Level</span>
                <span className="text-xl md:text-3xl font-bold text-white">{level}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <button
                onClick={() => {
                  setGameState('playing');
                  setLives(gameMode === 'standard' ? 3 : 1);
                  setScore(0);
                  setLevel(1);
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

      {/* Level Complete */}
      {gameState === 'levelcomplete' && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-900/90 z-50 pointer-events-auto backdrop-blur-sm px-4">
          <div className="text-center p-8 md:p-12 bg-black/90 border border-yellow-500/50 shadow-2xl w-full max-w-lg">
            <h2 className="text-4xl md:text-6xl font-black text-yellow-500 mb-4">TAKE PROFIT HIT</h2>
            <p className="text-base md:text-xl text-white mb-8">Volatility increasing for Zone {level + 1}...</p>
            <button
              onClick={nextLevel}
              className="w-full px-8 py-4 bg-yellow-500 text-black font-bold uppercase tracking-widest hover:bg-yellow-400 shadow-lg hover:scale-105 transition text-sm md:text-base"
            >
              Next Level
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
