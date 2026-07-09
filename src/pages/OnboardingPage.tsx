import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();
  
  // State for the intake form data
  const [visaType, setVisaType] = useState('Skilled Worker Visa');
  const [arrivalDate, setArrivalDate] = useState('2026-07-01');
  const [region, setRegion] = useState('England');
  const [language, setLanguage] = useState('english');
  const [dependants, setDependants] = useState('No, I am moving alone');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving user profile data:", { visaType, arrivalDate, region, dependants });
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto p-6 pt-10 min-h-screen bg-slate-50">
      
      {/* Visual Stepper */}
      <div className="flex items-center gap-2 mb-8 text-sm font-semibold text-slate-500">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
        <div className="flex-1 h-0.5 rounded-full bg-emerald-500"></div>
        <div className="flex items-center gap-2 text-slate-900">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0F67B1]"></div>
          Details
        </div>
        <div className="flex-1 h-0.5 rounded-full bg-slate-200"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
        <div className="flex-1 h-0.5 rounded-full bg-slate-200"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-6">Your Settlement Details</h2>

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Visa Type
          </label>
          <select 
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-base focus:border-[#0F67B1] focus:ring-4 focus:ring-[#0F67B1]/10 outline-none appearance-none transition-all"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '20px' }}
          >
            <option>Skilled Worker Visa</option>
            <option>Student Visa</option>
            <option>Graduate Visa</option>
            <option>Spouse / Family Visa</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Arrival Date
          </label>
          <input 
            type="date" 
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-base focus:border-[#0F67B1] focus:ring-4 focus:ring-[#0F67B1]/10 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            UK Region
          </label>
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-base focus:border-[#0F67B1] focus:ring-4 focus:ring-[#0F67B1]/10 outline-none appearance-none transition-all"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '20px' }}
          >
            <option>England</option>
            <option>Scotland</option>
            <option>Wales</option>
            <option>Northern Ireland</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preferred Language</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
            className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-base focus:border-[#0F67B1] focus:ring-4 focus:ring-[#0F67B1]/10 outline-none appearance-none transition-all"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '20px' }}
          >
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="arabic">Arabic</option>
            <option value="yoruba">Yoruba</option>
            <option value="igbo">Igbo</option>
            <option value="hausa">Hausa</option>
          </select>
        </div>

        {/* Updated Dependants Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Are you settling with dependants?
          </label>
          <select 
            value={dependants}
            onChange={(e) => setDependants(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white text-slate-900 text-base focus:border-[#0F67B1] focus:ring-4 focus:ring-[#0F67B1]/10 outline-none appearance-none transition-all"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '20px' }}
          >
            <option value="">Select an option</option>
                <option value="none">No dependants</option>
                <option value="adult">Yes, adult dependant</option>
                <option value="children">Yes, child dependant</option>
                <option value="both">Yes, adult and child dependants</option>
          </select>
        </div>

        <button 
          type="submit"
          className="w-full py-4 mt-4 rounded-xl font-bold text-white bg-[#0F67B1] hover:bg-[#0c5391] shadow-[0_4px_16px_rgba(15,103,177,0.25)] transition-all"
        >
          Continue
        </button>
      </form>
    </div>
  );
}