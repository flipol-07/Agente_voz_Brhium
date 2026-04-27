import { randomUUID } from 'node:crypto'
import { mutateStore, readStore } from '@/features/brhium-platform/server/store'
import type {
  PlatformStore,
  AssistantConfig,
  CallRecord,
  CallTranscriptEntry,
  CallWithDetails,
  DashboardSnapshot,
  DemoReply,
  MetricCard,
  SessionUser,
  KnowledgeProduct,
} from '@/features/brhium-platform/types'
import Retell from 'retell-sdk'

const RETELL_API_BASE = 'https://api.retellai.com';

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

async function fetchRetell(endpoint: string, options: RequestInit = {}) {
  const url = `${RETELL_API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${process.env.RETELL_API_KEY?.replace(/['"]+/g, '')}`,
    ...((options.headers as Record<string, string>) || {}),
  };

  // Only set Content-Type to application/json if not already set and body is not FormData
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorBody = await response.json();
      errorDetail = `: ${JSON.stringify(errorBody)}`;
    } catch (e) {
      errorDetail = `: ${response.statusText}`;
    }
    throw new Error(`Error de conexión con el motor de voz${errorDetail}`);
  }
  return response.json();
}

export async function fetchRetellAgentConfig(agentId: string) {
  const agent = await fetchRetell(`/get-agent/${agentId}`);
  if (agent.response_engine?.type === 'retell-llm' && agent.response_engine.llm_id) {
    const llm = await fetchRetell(`/get-retell-llm/${agent.response_engine.llm_id}`);
    return { 
      ...agent, 
      ...llm, 
      llm_id: agent.response_engine.llm_id,
      // Ensure we don't overwrite agent level fields if llm has them but agent is master
      agent_name: agent.agent_name,
      language: agent.language
    };
  }
  return agent;
}

