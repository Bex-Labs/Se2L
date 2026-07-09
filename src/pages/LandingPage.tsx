import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const { session } = useAuth(); 

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        
        {/* Se2L App Logo matching the prototype gradient and shadow */}
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#0F67B1] to-[#3FA2F6] rounded-[28px] mb-6 flex items-center justify-center text-white text-4xl font-extrabold shadow-[0_12px_32px_rgba(15,103,177,0.3)]">
          Se2L
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Welcome to the UK
        </h1>
        
        <p className="text-slate-500 text-base mb-10 px-4 leading-relaxed">
          Your personal guide to settling in. We'll walk you through everything step by step.
        </p>

        {/* Dynamic Auth Buttons */}
        {session ? (
          <Link 
            to="/dashboard" 
            className="block w-full py-4 rounded-xl font-bold text-white bg-[#0F67B1] hover:bg-[#0c5391] shadow-[0_4px_16px_rgba(15,103,177,0.25)] transition-all mb-4"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/auth"
              className="block w-full py-4 rounded-xl font-bold text-white bg-[#0F67B1] hover:bg-[#0c5391] shadow-[0_4px_16px_rgba(15,103,177,0.25)] transition-all mb-4"
            >
              Get Started
            </Link>
            <Link
              to="/auth"
              className="block w-full py-4 rounded-xl font-bold text-slate-900 bg-transparent border-2 border-slate-200 hover:bg-slate-100 transition-all"
            >
              I Already Have an Account
            </Link>
          </>
        )}

        <div className="mt-8 text-sm text-slate-500 font-medium">
          Available in: English, العربية, اردو, 中文
        </div>

      </div>
    </div>
  );
}

export default LandingPage;