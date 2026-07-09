import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import DashboardTaskCard from '../components/dashboard/DashboardTaskCard'
import { dashboardTasks, type TaskRegion } from '../data/settlementTasks'
import JourneyPhaseTimeline from '../components/dashboard/JourneyPhaseTimeline'
import {
    getSavedCompletedTaskIds,
    saveCompletedTaskIds,
} from '../utils/taskProgressStorage'
import {
    clearSavedJourneyDetails,
    getSavedJourneyDetails,
    saveJourneyDetails,
    type JourneyDetails,
} from '../utils/journeyStorage'
import { calculateCurrentPhase } from '../utils/phaseCalculator'
import { journeyPhases } from '../data/journeyPhases'

const visaTypeLabels: Record<string, string> = {
    'skilled-worker': 'Skilled Worker',
    student: 'Student',
    'spouse-family': 'Spouse / Family',
    graduate: 'Graduate',
}

const regionLabels: Record<string, string> = {
    england: 'England',
    wales: 'Wales',
    scotland: 'Scotland',
    'northern-ireland': 'Northern Ireland',
}

const languageLabels: Record<string, string> = {
    english: 'English',
    french: 'French',
    arabic: 'Arabic',
    yoruba: 'Yoruba',
    igbo: 'Igbo',
    hausa: 'Hausa',
}

const dependantLabels: Record<string, string> = {
    none: 'No dependants',
    adult: 'Adult dependant',
    children: 'Child dependant',
    both: 'Adult and child dependants',
}

type NewcomerProfileRow = {
    visa_type: string
    arrival_date: string
    uk_region: string
    selected_language: string
    dependant_count: number
}

type UserTaskStateRow = {
    task_id: string
    status: string
}

function getFrontendVisaType(visaType: string) {
    const visaTypeMap: Record<string, string> = {
        'Skilled Worker': 'skilled-worker',
        Student: 'student',
        'Spouse / Family': 'spouse-family',
        Graduate: 'graduate',
    }

    return visaTypeMap[visaType] ?? 'skilled-worker'
}

function getFrontendRegion(region: string) {
    const regionMap: Record<string, string> = {
        England: 'england',
        Wales: 'wales',
        Scotland: 'scotland',
        'Northern Ireland': 'northern-ireland',
    }

    return regionMap[region] ?? 'england'
}

function getFrontendLanguage(language: string) {
    const languageMap: Record<string, string> = {
        English: 'english',
        French: 'french',
        Arabic: 'arabic',
        Yoruba: 'yoruba',
        Igbo: 'igbo',
        Hausa: 'hausa',
    }

    return languageMap[language] ?? 'english'
}

function getFrontendDependants(dependantCount: number) {
    if (dependantCount <= 0) {
        return 'none'
    }

    if (dependantCount === 1) {
        return 'children'
    }

    return 'both'
}

function mapProfileToJourneyDetails(profile: NewcomerProfileRow): JourneyDetails {
    return {
        visaType: getFrontendVisaType(profile.visa_type),
        arrivalDate: profile.arrival_date,
        region: getFrontendRegion(profile.uk_region),
        language: getFrontendLanguage(profile.selected_language),
        dependants: getFrontendDependants(profile.dependant_count),
    }
}

const adultDependantTasks = [
    {
        id: 'adult-gp-registration',
        title: 'Help adult dependant register with a GP',
        description:
            'Make sure your adult dependant knows how to register with a local GP surgery.',
    },
]

const childDependantTasks = [
    {
        id: 'child-gp-registration',
        title: 'Register child dependant with a GP',
        description:
            'Children should also be registered with a local GP for NHS healthcare access.',
    },
    {
        id: 'school-registration',
        title: 'Check school registration requirements',
        description:
            'Review local council guidance for school placement and admissions.',
    },
]

