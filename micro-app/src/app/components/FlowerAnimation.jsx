import React, { useEffect, useState } from 'react';
import styles from '../styles/FlowerAnimation.module.css';

export default function FlowerAnimation({ type = 'grow' }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (type === 'grow') {
      // Plant growth animation
      const growthParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        emoji: ['🌱', '🌿', '🍃', '🌸'][Math.floor(Math.random() * 4)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.2,
        duration: 2 + Math.random() * 2
      }));
      setParticles(growthParticles);
    } else if (type === 'butterfly') {
      // Butterfly flying animation
      const butterflyParticles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        emoji: ['🦋', '🐛', '🌸', '🍃'][Math.floor(Math.random() * 4)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.3,
        duration: 3 + Math.random() * 2
      }));
      setParticles(butterflyParticles);
    }

    const timer = setTimeout(() => {
      setParticles([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, [type]);

  if (particles.length === 0) return null;

  return (
    <div className={styles.animationContainer}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`${styles.particle} ${styles[type]}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        >
          {particle.emoji}
        </div>
      ))}
      
      {type === 'grow' && (
        <div className={styles.growthCenter}>
          <div className={styles.growthRing}></div>
          <div className={styles.growthCore}>🌱</div>
        </div>
      )}
      
      {type === 'butterfly' && (
        <div className={styles.butterflyTrail}>
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={styles.trailDot}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}