import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Jewelry3D({ image }) {
  const [isInteracted, setIsInteracted] = useState(false);
  const x = useMotionValue(0);
  
  // Smooth rotation with spring physics
  const rotateYSpring = useSpring(x, {
    stiffness: 60,
    damping: 20,
    mass: 0.8
  });

  // Map drag x distance to many rotations for sensitivity
  const rotateY = useTransform(rotateYSpring, (val) => val * 0.5);

  // Auto-rotate slightly if not interacted
  useEffect(() => {
    if (!isInteracted) {
      const controls = x.set(0); 
      // We could use animate here to slowly rotate it initially
    }
  }, [isInteracted, x]);

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
      {/* Dynamic Glow and Rays */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(212,175,55,0.1),transparent_40%)] rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Interactive Drag Hint */}
      {!isInteracted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <motion.span animate={{ x: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-gold-500 text-lg">←</motion.span>
              <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40">Drag to Rotate</span>
              <motion.span animate={{ x: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-gold-500 text-lg">→</motion.span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rotating Ring Container */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDragStart={() => setIsInteracted(true)}
        style={{ 
          rotateY,
          transformStyle: 'preserve-3d',
          cursor: 'grab' 
        }}
        whileDrag={{ cursor: 'grabbing' }}
        animate={{ 
          y: [0, -15, 0]
        }}
        transition={{ 
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative z-20 w-[85%] h-[85%] drop-shadow-[0_45px_60px_rgba(0,0,0,0.7)]"
      >
        <img
          src={image}
          alt="Luxury Jewelry 3D"
          draggable="false"
          className="w-full h-full object-contain filter brightness-110 contrast-110 pointer-events-none select-none"
        />
        
        {/* Subtle Shine/Sparkle Effects */}
        <motion.div
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            left: ['20%', '75%', '45%'],
            top: ['35%', '55%', '25%']
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-4 h-4 text-white pointer-events-none"
        >
          ✦
        </motion.div>
        <motion.div
          animate={{ 
            opacity: [0, 0.7, 0],
            scale: [0.3, 0.7, 0.3],
            left: ['65%', '25%', '85%'],
            top: ['75%', '45%', '65%']
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="absolute w-3 h-3 text-gold-500 pointer-events-none"
        >
          ✧
        </motion.div>
      </motion.div>

      {/* Shadow */}
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-56 h-10 bg-black/70 blur-2xl rounded-[100%] pointer-events-none"
      />
    </div>
  );
}
