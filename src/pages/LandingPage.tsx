import { Link } from 'react-router';
import HeroSection from '../components/landing/HeroSection';
import { useAuth } from '../contexts/AuthContext'; // 1. Import the hook

function LandingPage() {
  // 2. Call the hook INSIDE the component
  const { session } = useAuth(); 

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public Navigation Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
            S
          </div>
          <span className="text-xl font-bold text-slate-900">Se2L</span>
        </div>
        
        <nav className="flex items-center gap-4">
          {/* 3. Conditional rendering based on the session */}
          {session ? (
            <Link 
              to="/dashboard" 
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Hero Content */}
      <HeroSection />
    </div>
  );
}

export default LandingPage;