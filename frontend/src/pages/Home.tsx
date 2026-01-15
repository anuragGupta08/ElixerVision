import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Brain, Grid3x3, Sparkles, HardDrive, Image as ImageIcon } from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedText } from '../components/AnimatedText';

export default function Home() {
  const features = [
    {
      icon: Upload,
      title: 'Upload Images',
      description: 'Upload individual images or entire folders with ease',
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'ResNet50 + ViT ensemble ML model extracts deep image features',
    },
    {
      icon: Grid3x3,
      title: 'Similarity Detection',
      description: 'Advanced algorithms compute similarity scores between images',
    },
    {
      icon: ImageIcon,
      title: 'Smart Grouping',
      description: 'Automatically groups duplicate and similar images together',
    },
    {
      icon: Sparkles,
      title: 'Quality Highlighting',
      description: 'Highlights the best image based on sharpness, resolution, and quality',
    },
    {
      icon: HardDrive,
      title: 'Storage Optimization',
      description: 'Shows exactly how much storage you save when duplicates are removed',
    },
  ];

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-semibold text-purple-200">Elixer Vision</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <Link
              to="/login"
              className="px-6 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 text-purple-100 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 rounded-lg bg-cyan-400/20 text-cyan-100 hover:bg-cyan-400/30 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Register
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex justify-center mb-8">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-24 h-24 text-cyan-400" />
                </motion.div>
                <motion.div
                  className="absolute -inset-4 rounded-full bg-cyan-400/20 blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </div>

            <AnimatedText />

            <motion.p
              className="text-xl md:text-2xl text-purple-100 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              Find duplicate images, highlight the best ones, and save storage effortlessly.
            </motion.p>

            <motion.div className="flex gap-4 justify-center flex-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }}>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-lg bg-cyan-400/20 text-cyan-100 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 text-purple-100 text-lg transition-all duration-300"
                >
                  Login
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <motion.h2 className="text-4xl mb-4 text-purple-200" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.2 }}>
              How It Works
            </motion.h2>
            <motion.p className="text-xl text-purple-100" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.4 }}>
              Powered by advanced AI and machine learning
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -10, rotateY: 5, transition: { duration: 0.3 } }}
                style={{ perspective: 1000 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                <motion.div initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 + 0.3, duration: 0.5, type: "spring" }}>
                  <feature.icon className="w-12 h-12 mb-4 text-cyan-400" />
                </motion.div>
                <motion.h3 className="text-xl mb-3 text-purple-200" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 + 0.4 }}>
                  {feature.title}
                </motion.h3>
                <motion.p className="text-purple-100" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.15 + 0.5 }}>
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, type: "spring", stiffness: 100 }} className="max-w-4xl mx-auto text-center">
          <motion.h2 className="text-4xl mb-6 text-purple-200" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}>
            Ready to optimize your storage?
          </motion.h2>
          <motion.p className="text-xl text-purple-100 mb-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}>
            Join thousands of users saving storage space with AI-powered duplicate detection
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.5, type: "spring" }}>
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-4 rounded-lg bg-cyan-400/20 text-cyan-100 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Start Free Today
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
