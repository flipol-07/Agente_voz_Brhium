'use client'

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  BadgeCheck,
  Bot,
  CalendarClock,
  Check,
  ChartNoAxesCombined,
  Download,
  LoaderCircle,
  LogOut,
  MessageSquareShare,
  PhoneCall,
  Search,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  Workflow,
  Settings,
  LayoutGrid,
  User,
  UserCog,
  ChevronRight,
  ExternalLink,
  Headphones,
  Mic,
  BookOpen,
  Wrench,
  Volume2,
  Timer,
  Plus,
  Trash2,
  Settings2,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react'
import { VoiceDemoPanel } from '@/features/brhium-platform/components/voice-demo-panel'
import type {
  AssistantWithConfig,
  AssistantConfig,
  DashboardSnapshot,
  KnowledgeProduct,
  PhoneNumber,
} from '@/features/brhium-platform/types'

function exportCsv(filename: string, rows: Record<string, string | number | undefined>[]) {
  const headers = Object.keys(rows[0] || {})
  const body = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? ''
        return `"${String(value).replaceAll('"', '""')}"`
      })
      .join(',')
  )
  const csv = [headers.join(','), ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}m ${remaining}s`
}

function productAccent(index: number) {
  const accents = ['#e4f2f0', '#f8ede5', '#efe8d4']
  return accents[index % accents.length]
}

type Toast = { id: number; kind: 'success' | 'error' | 'info'; text: string }

function KnowledgeBaseCard({ kb }: { kb: any }) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleAdd = async () => {
    setBusy(true)
    setFeedback(null)
    try {
      const resp = await fetch(`/api/knowledge/sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kbId: kb.knowledge_base_id, name, text }),
      })
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Error añadiendo fuente')
      }
      setFeedback('Añadido. El sistema tarda ~1 min en reindexar.')
      setName('')
      setText('')
      setTimeout(() => {
        setFeedback(null)
        setShowAdd(false)
      }, 3000)
    } catch (err: any) {
      setFeedback(err.message || 'Error al añadir')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel flex flex-col p-6 bg-[#fcfcf9] border border-[var(--line)] rounded-2xl shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-[var(--line)] text-[var(--teal)] shadow-sm">
            <Workflow className="h-5 w-5" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--deep)]">{kb.knowledge_base_name || 'Knowledge Base'}</h3>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-300 ${showAdd ? 'bg-[var(--deep)] text-white rotate-45' : 'bg-[var(--teal)]/10 text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white'}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 bg-white border border-[var(--teal)]/20 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--teal)]">Nueva Fuente de Texto</p>
          <input
            type="text"
            placeholder="Título (ej: FAQ Envios)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#fcfcf9] border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
          />
          <textarea
            placeholder="Contenido..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full bg-[#fcfcf9] border border-[var(--line)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--teal)]"
          />
          <div className="flex items-center justify-between gap-2">
             {feedback && <p className="text-[10px] font-medium text-[var(--muted)] flex-1">{feedback}</p>}
             <button
               disabled={busy || !name || !text}
               onClick={handleAdd}
               className="ml-auto bg-[var(--teal)] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-[var(--deep)] transition disabled:opacity-50"
             >
               {busy ? '...' : 'Añadir'}
             </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {kb.knowledge_base_sources?.map((source: any) => {
          const isText = source.source_type === 'text' || (!source.url && !source.uri);
          
          return (
            <div key={source.source_id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[var(--line)] group transition hover:border-[var(--teal)]/30">
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className={`h-2 w-2 rounded-full ${isText ? 'bg-[var(--muted)]' : 'bg-[var(--teal)]'}`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-[var(--deep)] truncate">
                    {source.name || source.source_type || 'Fuente'}
                  </span>
                  {isText ? (
                    <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wider">Fragmento de texto</span>
                  ) : (
                    <span className="text-[10px] text-[var(--teal)] font-medium truncate opacity-70">
                      {source.url || source.uri}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isText && (
                  <a 
                    href={source.url || source.uri} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 hover:bg-[var(--teal)]/10 rounded-lg transition text-[var(--teal)]"
                    title="Abrir fuente"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button 
                  onClick={async () => {
                    if (!confirm('¿Seguro que quieres eliminar esta fuente?')) return;
                    try {
                      const resp = await fetch(`/api/knowledge/sources/${source.source_id}?kbId=${kb.knowledge_base_id}`, { method: 'DELETE' });
                      if (!resp.ok) throw new Error('Error al eliminar');
                      // No podemos refrescar fácil el objeto local, así que avisamos
                      alert('Eliminado. Refresca para ver los cambios.');
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-red-400 opacity-0 group-hover:opacity-100"
                  title="Eliminar fuente"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export function DashboardClient({ snapshot }: { snapshot: DashboardSnapshot }) {
  const router = useRouter()
  const assistant = snapshot.assistants[0]
  const [activeTab, setActiveTab] = useState<'overview' | 'agent' | 'operations' | 'settings'>('overview')
  const [configForm, setConfigForm] = useState<AssistantConfig>({
    ...assistant.config,
    hidePrices: !!assistant.config.hidePrices
  })
  const [search, setSearch] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)
  const [updatingNumberId, setUpdatingNumberId] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(search)
  const [voices, setVoices] = useState<any[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(1)
  const toast = useCallback((kind: Toast['kind'], text: string) => {
    const id = toastIdRef.current++
    setToasts((prev) => [...prev, { id, kind, text }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  useEffect(() => {
    fetch('/api/assistants/voices')
      .then(r => r.json())
      .then(data => {
        // Filtramos duplicados por voice_id para evitar warnings en React
        const uniqueVoices = [];
        const seenIds = new Set();
        for (const voice of data) {
          if (!seenIds.has(voice.voice_id)) {
            uniqueVoices.push(voice);
            seenIds.add(voice.voice_id);
          }
        }
        setVoices(uniqueVoices);
      })
      .catch(err => console.error('Error fetching voices:', err))
  }, [])

  useEffect(() => {
    setConfigForm({
      ...snapshot.assistants[0].config,
      hidePrices: !!snapshot.assistants[0].config.hidePrices
    })
  }, [snapshot.assistants])

  const filteredCalls = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    if (!query) return snapshot.calls

    return snapshot.calls.filter((call) => {
      const haystack = [
        call.callerDisplay,
        call.customerName,
        call.summary?.summary,
        ...call.transcripts.map((line) => line.text),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [deferredSearch, snapshot.calls])

  async function saveConfig() {
    setSavingConfig(true)
    try {
      const resp = await fetch(`/api/assistants/${assistant.id}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      })
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Save failed')
      }
      toast('success', 'Configuración guardada y sincronizada.')
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      console.error('Save failed:', err)
      toast('error', 'No se pudo guardar. Revisa la consola.')
    } finally {
      setSavingConfig(false)
    }
  }

  async function refreshConfig() {
    setSavingConfig(true)
    try {
      const resp = await fetch(`/api/assistants/${assistant.id}/config/refresh`, {
        method: 'POST',
      })
      if (!resp.ok) throw new Error('Failed to refresh config')
      const updated = await resp.json()
      setConfigForm(updated)
      toast('info', 'Configuración recargada.')
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      console.error('Refresh failed:', err)
      toast('error', 'No se pudo recargar. ¿Está el ID del agente configurado?')
    } finally {
      setSavingConfig(false)
    }
  }

  async function toggleNumber(number: PhoneNumber) {
    setUpdatingNumberId(number.id)
    try {
      await fetch(`/api/phone-numbers/${number.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !number.isActive }),
      })
      startTransition(() => {
        router.refresh()
      })
    } finally {
      setUpdatingNumberId(null)
    }
  }

  async function toggleAssistantStatus(assistantId: string, nextStatus: 'active' | 'inactive') {
    try {
      await fetch(`/api/assistants/${assistantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Failed to toggle assistant status:', error)
    }
  }

  async function assignAssistant(number: PhoneNumber, nextAssistantId: string) {
    setUpdatingNumberId(number.id)
    try {
      await fetch(`/api/phone-numbers/${number.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId: nextAssistantId }),
      })
      startTransition(() => {
        router.refresh()
      })
    } finally {
      setUpdatingNumberId(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#fcfcf9]">
      <ToastStack toasts={toasts} />
      {/* Sidebar Navigation */}
      <aside className="sticky top-0 h-screen w-72 border-r border-[var(--line)] bg-white p-6 shadow-sm hidden lg:flex flex-col">
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--teal)] text-white shadow-lg shadow-[var(--teal)]/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <span className="block font-display text-xl font-bold tracking-tight text-[var(--deep)]">Brhium AI</span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-semibold">Plataforma Voz</span>
          </div>
        </div>

        <AgentLiveStatus
          assistantName={assistant.config.agentName}
          status={assistant.status}
          retellConnected={snapshot.integrationStatus.retellConnected}
          callsToday={snapshot.calls.filter((c) => {
            const today = new Date(); today.setHours(0, 0, 0, 0)
            return new Date(c.startedAt).getTime() >= today.getTime()
          }).length}
          lastCallAt={snapshot.calls[0]?.startedAt}
        />

        <nav className="flex-1 space-y-1.5">
          <NavButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={LayoutGrid}
            label="Dashboard"
            description="Actividad y metricas"
          />
          <NavButton
            active={activeTab === 'agent'}
            onClick={() => setActiveTab('agent')}
            icon={Bot}
            label="Asistente"
            description="Prompt y configuracion"
          />
          <NavButton
            active={activeTab === 'operations'}
            onClick={() => setActiveTab('operations')}
            icon={Workflow}
            label="Operaciones"
            description="Leads y resolucion"
          />
          {snapshot.sessionUser.role === 'admin_agencia' && (
            <NavButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={Settings}
              label="Ajustes"
              description="Privacidad y control"
            />
          )}
        </nav>

        <div className="mt-auto">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 text-sm font-bold text-[var(--deep)] transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-600 shadow-sm active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              Cerrar sesion
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-4">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <h1 className="font-display text-4xl font-bold text-[var(--deep)] tracking-tight">Overview</h1>
                  <p className="text-[var(--muted)] max-w-2xl text-sm leading-relaxed">
                    Supervision en tiempo real de llamadas y rendimiento del agente.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <IntegrationPill
                    label="Motor de Voz"
                    active={snapshot.integrationStatus.retellConnected}
                    detail={
                      snapshot.integrationStatus.retellConnected
                        ? 'Conectado'
                        : snapshot.integrationStatus.retellError
                          ? `Error: ${snapshot.integrationStatus.retellError.slice(0, 40)}`
                          : 'Sin configurar'
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {snapshot.dashboardMetrics.map((metric, index) => (
                  <article key={metric.label} className="lift-card panel metric-glow bg-white/50 border border-white/60 p-6 rounded-2xl shadow-sm slide-reveal" style={{ animationDelay: `${index * 80}ms` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--muted)]">{metric.label}</span>
                      {index === 0 ? <PhoneCall className="h-5 w-5 text-[var(--teal)] opacity-80" /> :
                       index === 1 ? <Activity className="h-5 w-5 text-[var(--gold)] opacity-80" /> :
                       index === 2 ? <ShieldAlert className="h-5 w-5 text-[var(--clay)] opacity-80" /> :
                       <CalendarClock className="h-5 w-5 text-[var(--teal)] opacity-80" />}
                    </div>
                    <MetricValue raw={metric.value} />
                    <p className="mt-2 text-sm text-[var(--muted)] font-medium">{metric.hint}</p>
                  </article>
                ))}
              </div>

              {!assistant.config.hidePrices && (
                <div className="grid gap-4 xl:grid-cols-3">
                  <CostCard title="Coste llamadas" value={`${snapshot.costSummary.callCostEuros} EUR`} description="Estimacion agregada en voz y orquestacion" />
                  <CostCard title="WhatsApp" value={`${snapshot.costSummary.whatsappCostEuros} EUR`} description="Mensajes generados por el asistente" />
                  <CostCard title="Total visible" value={`${snapshot.costSummary.totalCostEuros} EUR`} description="Sin conciliacion financiera" />
                </div>
              )}
            </header>

            <section className="grid gap-6">
              <div className="panel panel-strong p-6 overflow-hidden bg-white shadow-sm border border-[var(--line)]">
                <SectionHeader
                  icon={ChartNoAxesCombined}
                  title="Consumo reciente"
                  copy={assistant.config.hidePrices
                    ? "Serie corta para revisar actividad de la ultima semana." 
                    : "Serie corta para revisar actividad y gasto de la ultima semana."}
                />
                <div className="mt-8 relative h-64 w-full">
                  <svg 
                    viewBox="0 0 1000 200" 
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.01" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Area fill */}
                    <path
                      d={`M 0 200 ${snapshot.usageMetrics.map((p, i) => {
                        const maxVal = Math.max(...snapshot.usageMetrics.map(m => m.calls), 5);
                        const x = (i / (snapshot.usageMetrics.length - 1)) * 1000;
                        const y = 200 - (p.calls / maxVal) * 180 - 10;
                        return `L ${x} ${y}`;
                      }).join(' ')} L 1000 200 Z`}
                      fill="url(#chartGradient)"
                    />

                    {/* Main line */}
                    <path
                      d={snapshot.usageMetrics.map((p, i) => {
                        const maxVal = Math.max(...snapshot.usageMetrics.map(m => m.calls), 5);
                        const x = (i / (snapshot.usageMetrics.length - 1)) * 1000;
                        const y = 200 - (p.calls / maxVal) * 180 - 10;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="var(--teal)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glow)"
                    />
                  </svg>

                  {/* Interactive points and labels */}
                  <div className="absolute inset-0 px-0 pointer-events-none">
                    {snapshot.usageMetrics.map((point, i) => {
                      const maxVal = Math.max(...snapshot.usageMetrics.map(m => m.calls), 5);
                      const heightPercent = (point.calls / maxVal) * 90 + 5;
                      const leftPercent = (i / (snapshot.usageMetrics.length - 1)) * 100;
                      
                      return (
                        <div 
                          key={point.date} 
                          className="group absolute top-0 bottom-0 flex flex-col items-center pointer-events-auto"
                          style={{ left: `${leftPercent}%`, width: '60px', transform: 'translateX(-50%)' }}
                        >
                          {/* Point Dot */}
                          <div 
                            className="absolute z-10 w-3 h-3 rounded-full border-2 border-[var(--teal)] bg-white shadow-sm transition-all duration-300 group-hover:scale-150 group-hover:bg-[var(--teal)]"
                            style={{ bottom: `${heightPercent}%`, transform: 'translateY(50%)' }}
                          />
                          
                          {/* Vertical guide line on hover */}
                          <div className="absolute inset-y-0 w-px bg-[var(--teal)]/0 group-hover:bg-[var(--teal)]/10 transition-colors" />

                          {/* Date label at bottom */}
                          <div className="absolute bottom-0 text-center pb-2">
                            <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-extrabold">
                              {new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(new Date(point.date))}
                            </p>
                            <p className="text-[10px] font-bold text-[var(--deep)] mt-0.5">{point.calls}</p>
                          </div>

                          {/* Elegant Tooltip */}
                          <div className="absolute z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" style={{ bottom: `${heightPercent + 8}%` }}>
                            <div className="bg-[var(--deep)] text-white p-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md min-w-[130px] -translate-x-1/2 ml-[50%]">
                              <p className="text-[9px] uppercase tracking-widest opacity-50 font-bold mb-2">
                                {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(point.date))}
                              </p>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center gap-4">
                                  <span className="text-[10px] opacity-70">Llamadas</span>
                                  <span className="text-xs font-bold">{point.calls}</span>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                  <span className="text-[10px] opacity-70">Minutos</span>
                                  <span className="text-xs font-bold">{point.minutes}m</span>
                                </div>
                                {!assistant.config.hidePrices && (
                                  <div className="flex justify-between items-center gap-4 pt-1 border-t border-white/10 mt-1">
                                    <span className="text-[10px] text-[var(--teal)] font-bold">Gasto</span>
                                    <span className="text-xs font-bold text-[var(--teal)]">{(point.costEstimateCents/100).toFixed(2)}€</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="w-2 h-2 bg-[var(--deep)] rotate-45 mx-auto -mt-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <section id="calls" className="panel panel-strong p-0 overflow-hidden bg-white shadow-sm border border-[var(--line)]">
                <div className="p-6 border-b border-[var(--line)] flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold text-[var(--deep)]">Historial de llamadas</h2>
                    <p className="text-sm text-[var(--muted)]">Explora conversaciones y analisis de sentimientos.</p>
                  </div>
                  <div className="flex w-full max-w-md items-center gap-3">
                    <label className="relative flex w-full items-center">
                      <Search className="absolute left-4 h-4 w-4 text-[var(--muted)]" />
                      <input
                        type="search"
                        placeholder="Buscar por cliente, resumen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-[var(--line)] bg-[#f9f9f7] py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--teal)] focus:bg-white focus:ring-4 focus:ring-[var(--teal)]/5"
                      />
                    </label>
                  </div>
                </div>

                <div className="divide-y divide-[var(--line)] max-h-[600px] overflow-auto">
                  {filteredCalls.length ? (
                    filteredCalls.map((call) => (
                      <details key={call.id} className="group outline-none">
                        <summary className="flex cursor-pointer list-none items-center justify-between p-6 transition hover:bg-[#fcfcf9] outline-none">
                          <div className="flex items-center gap-4">
                            <div className={`h-3 w-3 rounded-full shadow-sm ${call.status === 'completed' ? 'bg-[var(--teal)]' : 'bg-[var(--gold)]'}`} />
                            <div className="space-y-1">
                              <p className="font-bold text-[var(--deep)] leading-none">{call.customerName || call.callerDisplay}</p>
                              <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-medium">
                                <span className="uppercase tracking-wider">{call.source}</span>
                                <span>•</span>
                                <span>{formatDate(call.startedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="hidden text-right xl:block">
                              <p className="text-sm font-bold text-[var(--deep)]">{formatDuration(call.durationSeconds)}</p>
                              {!assistant.config.hidePrices && (
                                <p className="text-xs text-[var(--muted)]">{(call.costEstimateCents / 100).toFixed(2)} € est.</p>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-[var(--muted)] transition-transform group-open:rotate-90" />
                          </div>
                        </summary>

                        <div className="px-6 pb-8 animate-in fade-in duration-300">
                          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                            <div className="space-y-4">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-bold">Transcripcion interactiva</p>
                              <div className="space-y-3 max-h-[400px] overflow-auto pr-4 custom-scrollbar">
                                {call.transcripts.map((line) => (
                                  <div
                                    key={line.id}
                                    className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                                      line.speaker === 'agent'
                                        ? 'bg-[#eef6f5] border border-[var(--teal)]/10 text-[var(--deep)] ml-auto max-w-[85%]'
                                        : line.speaker === 'caller'
                                          ? 'bg-white border border-[var(--line)] text-[var(--deep)] mr-auto max-w-[85%]'
                                          : 'bg-[#f1f1f1] text-[var(--muted)] mx-auto w-full text-center italic text-xs'
                                    }`}
                                  >
                                    <p className="mb-2 text-[10px] uppercase tracking-[0.18em] font-bold opacity-50">
                                      {line.speaker === 'agent' ? assistant.config.agentName : line.speaker}
                                    </p>
                                    {line.text}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="rounded-2xl border border-[var(--line)] bg-[#f9f9f7] p-5">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] font-bold mb-4">Analisis IA</p>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs font-bold text-[var(--deep)] mb-1">Resumen</p>
                                    <p className="text-sm leading-relaxed text-[var(--muted)]">{call.summary?.summary || 'Analizando llamada...'}</p>
                                  </div>
                                  <div className="flex gap-4">
                                    <div>
                                      <p className="text-xs font-bold text-[var(--deep)] mb-1">Disposicion</p>
                                      <span className="inline-block px-2 py-1 rounded bg-white border border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--teal)]">
                                        {call.summary?.disposition || 'Pending'}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[var(--deep)] mb-1">Sig. Paso</p>
                                      <p className="text-[10px] font-medium text-[var(--muted)]">{call.summary?.nextStep || 'None'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </details>
                    ))
                  ) : (
                    <div className="p-10 text-center text-[var(--muted)]">No se han encontrado llamadas con estos filtros.</div>
                  )}
                </div>
              </section>
            </section>
          </div>
        )}

        {activeTab === 'agent' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <header className="space-y-1">
              <h1 className="font-display text-4xl font-bold text-[var(--deep)] tracking-tight">Asistente</h1>
              <p className="text-[var(--muted)] max-w-2xl text-sm leading-relaxed">Controla la identidad, el comportamiento y los canales de activacion de tu agente.</p>
            </header>

            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--teal)]/20 bg-[var(--teal)]/[0.03] p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  assistant.status === 'active' ? 'bg-[var(--teal)]/10 text-[var(--teal)]' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[var(--deep)]">Activacion Maestra</h3>
                  <p className="text-sm text-[var(--muted)]">Control total: si apagas aqui, el agente deja de responder en todos los canales.</p>
                </div>
              </div>
              <button
                onClick={() => toggleAssistantStatus(assistant.id, assistant.status === 'active' ? 'inactive' : 'active')}
                className={`flex min-w-[140px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition ${
                  assistant.status === 'active' ? 'bg-[#143127] text-white hover:bg-[#10271f]' : 'bg-white border border-[var(--line)] text-[var(--deep)] hover:border-[var(--teal)]'
                }`}
              >
                {assistant.status === 'active' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                {assistant.status === 'active' ? 'ACTIVO' : 'PAUSADO'}
              </button>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <VoiceDemoPanel assistantId={assistant.id} />
              <div className="space-y-6">
                <section id="numbers" className="panel panel-strong p-6 bg-white shadow-sm border border-[var(--line)]">
                  <SectionHeader icon={Workflow} title="Canales y Numeros" copy="Activa o pausa cada linea individualmente." />
                  <div className="mt-6 grid gap-4">
                    {snapshot.phoneNumbers.map((number) => (
                      <PhoneNumberRow
                        key={number.id}
                        number={number}
                        assistants={snapshot.assistants}
                        updating={updatingNumberId === number.id}
                        onToggle={() => toggleNumber(number)}
                        onAssign={(assistantId) => assignAssistant(number, assistantId)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </section>

            <div className="max-w-4xl">
              <AgentConfigPanel
                assistant={assistant}
                configForm={configForm}
                onChange={setConfigForm}
                onSave={saveConfig}
                onRefresh={refreshConfig}
                saving={savingConfig}
                availableVoices={voices}
              />
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <header className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="font-display text-4xl font-bold text-[var(--deep)] tracking-tight">Operaciones</h1>
                <span className="px-3 py-1 bg-[var(--teal)]/10 text-[var(--teal)] text-[10px] uppercase tracking-widest font-bold rounded-full border border-[var(--teal)]/20 whitespace-nowrap">
                  Ejemplo de funcionalidad
                </span>
              </div>
              <p className="text-[var(--muted)] max-w-2xl text-sm leading-relaxed">Gestion de leads, incidencias y base de conocimiento activa.</p>
            </header>

            <div className="grid gap-6 xl:grid-cols-3">
              <BackofficeColumn
                title="Nuevos Contactos"
                icon={User}
                onExport={() => exportCsv('brhium-contactos.csv', snapshot.contacts.map(item => ({ nombre: item.fullName, telefono: item.phone, email: item.email, interes: item.interest, fecha: formatDate(item.createdAt) })))}
                rows={snapshot.contacts.map(item => <BackofficeRow key={item.id} title={item.fullName} subtitle={item.phone} meta={`${item.interest} · ${formatDate(item.createdAt)}`} note={item.notes} />)}
              />
              <BackofficeColumn
                title="Incidencias"
                icon={ShieldAlert}
                onExport={() => exportCsv('brhium-incidencias.csv', snapshot.supportCases.map(item => ({ asunto: item.topic, estado: item.status, prioridad: item.priority, owner: item.owner, notas: item.notes })))}
                rows={snapshot.supportCases.map(item => <BackofficeRow key={item.id} title={item.topic} subtitle={item.status} meta={`${item.priority} · ${item.owner}`} note={item.notes} />)}
              />
              <BackofficeColumn
                title="Callbacks"
                icon={CalendarClock}
                onExport={() => exportCsv('brhium-callbacks.csv', snapshot.callbacks.map(item => ({ motivo: item.reason, franja: item.preferredWindow, estado: item.status, fecha: formatDate(item.createdAt) })))}
                rows={snapshot.callbacks.map(item => <BackofficeRow key={item.id} title={item.reason} subtitle={item.preferredWindow} meta={`${item.status} · ${formatDate(item.createdAt)}`} />)}
              />
            </div>

            <section id="knowledge" className="panel panel-strong p-8 bg-white shadow-sm border border-[var(--line)]">
              <SectionHeader icon={BadgeCheck} title="Base de Conocimiento" copy="Fuentes de informacion sincronizadas que el agente utiliza para responder preguntas." />
              <div className="mt-8">
                {snapshot.retellKnowledgeBases?.length ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {snapshot.retellKnowledgeBases.map((kb: any) => (
                      <KnowledgeBaseCard key={kb.knowledge_base_id} kb={kb} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 rounded-2xl border-2 border-dashed border-[var(--line)]"><p className="text-[var(--muted)] font-medium">No hay bases de conocimiento sincronizadas.</p></div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <header className="space-y-1">
              <h1 className="font-display text-4xl font-bold text-[var(--deep)] tracking-tight">Ajustes</h1>
              <p className="text-[var(--muted)] max-w-2xl text-sm leading-relaxed">Configuracion global de la plataforma y preferencias de privacidad.</p>
            </header>

            <section className="panel panel-strong p-8 bg-white shadow-sm border border-[var(--line)]">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--line)]">
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#f8f5ef] text-[var(--gold)]"><ShieldAlert className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-display text-xl font-bold text-[var(--deep)]">Privacidad del Cliente</h3>
                  <p className="text-sm text-[var(--muted)]">Configura que informacion es visible para el cliente final.</p>
                </div>
              </div>

              {snapshot.sessionUser.role === 'admin_agencia' ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-6 p-6 rounded-2xl border border-[var(--teal)]/10 bg-[var(--teal)]/[0.02]">
                    <div className="space-y-1">
                      <p className="font-bold text-[var(--deep)]">Ocultar precios y costes</p>
                      <p className="text-sm text-[var(--muted)] max-w-md leading-relaxed">
                        Si activas esta opcion, el cliente no podra ver ninguna estimacion economica.
                        <strong> Nota: Esta opcion no es visible para el cliente.</strong>
                      </p>
                    </div>
                    <label className="relative flex items-center justify-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="toggle-privacy"
                        checked={!!configForm.hidePrices} 
                        onChange={(e) => {
                          const val = e.target.checked;
                          setConfigForm(prev => ({ ...prev, hidePrices: val }));
                          // Use startTransition for the refresh to avoid blocking the UI
                          startTransition(async () => {
                            try {
                              const resp = await fetch(`/api/assistants/${assistant.id}/config`, { 
                                method: 'PATCH', 
                                headers: { 'Content-Type': 'application/json' }, 
                                body: JSON.stringify({ hidePrices: val }) 
                              });
                              if (!resp.ok) throw new Error('Failed to update config');
                              router.refresh();
                            } catch (err) {
                              console.error('Privacy toggle failed:', err);
                              // Revert state on error
                              setConfigForm(prev => ({ ...prev, hidePrices: !val }));
                            }
                          });
                        }}
                        className="peer h-7 w-12 cursor-pointer appearance-none rounded-full border-2 border-[var(--line)] bg-gray-100 transition-all checked:border-[var(--teal)] checked:bg-[var(--teal)] focus:outline-none"
                      />
                      <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center bg-[#fcfcf9] rounded-2xl border border-[var(--line)]"><p className="text-sm text-[var(--muted)] font-medium">No tienes permisos para modificar los ajustes.</p></div>
              )}
            </section>

            {snapshot.sessionUser.role === 'admin_agencia' && (
              <>
                <WebhookSection
                  configForm={configForm}
                  onPatch={async (patch) => {
                    setConfigForm((prev) => ({ ...prev, ...patch }))
                    await fetch(`/api/assistants/${assistant.id}/config`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(patch),
                    })
                    startTransition(() => router.refresh())
                  }}
                />
                <PostCallSection
                  configForm={configForm}
                  onPatch={async (patch) => {
                    setConfigForm((prev) => ({ ...prev, ...patch }))
                    await fetch(`/api/assistants/${assistant.id}/config`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(patch),
                    })
                    startTransition(() => router.refresh())
                  }}
                />
                {/* KB section moved to operations */}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function NavButton({ active, onClick, icon: Icon, label, description }: { active: boolean; onClick: () => void; icon: any; label: string; description: string }) {
  return (
    <button onClick={onClick} className={`group flex w-full items-center gap-4 rounded-2xl p-3.5 transition-all duration-300 ${active ? 'bg-[var(--teal)] text-white shadow-lg shadow-[var(--teal)]/20' : 'text-[var(--muted)] hover:bg-[#fcfcf9] hover:text-[var(--deep)]'}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-[var(--muted)] group-hover:bg-white group-hover:text-[var(--teal)]'}`}><Icon className="h-5 w-5" /></div>
      <div className="text-left overflow-hidden">
        <p className="text-sm font-bold leading-none tracking-tight">{label}</p>
        <p className={`mt-1 truncate text-[10px] font-medium uppercase tracking-wider opacity-60 ${active ? 'text-white' : 'text-[var(--muted)]'}`}>{description}</p>
      </div>
    </button>
  )
}

function IntegrationPill({ label, active, detail }: { label: string; active: boolean; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 shadow-sm transition hover:border-[var(--teal)]/30">
      <div className={`h-2 w-2 rounded-full shadow-sm ${active ? 'bg-[var(--teal)] animate-pulse' : 'bg-[var(--gold)]'}`} />
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[var(--deep)]">{label}</span>
        <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--muted)] font-bold">| {detail}</span>
      </div>
    </div>
  )
}

function CostCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm transition hover:shadow-lg group">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-bold">{title}</p>
      <p className="mt-3 font-display text-2xl font-bold text-[var(--deep)] tracking-tight group-hover:text-[var(--teal)] transition-colors">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)] font-medium leading-relaxed">{description}</p>
    </article>
  )
}

function SectionHeader({ icon: Icon, title, copy }: { icon: any; title: string; copy: string }) {
  return (
    <div className="flex items-start gap-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fcfcf9] border border-[var(--line)] text-[var(--teal)] shadow-sm"><Icon className="h-6 w-6" /></div>
      <div className="space-y-1">
        <h3 className="font-display text-xl font-bold text-[var(--deep)] tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-[var(--muted)] font-medium">{copy}</p>
      </div>
    </div>
  )
}

function BackofficeColumn({ title, icon: Icon, onExport, rows }: { title: string; icon: any; onExport: () => void; rows: React.ReactNode }) {
  return (
    <section className="panel panel-strong p-6 bg-white border border-[var(--line)] shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#fcfcf9] border border-[var(--line)] p-2.5 text-[var(--teal)] shadow-sm"><Icon className="h-5 w-5" /></div>
          <h3 className="font-display text-xl font-bold text-[var(--deep)]">{title}</h3>
        </div>
        <button type="button" onClick={onExport} className="flex h-9 items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 text-xs font-bold text-[var(--muted)] transition hover:border-[var(--teal)] hover:text-[var(--teal)]"><Download className="h-4 w-4" /> CSV</button>
      </div>
      <div className="space-y-4 flex-1">{rows}</div>
    </section>
  )
}

function BackofficeRow({ title, subtitle, meta, note }: { title: string; subtitle: string; meta: string; note?: string }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[#fcfcf9]/50 p-5 transition hover:bg-white group">
      <p className="text-sm font-bold text-[var(--deep)] group-hover:text-[var(--teal)] transition-colors">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)] font-medium">{subtitle}</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-bold">{meta}</p>
      {note && <div className="mt-4 p-3 rounded-xl bg-white border border-[var(--line)]/50"><p className="text-xs leading-relaxed text-[var(--muted)] font-medium italic">{note}</p></div>}
    </article>
  )
}

function KnowledgeCard({ product, accent }: { product: KnowledgeProduct; accent: string }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm transition hover:shadow-xl group h-full flex flex-col">
      <div className="inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--deep)]" style={{ backgroundColor: accent }}>{product.category}</div>
      <h3 className="mt-5 font-display text-2xl font-bold text-[var(--deep)] group-hover:text-[var(--teal)] transition-colors">{product.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] font-medium flex-1">{product.purpose}</p>
      <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-6">
        <p className="text-xs"><strong>Composicion:</strong> {product.composition.join(', ')}</p>
        <p className="text-xs"><strong>Modo de uso:</strong> {product.modeOfUse}</p>
        <p className="text-[10px] text-red-600 font-bold"><strong>Escalar si:</strong> {product.escalateWhen.join(', ')}</p>
      </div>
      <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[var(--teal)] hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Ver fuente</a>
    </article>
  )
}

const RETELL_MODEL_CATEGORIES = [
  {
    label: 'Sugeridos (Suggested)',
    models: [
      { id: 'gpt-5.1', label: 'GPT 5.1', hasFast: true, suggested: true },
      { id: 'gpt-4.1', label: 'GPT 4.1', hasFast: true, suggested: true },
      { id: 'gpt-5.4', label: 'GPT 5.4', hasFast: true },
      { id: 'gpt-5.2', label: 'GPT 5.2', hasFast: true },
      { id: 'gpt-5', label: 'GPT 5', hasFast: true },
      { id: 'claude-4.6-sonnet', label: 'Claude 4.6 Sonnet', hasFast: false },
      { id: 'claude-4.5-sonnet', label: 'Claude 4.5 Sonnet', hasFast: false },
      { id: 'gemini-3.0-flash', label: 'Gemini 3.0 Flash', hasFast: false },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', hasFast: false },
    ]
  },
  {
    label: 'Rápidos y Económicos (Fast & Cost-efficient)',
    models: [
      { id: 'gpt-5.4-mini', label: 'GPT 5.4 mini', hasFast: true },
      { id: 'gpt-5.4-nano', label: 'GPT 5.4 nano', hasFast: false },
      { id: 'gpt-5-mini', label: 'GPT 5-mini', hasFast: true },
      { id: 'gpt-5-nano', label: 'GPT 5-nano', hasFast: false },
      { id: 'gpt-4.1-mini', label: 'GPT 4.1-mini', hasFast: true },
      { id: 'gpt-4.1-nano', label: 'GPT 4.1-nano', hasFast: true },
      { id: 'claude-4.5-haiku', label: 'Claude 4.5 Haiku', hasFast: false },
      { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', hasFast: false },
      { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', hasFast: false },
    ]
  },
  {
    label: 'Voz a Voz (Speech to Speech)',
    models: [
      { id: 'gpt-realtime-1.5', label: 'GPT Realtime 1.5', hasFast: false },
      { id: 'gpt-realtime', label: 'GPT Realtime', hasFast: false },
      { id: 'gpt-realtime-mini', label: 'GPT Realtime mini', hasFast: false },
    ]
  }
]

// Lista plana para selectores simples
const RETELL_MODELS_FLAT = RETELL_MODEL_CATEGORIES.flatMap(cat => cat.models.map(m => ({
  value: m.id,
  label: `${m.label}${m.suggested ? ' (Sugerido)' : ''}${m.hasFast ? ' →' : ''}`,
  hasFast: m.hasFast
})))

const RETELL_LANGUAGES = [
  { value: 'multi', label: 'Multilingüe (Auto-detección)' },
  { value: 'es-ES', label: 'Español (España)' },
  { value: 'es-MX', label: 'Español (México)' },
  { value: 'en-US', label: 'Inglés (EE.UU.)' },
  { value: 'en-GB', label: 'Inglés (Reino Unido)' },
  { value: 'pt-BR', label: 'Portugués (Brasil)' },
  { value: 'fr-FR', label: 'Francés' },
  { value: 'de-DE', label: 'Alemán' },
  { value: 'it-IT', label: 'Italiano' },
]

const AMBIENT_SOUNDS = [
  { value: 'none', label: 'Silencio total' },
  { value: 'coffee-shop', label: 'Cafetería (Gente hablando)' },
  { value: 'convention-hall', label: 'Sala de Convenciones (Eco)' },
  { value: 'summer-outdoor', label: 'Exterior Verano (Cigarras)' },
  { value: 'mountain-outdoor', label: 'Exterior Montaña (Pájaros)' },
  { value: 'static-noise', label: 'Ruido Estático (Constante)' },
  { value: 'call-center', label: 'Call Center (Oficina)' },
]

const SPANISH_VOICES = [
  { value: '11labs-Adrian', label: 'Adrian (México, ElevenLabs)' },
  { value: '11labs-Santiago', label: 'Santiago (España, ElevenLabs)' },
  { value: 'openai-Alloy', label: 'Alloy (Neutral, OpenAI)' },
  { value: 'openai-Shimmer', label: 'Shimmer (Femenina, OpenAI)' },
]

const TIMEZONES = [
  { value: 'Europe/Madrid', label: 'España (Madrid)' },
  { value: 'Europe/London', label: 'Reino Unido (Londres)' },
  { value: 'America/New_York', label: 'EE.UU. Este (New York)' },
  { value: 'America/Chicago', label: 'EE.UU. Central (Chicago)' },
  { value: 'America/Los_Angeles', label: 'EE.UU. Oeste (Los Angeles)' },
  { value: 'America/Mexico_City', label: 'México (CDMX)' },
  { value: 'America/Bogota', label: 'Colombia (Bogotá)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires)' },
  { value: 'Europe/Paris', label: 'Francia (París)' },
  { value: 'Europe/Berlin', label: 'Alemania (Berlín)' },
]

function AgentConfigPanel({ 
  assistant, 
  configForm, 
  onChange, 
  onSave, 
  onRefresh,
  availableVoices = [],
  saving 
}: { 
  assistant: AssistantWithConfig; 
  configForm: AssistantWithConfig['config']; 
  onChange: React.Dispatch<React.SetStateAction<AssistantWithConfig['config']>>; 
  onSave: () => Promise<void>; 
  onRefresh: () => Promise<void>;
  availableVoices?: any[];
  saving: boolean 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const spanishVoices = useMemo(() => {
    if (availableVoices.length === 0) return SPANISH_VOICES;
    return availableVoices
      .filter(v => v.accent?.toLowerCase().includes('spanish'))
      .map(v => ({
        value: v.voice_id,
        label: `${v.voice_name} (${v.provider}${v.accent ? `, ${v.accent}` : ''})`
      }));
  }, [availableVoices]);

  const otherVoices = useMemo(() => {
    if (availableVoices.length === 0) return [];
    return availableVoices
      .filter(v => !v.accent?.toLowerCase().includes('spanish'))
      .map(v => ({
        value: v.voice_id,
        label: `${v.voice_name} (${v.provider}${v.accent ? `, ${v.accent}` : ''})`
      }));
  }, [availableVoices]);

  const allVoicesFlat = useMemo(() => {
    return [...spanishVoices, ...otherVoices];
  }, [spanishVoices, otherVoices]);

  return (
    <section className="panel panel-strong p-8 bg-white border border-[var(--line)] shadow-sm">
      <div className="flex items-start justify-between mb-10 pb-6 border-b border-[var(--line)]">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--deep)]">Personalizacion del Agente</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Ajusta la identidad, voz e inteligencia de tu asistente de Brhium.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="rounded-full bg-[#eef6f5] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--teal)] border border-[var(--teal)]/10">{assistant.status}</div>
           <p className="text-[10px] text-[var(--muted)] font-medium italic">Ultima sincronizacion: {new Date(configForm.updatedAt).toLocaleDateString()}</p>
           <button 
             onClick={onRefresh} 
             disabled={saving}
             className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--teal)] hover:text-[var(--deep)] transition-colors disabled:opacity-50"
           >
             <LoaderCircle className={`h-3 w-3 ${saving ? 'animate-spin' : ''}`} />
             Sincronizar desde Servidor
           </button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Seccion 1: Identidad y Modelo */}
        <div className="space-y-6">
          <SectionTitle icon={Bot} title="Identidad e Inteligencia" />
          <div className="grid gap-6 sm:grid-cols-3">
            <ConfigField label="Nombre del Agente" value={configForm.agentName} onChange={(val) => onChange(prev => ({ ...prev, agentName: val }))} />
            <ConfigSelect 
              label="Zona Horaria" 
              value={configForm.timezone ?? 'Europe/Madrid'} 
              options={TIMEZONES} 
              onChange={(val: any) => onChange(prev => ({ ...prev, timezone: val }))} 
            />
            <ConfigSelect 
              label="Idioma Principal" 
              value={configForm.language} 
              options={RETELL_LANGUAGES} 
              onChange={(val: any) => onChange(prev => ({ ...prev, language: val }))} 
            />
          </div>
          <div className="space-y-4">
            <ConfigSelect 
              label="Modelo de Inteligencia (LLM)" 
              value={configForm.model} 
              options={RETELL_MODELS_FLAT} 
              onChange={(val) => {
                const modelInfo = RETELL_MODELS_FLAT.find(m => m.value === val);
                onChange(prev => ({ 
                  ...prev, 
                  model: val,
                  modelTier: modelInfo?.hasFast ? prev.modelTier : 'default' 
                }))
              }} 
            />
            {RETELL_MODELS_FLAT.find(m => m.value === configForm.model)?.hasFast && (
              <div className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--line)] bg-[#f9f9f7] animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Modo de Rendimiento</span>
                  {!configForm.hidePrices && (
                    <span className="text-[9px] font-medium text-[var(--teal)] px-1.5 py-0.5 bg-[var(--teal)]/5 rounded border border-[var(--teal)]/10">
                      {configForm.modelTier === 'fast' ? '+50% Costo' : 'Precio base'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {[
                    { id: 'default', label: 'Standard', icon: '⚖️' },
                    { id: 'fast', label: 'Fast Tier', icon: '🚀' }
                  ].map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => onChange(prev => ({ ...prev, modelTier: tier.id as any }))}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-2 ${
                        (configForm.modelTier || 'default') === tier.id 
                          ? 'bg-[var(--teal)] text-white border-[var(--teal)] shadow-sm' 
                          : 'bg-white text-[var(--muted)] border-[var(--line)] hover:border-[var(--teal)]/30'
                      }`}
                    >
                      <span>{tier.icon}</span>
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-1">
            <ConfigSlider 
              label="Creatividad (Model Temp)" 
              value={configForm.modelTemperature ?? 0.7} 
              min={0} max={1} step={0.1}
              onChange={(val) => onChange(prev => ({ ...prev, modelTemperature: val }))} 
            />
          </div>
          <ConfigField 
            label="Mensaje de Bienvenida (Greeting)" 
            value={configForm.beginMessage ?? ''} 
            onChange={(val) => onChange(prev => ({ ...prev, beginMessage: val }))} 
            placeholder="Hola, soy Alba..."
          />
          <ConfigField 
            label="Instrucciones Maestras (System Prompt)" 
            value={configForm.systemPrompt} 
            onChange={(val) => onChange(prev => ({ ...prev, systemPrompt: val }))} 
            multiline 
          />
        </div>

        <div className="flex justify-center py-4 border-y border-[var(--line)]/30 bg-[#f9f9f7]/50 rounded-xl">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-[var(--line)] shadow-sm text-xs font-bold text-[var(--deep)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-all active:scale-95"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ocultar Ajustes Avanzados
              </>
            ) : (
              <>
                <Settings2 className="h-4 w-4" />
                Mostrar Ajustes Avanzados
              </>
            )}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Seccion 2: Voz y Audio */}
        <div className="space-y-6">
          <SectionTitle icon={PhoneCall} title="Voz y Ambiente" />
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigSelect 
              label="Voz del Agente" 
              value={configForm.voiceId} 
              options={allVoicesFlat} 
              onChange={(val) => onChange(prev => ({ ...prev, voiceId: val }))} 
            />
            <div className="grid grid-cols-2 gap-4">
              <ConfigSelect 
                label="Sonido Ambiental" 
                value={configForm.ambientSound ?? 'none'} 
                options={AMBIENT_SOUNDS} 
                onChange={(val) => onChange(prev => ({ ...prev, ambientSound: val }))} 
              />
              <ConfigSlider 
                label="Volumen Ambiente" 
                value={configForm.ambientSoundVolume ?? 1.0} 
                min={0} max={2} step={0.1}
                onChange={(val) => onChange(prev => ({ ...prev, ambientSoundVolume: val }))} 
              />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <ConfigSlider label="Velocidad" value={configForm.voiceSpeed} min={0.5} max={2} step={0.1} onChange={(val) => onChange(prev => ({ ...prev, voiceSpeed: val }))} />
            <ConfigSlider label="Estabilidad" value={configForm.voiceTemperature ?? 1.0} min={0} max={1} step={0.1} onChange={(val) => onChange(prev => ({ ...prev, voiceTemperature: val }))} />
            <ConfigField label="Emoción" value={configForm.voiceEmotion ?? 'neutral'} onChange={(val) => onChange(prev => ({ ...prev, voiceEmotion: val }))} />
          </div>
        </div>

        {/* Seccion 3: Comportamiento y Latencia */}
        <div className="space-y-6">
          <SectionTitle icon={Workflow} title="Comportamiento de la Llamada" />
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigSelect 
              label="¿Quién inicia la conversación?" 
              value={configForm.startSpeaker ?? 'agent'} 
              options={[
                { value: 'agent', label: 'El Agente (Recomendado)' },
                { value: 'user', label: 'El Usuario (Espera silencio)' }
              ]} 
              onChange={(val: any) => onChange(prev => ({ ...prev, startSpeaker: val }))} 
            />
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Backchannel (Asentimiento)</span>
                <p className="text-[10px] text-[var(--muted)]">El agente dice "uh-huh" o "entiendo" mientras el usuario habla.</p>
              </div>
              <ConfigSwitch 
                checked={!!configForm.enableBackchannel} 
                onChange={(val) => onChange(prev => ({ ...prev, enableBackchannel: val }))} 
              />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigSlider label="Sensibilidad a Interrupciones" value={configForm.interruptionSensitivity} min={0} max={1} step={0.1} onChange={(val) => onChange(prev => ({ ...prev, interruptionSensitivity: val }))} />
            <div className="space-y-3">
              <ConfigSlider label="Responsividad (Latencia)" value={configForm.responsiveness} min={0} max={1} step={0.1} onChange={(val) => onChange(prev => ({ ...prev, responsiveness: val }))} />
              <div className="flex items-center gap-3 px-1">
                <input 
                  type="checkbox" 
                  checked={!!configForm.enableDynamicResponsiveness}
                  onChange={(e) => onChange(prev => ({ ...prev, enableDynamicResponsiveness: e.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--line)] text-[var(--teal)] focus:ring-[var(--teal)]/20 accent-[var(--teal)]"
                />
                <span className="text-[11px] text-[var(--muted)] font-medium">Ajustar dinámicamente según la entrada del usuario</span>
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigSlider 
              label="Retraso de fin de habla (ms)" 
              value={configForm.minEndpointingDelayMs ?? 500} 
              min={200} max={2000} step={50}
              onChange={(val) => onChange(prev => ({ ...prev, minEndpointingDelayMs: val }))} 
            />
            <ConfigSlider label="Volumen General" value={configForm.volume ?? 1} min={0} max={2} step={0.1} onChange={(val) => onChange(prev => ({ ...prev, volume: val }))} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Mensaje de Recordatorio</span>
            <p className="text-[10px] text-[var(--muted)] mb-2">Controla cada cuánto el agente envía un recordatorio si el usuario no responde.</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={Math.round((configForm.reminderTriggerMs ?? 10000) / 1000)} 
                  onChange={(e) => onChange(prev => ({ ...prev, reminderTriggerMs: Number(e.target.value) * 1000 }))}
                  className="h-10 w-20 rounded-lg border border-[var(--line)] bg-[#f9f9f7] px-3 text-sm font-bold text-center outline-none focus:border-[var(--teal)]"
                  min={1} max={60}
                />
                <span className="text-xs text-[var(--muted)] font-medium">seg.</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={configForm.reminderMaxCount ?? 1} 
                  onChange={(e) => onChange(prev => ({ ...prev, reminderMaxCount: Number(e.target.value) }))}
                  className="h-10 w-16 rounded-lg border border-[var(--line)] bg-[#f9f9f7] px-3 text-sm font-bold text-center outline-none focus:border-[var(--teal)]"
                  min={0} max={10}
                />
                <span className="text-xs text-[var(--muted)] font-medium">veces</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seccion 4: Ajustes de Llamada */}
        <div className="space-y-6">
          <SectionTitle icon={Headphones} title="Ajustes de Llamada" />
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigSlider 
              label="Silencio para Colgar (min)" 
              value={Math.round((configForm.endCallAfterSilenceMs ?? 62000) / 60000 * 10) / 10} 
              min={0.5} max={5} step={0.1}
              onChange={(val) => onChange(prev => ({ ...prev, endCallAfterSilenceMs: Math.round(val * 60000) }))} 
            />
            <ConfigSlider 
              label="Duración Máxima (min)" 
              value={Math.round((configForm.maxCallDurationMs ?? 600000) / 60000 * 10) / 10} 
              min={1} max={60} step={0.5}
              onChange={(val) => onChange(prev => ({ ...prev, maxCallDurationMs: Math.round(val * 60000) }))} 
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigSelect 
              label="Detección de Buzón" 
              value={configForm.voicemailDetection ?? 'disabled'} 
              options={[
                { value: 'disabled', label: 'Desactivado' },
                { value: 'hangup', label: 'Colgar al detectar' },
                { value: 'leave_message', label: 'Dejar mensaje' }
              ]} 
              onChange={(val: any) => onChange(prev => ({ ...prev, voicemailDetection: val }))} 
            />
            <ConfigSlider 
              label="Ring Duration (seg)" 
              value={Math.round((configForm.ringDurationMs ?? 30000) / 1000)} 
              min={5} max={120} step={5}
              onChange={(val) => onChange(prev => ({ ...prev, ringDurationMs: val * 1000 }))} 
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">IVR Hangup</span>
                <p className="text-[10px] text-[var(--muted)]">Colgar si detecta IVR.</p>
              </div>
              <ConfigSwitch 
                checked={configForm.ivrHangup ?? true} 
                onChange={(val) => onChange(prev => ({ ...prev, ivrHangup: val }))} 
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Teclado (DTMF)</span>
                <p className="text-[10px] text-[var(--muted)]">Entrada por teclado.</p>
              </div>
              <ConfigSwitch 
                checked={configForm.allowUserDtmf ?? true} 
                onChange={(val) => onChange(prev => ({ ...prev, allowUserDtmf: val }))} 
              />
            </div>
          </div>
        </div>

        {/* Seccion 5: Transcripción */}
        <div className="space-y-6">
          <SectionTitle icon={Mic} title="Transcripción en Tiempo Real" />
          <div className="grid gap-6 sm:grid-cols-2">
            <ConfigSelect 
              label="Reducción de Ruido"
              value={configForm.denoisingMode ?? 'noise-cancellation'}
              options={[
                { value: 'noise-cancellation', label: 'Eliminar ruido' },
                { value: 'noise-and-background-speech-cancellation', label: 'Eliminar ruido + habla de fondo' },
                { value: 'no-denoise', label: 'Sin reducción' },
              ]}
              onChange={(val: any) => onChange(prev => ({ ...prev, denoisingMode: val }))}
            />
            <ConfigSelect 
              label="Modo de Transcripción"
              value={configForm.transcriptionMode ?? 'speed'}
              options={[
                { value: 'speed', label: 'Optimizar velocidad' },
                { value: 'accuracy', label: 'Optimizar precisión' },
                { value: 'custom', label: 'Personalizado' },
              ]}
              onChange={(val: any) => onChange(prev => ({ ...prev, transcriptionMode: val }))}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Palabras Clave Potenciadas</span>
              <p className="text-[10px] text-[var(--muted)]">Amplía el vocabulario del modelo. Separa con comas.</p>
              <input 
                value={(configForm.boostedKeywords ?? []).join(', ')} 
                onChange={(e) => onChange(prev => ({ ...prev, boostedKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
                placeholder="Ej: Brhium, nutracéutico, Fluocol"
                className="h-12 w-full rounded-xl border border-[var(--line)] bg-[#f9f9f7] px-4 text-sm outline-none focus:border-[var(--teal)] focus:bg-white focus:ring-4 focus:ring-[var(--teal)]/5 transition placeholder:opacity-30"
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7] self-end">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Boost SEP Model</span>
                <p className="text-[10px] text-[var(--muted)]">Mejora la detección de fin de turno.</p>
              </div>
              <ConfigSwitch 
                checked={!!configForm.boostSepModel} 
                onChange={(val) => onChange(prev => ({ ...prev, boostSepModel: val }))} 
              />
            </div>
          </div>
        </div>

        {/* Seccion 6: Pronunciación */}
        <div className="space-y-6">
          <SectionTitle icon={Volume2} title="Diccionario de Pronunciación" />
          <div className="space-y-3">
            {(configForm.pronunciationDictionary ?? []).map((entry, idx) => (
              <div key={`pron-${idx}`} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--teal)]/10 text-[var(--teal)] text-xs font-bold shrink-0">🔊</div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input 
                    value={entry.word}
                    onChange={(e) => {
                      const d = [...(configForm.pronunciationDictionary ?? [])];
                      d[idx] = { ...d[idx], word: e.target.value };
                      onChange(prev => ({ ...prev, pronunciationDictionary: d }));
                    }}
                    placeholder="Palabra"
                    className="h-9 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold outline-none focus:border-[var(--teal)]"
                  />
                  <input 
                    value={entry.phoneme}
                    onChange={(e) => {
                      const d = [...(configForm.pronunciationDictionary ?? [])];
                      d[idx] = { ...d[idx], phoneme: e.target.value };
                      onChange(prev => ({ ...prev, pronunciationDictionary: d }));
                    }}
                    placeholder="Fonema (IPA)"
                    className="h-9 rounded-lg border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--teal)]"
                  />
                </div>
                <button 
                  onClick={() => {
                    const d = (configForm.pronunciationDictionary ?? []).filter((_, i) => i !== idx);
                    onChange(prev => ({ ...prev, pronunciationDictionary: d }));
                  }}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => onChange(prev => ({ ...prev, pronunciationDictionary: [...(prev.pronunciationDictionary ?? []), { word: '', alphabet: 'ipa' as const, phoneme: '' }] }))}
              className="flex items-center gap-2 text-xs font-bold text-[var(--teal)] hover:text-[var(--deep)] transition px-3 py-2 rounded-lg border border-dashed border-[var(--teal)]/30 hover:border-[var(--teal)]/60"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir pronunciación
            </button>
          </div>
        </div>

        {/* Seccion 7: Funciones y Knowledge Base */}
        <div className="space-y-6">
          <SectionTitle icon={BookOpen} title="Funciones y Base de Conocimiento" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Funciones Activas</span>
              <p className="text-[10px] text-[var(--muted)]">Gestiona en el panel de control.</p>
              {(configForm.generalTools ?? []).length > 0 ? (configForm.generalTools ?? []).map((tool, idx) => (
                <div key={`tool-${idx}`} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <Wrench className="h-4 w-4 text-[var(--teal)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--deep)]">{tool.name}</p>
                    <p className="text-[10px] text-[var(--muted)] truncate">{tool.description}</p>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--teal)]/10 text-[var(--teal)] shrink-0">{tool.type}</span>
                </div>
              )) : (
                <p className="text-xs text-[var(--muted)] italic p-3">Pulsa &quot;Sincronizar&quot; para actualizar.</p>
              )}
            </div>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Knowledge Base</span>
              <p className="text-[10px] text-[var(--muted)]">Gestiona en el panel de control.</p>
              {(configForm.knowledgeBaseIds ?? []).length > 0 ? (configForm.knowledgeBaseIds ?? []).map((kbId, idx) => (
                <div key={`kb-${idx}`} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <BookOpen className="h-4 w-4 text-[var(--teal)] shrink-0" />
                  <p className="text-sm font-bold text-[var(--deep)] truncate flex-1">{kbId}</p>
                </div>
              )) : (
                <p className="text-xs text-[var(--muted)] italic p-3">Pulsa &quot;Cargar desde Retell&quot; para sincronizar.</p>
              )}
              {(configForm.kbTopK || configForm.kbFilterScore) && (
                <div className="flex gap-4 p-3 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--muted)] uppercase font-bold">Top-K</p>
                    <p className="text-lg font-bold text-[var(--deep)]">{configForm.kbTopK ?? '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--muted)] uppercase font-bold">Score mín.</p>
                    <p className="text-lg font-bold text-[var(--deep)]">{configForm.kbFilterScore ?? '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Seccion 8: Agent Handbook */}
        <div className="space-y-6">
          <SectionTitle icon={BookOpen} title="Agent Handbook (Avanzado)" />
          
          {/* Subsección: Personality & Tone */}
          <div className="space-y-4">
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[var(--teal)] flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[var(--teal)]"></span>
              Personalidad y Tono
            </h5>
            <div className="grid gap-6 sm:grid-cols-2">
              <ConfigField 
                label="Personalidad por Defecto" 
                value={configForm.handbookDefaultPersonality ?? ''} 
                onChange={(val) => onChange(prev => ({ ...prev, handbookDefaultPersonality: val }))} 
                placeholder="Ej: Eres un asistente amable y profesional..."
                multiline
              />
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Palabras de Relleno (Filler Words)</span>
                    <p className="text-[10px] text-[var(--muted)]">Usa "uhm", "ah" para sonar más humano.</p>
                  </div>
                  <ConfigSwitch 
                    checked={!!configForm.handbookFillerWords} 
                    onChange={(val) => onChange(prev => ({ ...prev, handbookFillerWords: val }))} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Alta Empatía</span>
                    <p className="text-[10px] text-[var(--muted)]">Muestra más comprensión y validación.</p>
                  </div>
                  <ConfigSwitch 
                    checked={!!configForm.handbookHighEmpathy} 
                    onChange={(val) => onChange(prev => ({ ...prev, handbookHighEmpathy: val }))} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subsección: Accuracy & Format */}
          <div className="space-y-4 pt-4">
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[var(--teal)] flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[var(--teal)]"></span>
              Precisión y Formato
            </h5>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Verificación de Eco</span>
                    <p className="text-[10px] text-[var(--muted)]">Evita repetir lo que el usuario acaba de decir.</p>
                  </div>
                  <ConfigSwitch 
                    checked={!!configForm.handbookEchoVerification} 
                    onChange={(val) => onChange(prev => ({ ...prev, handbookEchoVerification: val }))} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Alfabeto NATO</span>
                    <p className="text-[10px] text-[var(--muted)]">Usa "Alfa", "Bravo" para deletrear.</p>
                  </div>
                  <ConfigSwitch 
                    checked={!!configForm.handbookNatoAlphabet} 
                    onChange={(val) => onChange(prev => ({ ...prev, handbookNatoAlphabet: val }))} 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Normalización de Habla</span>
                    <p className="text-[10px] text-[var(--muted)]">Corrige gramática y fluidez del usuario.</p>
                  </div>
                  <ConfigSwitch 
                    checked={!!configForm.handbookSpeechNormalization} 
                    onChange={(val) => onChange(prev => ({ ...prev, handbookSpeechNormalization: val }))} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Smart Matching</span>
                    <p className="text-[10px] text-[var(--muted)]">Mejora la coincidencia de entidades.</p>
                  </div>
                  <ConfigSwitch 
                    checked={!!configForm.handbookSmartMatching} 
                    onChange={(val) => onChange(prev => ({ ...prev, handbookSmartMatching: val }))} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subsección: Trust & Safety */}
          <div className="space-y-4 pt-4">
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-[var(--teal)] flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[var(--teal)]"></span>
              Confianza y Seguridad
            </h5>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Revelar que es IA</span>
                  <p className="text-[10px] text-[var(--muted)]">Informa al usuario que habla con una IA.</p>
                </div>
                <ConfigSwitch 
                  checked={!!configForm.handbookAiDisclosure} 
                  onChange={(val) => onChange(prev => ({ ...prev, handbookAiDisclosure: val }))} 
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-[#f9f9f7]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">No guardar datos sensibles</span>
                  <p className="text-[10px] text-[var(--muted)]">Privacidad de datos (Opt-out sensitive data).</p>
                </div>
                <ConfigSwitch 
                  checked={!!configForm.optOutSensitiveDataStorage} 
                  onChange={(val) => onChange(prev => ({ ...prev, optOutSensitiveDataStorage: val }))} 
                />
              </div>
            </div>
            <ConfigField 
              label="Límites de Alcance (Scope)" 
              value={configForm.handbookScopeBoundaries ?? ''} 
              onChange={(val) => onChange(prev => ({ ...prev, handbookScopeBoundaries: val }))} 
              placeholder="Ej: No respondas preguntas sobre política..."
            />
          </div>
        </div>
      </div>
      )}
      </div>

      <button onClick={onSave} disabled={saving} className="mt-12 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[var(--deep)] text-white font-bold transition hover:bg-[#10271f] disabled:opacity-50 shadow-lg shadow-[var(--deep)]/10 active:scale-[0.99]">
        {saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <BadgeCheck className="h-5 w-5" />}
        Guardar y Sincronizar
      </button>
    </section>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-[var(--line)]/50">
      <div className="p-1.5 rounded-lg bg-[var(--teal)]/5 text-[var(--teal)]">
        <Icon className="h-4 w-4" />
      </div>
      <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--deep)]">{title}</h4>
    </div>
  )
}

function ConfigField({ label, value, onChange, multiline, disabled, placeholder }: { label: string; value: string; onChange: (val: string) => void; multiline?: boolean; disabled?: boolean; placeholder?: string }) {
  return (
    <label className="space-y-2 block">
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} className="min-h-[160px] w-full rounded-xl border border-[var(--line)] bg-[#f9f9f7] px-4 py-3 text-sm outline-none focus:border-[var(--teal)] focus:bg-white focus:ring-4 focus:ring-[var(--teal)]/5 transition placeholder:opacity-30" />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} className="h-12 w-full rounded-xl border border-[var(--line)] bg-[#f9f9f7] px-4 text-sm outline-none focus:border-[var(--teal)] focus:bg-white focus:ring-4 focus:ring-[var(--teal)]/5 transition placeholder:opacity-30" />
      )}
    </label>
  )
}

function ConfigSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (val: string) => void }) {
  return (
    <label className="space-y-2 block">
      <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="h-12 w-full rounded-xl border border-[var(--line)] bg-[#f9f9f7] px-4 text-sm font-bold outline-none focus:border-[var(--teal)] focus:bg-white focus:ring-4 focus:ring-[var(--teal)]/5 transition">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </label>
  )
}

function ConfigSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <label className="relative flex items-center justify-center cursor-pointer">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        className="peer h-6 w-11 cursor-pointer appearance-none rounded-full border-2 border-[var(--line)] bg-gray-100 transition-all checked:border-[var(--teal)] checked:bg-[var(--teal)] focus:outline-none"
      />
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
    </label>
  )
}

function PhoneNumberRow({ number, assistants, updating, onToggle, onAssign }: { number: PhoneNumber; assistants: AssistantWithConfig[]; updating: boolean; onToggle: () => Promise<void>; onAssign: (id: string) => Promise<void> }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--line)] bg-[#fcfcf9]/50 transition hover:bg-white">
      <div className="space-y-1">
        <p className="text-sm font-bold text-[var(--deep)]">{number.label}</p>
        <p className="text-xs text-[var(--muted)]">{number.e164} · deriva a {number.forwardTo}</p>
      </div>
      <div className="flex items-center gap-3">
        <select value={number.assistantId} onChange={e => onAssign(e.target.value)} disabled={updating} className="h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-xs font-bold outline-none">{assistants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <button onClick={onToggle} disabled={updating} className={`flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-lg text-xs font-bold transition ${number.isActive ? 'bg-[#143127] text-white' : 'bg-white border border-[var(--line)] text-[var(--deep)]'}`}>
          {updating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : number.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {number.isActive ? 'ACTIVO' : 'PAUSADO'}
        </button>
      </div>
    </div>
  )
}
function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-[var(--ok)] flex-shrink-0" />
          ) : t.kind === 'error' ? (
            <XCircle className="h-5 w-5 text-[#c0392b] flex-shrink-0" />
          ) : (
            <Info className="h-5 w-5 text-[var(--teal)] flex-shrink-0" />
          )}
          <p className="leading-snug text-[var(--deep)] font-medium">{t.text}</p>
        </div>
      ))}
    </div>
  )
}

function AgentLiveStatus({
  assistantName,
  status,
  retellConnected,
  callsToday,
  lastCallAt,
}: {
  assistantName: string
  status: 'active' | 'inactive'
  retellConnected: boolean
  callsToday: number
  lastCallAt?: string
}) {
  const live = status === 'active' && retellConnected
  const lastCallLabel = useMemo(() => {
    if (!lastCallAt) return null
    const diffMin = Math.round((Date.now() - new Date(lastCallAt).getTime()) / 60000)
    if (diffMin < 1) return 'ahora mismo'
    if (diffMin < 60) return `hace ${diffMin} min`
    const hours = Math.floor(diffMin / 60)
    if (hours < 24) return `hace ${hours} h`
    return `hace ${Math.floor(hours / 24)} d`
  }, [lastCallAt])

  return (
    <div className="mb-6 rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[#f6faf9] to-[#fcfcf9] p-4">
      <div className="flex items-center gap-2.5">
        {live ? (
          <span className="live-dot" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-[var(--warn)]" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          {live ? 'En directo' : 'Pausado'}
        </span>
        {live && (
          <span className="audio-wave ml-auto text-[var(--teal)]">
            <span /><span /><span /><span /><span />
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-bold text-[var(--deep)] truncate">{assistantName}</p>
      <p className="mt-0.5 text-[11px] text-[var(--muted)] font-medium">
        {callsToday > 0
          ? <>· {callsToday} {callsToday === 1 ? 'llamada' : 'llamadas'} hoy{lastCallLabel ? ` · última ${lastCallLabel}` : ''}</>
          : <>· Sin llamadas hoy todavía</>}
      </p>
    </div>
  )
}

function MetricValue({ raw }: { raw: string }) {
  // Extract numeric prefix; keep suffix (s, %, etc.)
  const match = raw.match(/^(-?\d+)([^\d]*)$/)
  if (!match) {
    return <p className="mt-5 font-display text-4xl text-[var(--deep)] tracking-tight font-bold">{raw}</p>
  }
  const target = parseInt(match[1], 10)
  const suffix = match[2]
  return (
    <p className="mt-5 font-display text-4xl text-[var(--deep)] tracking-tight font-bold tabular-nums">
      <CountingNumber to={target} />
      {suffix}
    </p>
  )
}

function CountingNumber({ to }: { to: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (to === 0) { setVal(0); return }
    const start = performance.now()
    const dur = 900
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{val}</>
}

function ConfigSlider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (val: number) => void }) {
  return (
    <label className="space-y-2 block">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">{label}</span>
        <span className="text-xs font-bold text-[var(--teal)] bg-[var(--teal)]/5 px-2 py-0.5 rounded">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-[var(--line)] rounded-lg appearance-none cursor-pointer accent-[var(--teal)]"
      />
    </label>
  )
}

const WEBHOOK_EVENT_OPTIONS: Array<'call_started' | 'call_ended' | 'call_analyzed'> = [
  'call_started',
  'call_ended',
  'call_analyzed',
]

function WebhookSection({
  configForm,
  onPatch,
}: {
  configForm: AssistantConfig
  onPatch: (patch: Partial<AssistantConfig>) => Promise<void>
}) {
  const [url, setUrl] = useState(configForm.webhookUrl ?? '')
  const events = configForm.webhookEvents ?? []
  const [saving, setSaving] = useState(false)

  return (
    <section className="panel panel-strong p-8 bg-white shadow-sm border border-[var(--line)]">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--line)]">
        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--teal)]/10 text-[var(--teal)]">
          <Workflow className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-[var(--deep)]">Webhooks</h3>
          <p className="text-sm text-[var(--muted)]">Recibe eventos en tu CRM o n8n cuando empieza, acaba o se analiza una llamada.</p>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">URL del webhook</span>
          <input
            type="url"
            placeholder="https://tu-crm.com/webhook/brhium"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#fcfcf9] px-4 py-2.5 text-sm outline-none focus:border-[var(--teal)] focus:bg-white"
          />
        </label>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Eventos a enviar</p>
          <div className="flex flex-wrap gap-2">
            {WEBHOOK_EVENT_OPTIONS.map((evt) => {
              const active = events.includes(evt)
              return (
                <button
                  key={evt}
                  type="button"
                  onClick={async () => {
                    const next = active ? events.filter((e) => e !== evt) : [...events, evt]
                    setSaving(true)
                    try {
                      await onPatch({ webhookEvents: next })
                    } finally {
                      setSaving(false)
                    }
                  }}
                  className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                    active
                      ? 'border-[var(--teal)] bg-[var(--teal)] text-white'
                      : 'border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--teal)]'
                  }`}
                >
                  {evt}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={saving || url === (configForm.webhookUrl ?? '')}
          onClick={async () => {
            setSaving(true)
            try {
              await onPatch({ webhookUrl: url })
            } finally {
              setSaving(false)
            }
          }}
          className="rounded-xl bg-[var(--teal)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--deep)] disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Guardar URL'}
        </button>
      </div>
    </section>
  )
}

function PostCallSection({
  configForm,
  onPatch,
}: {
  configForm: AssistantConfig
  onPatch: (patch: Partial<AssistantConfig>) => Promise<void>
}) {
  return (
    <section className="panel panel-strong p-8 bg-white shadow-sm border border-[var(--line)]">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--line)]">
        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)]">
          <BadgeCheck className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-[var(--deep)]">Análisis y grabación</h3>
          <p className="text-sm text-[var(--muted)]">Activa la transcripción avanzada, sentimiento y grabación de llamadas.</p>
        </div>
      </div>

      <div className="space-y-4">
        <ToggleRow
          label="Grabar llamadas"
          description="Genera una URL firmada para reescuchar cada conversación."
          checked={!!configForm.enableRecording}
          onChange={(val) => onPatch({ enableRecording: val })}
        />
        <ToggleRow
          label="Análisis post-llamada"
          description="Resumen automático, sentimiento y disposición tras cada llamada."
          checked={!!configForm.postCallAnalysisEnabled}
          onChange={(val) => onPatch({ postCallAnalysisEnabled: val })}
        />
      </div>
    </section>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-6 p-5 rounded-2xl border border-[var(--line)] bg-[#fcfcf9]/50">
      <div className="space-y-1">
        <p className="font-bold text-[var(--deep)]">{label}</p>
        <p className="text-sm text-[var(--muted)] max-w-md leading-relaxed">{description}</p>
      </div>
      <label className="relative flex items-center justify-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer h-7 w-12 cursor-pointer appearance-none rounded-full border-2 border-[var(--line)] bg-gray-100 transition-all checked:border-[var(--teal)] checked:bg-[var(--teal)] focus:outline-none"
        />
        <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  )
}

