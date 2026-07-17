export class ApiError extends Error {
  code?: string
  details?: string | null
  hint?: string | null

  constructor(message: string, code?: string, details?: string | null, hint?: string | null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.details = details
    this.hint = hint
  }
}

/**
 * Handles error responses from PostgREST API requests by extracting error details and throwing ApiError.
 */
export async function handleError(response: Response): Promise<never> {
  let errorData: any
  try {
    errorData = await response.json()
  } catch {
    throw new ApiError(response.statusText || 'An unknown network error occurred')
  }

  const message = errorData?.message || errorData?.error_description || 'API request failed'
  const code = errorData?.code
  const details = errorData?.details
  const hint = errorData?.hint

  throw new ApiError(message, code, details, hint)
}
