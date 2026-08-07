import { ExtractionMatch, FieldType } from './types'

/**
 * Formats JSON keys (e.g. `invoice_number`, `vatId`, `bill-to`, `sold_to`) into readable labels (`Invoice Number`, `VAT ID`, `Sold To`).
 */
export function formatKeyToLabel(key: string): string {
  if (!key) return ''
  if (!isNaN(Number(key))) {
    return `Item ${Number(key) + 1}`
  }

  const acronymMap: Record<string, string> = {
    vatid: 'VAT ID',
    vat_id: 'VAT ID',
    vat: 'VAT',
    id: 'ID',
    po: 'PO Number',
    inv: 'Invoice',
    qty: 'Quantity',
    num: 'Number',
    no: 'Number',
  }

  const formatted = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()

  return formatted
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase()
      if (acronymMap[lower]) return acronymMap[lower]
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Formats JSON keys into UPPERCASE labels matching target UI screenshot (e.g. `INVOICE NUMBER`, `VAT ID`, `SOLD TO`, `SOLD BY`, `SUBTOTAL`).
 */
export function formatKeyToUppercaseLabel(key: string): string {
  const customUppercaseMap: Record<string, string> = {
    vatid: 'VAT ID',
    vat_id: 'VAT ID',
    vat: 'VAT ID',
    invoicenumber: 'INVOICE NUMBER',
    invoiceno: 'INVOICE NUMBER',
    invoice_no: 'INVOICE NUMBER',
    invoice_number: 'INVOICE NUMBER',
    customername: 'CUSTOMER NAME',
    customer_name: 'CUSTOMER NAME',
    soldto: 'SOLD TO',
    sold_to: 'SOLD TO',
    soldby: 'SOLD BY',
    sold_by: 'SOLD BY',
    customeraddress: 'SOLD TO ADDRESS',
    customer_address: 'SOLD TO ADDRESS',
    businessaddress: 'SOLD BY ADDRESS',
    business_address: 'SOLD BY ADDRESS',
    vendor: 'VENDOR',
    issuedate: 'INVOICE DATE',
    invoicedate: 'INVOICE DATE',
    invoice_date: 'INVOICE DATE',
    duedate: 'DUE DATE',
    due_date: 'DUE DATE',
    purchaseorder: 'PURCHASE ORDER',
    purchase_order: 'PURCHASE ORDER',
    paymentterms: 'PAYMENT TERMS',
    payment_terms: 'PAYMENT TERMS',
    subtotal: 'SUBTOTAL',
    tax: 'TAX',
    total: 'TOTAL',
  }

  const normalized = key.replace(/[_-]+/g, '').toLowerCase()
  if (customUppercaseMap[normalized]) {
    return customUppercaseMap[normalized]
  }

  return formatKeyToLabel(key).toUpperCase()
}

/**
 * Sentence case key formatting for right-side value cards (e.g., `Invoice number`, `Vendor`, `VAT ID`, `Sold to`).
 */
export function formatKeyToSentenceCase(key: string): string {
  const label = formatKeyToLabel(key)
  if (label.startsWith('VAT') || label.startsWith('PO') || label.startsWith('ID')) {
    return label
  }
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
}

/**
 * Determines whether string value represents a valid date (ISO, YYYY-MM-DD, etc.)
 */
export function isDateString(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  if (value.length < 8) return false
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return true
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return true

  return false
}

/**
 * Automatically infers input control type based on value and key name
 */
export function inferInputType(key: string, value: unknown): FieldType {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  
  if (typeof value === 'string') {
    if (isDateString(value) || key.toLowerCase().includes('date')) return 'date'
    if (value.length > 70 || value.includes('\n')) return 'textarea'
    return 'text'
  }

  return 'text'
}

/**
 * Accesses nested property value using dot path (e.g., "address.city" or "items.0.title")
 */
export function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined
  const parts = path.split('.')
  let curr = obj
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined
    curr = curr[part]
  }
  return curr
}

/**
 * Immutably sets nested property value at dot path
 */
export function setValueByPath(obj: any, path: string, value: any): any {
  if (!path) return value
  const parts = path.split('.')
  
  const setDeep = (current: any, index: number): any => {
    const key = parts[index]
    const isLast = index === parts.length - 1

    if (Array.isArray(current)) {
      const idx = Number(key)
      const nextArr = [...current]
      nextArr[idx] = isLast ? value : setDeep(current[idx] ?? {}, index + 1)
      return nextArr
    }

    const nextObj = { ...(current || {}) }
    if (isLast) {
      nextObj[key] = value
    } else {
      nextObj[key] = setDeep(current ? current[key] : {}, index + 1)
    }
    return nextObj
  }

  return setDeep(obj, 0)
}

const IGNORED_METADATA_KEYS = new Set([
  'meta',
  'lines',
  'rawtext',
  'raw_text',
  'words',
  'extractedat',
  'extracted_at',
  'confidence',
  'engine',
  'pagecount',
  'page_count',
  'language',
])

/**
 * Recursively flattens JSON object into key-value pairs for the Review Panel matches view (matching screenshot UI)
 * Filters out technical OCR metadata keys (meta, lines, rawText, etc.)
 */
export function flattenJsonToPairs(
  data: any,
  parentKey: string = ''
): ExtractionMatch[] {
  if (data === null || data === undefined) return []
  const matches: ExtractionMatch[] = []

  // Skip top-level metadata object or key
  if (parentKey && IGNORED_METADATA_KEYS.has(parentKey.toLowerCase().split('.')[0])) {
    return []
  }

  if (typeof data !== 'object') {
    const keyName = parentKey.split('.').pop() || parentKey
    if (IGNORED_METADATA_KEYS.has(keyName.toLowerCase())) return []

    const label = formatKeyToLabel(keyName)
    const sentenceLabel = formatKeyToSentenceCase(keyName)
    return [
      {
        key: formatKeyToUppercaseLabel(keyName),
        label,
        value: data,
        formattedValue: `${sentenceLabel}: ${String(data)}`,
      },
    ]
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemKey = parentKey ? `${parentKey}.${index}` : `${index}`
      matches.push(...flattenJsonToPairs(item, itemKey))
    })
    return matches
  }

  Object.keys(data).forEach((key) => {
    if (IGNORED_METADATA_KEYS.has(key.toLowerCase())) return

    const path = parentKey ? `${parentKey}.${key}` : key
    const val = data[key]

    if (val !== null && typeof val === 'object') {
      matches.push(...flattenJsonToPairs(val, path))
    } else {
      const label = formatKeyToLabel(key)
      const sentenceLabel = formatKeyToSentenceCase(key)
      const valStr = val !== undefined && val !== null ? String(val).replace(/\n/g, ', ') : '—'
      matches.push({
        key: formatKeyToUppercaseLabel(key),
        label,
        value: val ?? '',
        formattedValue: `${sentenceLabel}: ${valStr}`,
      })
    }
  })

  return matches
}
