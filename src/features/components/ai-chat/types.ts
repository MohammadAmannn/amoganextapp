export type Message = {
  role: 'user' | 'assistant'
  content: string
  sources?: {
    title: string
    url: string
  }[]
  images?: string[]
}

export interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

export interface SpeechRecognitionErrorEvent {
  error: string
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}