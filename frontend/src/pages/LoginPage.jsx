import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container px-4 dark:bg-slate-900">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-surface-container-high bg-surface-container-lowest p-8 shadow-lg dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-3xl text-primary">sync</span>
          <span className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
            SYNCLAB CMS
          </span>
        </div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700"
          placeholder="admin@synclab.id"
        />
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700"
          placeholder="••••••••"
        />
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
