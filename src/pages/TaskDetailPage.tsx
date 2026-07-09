import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { dashboardTasks } from '../data/settlementTasks'
import {
  isTaskComplete,
  saveCompletedTaskIds,
  toggleSavedTaskCompletion,
} from '../utils/taskProgressStorage'

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

function TaskDetailPage() {
  const { taskId } = useParams()
  const { user, loading: authLoading } = useAuth()

  const task = dashboardTasks.find(
    (currentTask) => currentTask.id === taskId,
  )

  const [isComplete, setIsComplete] = useState(false)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [progressSaveError, setProgressSaveError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadTaskCompletionState() {
      if (!taskId) {
        return
      }

      setIsComplete(isTaskComplete(taskId))

      if (authLoading || !user) {
        return
      }

      const { data, error } = await supabase
        .from('user_task_states')
        .select('task_id, status')
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      if (error) {
        console.error('Failed to load task completion state:', error.message)
        return
      }

      setIsComplete(data?.status === 'complete')
    }

    loadTaskCompletionState()

    return () => {
      isMounted = false
    }
  }, [authLoading, taskId, user])

  async function handleTaskCompletionToggle() {
    if (!taskId || isSavingProgress) {
      return
    }

    const taskIsCurrentlyComplete = isComplete
    const nextIsComplete = !taskIsCurrentlyComplete

    setIsComplete(nextIsComplete)
    setProgressSaveError(null)

    const updatedCompletedTaskIds = toggleSavedTaskCompletion(taskId)

    if (!user) {
      return
    }

    setIsSavingProgress(true)

    const now = new Date().toISOString()

    const { error } = await supabase.from('user_task_states').upsert(
      {
        user_id: user.id,
        task_id: taskId,
        status: nextIsComplete ? 'complete' : 'pending',
        completed_at: nextIsComplete ? now : null,
        updated_at: now,
      },
      {
        onConflict: 'user_id,task_id',
      },
    )

    setIsSavingProgress(false)

    if (error) {
      console.error('Failed to save task progress:', error.message)

      setIsComplete(taskIsCurrentlyComplete)
      saveCompletedTaskIds(
        taskIsCurrentlyComplete
          ? [...updatedCompletedTaskIds, taskId]
          : updatedCompletedTaskIds.filter(
              (completedTaskId) => completedTaskId !== taskId,
            ),
      )

      setProgressSaveError(
        'We could not save your task progress. Please try again.',
      )
    }
  }

  if (!task) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-3 inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
            Task not found
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            We could not find this settlement task.
          </h1>

          <p className="mt-4 text-slate-600">
            The task may have been removed or the link may be incorrect.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
      >
        ← Back to dashboard
      </Link>

      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                {task.category}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-sm font-bold ${getTaskUrgencyClass(
                  task.urgency,
                )}`}
              >
                {formatUrgencyLabel(task.urgency)}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
              {task.title}
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              {task.description}
            </p>
          </div>

          <button
            type="button"
            onClick={handleTaskCompletionToggle}
            disabled={isSavingProgress}
            className={`w-fit rounded-xl px-5 py-3 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-70 ${
              isComplete
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSavingProgress
              ? 'Saving...'
              : isComplete
                ? 'Completed ✓'
                : 'Mark as complete'}
          </button>
        </div>

        {progressSaveError && (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {progressSaveError}
          </p>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Estimated time
            </h2>

            <p className="mt-2 text-slate-600">{task.estimatedTime}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Why this matters
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {task.whyItMatters}
            </p>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-slate-950">
            Steps to complete
          </h2>

          <ol className="mt-4 space-y-4">
            {task.steps.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-slate-200 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {index + 1}
                </span>

                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {task.officialLinks && task.officialLinks.length > 0 ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Trusted resources
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Official links
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use these official resources to continue this task safely.
            </p>

            <div className="mt-5 space-y-3">
              {task.officialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-slate-50"
                >
                  <p className="text-sm font-bold text-slate-950">
                    {link.label}
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Source: {link.source}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {task.youtubeVideoUrl ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Helpful video
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              Watch guidance
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use this video as a quick visual guide before completing the task.
            </p>

            <a
              href={task.youtubeVideoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Open video guide →
            </a>
          </section>
        ) : null}
      </article>
    </section>
  )
}

export default TaskDetailPage