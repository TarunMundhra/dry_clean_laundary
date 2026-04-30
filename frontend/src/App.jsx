import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Marketplace from './pages/marketplace.jsx';
import SessionDetail from './pages/SessionDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import GitHubCallback from './pages/GitHubCallback.jsx';

function App() {
  // loadingAuth comes from the useEffect inside useAuth
  const { user, loginWithGoogle, loginWithGitHub, logout, authError } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
        <div className="max-w-4xl mx-auto">
          
          <Header
            user={user}
            onGoogleLogin={loginWithGoogle}
            onGithubLogin={loginWithGitHub}
            onLogout={logout}
          />

          {authError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
              {authError}
            </div>
          )}

          <ErrorBoundary>
            <Routes>
              {/* 1. Public Route: Anyone can see the sessions */}
              <Route path="/" element={<Marketplace user={user} />} />
              <Route path="/sessions/:sessionId" element={<SessionDetail user={user} />} />
              <Route path="/auth/github/callback" element={<GitHubCallback />} />

              {/* 2. Protected Route: Your AuthLayout idea handles access */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/profile" element={<Profile user={user} />} />
              </Route>
            </Routes>
          </ErrorBoundary>

        </div>
      </div>
    </Router>
  );
}

export default App;