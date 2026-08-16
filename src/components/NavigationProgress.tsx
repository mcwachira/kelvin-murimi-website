import { useRouterState } from '@tanstack/react-router'

/** Slim top-of-viewport progress bar shown while a route navigation is loading. */
export default function NavigationProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  return (
    <div className={`nav-progress${isLoading ? ' active' : ''}`} aria-hidden={!isLoading} />
  )
}
