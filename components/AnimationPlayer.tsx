import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, Variants, TargetAndTransition } from 'framer-motion';
import { Scene, VisualElement, ElementType, CameraConfig, AnimationType } from '../types';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface PlayerProps {
  script: { title: string; scenes: Scene[] };
}

const Background: React.FC<{ style: string }> = ({ style }) => {
  const getBg = () => {
    switch (style) {
      case 'map':
        return (
          <div className="absolute inset-0 bg-[#e6dfcf]">
             <svg className="w-full h-full text-[#d4cbb8]" fill="currentColor">
               <path d="M0,50 Q20,30 50,50 T100,40 L100,100 L0,100 Z" opacity="0.6" />
               <path d="M60,10 Q80,0 100,20 L100,0 L60,0 Z" opacity="0.6" />
               <path d="M20,20 L40,30 L30,60" fill="none" stroke="#b0a896" strokeWidth="2" strokeDasharray="4 4" />
               <path d="M70,40 L90,30 L95,60" fill="none" stroke="#b0a896" strokeWidth="2" strokeDasharray="4 4" />
             </svg>
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
          </div>
        );
      case 'grid':
        return (
          <div className="absolute inset-0 bg-white" 
            style={{ 
              backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }}
          />
        );
      case 'space':
        return <div className="absolute inset-0 bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>;
      case 'paper':
        return <div className="absolute inset-0 bg-[#fdfbf7]"></div>;
      default:
        return <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200"></div>;
    }
  };

  return <div className="absolute inset-0 z-0 overflow-hidden">{getBg()}</div>;
};

