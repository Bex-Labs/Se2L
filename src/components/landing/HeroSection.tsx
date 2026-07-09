import { Link } from 'react-router'
import PreviewTaskCard from './PreviewTaskCard'

function HeroSection() {
  return (
    <section
      id="start"
      className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center"
    >
      <div>
        <p className="mb-4 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
          Newcomer settlement platform
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
          Your UK settlement journey, organised into simple steps.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Se2L gives newcomers a personalised checklist based on visa type,
          arrival date, UK region, language, and family needs.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {/* Changed this from /onboarding to /auth */}
          <Link
            to="/auth"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Start your journey
          </Link>

          {/* Changed this to act as an anchor link for a future features section */}
          <a
            href="#features"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            View how it works
          </a>
        </div>
      </div>

      <aside
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        aria-label="Settlement progress preview"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Current phase
            </p>

            <h2 className="text-2xl font-bold text-slate-950">
              First Week in the UK
            </h2>
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            42% complete
          </span>
        </div>

        <div className="mb-6 h-3 rounded-full bg-slate-100">
          <div
            className="h-3 w-[42%] rounded-full bg-indigo-600"
            aria-hidden="true"
          />
        </div>

        <div className="space-y-4">
          <PreviewTaskCard
            label="Urgent"
            labelColourClass="text-red-600"
            title="Register with a GP"
            description="Find a local GP surgery and complete your registration."
          />

          <PreviewTaskCard
            label="Important"
            labelColourClass="text-amber-600"
            title="Apply for National Insurance number"
            description="Complete this if you are eligible to work in the UK."
          />

          <PreviewTaskCard
            label="Family"
            labelColourClass="text-indigo-600"
            title="Add dependant tasks"
            description="Track school, GP, and local council actions for children."
          />
        </div>
      </aside>
    </section>
  )
}

export default HeroSection