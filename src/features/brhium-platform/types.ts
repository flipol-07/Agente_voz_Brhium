export type UserRole = 'admin_agencia' | 'cliente_brhium'

export type CallSource = 'phone' | 'web_demo'
export type CallDirection = 'inbound' | 'demo'
export type CallStatus =
  | 'active'
  | 'completed'
  | 'transferred'
  | 'scheduled_callback'
  | 'needs_followup'

export type CaseStatus = 'nuevo' | 'pendiente' | 'contactado' | 'cerrado'

export interface Workspace {
  id: string
  name: string
  slug: string
  brandColor: string
  timezone: string
  createdAt: string
}

export interface User {
  id: string
  workspaceId: string
  role: UserRole
  email: string
  name: string
  title: string
  passwordHash: string
  createdAt: string
}

export interface OperatingHours {
  timezone: string
  days: string[]
  start: string
  end: string
}

export interface Assistant {
  id: string
  workspaceId: string
  name: string
  slug: string
  language: string
  voiceStyle: string
  status: 'active' | 'inactive'
  providerMode: 'browser_demo' | 'provider_ready'
  channels: Array<'web' | 'phone'>
  configId: string
  createdAt: string
}

export interface PronunciationEntry {
  word: string
  alphabet: 'ipa' | 'cmu'
  phoneme: string
}

export interface AssistantConfig {
  id: string
  assistantId: string
  systemPrompt: string
  agentName: string
  language: 'es-ES' | 'es-MX' | 'en-US' | 'en-GB' | 'pt-BR' | 'fr-FR' | 'de-DE' | 'it-IT' | 'multi' | string
  voiceId: string
  voiceSpeed: number
  voiceTemperature?: number
  voiceEmotion?: string
  volume?: number
  model: string
  modelTier?: 'default' | 'fast'
  modelTemperature?: number
  beginMessage?: string
  beginMessageDelayMs?: number
  interruptionSensitivity: number
  responsiveness: number
  enableDynamicResponsiveness?: boolean
  enableBackchannel?: boolean
  ambientSound?: 'none' | 'coffee-shop' | 'convention-hall' | 'summer-outdoor' | 'mountain-outdoor' | 'static-noise' | 'call-center' | string
  ambientSoundVolume?: number
  startSpeaker?: 'agent' | 'user'

  // Reminder
  reminderTriggerMs?: number
  reminderMaxCount?: number

  // Pronunciation
  pronunciationDictionary?: PronunciationEntry[]

  // Call Settings
  endCallAfterSilenceMs?: number
  maxCallDurationMs?: number
  voicemailDetection?: 'disabled' | 'hangup' | 'leave_message'
  ivrHangup?: boolean
  allowUserDtmf?: boolean
  dtmfTimeoutMs?: number
  dtmfTerminationKey?: string
  dtmfDigitLimit?: number
  ringDurationMs?: number

  // Transcription
  denoisingMode?: 'no-denoise' | 'noise-cancellation' | 'noise-and-background-speech-cancellation'
  transcriptionMode?: 'speed' | 'accuracy' | 'custom'
  boostedKeywords?: string[]

  // LLM read-only info (synced from Retell)
  knowledgeBaseIds?: string[]
  generalTools?: Array<{ name: string; type: string; description: string }>
  kbTopK?: number
  kbFilterScore?: number

  // Agent Handbook
  timezone?: string
  handbookDefaultPersonality?: string
  handbookFillerWords?: boolean
  handbookHighEmpathy?: boolean
  handbookEchoVerification?: boolean
  handbookNatoAlphabet?: boolean
  handbookSpeechNormalization?: boolean
  handbookSmartMatching?: boolean
  handbookAiDisclosure?: boolean
  handbookScopeBoundaries?: string

  // Advanced Retell Settings
  minEndpointingDelayMs?: number
  optOutSensitiveDataStorage?: boolean
  boostSepModel?: boolean

  // Webhooks
  webhookUrl?: string
  webhookEvents?: Array<'call_started' | 'call_ended' | 'call_analyzed'>

  // Post-call analysis
  enableRecording?: boolean
  postCallAnalysisEnabled?: boolean

  hidePrices?: boolean
  updatedAt: string
}

export interface PhoneNumber {
  id: string
  workspaceId: string
  label: string
  e164: string
  assistantId: string
  isActive: boolean
  forwardTo: string
  createdAt: string
}

export interface Contact {
  id: string
  workspaceId: string
  fullName: string
  phone: string
  email?: string
  source: CallSource | 'manual'
  interest: string
  notes: string
  createdAt: string
}

export interface SupportCase {
  id: string
  workspaceId: string
  contactId?: string
  callId?: string
  topic: string
  status: CaseStatus
  priority: 'normal' | 'alta'
  owner: string
  notes: string
  createdAt: string
}

export interface Callback {
  id: string
  workspaceId: string
  contactId?: string
  callId?: string
  preferredWindow: string
  reason: string
  status: 'pending' | 'done'
  createdAt: string
}

export interface ConsentRecord {
  id: string
  workspaceId: string
  callId: string
  canStoreTranscript: boolean
  canSendWhatsapp: boolean
  createdAt: string
}

export interface CallRecord {
  id: string
  workspaceId: string
  assistantId: string
  phoneNumberId?: string
  source: CallSource
  direction: CallDirection
  callerDisplay: string
  customerName?: string
  status: CallStatus
  startedAt: string
  endedAt?: string
  durationSeconds: number
  linkedContactId?: string
  linkedCaseId?: string
  linkedCallbackId?: string
  costEstimateCents: number
}