export async function updateRetellAgentConfig(agentId: string, config: Partial<AssistantConfig>) {
  console.log('UPDATING RETELL AGENT:', agentId, config);
  const agentUpdates: any = {};
  const llmUpdates: any = {};

  // Agent level updates
  if (config.agentName !== undefined) agentUpdates.agent_name = config.agentName;
  if (config.language !== undefined) agentUpdates.language = config.language;
  if (config.voiceId !== undefined) agentUpdates.voice_id = config.voiceId;
  // Doc: voice_speed [0.5, 2], voice_temperature [0, 2], volume [0, 2]
  if (config.voiceSpeed !== undefined) agentUpdates.voice_speed = clamp(config.voiceSpeed, 0.5, 2);
  if (config.voiceTemperature !== undefined) agentUpdates.voice_temperature = clamp(config.voiceTemperature, 0, 2);
  if (config.voiceEmotion !== undefined) {
    // Doc enum: calm/sympathetic/happy/sad/angry/fearful/surprised
    const allowed = ['calm', 'sympathetic', 'happy', 'sad', 'angry', 'fearful', 'surprised']
    const v = config.voiceEmotion?.toLowerCase()
    agentUpdates.voice_emotion = v && allowed.includes(v) ? v : null
  }
  if (config.volume !== undefined) agentUpdates.volume = clamp(config.volume, 0, 2);
  // Doc: responsiveness [0, 1], interruption_sensitivity [0, 1]
  if (config.responsiveness !== undefined) agentUpdates.responsiveness = clamp(config.responsiveness, 0, 1);
  if (config.enableDynamicResponsiveness !== undefined) agentUpdates.enable_dynamic_responsiveness = config.enableDynamicResponsiveness;
  if (config.interruptionSensitivity !== undefined) agentUpdates.interruption_sensitivity = clamp(config.interruptionSensitivity, 0, 1);
  if (config.enableBackchannel !== undefined) agentUpdates.enable_backchannel = config.enableBackchannel;
  if (config.ambientSound !== undefined) {
    // Doc enum: coffee-shop / convention-hall / summer-outdoor / mountain-outdoor / static-noise / call-center / null
    const allowed = ['coffee-shop', 'convention-hall', 'summer-outdoor', 'mountain-outdoor', 'static-noise', 'call-center']
    agentUpdates.ambient_sound = config.ambientSound === 'none' || !allowed.includes(config.ambientSound) ? null : config.ambientSound
  }
  if (config.ambientSoundVolume !== undefined) agentUpdates.ambient_sound_volume = clamp(config.ambientSoundVolume, 0, 2);
  if (config.beginMessageDelayMs !== undefined) agentUpdates.begin_message_delay_ms = clamp(config.beginMessageDelayMs, 0, 5000);

  // Reminder settings
  if (config.reminderTriggerMs !== undefined) agentUpdates.reminder_trigger_ms = Math.max(0, config.reminderTriggerMs);
  if (config.reminderMaxCount !== undefined) agentUpdates.reminder_max_count = Math.max(0, Math.round(config.reminderMaxCount));

  // Pronunciation dictionary
  if (config.pronunciationDictionary !== undefined) agentUpdates.pronunciation_dictionary = config.pronunciationDictionary;

  // Call settings — doc rangos: end_call_after_silence_ms >= 10000, max_call_duration_ms [60000, 7200000], ring_duration_ms [5000, 300000]
  if (config.endCallAfterSilenceMs !== undefined) agentUpdates.end_call_after_silence_ms = Math.max(10000, Math.round(config.endCallAfterSilenceMs));
  if (config.maxCallDurationMs !== undefined) agentUpdates.max_call_duration_ms = clamp(Math.round(config.maxCallDurationMs), 60000, 7200000);
  if (config.ringDurationMs !== undefined) agentUpdates.ring_duration_ms = clamp(Math.round(config.ringDurationMs), 5000, 300000);
  if (config.allowUserDtmf !== undefined) agentUpdates.allow_user_dtmf = config.allowUserDtmf;
  // OJO: el campo `voicemail_detection` NO existe. Lo correcto es `voicemail_option` (objeto).
  if (config.voicemailDetection !== undefined) {
    if (config.voicemailDetection === 'hangup') {
      agentUpdates.voicemail_option = { action: { type: 'prompt', text: '' } }
    } else if (config.voicemailDetection === 'leave_message') {
      agentUpdates.voicemail_option = { action: { type: 'voicemail_message' } }
    } else {
      agentUpdates.voicemail_option = null
    }
  }
  if (config.ivrHangup !== undefined) {
    agentUpdates.ivr_option = config.ivrHangup
      ? { action: { type: 'hangup' } }
      : { action: { type: 'ignore' } };
  }

  // Transcription
  if (config.boostedKeywords !== undefined) agentUpdates.boosted_keywords = config.boostedKeywords;
  // El campo correcto es `stt_mode` con enum fast/accurate/custom (no `transcription_mode`)
  if (config.transcriptionMode !== undefined) {
    const allowed = ['fast', 'accurate', 'custom']
    if (allowed.includes(config.transcriptionMode)) agentUpdates.stt_mode = config.transcriptionMode === 'speed' ? 'fast' : config.transcriptionMode
  }
  // denoising_mode: enum válido
  if (config.denoisingMode !== undefined) {
    const allowed = ['no-denoise', 'noise-cancellation', 'noise-and-background-speech-cancellation']
    if (allowed.includes(config.denoisingMode)) agentUpdates.denoising_mode = config.denoisingMode
  }

  // Timezone and Handbook
  if (config.timezone !== undefined) agentUpdates.timezone = config.timezone;
  
  const handbookConfig: any = {};
  if (config.handbookDefaultPersonality !== undefined) handbookConfig.default_personality = Boolean(config.handbookDefaultPersonality);
  if (config.handbookFillerWords !== undefined) handbookConfig.filler_words = config.handbookFillerWords;
  if (config.handbookHighEmpathy !== undefined) handbookConfig.high_empathy = config.handbookHighEmpathy;
  if (config.handbookEchoVerification !== undefined) handbookConfig.echo_verification = config.handbookEchoVerification;
  if (config.handbookNatoAlphabet !== undefined) handbookConfig.nato_phonetic_alphabet = config.handbookNatoAlphabet;
  if (config.handbookSpeechNormalization !== undefined) handbookConfig.speech_normalization = config.handbookSpeechNormalization;
  if (config.handbookSmartMatching !== undefined) handbookConfig.smart_matching = config.handbookSmartMatching;
  if (config.handbookAiDisclosure !== undefined) handbookConfig.ai_disclosure = config.handbookAiDisclosure;
  if (config.handbookScopeBoundaries !== undefined) handbookConfig.scope_boundaries = Boolean(config.handbookScopeBoundaries);

  if (Object.keys(handbookConfig).length > 0) {
    agentUpdates.handbook_config = {
      ...(agentUpdates.handbook_config || {}),
      ...handbookConfig
    };
  }

  // Advanced Retell Settings
  if (config.minEndpointingDelayMs !== undefined) agentUpdates.min_endpointing_delay_ms = Math.max(0, Math.round(config.minEndpointingDelayMs));
  // `opt_out_sensitive_data_storage` y `boost_sep_model` NO están documentados. Mejor traducirlos
  // a algo que sí existe: usar data_storage_setting si optOutSensitiveDataStorage es true.
  if (config.optOutSensitiveDataStorage !== undefined) {
    agentUpdates.data_storage_setting = config.optOutSensitiveDataStorage ? 'everything_except_pii' : 'everything'
  }
  // boost_sep_model: campo no documentado, lo dropeamos para no romper la PATCH.

  // Webhooks
  if (config.webhookUrl !== undefined) agentUpdates.webhook_url = config.webhookUrl || null;
  if (config.webhookEvents !== undefined) {
    const allowed = ['call_started', 'call_ended', 'call_analyzed', 'transcript_updated', 'transfer_started', 'transfer_bridged', 'transfer_cancelled', 'transfer_ended']
    agentUpdates.webhook_events = (config.webhookEvents || []).filter((e) => allowed.includes(e))
  }

  // Post-call analysis & recording
  if (config.enableRecording !== undefined) agentUpdates.opt_in_signed_url = config.enableRecording;
  if (config.postCallAnalysisEnabled !== undefined) {
    // Si activamos análisis sin un schema personalizado, dejamos un set por defecto útil.
    agentUpdates.post_call_analysis_data = config.postCallAnalysisEnabled
      ? [
          { type: 'string', name: 'call_summary', description: 'Resumen breve de la llamada.', examples: [] },
          { type: 'string', name: 'user_sentiment', description: 'Sentimiento detectado del usuario (positivo/negativo/neutro).', examples: [] },
          { type: 'boolean', name: 'call_successful', description: 'Si la llamada cumplió su objetivo.', examples: [] },
        ]
      : null
  }

  // LLM level updates
  if (config.systemPrompt !== undefined) llmUpdates.general_prompt = config.systemPrompt;
  if (config.beginMessage !== undefined) llmUpdates.begin_message = config.beginMessage;
  if (config.model !== undefined) llmUpdates.model = config.model;
  if (config.modelTier !== undefined) {
    llmUpdates.model_high_priority = config.modelTier === 'fast';
  }
  // Doc: model_temperature [0, 1]
  if (config.modelTemperature !== undefined) llmUpdates.model_temperature = clamp(config.modelTemperature, 0, 1);
  if (config.startSpeaker !== undefined) llmUpdates.start_speaker = config.startSpeaker;

  if (Object.keys(agentUpdates).length > 0) {
    await fetchRetell(`/update-agent/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(agentUpdates)
    });
  }

  if (Object.keys(llmUpdates).length > 0) {
    const agent = await fetchRetell(`/get-agent/${agentId}`);
    if (agent.response_engine?.type === 'retell-llm' && agent.response_engine.llm_id) {
      await fetchRetell(`/update-retell-llm/${agent.response_engine.llm_id}`, {
        method: 'PATCH',
        body: JSON.stringify(llmUpdates)
      });
    }
  }
}

export async function fetchRetellCalls(agentId?: string) {
  const body: Record<string, unknown> = {
    sort_order: 'descending',
    limit: 200,
  };
  if (agentId) {
    body.filter_criteria = { agent_id: [agentId] };
  }
  return fetchRetell('/v2/list-calls', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchRetellCallDetails(callId: string) {
  try {
    // Intentar primero con la API v2 (donde residen las transcripciones modernas)
    return await fetchRetell(`/v2/get-call/${callId}`);
  } catch (err: any) {
    // Si da 404, probar con la API v1/unversioned por si es una llamada antigua o con ID legacy
    if (err.message?.includes('Not Found') || err.message?.includes('404')) {
      console.warn(`[Retell] Call ${callId} not found in v2, falling back to v1...`);
      return await fetchRetell(`/get-call/${callId}`);
    }
    throw err;
  }
}

export async function fetchRetellPhoneNumbers() {
  return fetchRetell('/list-phone-numbers');
}

export async function updateRetellPhoneNumber(phoneNumber: string, assistantId: string) {
  return fetchRetell(`/update-phone-number/${phoneNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({ inbound_agent_id: assistantId })
  });
}

export async function fetchRetellKnowledgeBase(kbId: string) {
  return fetchRetell(`/get-knowledge-base/${kbId}`);
}

function eurosFromCents(value: number) {
  return (value / 100).toFixed(2)
}

function createId(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 8)}`
}

function getWorkspaceScopedCalls(store: Awaited<ReturnType<typeof readStore>>, session: SessionUser) {
  return store.calls.filter((call) => call.workspaceId === session.workspaceId)
}

function buildAssistantMap(store: Awaited<ReturnType<typeof readStore>>) {
  const configMap = new Map(store.assistantConfigs.map((config) => [config.id, config]))

  return store.assistants.map((assistant) => ({
    ...assistant,
    config: configMap.get(assistant.configId)!,
  }))
}

function buildCallWithDetails(store: Awaited<ReturnType<typeof readStore>>, call: CallRecord): CallWithDetails {
  return {
    ...call,
    transcripts: store.callTranscripts.filter((line) => line.callId === call.id),
    events: store.callEvents.filter((event) => event.callId === call.id),
    summary: store.callSummaries.find((summary) => summary.callId === call.id),
  }
}

function detectSensitiveTopic(message: string) {
  const lowered = message.toLowerCase()
  return [
    'embaraz',
    'lactan',
    'medic',
    'receta',
    'diagnost',
    'urgencia',
    'sangre',
    'dolor fuerte',
    'psicofarm',
  ].some((token) => lowered.includes(token))
}

function detectIntent(message: string) {
  const lowered = message.toLowerCase()

  if (lowered.includes('whatsapp')) return 'whatsapp'
  if (lowered.includes('llamad') || lowered.includes('devolv') || lowered.includes('contacte')) return 'callback'
  if (lowered.includes('comprar') || lowered.includes('pedido')) return 'purchase'
  if (lowered.includes('como se toma') || lowered.includes('modo de empleo') || lowered.includes('tomar')) {
    return 'mode'
  }
  if (lowered.includes('advert') || lowered.includes('contraindic') || lowered.includes('precauc')) {
    return 'warning'
  }
  if (lowered.includes('compos') || lowered.includes('ingred')) return 'composition'
  if (lowered.includes('colesterol')) return 'fluocol'
  if (lowered.includes('estres') || lowered.includes('sueno')) return 'estavit'
  if (lowered.includes('urin')) return 'irbosyn'
  if (lowered.includes('microbiota')) return 'micraflora'
  if (lowered.includes('quienes sois') || lowered.includes('que es brhium')) return 'company'

  return 'general'
}

function findProductByMessage(
  store: Awaited<ReturnType<typeof readStore>>,
  message: string
) {
  const lowered = message.toLowerCase()

  return store.knowledgeProducts.find((product) => lowered.includes(product.slug) || lowered.includes(product.name.toLowerCase()))
}

function buildKnowledgeReply(
  store: Awaited<ReturnType<typeof readStore>>,
  message: string,
  config: AssistantConfig
) {
  if (detectSensitiveTopic(message)) {
    return {
      reply: `Voy a dejar esto preparado para que una persona del equipo de Brhium te contacte cuanto antes. En temas con medicacion, embarazo, lactancia o sintomas intensos prefiero dejar la valoracion a una persona del equipo.`,
      status: 'handoff' as const,
      action: 'handoff' as const,
    }
  }

  const companyIntent = detectIntent(message)
  if (companyIntent === 'company') {
    const about = store.companyKnowledge
    return {
      reply: `${about.summary} ${about.philosophy} Si quieres escribirles, el canal publico es ${about.contactChannel}`,
      status: 'responding' as const,
    }
  }

  const product = findProductByMessage(store, message)

  if (product) {
    const intent = detectIntent(message)

    if (intent === 'mode') {
      return {
        reply: `${product.name}: ${product.modeOfUse} Recuerda que es informacion general y que, si hay un caso clinico sensible, conviene escalarlo.`,
        status: 'responding' as const,
      }
    }

    if (intent === 'warning') {
      return {
        reply: `${product.name}: ${product.warnings.join(' ')} Escalo siempre si aparece alguna de estas situaciones: ${product.escalateWhen.join(', ')}.`,
        status: 'responding' as const,
      }
    }

    if (intent === 'composition') {
      return {
        reply: `${product.name} incluye ${product.composition.join(', ')}. Su objetivo general es ${product.purpose.toLowerCase()}.`,
        status: 'responding' as const,
      }
    }

    if (intent === 'purchase') {
      return {
        reply: `Te puedo orientar y dejarte el enlace publico de ${product.name}: ${product.purchaseUrl}. Si quieres, tambien preparo seguimiento por WhatsApp.`,
        status: 'responding' as const,
      }
    }

    return {
      reply: `${product.name} pertenece a ${product.category.toLowerCase()}. ${product.purpose} La pauta publica es: ${product.modeOfUse}`,
      status: 'responding' as const,
    }
  }

  if (companyIntent === 'fluocol') {
    const product = store.knowledgeProducts.find((item) => item.slug === 'fluocol')!
    return {
      reply: `${product.name} es la referencia publica de Brhium para colesterol y mantenimiento cardiovascular. ${product.modeOfUse}`,
      status: 'responding' as const,
    }
  }

  if (companyIntent === 'estavit') {
    const product = store.knowledgeProducts.find((item) => item.slug === 'estavit')!
    return {
      reply: `${product.name} aparece orientado a estres y sueno. ${product.modeOfUse}`,
      status: 'responding' as const,
    }
  }

  if (companyIntent === 'whatsapp') {
    return {
      reply: 'Puedo dejar preparado un seguimiento por WhatsApp con resumen de llamada y siguiente paso. Dime nombre y telefono para registrarlo.',
      status: 'responding' as const,
      action: 'create_lead' as const,
    }
  }

  if (companyIntent === 'callback') {
    return {
      reply: `Voy a dejar esto preparado para que una persona del equipo de Brhium te contacte cuanto antes. Dime tu nombre y el mejor telefono y lo dejo programado como callback.`,
      status: 'responding' as const,
      action: 'create_callback' as const,
    }
  }

  const productNames = store.knowledgeProducts.map((product) => product.name).join(', ')
  return {
    reply: `Hola, soy Alba, la asistente de Brhium. Te ayudo con informacion de producto. Ahora mismo puedo ayudarte con informacion publica sobre ${productNames}, ademas de tomar datos para seguimiento o derivacion.`,
    status: 'responding' as const,
  }
}

function summariseConversation(lines: CallTranscriptEntry[]) {
  const callerLines = lines.filter((line) => line.speaker === 'caller').map((line) => line.text)
  const recentPrompt = callerLines[callerLines.length - 1] || 'Consulta general'
  return `Resumen rapido: ${recentPrompt}`
}

function estimateCallCost(durationSeconds: number, source: CallRecord['source']) {
  const ratePerMinute = source === 'phone' ? 0.34 : 0.18
  return Math.round((durationSeconds / 60) * ratePerMinute * 100)
}

// Cache para evitar llamar a Retell en cada refresh del dashboard.
// 30s = balance entre frescura para la demo y no spamear la API.
const SYNC_TTL_MS = 30_000
const lastSyncByWorkspace = new Map<string, number>()
const lastSyncErrorByWorkspace = new Map<string, string>()

async function maybeAutoSync(session: SessionUser) {
  if (!process.env.RETELL_API_KEY || !process.env.RETELL_AGENT_ID) return
  const last = lastSyncByWorkspace.get(session.workspaceId) || 0
  if (Date.now() - last < SYNC_TTL_MS) return
  lastSyncByWorkspace.set(session.workspaceId, Date.now())
  try {
    await syncRetellCalls(session)
    lastSyncErrorByWorkspace.delete(session.workspaceId)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[autoSync] failed', msg)
    lastSyncErrorByWorkspace.set(session.workspaceId, msg)
  }
}

export async function getDashboardSnapshot(session: SessionUser): Promise<DashboardSnapshot> {
  await maybeAutoSync(session)
  const store = await readStore()
  const workspace = store.workspaces.find((item) => item.id === session.workspaceId)!
  const assistants = buildAssistantMap(store).filter((assistant) => assistant.workspaceId === session.workspaceId)
  const calls = getWorkspaceScopedCalls(store, session)
    .map((call) => buildCallWithDetails(store, call))
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))

  const callCost = calls.reduce((sum, call) => sum + call.costEstimateCents, 0)
  const whatsappCost = store.whatsappEvents
    .filter((event) => event.workspaceId === session.workspaceId)
    .reduce((sum, event) => sum + event.costEstimateCents, 0)

  const totalDuration = calls.reduce((sum, call) => sum + call.durationSeconds, 0)
  const answeredCalls = calls.filter((call) => call.status !== 'active').length
  const transfers = calls.filter((call) => call.status === 'transferred').length
  const callbacks = store.callbacks.filter((item) => item.workspaceId === session.workspaceId && item.status === 'pending').length
  const dashboardMetrics: MetricCard[] = [
    {
      label: 'Llamadas',
      value: String(calls.length),
      hint: `${answeredCalls} atendidas`,
    },
    {
      label: 'Duracion media',
      value: `${Math.round(totalDuration / Math.max(calls.length, 1))}s`,
      hint: 'web y telefono',
    },
    {
      label: 'Transferencias',
      value: String(transfers),
      hint: 'casos sensibles',
    },
    {
      label: 'Callbacks',
      value: String(callbacks),
      hint: 'pendientes',
    },
  ]

  return {
    sessionUser: session,
    workspace,
    assistants,
    phoneNumbers: store.phoneNumbers.filter((item) => item.workspaceId === session.workspaceId),
    contacts: store.contacts.filter((item) => item.workspaceId === session.workspaceId),
    supportCases: store.supportCases.filter((item) => item.workspaceId === session.workspaceId),
    callbacks: store.callbacks.filter((item) => item.workspaceId === session.workspaceId),
    knowledgeProducts: store.knowledgeProducts,
    retellKnowledgeBases: store.retellKnowledgeBases,
    companyKnowledge: store.companyKnowledge,
    calls,
    usageMetrics: store.usageMetrics,
    dashboardMetrics,
    costSummary: {
      callCostEuros: eurosFromCents(callCost),
      whatsappCostEuros: eurosFromCents(whatsappCost),
      totalCostEuros: eurosFromCents(callCost + whatsappCost),
    },
    integrationStatus: {
      retellConfigured: Boolean(process.env.RETELL_API_KEY && process.env.RETELL_AGENT_ID),
      retellConnected: Boolean(process.env.RETELL_API_KEY && process.env.RETELL_AGENT_ID) && !lastSyncErrorByWorkspace.has(session.workspaceId),
      retellError: lastSyncErrorByWorkspace.get(session.workspaceId),
      vapiConfigured: false,
      twilioConfigured: false,
      sessionSecretConfigured: process.env.APP_SESSION_SECRET !== undefined,
    },
    retell: null,
  }
}

export async function listCalls(session: SessionUser) {
  const store = await readStore()
  return getWorkspaceScopedCalls(store, session)
    .map((call) => buildCallWithDetails(store, call))
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
}

export async function getCall(session: SessionUser, callId: string) {
  const store = await readStore()
  const call = store.calls.find((item) => item.workspaceId === session.workspaceId && item.id === callId)
  return call ? buildCallWithDetails(store, call) : null
}

export async function getMetrics(session: SessionUser) {
  const snapshot = await getDashboardSnapshot(session)
  return {
    metrics: snapshot.dashboardMetrics,
    costSummary: snapshot.costSummary,
    usageMetrics: snapshot.usageMetrics,
  }
}

export async function updateAssistantConfig(
  session: SessionUser,
  assistantId: string,
  patch: Partial<AssistantConfig>
) {
  return mutateStore((store) => {
    const assistant = store.assistants.find(
      (item) => item.workspaceId === session.workspaceId && item.id === assistantId
    )
    if (!assistant) throw new Error('Assistant not found')

    const config = store.assistantConfigs.find((item) => item.id === assistant.configId)
    if (!config) throw new Error('Assistant config not found')

    if (patch.agentName) {
      assistant.name = patch.agentName
    }

    Object.assign(config, {
      ...patch,
      updatedAt: new Date().toISOString(),
    })

    return config
  })
}

export async function updateAssistantStatus(
  session: SessionUser,
  assistantId: string,
  status: 'active' | 'inactive'
) {
  return mutateStore((store) => {
    const assistant = store.assistants.find(
      (item) => item.workspaceId === session.workspaceId && item.id === assistantId
    )
    if (!assistant) throw new Error('Assistant not found')
    assistant.status = status
    return assistant
  })
}

export async function getAssistant(session: SessionUser, assistantId: string) {
  const store = await readStore()
  return store.assistants.find(
    (item) => item.workspaceId === session.workspaceId && item.id === assistantId
  )
}

export async function updatePhoneNumber(
  session: SessionUser,
  phoneNumberId: string,
  patch: Partial<{ isActive: boolean; assistantId: string; forwardTo: string }>
) {
  return mutateStore(async (store) => {
    const number = store.phoneNumbers.find(
      (item) => item.workspaceId === session.workspaceId && item.id === phoneNumberId
    )
    if (!number) throw new Error('Phone number not found')

    if (patch.isActive !== undefined) number.isActive = patch.isActive
    if (patch.assistantId) {
      number.assistantId = patch.assistantId
      
      // If it's a Retell number (contains + or starts with +), try to update Retell binding
      if (number.e164.startsWith('+') && process.env.RETELL_API_KEY) {
        try {
          // Find the retell agent ID. Usually we map local assistant ID to Retell Agent ID.
          // In this simplified platform, we use RETELL_AGENT_ID from env for everything,
          // but in a multi-agent system we would have a mapping.
          const retellAgentId = process.env.RETELL_AGENT_ID?.replace(/['"]+/g, '');
          if (retellAgentId) {
            await updateRetellPhoneNumber(number.e164, retellAgentId);
            console.log(`[Phone] Bound ${number.e164} to Retell Agent ${retellAgentId}`);
          }
        } catch (e) {
          console.error('[Phone] Failed to update Retell binding', e);
        }
      }
    }
    if (patch.forwardTo) number.forwardTo = patch.forwardTo
    return number
  })
}

export async function createLead(
  session: SessionUser,
  payload: { fullName: string; phone: string; email?: string; interest: string; notes?: string }
) {
  return mutateStore((store) => {
    const contact = {
      id: createId('contact'),
      workspaceId: session.workspaceId,
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      source: 'manual' as const,
      interest: payload.interest,
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
    }
    store.contacts.unshift(contact)
    return contact
  })
}

export async function createCase(
  session: SessionUser,
  payload: { topic: string; notes: string; priority?: 'normal' | 'alta'; contactId?: string; callId?: string }
) {
  return mutateStore((store) => {
    const supportCase = {
      id: createId('case'),
      workspaceId: session.workspaceId,
      contactId: payload.contactId,
      callId: payload.callId,
      topic: payload.topic,
      status: 'nuevo' as const,
      priority: payload.priority || 'normal',
      owner: session.name,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    }
    store.supportCases.unshift(supportCase)
    return supportCase
  })
}

export async function createCallback(
  session: SessionUser,
  payload: { reason: string; preferredWindow: string; contactId?: string; callId?: string }
) {
  return mutateStore((store) => {
    const callback = {
      id: createId('callback'),
      workspaceId: session.workspaceId,
      contactId: payload.contactId,
      callId: payload.callId,
      preferredWindow: payload.preferredWindow,
      reason: payload.reason,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }
    store.callbacks.unshift(callback)
    return callback
  })
}

export async function createWhatsappFollowup(
  session: SessionUser,
  payload: { to: string; template: string; callId?: string; contactId?: string }
) {
  return mutateStore((store) => {
    const event = {
      id: createId('wa'),
      workspaceId: session.workspaceId,
      callId: payload.callId,
      contactId: payload.contactId,
      to: payload.to,
      template: payload.template,
      status: 'queued' as const,
      costEstimateCents: 7,
      createdAt: new Date().toISOString(),
    }

    store.whatsappEvents.unshift(event)
    if (payload.callId) {
      store.callEvents.unshift({
        id: createId('event'),
        callId: payload.callId,
        type: 'whatsapp_sent',
        label: `WhatsApp preparado para ${payload.to}`,
        at: new Date().toISOString(),
      })
    }
    return event
  })
}

export async function getKnowledgeProduct(session: SessionUser, slug: string) {
  const store = await readStore()
  const workspace = store.workspaces.find((item) => item.id === session.workspaceId)
  if (!workspace) return null
  return store.knowledgeProducts.find((item) => item.slug === slug) || null
}

export async function logExternalCallEvent(
  session: SessionUser,
  payload: {
    source: CallRecord['source']
    callerDisplay: string
    summary: string
    durationSeconds: number
    status: CallRecord['status']
    assistantId?: string
    phoneNumberId?: string
    transcript?: Array<{ speaker: CallTranscriptEntry['speaker']; text: string }>
  }
) {
  return mutateStore((store) => {
    const assistantId = payload.assistantId || store.assistants.find((item) => item.workspaceId === session.workspaceId)?.id
    if (!assistantId) throw new Error('Assistant unavailable')

    const callId = createId('call')
    const startedAt = new Date(Date.now() - payload.durationSeconds * 1000).toISOString()
    const endedAt = new Date().toISOString()

    store.calls.unshift({
      id: callId,
      workspaceId: session.workspaceId,
      assistantId,
      phoneNumberId: payload.phoneNumberId,
      source: payload.source,
      direction: payload.source === 'phone' ? 'inbound' : 'demo',
      callerDisplay: payload.callerDisplay,
      status: payload.status,
      startedAt,
      endedAt,
      durationSeconds: payload.durationSeconds,
      costEstimateCents: estimateCallCost(payload.durationSeconds, payload.source),
    })

    if (payload.transcript) {
      payload.transcript.forEach((line) => {
        store.callTranscripts.unshift({
          id: createId('line'),
          callId,
          speaker: line.speaker,
          text: line.text,
          at: endedAt,
        })
      })
    }

    store.callSummaries.unshift({
      id: createId('summary'),
      callId,
      summary: payload.summary,
      disposition: payload.status === 'transferred' ? 'Escalada' : 'Procesada',
      nextStep: payload.status === 'transferred' ? 'Revisar derivacion humana.' : 'Sin siguiente paso.',
      updatedAt: endedAt,
    })

    return callId
  })
}

export async function converseWithAssistant(
  session: SessionUser,
  payload: { assistantId: string; message: string; conversationId?: string }
): Promise<DemoReply> {
  const store = await readStore()
  const assistant = buildAssistantMap(store).find(
    (item) => item.workspaceId === session.workspaceId && item.id === payload.assistantId
  )

  if (!assistant) {
    throw new Error('Assistant not found')
  }

  const answer = buildKnowledgeReply(store, payload.message, assistant.config)

  const callId = payload.conversationId || createId('demo')
  const now = new Date().toISOString()

  await mutateStore((draft) => {
    const existingCall = draft.calls.find((call) => call.id === callId)

    if (!existingCall) {
      draft.calls.unshift({
        id: callId,
        workspaceId: session.workspaceId,
        assistantId: payload.assistantId,
        source: 'web_demo',
        direction: 'demo',
        callerDisplay: session.name,
        customerName: session.name,
        status: answer.status === 'handoff' ? 'needs_followup' : 'active',
        startedAt: now,
        durationSeconds: 0,
        costEstimateCents: 0,
      })
      draft.callEvents.unshift({
        id: createId('event'),
        callId,
        type: 'demo_started',
        label: 'Demo web iniciada',
        at: now,
      })
    }

    const currentCall = draft.calls.find((call) => call.id === callId)!
    draft.callTranscripts.push({
      id: createId('line'),
      callId,
      speaker: 'caller',
      text: payload.message,
      at: now,
    })
    draft.callEvents.push({
      id: createId('event'),
      callId,
      type: 'message_received',
      label: 'Mensaje recibido en demo web',
      at: now,
    })
    draft.callTranscripts.push({
      id: createId('line'),
      callId,
      speaker: 'agent',
      text: answer.reply,
      at: now,
    })
    draft.callEvents.push({
      id: createId('event'),
      callId,
      type: (answer as any).action === 'handoff' ? 'transfer_requested' : 'message_sent',
      label: (answer as any).action === 'handoff' ? 'Derivacion recomendada por politica' : 'Respuesta enviada',
      at: now,
    })

    // Logica real: Crear entradas en el store segun la intencion detectada
    if ((answer as any).action === 'create_lead') {
      draft.contacts.unshift({
        id: createId('contact'),
        workspaceId: session.workspaceId,
        fullName: session.name || 'Usuario Demo',
        phone: '+34 600 000 000',
        email: 'demo@brhium.com',
        source: 'web_demo' as any,
        interest: 'Seguimiento WhatsApp',
        notes: `Solicitado en demo: "${payload.message}"`,
        createdAt: now,
      })
    }

    if ((answer as any).action === 'create_callback') {
      draft.callbacks.unshift({
        id: createId('callback'),
        workspaceId: session.workspaceId,
        callId,
        reason: 'Solicitud de contacto',
        preferredWindow: 'Mañana (demo)',
        status: 'pending' as any,
        createdAt: now,
      })
    }

    if (answer.status === 'handoff') {
      draft.supportCases.unshift({
        id: createId('case'),
        workspaceId: session.workspaceId,
        callId,
        topic: 'Consulta compleja (demo)',
        status: 'nuevo' as any,
        priority: 'alta' as any,
        owner: 'Alba (IA)',
        notes: `Handoff automático por tema sensible: "${payload.message}"`,
        createdAt: now,
      })
    }


    const lines = draft.callTranscripts.filter((line) => line.callId === callId)
    const elapsedSeconds = Math.max(45, lines.length * 26)
    currentCall.durationSeconds = elapsedSeconds
    currentCall.costEstimateCents = estimateCallCost(elapsedSeconds, 'web_demo')
    currentCall.status = answer.status === 'handoff' ? 'needs_followup' : 'completed'
    currentCall.endedAt = now

    const summary = draft.callSummaries.find((item) => item.callId === callId)
    const nextStep = answer.status === 'handoff' ? 'Revisar y devolver llamada.' : 'Sin accion urgente.'

    if (summary) {
      summary.summary = summariseConversation(lines)
      summary.disposition = answer.status === 'handoff' ? 'Escalada recomendada' : 'Demo atendida'
      summary.nextStep = nextStep
      summary.updatedAt = now
    } else {
      draft.callSummaries.push({
        id: createId('summary'),
        callId,
        summary: summariseConversation(lines),
        disposition: answer.status === 'handoff' ? 'Escalada recomendada' : 'Demo atendida',
        nextStep,
        updatedAt: now,
      })
    }
  })

  return {
    conversationId: callId,
    reply: answer.reply,
    status: answer.status,
    callId,
  }
}

export async function syncRetellCalls(session: SessionUser) {
  try {
    const retellAgentIdRaw = process.env.RETELL_AGENT_ID;
    if (!retellAgentIdRaw) return;
    const retellAgentId = retellAgentIdRaw.replace(/['"]+/g, '').trim();

    // Filtramos server-side por agent_id para no transferir llamadas ajenas.
    const retellCallsResp = await fetchRetellCalls(retellAgentId);
    // Assuming retellCallsResp is an array or has a property containing array
    const retellCalls = Array.isArray(retellCallsResp) ? retellCallsResp : retellCallsResp?.data || [];

    // Fetch the latest agent configuration to keep prompt in sync
    console.log(`[Sync] Fetching latest config for agent: ${retellAgentId}`);
    let latestAgentConfig: any;
    let kbDetails: any[] = [];
    try {
      latestAgentConfig = await fetchRetellAgentConfig(retellAgentId);
      console.log(`[Sync] Agent config fetched. KB IDs: ${latestAgentConfig.knowledge_base_ids?.join(', ') || 'None'}`);
      
      if (latestAgentConfig.knowledge_base_ids && latestAgentConfig.knowledge_base_ids.length > 0) {
        for (const kbId of latestAgentConfig.knowledge_base_ids) {
          console.log(`[Sync] Fetching KB detail for: ${kbId}`);
          const kb = await fetchRetellKnowledgeBase(kbId);
          if (kb) {
            console.log(`[Sync] KB fetched: ${kb.knowledge_base_name} with ${kb.knowledge_base_sources?.length || 0} sources`);
            kbDetails.push(kb);
          }
        }
      }
    } catch (e) {
      console.error('[Sync] Failed to fetch Retell agent config or KB', e);
    }

    await mutateStore(async (draft) => {
      const assistant = draft.assistants.find((a: any) => a.workspaceId === session.workspaceId);
      const assistantId = assistant?.id;
      if (!assistantId) {
        console.error(`[Sync] No assistant found for workspace: ${session.workspaceId}`);
        return;
      }

      // Sync system prompt if it was fetched successfully
      if (latestAgentConfig) {
        const config = draft.assistantConfigs.find((c: any) => c.id === assistant.configId);
        if (config) {
          console.log(`[Sync] Updating local config for assistant: ${assistantId}`);
          if (latestAgentConfig.general_prompt) config.systemPrompt = latestAgentConfig.general_prompt;
          if (latestAgentConfig.agent_name) config.agentName = latestAgentConfig.agent_name;
          if (latestAgentConfig.language) config.language = latestAgentConfig.language;
          if (latestAgentConfig.voice_id) config.voiceId = latestAgentConfig.voice_id;
          if (latestAgentConfig.voice_speed !== undefined) config.voiceSpeed = latestAgentConfig.voice_speed;
          if (latestAgentConfig.voice_temperature !== undefined) config.voiceTemperature = latestAgentConfig.voice_temperature;
          if (latestAgentConfig.voice_emotion) config.voiceEmotion = latestAgentConfig.voice_emotion;
          if (latestAgentConfig.model) config.model = latestAgentConfig.model;
          if (latestAgentConfig.model_temperature !== undefined) config.modelTemperature = latestAgentConfig.model_temperature;
          if (latestAgentConfig.begin_message) config.beginMessage = latestAgentConfig.begin_message;
          if (latestAgentConfig.interruption_sensitivity !== undefined) config.interruptionSensitivity = latestAgentConfig.interruption_sensitivity;
          if (latestAgentConfig.responsiveness !== undefined) config.responsiveness = latestAgentConfig.responsiveness;
          if (latestAgentConfig.enable_backchannel !== undefined) config.enableBackchannel = latestAgentConfig.enable_backchannel;
          if (latestAgentConfig.ambient_sound) config.ambientSound = latestAgentConfig.ambient_sound;
          if (latestAgentConfig.ambient_sound_volume !== undefined) config.ambientSoundVolume = latestAgentConfig.ambient_sound_volume;
          if (latestAgentConfig.start_speaker) config.startSpeaker = latestAgentConfig.start_speaker;
          // model_tier no existe en Retell; deducirlo del LLM se hace en syncAssistantConfigFromRetell.
        }
      }

      if (kbDetails.length > 0) {
        console.log(`[Sync] Storing ${kbDetails.length} Knowledge Bases in draft`);
        draft.retellKnowledgeBases = kbDetails;
      } else {
        console.log(`[Sync] No Knowledge Bases to store`);
      }

      console.log(`[Sync] Processing ${retellCalls.length} calls for agent: ${retellAgentId}`);
      let matched = 0, skipped = 0, added = 0;
      for (const rCall of retellCalls) {
        // Tolerante: matchea por prefijo (Retell a veces añade sufijos de versión).
        const callAgent: string = rCall.agent_id || '';
        const matches = callAgent === retellAgentId
          || callAgent.startsWith(retellAgentId)
          || retellAgentId.startsWith(callAgent);
        if (!matches) { skipped++; continue; }
        matched++;

        const exists = draft.calls.find((c: any) => c.id === rCall.call_id);
        const previousSummary = draft.callSummaries.find((s: any) => s.callId === rCall.call_id);
        const isFailed404 = previousSummary?.summary.includes('404');

        if (exists && !isFailed404) {
          skipped++;
          continue;
        }

        // Si ya existía pero falló el detalle (404), limpiamos para reintentar con la nueva lógica v2/v1
        if (isFailed404) {
          draft.calls = draft.calls.filter((c: any) => c.id !== rCall.call_id);
          draft.callSummaries = draft.callSummaries.filter((s: any) => s.callId !== rCall.call_id);
          console.log(`[Sync] Re-intentando sincronización completa para llamada ${rCall.call_id} (previamente 404)`);
        }

        try {
          // Fetch full call detail to get transcript
          const callDetail = await fetchRetellCallDetails(rCall.call_id);

          const durationSeconds = Math.round(((callDetail.end_timestamp || Date.now()) - callDetail.start_timestamp) / 1000) || 0;
          const isPhone = Boolean(callDetail.from_number || callDetail.to_number || rCall.call_type === 'phone_call');
          const source: CallRecord['source'] = isPhone ? 'phone' : 'web_demo';
          const cost = estimateCallCost(durationSeconds, source);
          const callerDisplay = callDetail.from_number || (isPhone ? 'Llamada telefónica' : 'Llamada web');

          draft.calls.push({
            id: callDetail.call_id,
            workspaceId: session.workspaceId,
            assistantId,
            source,
            direction: isPhone ? 'inbound' : 'demo',
            callerDisplay,
            status: callDetail.call_status === 'ended' ? 'completed' : 'active',
            startedAt: new Date(callDetail.start_timestamp).toISOString(),
            endedAt: callDetail.end_timestamp ? new Date(callDetail.end_timestamp).toISOString() : undefined,
            durationSeconds,
            costEstimateCents: cost,
          });

          // Process transcript if available - prioritize structured object
          const transcript = callDetail.transcript_object || callDetail.transcript;
          if (Array.isArray(transcript)) {
            for (const turn of transcript) {
              draft.callTranscripts.push({
                id: createId('line'),
                callId: callDetail.call_id,
                speaker: turn.role === 'agent' ? 'agent' : 'caller',
                text: turn.content,
                at: new Date(callDetail.start_timestamp).toISOString(), // fallback
              });
            }
          }

          draft.callSummaries.push({
            id: createId('summary'),
            callId: callDetail.call_id,
            summary: callDetail.call_analysis?.call_summary || 'Resumen no disponible',
            disposition: callDetail.call_analysis?.user_sentiment || 'Neutral',
            nextStep: 'Completado',
            updatedAt: new Date().toISOString(),
          });
          added++;
        } catch (e: any) {
          if (e.message?.includes('Not Found')) {
            console.warn(`[Sync] Call ${rCall.call_id} listed but details 404. Adding minimal record.`);
            
            const durationSeconds = Math.round((rCall.duration_ms || 0) / 1000);
            const source: CallRecord['source'] = rCall.call_type === 'phone_call' ? 'phone' : 'web_demo';
            
            draft.calls.push({
              id: rCall.call_id,
              workspaceId: session.workspaceId,
              assistantId,
              source,
              direction: source === 'phone' ? 'inbound' : 'demo',
              callerDisplay: source === 'phone' ? 'Llamada telefónica' : 'Llamada web',
              status: 'completed',
              startedAt: rCall.start_timestamp ? new Date(rCall.start_timestamp).toISOString() : new Date().toISOString(),
              endedAt: rCall.end_timestamp ? new Date(rCall.end_timestamp).toISOString() : undefined,
              durationSeconds,
              costEstimateCents: estimateCallCost(durationSeconds, source),
            });
            
            draft.callSummaries.push({
              id: createId('summary'),
              callId: rCall.call_id,
              summary: 'Detalles no disponibles (404)',
              disposition: 'Desconocida',
              nextStep: 'Ninguno',
              updatedAt: new Date().toISOString(),
            });
            added++;
          } else {
            console.error('Failed to sync details for call', rCall.call_id, e);
          }
        }
      }
      console.log(`[Sync] Calls summary: matched=${matched} skipped=${skipped} added=${added}`);

      aggregateRealUsageMetrics(draft);

      // Sync phone numbers from Retell
      try {
        const retellPhonesResp = await fetchRetellPhoneNumbers();
        const retellPhones = Array.isArray(retellPhonesResp) ? retellPhonesResp : (retellPhonesResp?.phone_numbers || []);
        for (const rPhone of retellPhones) {
          const exists = draft.phoneNumbers.find(p => p.e164 === rPhone.phone_number);
          if (exists) {
            exists.isActive = true; // If it's in retell and bound, it's active
            // We could also sync assistantId here if we wanted
          } else {
            draft.phoneNumbers.push({
              id: createId('phone'),
              workspaceId: session.workspaceId,
              label: rPhone.nickname || `Linea Retell ${rPhone.phone_number}`,
              e164: rPhone.phone_number,
              assistantId: assistantId,
              isActive: true,
              forwardTo: '+34 000 000 000', // Unknown
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.error('[Sync] Failed to sync phone numbers from Retell', e);
      }
    });
  } catch (error) {
    console.error('Error syncing Retell calls:', error);
  }
}

function aggregateRealUsageMetrics(draft: PlatformStore) {
  const today = new Date();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }

  // Use seconds for intermediate calculation
  const metricsMap: Record<string, { calls: number; seconds: number; costEstimateCents: number }> = {};
  last7Days.forEach(date => {
    metricsMap[date] = { calls: 0, seconds: 0, costEstimateCents: 0 };
  });

  draft.calls.forEach(call => {
    const date = call.startedAt.split('T')[0];
    if (metricsMap[date]) {
      metricsMap[date].calls += 1;
      metricsMap[date].seconds += call.durationSeconds || 0;
      metricsMap[date].costEstimateCents += call.costEstimateCents || 0;
    }
  });

  draft.usageMetrics = last7Days.map(date => ({
    date,
    calls: metricsMap[date].calls,
    minutes: Math.ceil(metricsMap[date].seconds / 60),
    costEstimateCents: metricsMap[date].costEstimateCents
  }));
}

export async function fetchRetellVoices() {
  return fetchRetell('/list-voices');
}

export async function syncAssistantConfigFromRetell(assistantId: string, agentId: string) {
  try {
    const agent = await fetchRetell(`/get-agent/${agentId}`);
    const llmId = agent.response_engine?.llm_id;
    
    let llm: any = {};
    if (llmId) {
      llm = await fetchRetell(`/get-retell-llm/${llmId}`);
    }

    const store = await readStore();
    const assistantIndex = store.assistants.findIndex(a => a.id === assistantId);
    if (assistantIndex === -1) return null;

    const configIndex = store.assistantConfigs.findIndex(c => c.assistantId === assistantId);
    if (configIndex === -1) return null;

    const currentConfig = store.assistantConfigs[configIndex];

    const updatedConfig: AssistantConfig = {
      ...currentConfig,
      agentName: agent.agent_name || currentConfig.agentName,
      language: agent.language || currentConfig.language,
      voiceId: agent.voice_id || currentConfig.voiceId,
      voiceSpeed: agent.voice_speed ?? currentConfig.voiceSpeed,
      voiceTemperature: agent.voice_temperature ?? currentConfig.voiceTemperature,
      volume: agent.volume ?? currentConfig.volume,
      responsiveness: agent.responsiveness ?? currentConfig.responsiveness,
      enableDynamicResponsiveness: agent.enable_dynamic_responsiveness ?? currentConfig.enableDynamicResponsiveness,
      interruptionSensitivity: agent.interruption_sensitivity ?? currentConfig.interruptionSensitivity,
      enableBackchannel: agent.enable_backchannel ?? currentConfig.enableBackchannel,
      ambientSound: agent.ambient_sound || currentConfig.ambientSound,
      ambientSoundVolume: agent.ambient_sound_volume ?? currentConfig.ambientSoundVolume,
      beginMessageDelayMs: agent.begin_message_delay_ms ?? currentConfig.beginMessageDelayMs,

      // Reminder
      reminderTriggerMs: agent.reminder_trigger_ms ?? currentConfig.reminderTriggerMs,
      reminderMaxCount: agent.reminder_max_count ?? currentConfig.reminderMaxCount,

      // Pronunciation
      pronunciationDictionary: agent.pronunciation_dictionary || currentConfig.pronunciationDictionary,

      // Call Settings
      endCallAfterSilenceMs: agent.end_call_after_silence_ms ?? currentConfig.endCallAfterSilenceMs,
      maxCallDurationMs: agent.max_call_duration_ms ?? currentConfig.maxCallDurationMs,
      ivrHangup: agent.ivr_option?.action?.type === 'hangup',
      allowUserDtmf: agent.allow_user_dtmf ?? currentConfig.allowUserDtmf,
      voicemailDetection: agent.voicemail_option?.action?.type === 'voicemail_message'
        ? 'leave_message'
        : agent.voicemail_option?.action?.type === 'prompt'
          ? 'hangup'
          : (currentConfig.voicemailDetection ?? 'disabled'),
      ringDurationMs: agent.ring_duration_ms ?? currentConfig.ringDurationMs,
      
      // Transcription
      boostedKeywords: agent.boosted_keywords || currentConfig.boostedKeywords,

      // Timezone and Handbook
      timezone: agent.timezone || currentConfig.timezone,
      handbookDefaultPersonality: agent.handbook_config?.default_personality ?? currentConfig.handbookDefaultPersonality,
      handbookFillerWords: agent.handbook_config?.filler_words ?? currentConfig.handbookFillerWords,
      handbookHighEmpathy: agent.handbook_config?.high_empathy ?? currentConfig.handbookHighEmpathy,
      handbookEchoVerification: agent.handbook_config?.echo_verification ?? currentConfig.handbookEchoVerification,
      handbookNatoAlphabet: agent.handbook_config?.nato_phonetic_alphabet ?? currentConfig.handbookNatoAlphabet,
      handbookSpeechNormalization: agent.handbook_config?.speech_normalization ?? currentConfig.handbookSpeechNormalization,
      handbookSmartMatching: agent.handbook_config?.smart_matching ?? currentConfig.handbookSmartMatching,
      handbookAiDisclosure: agent.handbook_config?.ai_disclosure ?? currentConfig.handbookAiDisclosure,
      handbookScopeBoundaries: agent.handbook_config?.scope_boundaries ?? currentConfig.handbookScopeBoundaries,

      // Advanced Retell Settings
      minEndpointingDelayMs: agent.min_endpointing_delay_ms ?? currentConfig.minEndpointingDelayMs,
      optOutSensitiveDataStorage: agent.opt_out_sensitive_data_storage ?? currentConfig.optOutSensitiveDataStorage,
      boostSepModel: agent.boost_sep_model ?? currentConfig.boostSepModel,

      // Webhooks
      webhookUrl: agent.webhook_url ?? currentConfig.webhookUrl,
      webhookEvents: agent.webhook_events ?? currentConfig.webhookEvents,

      // Post-call analysis & recording
      enableRecording: agent.opt_in_signed_url ?? currentConfig.enableRecording,
      postCallAnalysisEnabled: Array.isArray(agent.post_call_analysis_data)
        ? true
        : (currentConfig.postCallAnalysisEnabled ?? false),

      // LLM fields
      model: llm.model || currentConfig.model,
      modelTier: llm.model_high_priority ? 'fast' : 'default',
      modelTemperature: llm.model_temperature ?? currentConfig.modelTemperature,
      beginMessage: llm.begin_message || currentConfig.beginMessage,
      startSpeaker: llm.start_speaker || currentConfig.startSpeaker,
      systemPrompt: llm.general_prompt || currentConfig.systemPrompt,

      // LLM read-only
      knowledgeBaseIds: llm.knowledge_base_ids || currentConfig.knowledgeBaseIds,
      generalTools: llm.general_tools?.map((t: any) => ({ name: t.name, type: t.type, description: t.description })) || currentConfig.generalTools,
      kbTopK: llm.kb_config?.top_k ?? currentConfig.kbTopK,
      kbFilterScore: llm.kb_config?.filter_score ?? currentConfig.kbFilterScore,

      updatedAt: new Date().toISOString()
    };

    await mutateStore(draft => {
      const idx = draft.assistantConfigs.findIndex(c => c.assistantId === assistantId);
      if (idx !== -1) {
        draft.assistantConfigs[idx] = updatedConfig;
      }
    });

    return updatedConfig;
  } catch (error) {
    console.error('Error syncing from Retell:', error);
    throw error;
  }
}

export async function listKnowledgeProducts(session: SessionUser) {
  const store = await readStore()
  return store.knowledgeProducts || []
}

export async function createKnowledgeProduct(session: SessionUser, product: KnowledgeProduct) {
  return mutateStore((store) => {
    if (!store.knowledgeProducts) store.knowledgeProducts = []
    store.knowledgeProducts.push(product)
    return product
  })
}

export async function updateKnowledgeProduct(session: SessionUser, slug: string, patch: Partial<KnowledgeProduct>) {
  return mutateStore((store) => {
    const idx = store.knowledgeProducts.findIndex(p => p.slug === slug)
    if (idx === -1) throw new Error('Product not found')
    store.knowledgeProducts[idx] = { ...store.knowledgeProducts[idx], ...patch }
    return store.knowledgeProducts[idx]
  })
}

export async function deleteKnowledgeProduct(session: SessionUser, slug: string) {
  return mutateStore((store) => {
    store.knowledgeProducts = store.knowledgeProducts.filter(p => p.slug !== slug)
  })
}

export async function addRetellKnowledgeSource(kbId: string, payload: { name: string, text: string }) {
  // Retell API: POST /add-knowledge-base-sources/{knowledge_base_id}
  // This endpoint requires multipart/form-data
  const formData = new FormData();
  formData.append('knowledge_base_texts', JSON.stringify([
    {
      title: payload.name,
      text: payload.text
    }
  ]));

  return fetchRetell(`/add-knowledge-base-sources/${kbId}`, {
    method: 'POST',
    body: formData
  });
}

const retell = new Retell({
  apiKey: (process.env.RETELL_API_KEY || '').replace(/['"]+/g, ''),
})

export async function deleteRetellKnowledgeSource(kbId: string, sourceId: string) {
  // Based on SDK d.ts: deleteSource(sourceId: string, params: { knowledge_base_id: string })
  return retell.knowledgeBase.deleteSource(sourceId, { knowledge_base_id: kbId });
}
