/**
 * Centralized service to manage authentication redirections.
 */

export function getFullRedirectUrl(pathname: string, searchParamsString?: string): string {
  if (!searchParamsString) {
    return pathname
  }
  const cleanSearch = searchParamsString.startsWith('?') 
    ? searchParamsString 
    : `?${searchParamsString}`
  return `${pathname}${cleanSearch}`
}

export function handleAuthRedirect(router: any, redirectTo?: string | null) {
  console.log('[DEBUG client] handleAuthRedirect received raw redirectTo:', redirectTo)

  let targetPath = '/'
  if (redirectTo) {
    try {
      targetPath = decodeURIComponent(redirectTo)
    } catch {
      targetPath = redirectTo
    }
  }

  // Normalize absolute URL to relative path if needed
  try {
    if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
      const url = new URL(targetPath)
      targetPath = `${url.pathname}${url.search}${url.hash}` || '/'
    }
  } catch {
    // Relative path
  }

  // Prevent redirect loops back to sign-in / sign-up
  if (targetPath === '/sign-in' || targetPath === '/sign-up' || !targetPath || targetPath === '') {
    targetPath = '/'
  }

  // Ensure leading slash
  if (!targetPath.startsWith('/')) {
    targetPath = `/${targetPath}`
  }

  console.log('[DEBUG client] handleAuthRedirect executing navigation to targetPath:', targetPath)

  if (router && typeof router.replace === 'function') {
    router.replace(targetPath)
  }

  // Hard navigation fallback if client router.replace stays on sign-in page
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      if (window.location.pathname.startsWith('/sign-in') || window.location.pathname.startsWith('/sign-up')) {
        console.log('[DEBUG client] Executing hard redirect to dashboard:', targetPath)
        window.location.href = targetPath
      }
    }, 100)
  }
}
