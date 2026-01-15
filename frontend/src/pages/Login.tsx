import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock } from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import api from '../api/axios';

interface LoginProps {
  onLogin: (name: string, token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare x-www-form-urlencoded data for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', email); // must be 'username'
      formData.append('password', password);

      const res = await api.post('/auth/login', formData.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      console.log('Login response:', res.data);

      // Extract token and user's name from backend response
      const token = res.data.access_token;
      const name = res.data.name; // <-- backend returns 'name'

      if (!token || !name) {
        setError('Login failed: Invalid server response');
        return;
      }

      // Save token & user's name
      localStorage.setItem('token', token);
      localStorage.setItem('userName', name);

      // Update App state
      onLogin(name, token);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-6">
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

          <h2 className="text-3xl mb-2 text-center">Welcome Back</h2>
          <p className="text-purple-100 text-center mb-4">
            Login to continue optimizing your storage
          </p>

          {error && (
            <div className="text-red-400 text-sm text-center mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all placeholder-purple-200/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-200 hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-200" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all placeholder-purple-200/50"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-white text-purple-900 shadow-lg hover:shadow-xl'
              } transition-all duration-300`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-100">
              Don't have an account?{' '}
              <Link to="/register" className="text-white hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}