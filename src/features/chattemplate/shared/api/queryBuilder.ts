/**
 * Standard chainable helper to construct PostgREST query parameters.
 * Eliminates raw string manipulation for URLs.
 */
export class QueryBuilder {
  private params: URLSearchParams = new URLSearchParams()
  
  /**
   * Embeds resource relationships or filters output columns.
   */
  select(fields: string): this {
    // Strip whitespace and newlines for a clean query parameter
    const cleaned = fields.replace(/\s+/g, '')
    this.params.set('select', cleaned)
    return this
  }
  
  /**
   * Equality filter.
   */
  eq(column: string, value: any): this {
    this.params.append(column, `eq.${value}`)
    return this
  }

  /**
   * Case-insensitive pattern matching filter.
   */
  ilike(column: string, value: string): this {
    this.params.append(column, `ilike.${value}`)
    return this
  }

  /**
   * IN filter matching array of values.
   */
  in(column: string, values: any[]): this {
    const formatted = values.map(v => `${v}`).join(',')
    this.params.append(column, `in.(${formatted})`)
    return this
  }

  /**
   * Logical OR filter matching multiple column criteria.
   * Example string: "email.ilike.test@gmail.com,contact_user_id.eq.some-uuid"
   */
  or(filterString: string): this {
    this.params.set('or', `(${filterString})`)
    return this
  }

  /**
   * Sorting filter.
   */
  order(column: string, options?: { ascending?: boolean }): this {
    const dir = options?.ascending !== false ? 'asc' : 'desc'
    this.params.set('order', `${column}.${dir}`)
    return this
  }

  /**
   * Limit result size.
   */
  limit(n: number): this {
    this.params.set('limit', n.toString())
    return this
  }

  /**
   * Offset result index.
   */
  offset(n: number): this {
    this.params.set('offset', n.toString())
    return this
  }

  /**
   * Generates the final query parameter string (e.g. "?owner_id=eq.123").
   */
  toString(): string {
    const q = this.params.toString()
    return q ? `?${q}` : ''
  }
}

/**
 * Instantiates a new QueryBuilder query chain.
 */
export function createQuery(): QueryBuilder {
  return new QueryBuilder()
}
