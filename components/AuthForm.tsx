import React, { useState } from 'react';

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, fullName: string, businessName: string) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSignIn, onSignUp }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName || !businessName) {
          setError('Please fill in all fields');
          return;
        }
        await onSignUp(email, password, fullName, businessName);
      } else {
        await onSignIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card-tinted max-w-md w-full p-8 space-y-6">
        {/* Logo */}
        <div className="flex justify-center relative z-10">
          <div className="glass-dist w-16 h-16 text-white rounded-2xl flex items-center justify-center text-3xl font-bold">
            <span className="relative z-10">A</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {isSignUp ? 'Create Your Academy' : 'Welcome Back'}
          </h2>
          <p className="text-white/70">
            {isSignUp
              ? 'Start your white-label AI platform journey'
              : 'Sign in to manage your academy'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative z-10 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
                  placeholder="Elite Martial Arts Academy"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-dist text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">{loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <div className="text-center relative z-10">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-white/80 hover:text-white font-medium text-sm"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Info Notice */}
        {isSignUp && (
          <div className="relative z-10 glass-card border border-white/20 rounded-lg p-4 text-sm text-white/90">
            <p className="font-semibold mb-1">What you'll get:</p>
            <ul className="space-y-1 text-xs">
              <li>✓ Your own branded platform</li>
              <li>✓ AI-powered student assistant</li>
              <li>✓ Class & payment management</li>
              <li>✓ Marketing automation tools</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