export interface CallTranscriptEntry {
  id: string
  callId: string
  speaker: 'caller' | 'agent' | 'system'
  text: string
  at: string
}

export interface CallEvent {
  id: string
  callId: string
  type:
    | 'demo_started'
    | 'message_received'
    | 'message_sent'
    | 'lead_created'
    | 'case_created'
    | 'callback_scheduled'
    | 'whatsapp_sent'
    | 'transfer_requested'
  label: string
  at: string
}

export interface CallSummary {
  id: string
  callId: string
  summary: string
  disposition: string
  nextStep: string
  updatedAt: string
}

export interface WhatsappEvent {
  id: string
  workspaceId: string
  callId?: string
  contactId?: string
  to: string
  template: string
  status: 'queued' | 'sent'
  costEstimateCents: number
  createdAt: string
}

export interface KnowledgeProduct {
  slug: string
  name: string
  category: string
  purpose: string
  composition: string[]
  modeOfUse: string
  warnings: string[]
  purchaseUrl: string
  sourceUrl: string
  escalateWhen: string[]
}

export interface CompanyKnowledge {
  summary: string
  philosophy: string
  contactChannel: string
  contactUrl: string
}

export interface UsageMetricPoint {
  date: string
  calls: number
  minutes: number
  costEstimateCents: number
}

export interface PlatformStore {
  version: number
  updatedAt: string
  workspaces: Workspace[]
  users: User[]
  assistants: Assistant[]
  assistantConfigs: AssistantConfig[]
  phoneNumbers: PhoneNumber[]
  contacts: Contact[]
  supportCases: SupportCase[]
  callbacks: Callback[]
  consents: ConsentRecord[]
  calls: CallRecord[]
  callTranscripts: CallTranscriptEntry[]
  callEvents: CallEvent[]
  callSummaries: CallSummary[]
  whatsappEvents: WhatsappEvent[]
  knowledgeProducts: KnowledgeProduct[]
  companyKnowledge: CompanyKnowledge
  retellKnowledgeBases?: any[]
  usageMetrics: UsageMetricPoint[]
}

export interface SessionUser {
  id: string
  workspaceId: string
  role: UserRole
  email: string
  name: string
  title: string
}

export interface MetricCard {
  label: string
  value: string
  hint: string
}

export interface CallWithDetails extends CallRecord {
  transcripts: CallTranscriptEntry[]
  events: CallEvent[]
  summary?: CallSummary
}

export interface AssistantWithConfig extends Assistant {
  config: AssistantConfig
}

export interface RetellPhoneBinding {
  phoneNumber: string
  nickname: string
  phoneNumberType: 'retell-twilio' | 'retell-telnyx' | 'custom'
  inboundAgentIds: string[]
  outboundAgentIds: string[]
  inboundWebhookUrl?: string
  isBound: boolean
}

export interface RetellEditableConfig {
  responseEngineType: 'retell-llm' | 'custom-llm' | 'conversation-flow'
  agentId: string
  llmId?: string
  agentVersion: number
  llmVersion?: number | null
  isPublished: boolean
  agentName: string
  beginMessage: string
  generalPrompt: string
  model: string
  modelTemperature: number
  modelHighPriority: boolean
  toolCallStrictMode: boolean
  startSpeaker: 'agent' | 'user'
  knowledgeBaseIds: string[]
  kbTopK: number
  kbFilterScore: number
  language: string
  voiceId: string
  voiceModel: string
  voiceSpeed: number
  voiceTemperature: number
  voiceEmotion: string
  responsiveness: number
  interruptionSensitivity: number
  enableBackchannel: boolean
  backchannelFrequency: number
  backchannelWords: string[]
  boostedKeywords: string[]
  enableDynamicResponsiveness: boolean
  enableDynamicVoiceSpeed: boolean
  sttMode: 'fast' | 'accurate' | 'custom'
  denoisingMode: 'no-denoise' | 'noise-cancellation' | 'noise-and-background-speech-cancellation'
  vocabSpecialization: 'general' | 'medical'
  reminderMaxCount: number
  reminderTriggerMs: number
  ambientSound: string
  webhookUrl: string
  webhookEvents: Array<'call_started' | 'call_ended' | 'call_analyzed'>
  phoneBindings: RetellPhoneBinding[]
}

export interface RetellDashboardData {
  configured: boolean
  connected: boolean
  lastSyncAt?: string
  error?: string
  webCallReady: boolean
  editable?: RetellEditableConfig
}

export interface DashboardSnapshot {
  sessionUser: SessionUser
  workspace: Workspace
  assistants: AssistantWithConfig[]
  phoneNumbers: PhoneNumber[]
  contacts: Contact[]
  supportCases: SupportCase[]
  callbacks: Callback[]
  knowledgeProducts: KnowledgeProduct[]
  retellKnowledgeBases?: any[]
  companyKnowledge: CompanyKnowledge
  calls: CallWithDetails[]
  usageMetrics: UsageMetricPoint[]
  dashboardMetrics: MetricCard[]
  costSummary: {
    callCostEuros: string
    whatsappCostEuros: string
    totalCostEuros: string
  }
  integrationStatus: {
    retellConfigured: boolean
    retellConnected: boolean
    retellError?: string
    vapiConfigured: boolean
    twilioConfigured: boolean
    sessionSecretConfigured: boolean
  }

  retell: RetellDashboardData | null
}

export interface DemoReply {
  conversationId: string
  reply: string
  status: 'listening' | 'responding' | 'handoff'
  callId: string
}
