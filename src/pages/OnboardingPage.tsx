// src/pages/OnboardingPage.tsx

import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { saveJourneyDetails } from '../utils/journeyStorage'
import { calculateCurrentPhase } from '../utils/phaseCalculator'

function getDependantCount(dependants: string) {
  if (dependants === 'adult') {
    return 1
  }

  if (dependants === 'children') {
    return 1
  }

  if (dependants === 'both') {
    return 2
  }

  return 0
}

function getBackendPhaseKey(phaseId: string) {
  const phaseKeyMap: Record<string, string> = {
    'pre-arrival': 'preArrival',
    'arrival-day': 'arrivalDay',
    'first-week': 'firstWeek',
    'first-month': 'firstMonth',
    'three-six-months': 'threeToSixMonths',
    'three-to-six-months': 'threeToSixMonths',
    'six-eighteen-months': 'sixToEighteenMonths',
    'six-to-eighteen-months': 'sixToEighteenMonths',
    'year-two-plus': 'yearTwoPlus',
  }

  return phaseKeyMap[phaseId] ?? phaseId
}

function getBackendRegion(region: string) {
  const regionMap: Record<string, string> = {
    england: 'England',
    scotland: 'Scotland',
    wales: 'Wales',
    'northern-ireland': 'Northern Ireland',
  }

  return regionMap[region] ?? region
}

function getBackendVisaType(visaType: string) {
  const visaTypeMap: Record<string, string> = {
    'skilled-worker': 'Skilled Worker',
    student: 'Student',
    'spouse-family': 'Spouse / Family',
    graduate: 'Graduate',
  }

  return visaTypeMap[visaType] ?? visaType
}

function getBackendLanguage(language: string) {
  const languageMap: Record<string, string> = {
    english: 'English',
    french: 'French',
    arabic: 'Arabic',
    yoruba: 'Yoruba',
    igbo: 'Igbo',
    hausa: 'Hausa',
  }

  return languageMap[language] ?? language
}

function OnboardingPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Loading
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Preparing your onboarding
          </h1>
        </section>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      setErrorMessage('Please sign in before creating your journey.')
      return
    }

    setSaving(true)
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)

    const journeyDetails = {
      visaType: String(formData.get('visaType') ?? ''),
      arrivalDate: String(formData.get('arrivalDate') ?? ''),
      region: String(formData.get('region') ?? ''),
      language: String(formData.get('language') ?? ''),
      dependants: String(formData.get('dependants') ?? ''),
    }

    const currentPhase = calculateCurrentPhase(journeyDetails.arrivalDate)
    const now = new Date().toISOString()

    const { error } = await supabase.from('newcomer_profiles').upsert(
      {
        user_id: user.id,
        visa_type: getBackendVisaType(journeyDetails.visaType),
        arrival_date: journeyDetails.arrivalDate,
        uk_region: getBackendRegion(journeyDetails.region),
        selected_language: getBackendLanguage(journeyDetails.language),
        dependant_count: getDependantCount(journeyDetails.dependants),
        current_phase_key: getBackendPhaseKey(currentPhase.id),
        last_active_at: now,
        updated_at: now,
      },
      {
        onConflict: 'user_id',
      },
    )

    if (error) {
      console.error('Failed to save onboarding details:', error.message)

      setErrorMessage(
        'We could not save your journey details. Please try again.',
      )

      setSaving(false)
      return
    }

    saveJourneyDetails(journeyDetails)

    setSaving(false)

    navigate('/dashboard', {
      state: journeyDetails,
    })
  }

  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <p className="mb-3 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
            Start your settlement journey
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            Tell us about your move to the UK.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Se2L uses your visa type, actual or planned UK arrival date, region,
            language, and family needs to create your personalised settlement
            journey.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        >
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="visaType"
                className="block text-sm font-semibold text-slate-700"
              >
                Visa type
              </label>

              <select
                id="visaType"
                name="visaType"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select visa type</option>
                <option value="skilled-worker">Skilled Worker</option>
                <option value="student">Student</option>
                <option value="spouse-family">Spouse / Family</option>
                <option value="graduate">Graduate</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="arrivalDate"
                className="block text-sm font-semibold text-slate-700"
              >
                UK arrival date
              </label>

              <input
                id="arrivalDate"
                name="arrivalDate"
                type="date"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="region"
                className="block text-sm font-semibold text-slate-700"
              >
                UK region
              </label>

              <select
                id="region"
                name="region"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select region</option>
                <option value="england">England</option>
                <option value="wales">Wales</option>
                <option value="scotland">Scotland</option>
                <option value="northern-ireland">Northern Ireland</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="language"
                className="block text-sm font-semibold text-slate-700"
              >
                Preferred language
              </label>

              <select
                id="language"
                name="language"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="english">English</option>
                <option value="french">French</option>
                <option value="arabic">Arabic</option>
                <option value="yoruba">Yoruba</option>
                <option value="igbo">Igbo</option>
                <option value="hausa">Hausa</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="dependants"
                className="block text-sm font-semibold text-slate-700"
              >
                Are you settling with dependants?
              </label>

              <select
                id="dependants"
                name="dependants"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select an option</option>
                <option value="none">No dependants</option>
                <option value="adult">Yes, adult dependant</option>
                <option value="children">Yes, child dependant</option>
                <option value="both">Yes, adult and child dependants</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Back
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? 'Saving journey...' : 'Create my journey'}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

export default OnboardingPage