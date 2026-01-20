'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function TradingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game Variables
    let animationFrameId: number;
    let frames = 0;
    let gameSpeed = 5;
    let currentScore = 0;

    // Player
    const player = {
      x: 100,
      y: 200,
      width: 40,
      height: 40,
      dy: 0,
      jumpStrength: 12,
      gravity: 0.6,
      grounded: false,
      color: '#3b82f6', // Blue (Trader)
    };

    // World
    interface Candle {
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      type: 'candle';
    }
    
    interface Enemy {
      x: number;
      y: number;
      width: number;
      height: number;
      type: 'bank';
    }

    let obstacles: (Candle | Enemy)[] = [];
    
    // Initial Platform
    obstacles.push({
      x: 50,
      y: 400,
      width: 200,
      height: 300, // Extends down
      color: '#22c55e', // Green
      type: 'candle'
    });

    // Input Handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (gameState === 'start' || gameState === 'gameover') {
          // Restart handled by UI button for gameover, but space starts 'start'
          if (gameState === 'start') setGameState('playing');
        } else if (player.grounded) {
          player.dy = -player.jumpStrength;
          player.grounded = false;
        }
      }
    };
    
    // Touch support for mobile
    const handleTouch = () => {
         if (gameState === 'start') {
             setGameState('playing'); 
         } else if (player.grounded) {
             player.dy = -player.jumpStrength;
             player.grounded = false;
         }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch);

    // Reset Game Function
    const resetGame = () => {
      player.y = 200;
      player.dy = 0;
      obstacles = [];
      // Initial platform
      obstacles.push({
        x: 50,
        y: 400,
        width: 200,
        height: 600,
        color: '#22c55e',
        type: 'candle'
      });
      currentScore = 0;
      frames = 0;
      gameSpeed = 5;
      setScore(0);
    };

    if (gameState === 'playing') {
      // Game Loop
      const update = () => {
        frames++;
        
        // Clear Canvas
        ctx.fillStyle = '#111827'; // Dark bg
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Player Physics
        player.dy += player.gravity;
        player.y += player.dy;
        player.grounded = false;

        // Generate Obstacles (Candles)
        // Ensure there's always a path
        const lastObstacle = obstacles[obstacles.length - 1];
        if (lastObstacle.x < canvas.width) {
          const gap = Math.random() * 150 + 50; // Random gap
          const width = Math.random() * 100 + 50;
          // Varying height for candles. Y is top position.
          // Canvas height is approx 600.
          // Ground level varies.
          const y = Math.random() * 200 + 300; 
          
          const isGreen = Math.random() > 0.4; // More green than red
          
          obstacles.push({
            x: lastObstacle.x + lastObstacle.width + gap,
            y: y,
            width: width,
            height: 600, // Extend to bottom
            color: isGreen ? '#22c55e' : '#ef4444',
            type: 'candle'
          });

          // Chance to spawn Bank Enemy on top
          if (Math.random() < 0.3) {
             obstacles.push({
                 x: lastObstacle.x + lastObstacle.width + gap + (width/2) - 20,
                 y: y - 50, // Floating above candle
                 width: 40,
                 height: 40,
                 type: 'bank'
             })
          }
        }

        // Update Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          let obs = obstacles[i];
          obs.x -= gameSpeed;

          // Draw Obstacle
          if (obs.type === 'candle') {
            const candle = obs as Candle;
            ctx.fillStyle = candle.color;
            ctx.fillRect(candle.x, candle.y, candle.width, candle.height);
            // Wick
            ctx.fillStyle = candle.color;
            ctx.fillRect(candle.x + candle.width/2 - 2, candle.y - 15, 4, 15);
          } else if (obs.type === 'bank') {
              // Draw Bank (Enemy)
              ctx.fillStyle = '#64748b'; // Slate 500
              ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
              // Bank Text
              ctx.fillStyle = 'white';
              ctx.font = '10px Arial';
              ctx.fillText('BANK', obs.x + 5, obs.y + 25);
          }

          // Collision Detection
          if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
          ) {
            
            if (obs.type === 'candle') {
                 // Collision with candle (platform)
                // Check if landing on top
                if (player.dy > 0 && player.y + player.height - player.dy <= obs.y + 10) {
                    player.grounded = true;
                    player.dy = 0;
                    player.y = obs.y - player.height;
                } else {
                    // Hit side or bottom -> Game Over
                     setGameState('gameover');
                }
            } else if (obs.type === 'bank') {
                // Hit enemy
                setGameState('gameover');
            }
          }

          // Remove off-screen
          if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            currentScore += 10;
            setScore(currentScore);
            gameSpeed += 0.005; // Slowly increase speed
          }
        }

        // Player Bounds (Fall off)
        if (player.y > canvas.height) {
          setGameState('gameover');
        }

        // Draw Player
        ctx.fillStyle = player.color;
        
        ctx.fillRect(player.x, player.y, player.width, player.height);
        // Draw Eyes (Mario style)
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 25, player.y + 10, 8, 8);


        // Score
        ctx.fillStyle = 'white';
        ctx.font = '20px sans-serif';
        ctx.fillText(`P&L: $${currentScore}`, canvas.width - 150, 40);

        animationFrameId = requestAnimationFrame(update);
      };
      
      update();
    } else {
       // Draw static screen or initial state
       ctx.fillStyle = '#111827';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       
       ctx.fillStyle = 'white';
       ctx.font = '30px sans-serif';
       ctx.textAlign = 'center';
       if (gameState === 'start') {
           ctx.fillText("FullMargin Trader", canvas.width/2, canvas.height/2 - 20);
           ctx.font = '16px sans-serif';
           ctx.fillText("Press Space or Click to Start", canvas.width/2, canvas.height/2 + 20);
       } else if (gameState === 'gameover') {
           ctx.fillText("LIQUIDATED", canvas.width/2, canvas.height/2 - 20);
           ctx.font = '20px sans-serif';
           ctx.fillText(`Final P&L: $${score}`, canvas.width/2, canvas.height/2 + 20);
       }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-4 border-slate-700 rounded-lg shadow-2xl bg-gray-900 max-w-full"
        onClick={() => gameState === 'start' && setGameState('playing')}
      />
      {gameState === 'gameover' && (
        <button
          onClick={() => setGameState('start')}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition"
        >
          Recommencer (Trade Again)
        </button>
      )}
      <div className="mt-4 text-slate-300 text-sm">
        <p>Espace / Click pour sauter. Évitez les Banques !</p>
      </div>
    </div>
  );
}