const RenderedElement: React.FC<{ el: VisualElement; sceneDuration: number; index: number }> = ({ el, sceneDuration, index }) => {
  const isMoving = el.targetX !== undefined || el.targetY !== undefined;

  // Calculate distinct visual properties
  // Increased base size to ensure visibility; default 12 was too small. Now base is ~48px if size=10.
  const getSize = () => (el.size ? el.size * 5 : 48); 
  const hasLabel = el.type !== ElementType.TEXT && el.label;

  // 1. Initial State (Entry Position)
  const getInitial = () => {
    const base = { opacity: 0, scale: 0.8, x: `${el.x}%`, y: `${el.y}%` };
    
    switch (el.enterAnimation) {
      case AnimationType.SLIDE_IN:
        return { ...base, x: `${el.x - 20}%`, opacity: 0 };
      case AnimationType.SCALE_UP:
        return { ...base, scale: 0 };
      case AnimationType.FADE_IN:
        return { ...base, scale: 1 };
      case AnimationType.NONE:
        return { ...base, opacity: 1, scale: 1 };
      default:
        return { ...base, y: `${el.y + 10}%` }; // Default slight slide up
    }
  };

  // 2. Animate State (Keyframes for separation of Entry -> Action)
  const getAnimate = (): TargetAndTransition => {
    const targetX = el.targetX !== undefined ? el.targetX : el.x;
    const targetY = el.targetY !== undefined ? el.targetY : el.y;

    if (isMoving) {
      // Sequence: Appear (0-15%) -> Wait -> Move (20%-100%)
      return {
        opacity: 1,
        scale: 1,
        x: [`${el.x}%`, `${el.x}%`, `${targetX}%`],
        y: [`${el.y}%`, `${el.y}%`, `${targetY}%`],
        transition: {
          opacity: { duration: 0.5, ease: "easeOut" as const },
          scale: { duration: 0.5, ease: "backOut" as const },
          x: { 
            duration: sceneDuration, 
            times: [0, 0.2, 1], // Wait 20% before moving
            ease: "easeInOut" as const
          },
          y: { 
            duration: sceneDuration, 
            times: [0, 0.2, 1], 
            ease: "easeInOut" as const
          }
        }
      };
    }

    // Static entrance
    return {
      opacity: 1,
      scale: 1,
      x: `${el.x}%`,
      y: `${el.y}%`,
      transition: { 
        duration: 0.8, 
        delay: index * 0.15, // Increased stagger for better visual separation on entry
        ease: "backOut" as const
      }
    };
  };

  // 3. Idle Animations (Floating/Pulsing)
  const getIdleAnimation = (): TargetAndTransition => {
    if (isMoving) return {}; // Don't idle if moving across screen
    
    switch(el.type) {
      case ElementType.CHARACTER:
        return {
          y: ["-3%", "3%", "-3%"],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
        };
      case ElementType.MAP_MARKER:
        return {
          y: ["0%", "-10%", "0%"],
          transition: { duration: 1.5, repeat: Infinity, ease: "circOut" as const }
        };
      case ElementType.ARROW:
        return {
          scale: [1, 1.1, 1],
          transition: { duration: 1, repeat: Infinity, ease: "easeInOut" as const }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      animate={getAnimate()}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
      className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
      // Added zIndex based on Y position to handle depth overlap correctly
      style={{ left: 0, top: 0, width: 'auto', zIndex: Math.floor(el.y) }} 
    >
      {/* Inner Element Container (For Idle Animations) */}
      <motion.div
        animate={getIdleAnimation()}
        className={`flex flex-col items-center`}
      >
        {/* Visual Icon/Shape */}
        <div 
          className={`flex items-center justify-center transition-all duration-500`}
          style={{
            width: el.type === ElementType.TEXT ? 'auto' : `${getSize()}px`,
            height: el.type === ElementType.TEXT ? 'auto' : `${getSize()}px`,
            backgroundColor: el.type === ElementType.SHAPE ? (el.color || '#3b82f6') : 'transparent',
            borderRadius: el.type === ElementType.SHAPE ? '50%' : '0',
            border: el.type === ElementType.SHAPE ? '2px solid rgba(255,255,255,0.4)' : 'none',
            boxShadow: el.type === ElementType.SHAPE || el.type === ElementType.CHARACTER 
              ? '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)' 
              : 'none'
          }}
        >
          {el.type === ElementType.CHARACTER && (
            <span className="text-6xl filter drop-shadow-2xl transition-transform">{el.icon || '👤'}</span>
          )}
          
          {el.type === ElementType.MAP_MARKER && (
            <span className="text-red-600 text-6xl filter drop-shadow-xl">📍</span>
          )}
          
          {el.type === ElementType.ARROW && (
            <div className="text-slate-700 text-5xl font-bold filter drop-shadow-sm" style={{ transform: 'rotate(90deg)' }}>
               ➜
            </div>
          )}
          
          {el.type === ElementType.TEXT && (
            <div 
              className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-slate-200/50 text-slate-900 font-bold shadow-2xl text-xl min-w-[140px]"
              style={{ color: el.color || '#0f172a' }}
            >
              {el.label}
            </div>
          )}
          
          {el.type === ElementType.SHAPE && !el.icon && (
             <span className="text-sm text-white/90 font-mono font-bold">{el.label?.substring(0, 2)}</span>
          )}
        </div>

        {/* External Label (if not text type) */}
        {hasLabel && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-sm font-bold text-slate-800 bg-white/95 px-3 py-1.5 rounded-lg shadow-lg border border-slate-200/60 whitespace-nowrap z-10"
          >
            {el.label}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export const AnimationPlayer: React.FC<PlayerProps> = ({ script }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentScene = script.scenes[currentSceneIndex];
  const timerRef = useRef<number | null>(null);
  const FRAME_RATE = 24;
  const UPDATE_INTERVAL = 1000 / FRAME_RATE;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const increment = (UPDATE_INTERVAL / 1000) / currentScene.duration * 100;
          const next = prev + increment;
          if (next >= 100) {
            if (currentSceneIndex < script.scenes.length - 1) {
              setCurrentSceneIndex(idx => idx + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return next;
        });
      }, UPDATE_INTERVAL);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentSceneIndex, currentScene.duration, script.scenes.length]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentSceneIndex(0);
    setProgress(0);
  };

  // Camera Logic
  const cameraVariants: Variants = {
    initial: { scale: 1, x: 0, y: 0 },
    animate: (camera: CameraConfig | undefined) => ({
      scale: camera?.zoom || 1,
      x: `${camera?.x || 0}%`,
      y: `${camera?.y || 0}%`,
      transition: { duration: currentScene.duration, ease: "linear" as const }
    })
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-slate-800/50">
      {/* Viewport */}
      <div className="relative w-full aspect-video bg-white overflow-hidden group select-none">
        <Background style={currentScene.backgroundStyle} />
        
        {/* Camera Stage */}
        <motion.div 
          className="absolute inset-0 w-full h-full origin-center"
          variants={cameraVariants}
          initial="initial"
          animate="animate"
          custom={currentScene.camera}
        >
          <AnimatePresence mode='popLayout'>
            <div key={currentScene.id} className="absolute inset-0 w-full h-full">
              {currentScene.elements.map((el, idx) => (
                <RenderedElement 
                  key={`${currentScene.id}-${el.id}`} 
                  el={el} 
                  sceneDuration={currentScene.duration} 
                  index={idx}
                />
              ))}
            </div>
          </AnimatePresence>
        </motion.div>

        {/* Subtitles Overlay */}
        <div className="absolute bottom-8 left-0 right-0 text-center px-4 z-20 pointer-events-none">
          <AnimatePresence mode='wait'>
            <motion.div 
              key={currentScene.narrative}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-block bg-black/70 text-white px-6 py-4 rounded-2xl text-lg font-medium shadow-2xl backdrop-blur-md max-w-4xl border border-white/10"
            >
              {currentScene.narrative}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Scene Badge */}
        <div className="absolute top-4 right-4 z-20">
           <motion.div 
             key={currentSceneIndex}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg font-mono backdrop-blur-sm border border-white/10 shadow-lg"
           >
            SCENE {currentSceneIndex + 1} / {script.scenes.length}
          </motion.div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center space-x-5 mb-3">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
          </button>
          
          <button 
            onClick={reset} 
            className="p-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all hover:scale-105"
            title="Restart Animation"
          >
            <RefreshCw size={20} />
          </button>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-mono uppercase tracking-wider font-bold">
               <span className="truncate max-w-[150px]">{currentScene.id.replace(/-/g, ' ')}</span>
               <span>{Math.round(progress)}%</span>
            </div>
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                 style={{ width: `${progress}%` }}
                 layoutId="progressBar"
               />
               <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress} 
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        {/* Timeline Visualization */}
        <div className="flex gap-1.5 mt-2 h-2">
          {script.scenes.map((s, idx) => (
            <div 
              key={s.id}
              onClick={() => { setCurrentSceneIndex(idx); setProgress(0); }}
              className={`rounded-full cursor-pointer transition-all duration-300 flex-1 relative group overflow-hidden ${
                idx === currentSceneIndex ? 'bg-blue-500/50' : idx < currentSceneIndex ? 'bg-slate-700' : 'bg-slate-800'
              }`}
            >
              {idx === currentSceneIndex && (
                <motion.div 
                  className="absolute inset-0 bg-blue-500" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0 }}
                />
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};