function getFamilyTasks(dependantType: string | undefined) {
    if (dependantType === 'adult') {
        return adultDependantTasks
    }

    if (dependantType === 'children') {
        return childDependantTasks
    }

    if (dependantType === 'both') {
        return [...adultDependantTasks, ...childDependantTasks]
    }

    return []
}

function getOptionLabel(
    options: Record<string, string>,
    value: string | undefined,
    fallback: string,
) {
    if (!value) {
        return fallback
    }

    return options[value] ?? fallback
}

function formatArrivalDate(value: string | undefined) {
    if (!value) {
        return 'Not provided'
    }

    const [year, month, day] = value.split('-')

    if (!year || !month || !day) {
        return value
    }

    return `${day}/${month}/${year}`
}

function getPhaseIndex(phaseId: string) {
    return journeyPhases.findIndex((phase) => phase.id === phaseId)
}

function getTaskTimingLabel(taskPhaseId: string, currentPhaseId: string) {
    const taskPhaseIndex = getPhaseIndex(taskPhaseId)
    const currentPhaseIndex = getPhaseIndex(currentPhaseId)

    if (taskPhaseIndex < currentPhaseIndex) {
        return 'Past phase'
    }

    if (taskPhaseIndex === currentPhaseIndex) {
        return 'Due now'
    }

    return 'Coming soon'
}

function getTaskTimingClass(taskPhaseId: string, currentPhaseId: string) {
    const taskPhaseIndex = getPhaseIndex(taskPhaseId)
    const currentPhaseIndex = getPhaseIndex(currentPhaseId)

    if (taskPhaseIndex < currentPhaseIndex) {
        return 'bg-slate-100 text-slate-600'
    }

    if (taskPhaseIndex === currentPhaseIndex) {
        return 'bg-indigo-100 text-indigo-700'
    }

    return 'bg-amber-100 text-amber-700'
}

function getTaskTimingPriority(taskPhaseId: string, currentPhaseId: string) {
    const taskPhaseIndex = getPhaseIndex(taskPhaseId)
    const currentPhaseIndex = getPhaseIndex(currentPhaseId)

    if (taskPhaseIndex === currentPhaseIndex) {
        return 1
    }

    if (taskPhaseIndex > currentPhaseIndex) {
        return 2
    }

    return 3
}

function getTaskUrgencyPriority(urgency: string) {
    if (urgency === 'critical') {
        return 1
    }

    if (urgency === 'important') {
        return 2
    }

    return 3
}

function formatUrgencyLabel(urgency: string) {
    if (urgency === 'critical') {
        return 'Critical'
    }

    if (urgency === 'important') {
        return 'Important'
    }

    return 'Optional'
}

function getTaskUrgencyClass(urgency: string) {
    if (urgency === 'critical') {
        return 'bg-red-100 text-red-700'
    }

    if (urgency === 'important') {
        return 'bg-amber-100 text-amber-700'
    }

    return 'bg-slate-100 text-slate-600'
}

function isTaskAvailableInRegion(
    taskRegions: TaskRegion[],
    selectedRegion: string,
) {
    return taskRegions.includes(selectedRegion as TaskRegion)
}

function DashboardPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()

    const localJourneyDetails = useMemo(
        () =>
            (location.state as JourneyDetails | null) ??
            getSavedJourneyDetails(),
        [location.state],
    )

    const [backendJourneyDetails, setBackendJourneyDetails] =
        useState<JourneyDetails | null>(null)

    const [isLoadingJourney, setIsLoadingJourney] = useState(true)
    const [journeyLoadError, setJourneyLoadError] = useState<string | null>(null)

    const journeyDetails = backendJourneyDetails ?? localJourneyDetails

    const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(
        getSavedCompletedTaskIds,
    )

    useEffect(() => {
        let isMounted = true

        async function loadBackendJourneyDetails() {
            if (authLoading) {
                return
            }

            if (!user) {
                setIsLoadingJourney(false)
                return
            }

            setIsLoadingJourney(true)
            setJourneyLoadError(null)

            const { data, error } = await supabase
                .from('newcomer_profiles')
                .select(
                    'visa_type, arrival_date, uk_region, selected_language, dependant_count',
                )
                .eq('user_id', user.id)
                .maybeSingle()

            if (!isMounted) {
                return
            }

            if (error) {
                console.error('Failed to load dashboard journey:', error.message)
                setJourneyLoadError(
                    'We could not load your saved journey. Please try again.',
                )
                setBackendJourneyDetails(null)
                setIsLoadingJourney(false)
                return
            }

            if (data) {
                const mappedJourneyDetails = mapProfileToJourneyDetails(
                    data as NewcomerProfileRow,
                )

                setBackendJourneyDetails(mappedJourneyDetails)
                saveJourneyDetails(mappedJourneyDetails)
            } else {
                setBackendJourneyDetails(null)
            }

            setIsLoadingJourney(false)
        }

        loadBackendJourneyDetails()

        return () => {
            isMounted = false
        }
    }, [authLoading, user])

    useEffect(() => {
        let isMounted = true

        async function loadBackendCompletedTaskIds() {
            if (authLoading || !user) {
                return
            }

            const { data, error } = await supabase
                .from('user_task_states')
                .select('task_id, status')
                .eq('user_id', user.id)
                .eq('status', 'complete')

            if (!isMounted) {
                return
            }

            if (error) {
                console.error('Failed to load task progress:', error.message)
                return
            }

            const backendCompletedTaskIds = ((data ?? []) as UserTaskStateRow[]).map(
                (taskState) => taskState.task_id,
            )

            setCompletedTaskIds(backendCompletedTaskIds)
            saveCompletedTaskIds(backendCompletedTaskIds)
        }

        loadBackendCompletedTaskIds()

        return () => {
            isMounted = false
        }
    }, [authLoading, user])

    useEffect(() => {
        saveCompletedTaskIds(completedTaskIds)
    }, [completedTaskIds])

    if (authLoading || isLoadingJourney) {
        return (
            <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-12">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                    <p className="mb-3 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                        Loading journey
                    </p>

                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
                        Preparing your dashboard.
                    </h1>

                    <p className="mt-4 text-lg leading-8 text-slate-600">
                        Please wait while we load your saved settlement journey.
                    </p>
                </div>
            </section>
        )
    }

    if (!journeyDetails) {
        return (
            <>
                <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-12">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                        <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                            Journey not created
                        </p>

                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
                            Start your onboarding first.
                        </h1>

                        <p className="mt-4 text-lg leading-8 text-slate-600">
                            Se2L needs your visa type, arrival date, region, language, and
                            dependant information before it can create your settlement
                            dashboard.
                        </p>

                        {journeyLoadError && (
                            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                {journeyLoadError}
                            </p>
                        )}

                        <Link
                            to="/onboarding"
                            className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                        >
                            Start onboarding
                        </Link>
                    </div>
                </section>
            </>
        )
    }

    const visaType = getOptionLabel(
        visaTypeLabels,
        journeyDetails?.visaType,
        'Skilled Worker',
    )

    const region = getOptionLabel(regionLabels, journeyDetails?.region, 'Wales')

    const language = getOptionLabel(
        languageLabels,
        journeyDetails?.language,
        'English',
    )

    const dependants = getOptionLabel(
        dependantLabels,
        journeyDetails?.dependants,
        'Not provided',
    )

    const familyTasks = getFamilyTasks(journeyDetails?.dependants)
    const arrivalDate = formatArrivalDate(journeyDetails?.arrivalDate)
    const currentPhase = calculateCurrentPhase(journeyDetails.arrivalDate)

    const filteredDashboardTasks = dashboardTasks.filter(
        (task) =>
            task.visaTypes.includes(journeyDetails.visaType) &&
            isTaskAvailableInRegion(task.ukRegions, journeyDetails.region),
    )

    const filteredDashboardTaskIds = filteredDashboardTasks.map((task) => task.id)
    const sortedDashboardTasks = [...filteredDashboardTasks].sort(
        (firstTask, secondTask) => {
            const firstTaskIsComplete = completedTaskIds.includes(firstTask.id)
            const secondTaskIsComplete = completedTaskIds.includes(secondTask.id)

            if (firstTaskIsComplete && !secondTaskIsComplete) {
                return 1
            }

            if (!firstTaskIsComplete && secondTaskIsComplete) {
                return -1
            }

            const timingPriorityDifference =
                getTaskTimingPriority(firstTask.phaseId, currentPhase.id) -
                getTaskTimingPriority(secondTask.phaseId, currentPhase.id)

            if (timingPriorityDifference !== 0) {
                return timingPriorityDifference
            }

            return (
                getTaskUrgencyPriority(firstTask.urgency) -
                getTaskUrgencyPriority(secondTask.urgency)
            )
        },
    )

    const incompleteDashboardTasks = sortedDashboardTasks.filter(
        (task) => !completedTaskIds.includes(task.id),
    )

    const completedDashboardTasks = sortedDashboardTasks.filter((task) =>
        completedTaskIds.includes(task.id),
    )

    const dueNowTasks = incompleteDashboardTasks.filter(
        (task) => getTaskTimingLabel(task.phaseId, currentPhase.id) === 'Due now',
    )

    const comingSoonTasks = incompleteDashboardTasks.filter(
        (task) =>
            getTaskTimingLabel(task.phaseId, currentPhase.id) === 'Coming soon',
    )

    const pastPhaseTasks = incompleteDashboardTasks.filter(
        (task) =>
            getTaskTimingLabel(task.phaseId, currentPhase.id) === 'Past phase',
    )

    const completedTaskCount = completedTaskIds.filter((taskId) =>
        filteredDashboardTaskIds.includes(taskId),
    ).length
    const totalTaskCount = filteredDashboardTasks.length
    const progressPercentage = Math.round(
        (completedTaskCount / totalTaskCount) * 100,
    )

    function handleStartNewJourney() {
        clearSavedJourneyDetails()
        saveCompletedTaskIds([])
        setCompletedTaskIds([])
        navigate('/onboarding')
    }

    async function handleTaskToggle(taskId: string) {
        const taskIsCurrentlyComplete = completedTaskIds.includes(taskId)

        const updatedCompletedTaskIds = taskIsCurrentlyComplete
            ? completedTaskIds.filter((currentTaskId) => currentTaskId !== taskId)
            : [...completedTaskIds, taskId]

        setCompletedTaskIds(updatedCompletedTaskIds)
        saveCompletedTaskIds(updatedCompletedTaskIds)

        if (!user) {
            return
        }

        const now = new Date().toISOString()

        const { error } = await supabase.from('user_task_states').upsert(
            {
                user_id: user.id,
                task_id: taskId,
                status: taskIsCurrentlyComplete ? 'pending' : 'complete',
                completed_at: taskIsCurrentlyComplete ? null : now,
                updated_at: now,
            },
            {
                onConflict: 'user_id,task_id',
            },
        )

        if (error) {
            console.error('Failed to save task progress:', error.message)

            setCompletedTaskIds(completedTaskIds)
            saveCompletedTaskIds(completedTaskIds)
        }
    }

    function renderDashboardTaskCard(task: (typeof dashboardTasks)[number]) {
        return (
            <DashboardTaskCard
                key={task.id}
                id={task.id}
                category={task.category}
                urgencyLabel={formatUrgencyLabel(task.urgency)}
                urgencyClass={getTaskUrgencyClass(task.urgency)}
                title={task.title}
                description={task.description}
                phaseTitle={
                    journeyPhases.find((phase) => phase.id === task.phaseId)?.title ??
                    'Unassigned phase'
                }
                taskTimingLabel={getTaskTimingLabel(task.phaseId, currentPhase.id)}
                taskTimingClass={getTaskTimingClass(task.phaseId, currentPhase.id)}
                isComplete={completedTaskIds.includes(task.id)}
                onToggle={handleTaskToggle}
            />
        )
    }

    return (
        <>
            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8">
                    <p className="mb-3 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                        {visaType} journey
                    </p>

                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
                        Welcome to your settlement dashboard.
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                        Track your current phase, complete key tasks, and stay organised as
                        you settle into everyday life in the UK.
                    </p>

                    <button
                        type="button"
                        onClick={handleStartNewJourney}
                        className="mt-6 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                        Start new journey
                    </button>

                </div>

                <JourneyPhaseTimeline currentPhaseId={currentPhase.id} />

                <div className="grid gap-6 lg:grid-cols-3">
                    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500">
                                    Current phase
                                </p>

                                <h2 className="text-2xl font-bold text-slate-950">
                                    {currentPhase.title}
                                </h2>
                            </div>

                            <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                {completedTaskCount} of {totalTaskCount} tasks complete
                            </span>
                        </div>

                        <div className="mb-8 h-3 rounded-full bg-slate-100">
                            <div
                                className="h-3 rounded-full bg-indigo-600"
                                style={{ width: `${progressPercentage}%` }}
                                aria-hidden="true"
                            />
                        </div>

                        <div className="max-h-[520px] space-y-6 overflow-y-auto pr-2">
                            {dueNowTasks.length > 0 ? (
                                <section>
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                                        Due now
                                    </h3>

                                    <div className="space-y-4">{dueNowTasks.map(renderDashboardTaskCard)}</div>
                                </section>
                            ) : null}

                            {comingSoonTasks.length > 0 ? (
                                <section>
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                                        Coming soon
                                    </h3>

                                    <div className="space-y-4">
                                        {comingSoonTasks.map(renderDashboardTaskCard)}
                                    </div>
                                </section>
                            ) : null}

                            {pastPhaseTasks.length > 0 ? (
                                <section>
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                                        Past phase
                                    </h3>

                                    <div className="space-y-4">
                                        {pastPhaseTasks.map(renderDashboardTaskCard)}
                                    </div>
                                </section>
                            ) : null}

                            {completedDashboardTasks.length > 0 ? (
                                <section>
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                                        Completed
                                    </h3>

                                    <div className="space-y-4">
                                        {completedDashboardTasks.map(renderDashboardTaskCard)}
                                    </div>
                                </section>
                            ) : null}
                        </div>
                    </article>

                    <aside className="space-y-6">
                        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-950">
                                Journey summary
                            </h2>

                            <dl className="mt-4 space-y-4 text-sm">
                                <div>
                                    <dt className="font-semibold text-slate-500">Visa type</dt>
                                    <dd className="text-slate-900">{visaType}</dd>
                                </div>

                                <div>
                                    <dt className="font-semibold text-slate-500">
                                        Arrival date
                                    </dt>
                                    <dd className="text-slate-900">{arrivalDate}</dd>
                                </div>

                                <div>
                                    <dt className="font-semibold text-slate-500">Region</dt>
                                    <dd className="text-slate-900">{region}</dd>
                                </div>

                                <div>
                                    <dt className="font-semibold text-slate-500">Language</dt>
                                    <dd className="text-slate-900">{language}</dd>
                                </div>

                                <div>
                                    <dt className="font-semibold text-slate-500">Dependants</dt>
                                    <dd className="text-slate-900">{dependants}</dd>
                                </div>
                            </dl>
                        </article>

                        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-950">For your family</h2>

                            {familyTasks.length > 0 ? (
                                <div className="mt-4 space-y-4">
                                    {familyTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <h3 className="font-bold text-slate-950">{task.title}</h3>

                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                {task.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    No family tasks are needed based on your current dependant selection.
                                </p>
                            )}
                        </article>
                    </aside>
                </div>
            </section>
        </>
    )
}

export default DashboardPage
