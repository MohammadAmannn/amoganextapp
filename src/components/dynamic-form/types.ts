export type PrimitiveValue = string | number | boolean | null | undefined

export type DynamicJsonObject = {
  [key: string]: DynamicJsonValue
}

export type DynamicJsonArray = DynamicJsonValue[]

export type DynamicJsonValue = PrimitiveValue | DynamicJsonObject | DynamicJsonArray

export type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'textarea'

export type FormErrors = Record<string, string>

export interface ExtractionMatch {
  key: string
  label: string
  value: string | number | boolean
  formattedValue: string
}

export interface DynamicFormState {
  uploadedFile: File | null
  ocrJson: DynamicJsonObject | null
  editedJson: DynamicJsonObject | null
  loading: boolean
  saving: boolean
  error: string | null
  activeTab: 'select' | 'review' | 'pdf'
}
