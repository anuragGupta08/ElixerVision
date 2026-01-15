import { motion } from 'framer-motion';

export function AnimatedText() {
  const text = 'Elixer Vision';
  const letters = text.split('');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.3,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.8,
      filter: 'blur(6px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="relative mb-8 overflow-hidden">
      <motion.h1
        className="text-4xl md:text-7xl font-semibold inline-flex justify-center tracking-wide"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            variants={child}
            className="inline-block"
            style={{
              background:
                'linear-gradient(135deg, #c084fc 0%, #60a5fa 50%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: `
                0 0 10px rgba(96,165,250,0.35),
                0 0 25px rgba(34,211,238,0.25)
              `,
            }}
            whileHover={{
              scale: 1.15,
              textShadow:
                '0 0 25px rgba(96,165,250,0.8), 0 0 45px rgba(34,211,238,0.6)',
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </motion.h1>

      {/* Animated neon underline */}
      <motion.div
        className="mx-auto mt-4 h-[2px] max-w-[280px]"
        style={{
          background:
            'linear-gradient(90deg, transparent, #22d3ee, #60a5fa, transparent)',
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '100%', opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />

      {/* Floating glow orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: 'radial-gradient(circle, #22d3ee, transparent)',
            left: `${30 + i * 12}%`,
            top: '60%',
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
