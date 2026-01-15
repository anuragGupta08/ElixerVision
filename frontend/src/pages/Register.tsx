import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import api from '../api/axios';

interface RegisterProps {
  onRegister: (name: string) => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Register user (WITH NAME)
      await api.post('/auth/register', {
        name,
        email,
        password,
      });

      // 2️⃣ Auto login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginRes = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },  
      });

      const token = loginRes.data.access_token;
      if (!token) throw new Error('No token returned');

      // 3️⃣ Save auth
      localStorage.setItem('token', token);
      localStorage.setItem('userName', name);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 4️⃣ Notify App + redirect
      onRegister(name);
      navigate('/dashboard');

    } catch (err: any) {
  console.error(err);

  let message = 'Registration failed';

  if (err.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      // Pydantic validation errors come as an array of objects
      message = detail.map((d: any) => d.msg).join(', ');
    } else if (typeof detail === 'object') {
      message = JSON.stringify(detail);
    }
  }

  setError(message);
}
 finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-6 py-12">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <Link to="/" className="flex items-center gap-2 justify-center mb-8">
            <Sparkles className="w-8 h-8 text-purple-200" />
            <span className="text-2xl font-semibold">Elixer Vision</span>
          </Link>

          <h2 className="text-3xl mb-2 text-center">Create Account</h2>
          <p className="text-purple-100 text-center mb-4">
            Start optimizing your storage today
          </p>

          {error && (
            <div className="text-red-400 text-sm text-center mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="block mb-2 text-sm">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-300/50 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-300/50 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-300/50 outline-none"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2 text-sm">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-purple-300/50 outline-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-white text-purple-900 font-semibold shadow-lg"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-100">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
