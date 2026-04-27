'use client'

import { useCallback, useEffect, useRef, useState, startTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { RetellWebClient } from 'retell-client-js-sdk'

const SLIDE_LABELS = [
  '01 Cover',
  '02 Qué es un agente de voz con IA',
  '03 Cómo funciona',
  '04 Casos de uso para BRHIUM',
  '05 Demo en vivo',
  '06 Preguntas para definir vuestro agente',
  '07 Próximos pasos',
]

export function PresentationDeck() {
  const [index, setIndex] = useState(0)

  const go = useCallback((delta: number) => {
    setIndex((p) => Math.min(SLIDE_LABELS.length - 1, Math.max(0, p + delta)))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); go(1) }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1) }
      else if (e.key === 'Home') setIndex(0)
      else if (e.key === 'End') setIndex(SLIDE_LABELS.length - 1)
      else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  return (
    <div className="deck-root">
      <div className="deck-viewport">
        <div className="deck-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          <SlideCover />
          <SlideQueEs />
          <SlideComoFunciona />
          <SlideCasos />
          <SlideDemo />
          <SlideDiscovery />
          <SlideSiguientes />
        </div>
      </div>

      {/* Top progress bar */}
      <div className="deck-progress">
        <div
          className="deck-progress-fill"
          style={{ width: `${((index + 1) / SLIDE_LABELS.length) * 100}%` }}
        />
      </div>

      {/* Nav controls */}
      <nav className="deck-nav" aria-label="Navegación">
        <button
          className="deck-arrow"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Anterior"
        >
          ‹
        </button>
        <div className="deck-dots">
          {SLIDE_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setIndex(i)}
              aria-label={label}
              aria-current={i === index}
              className={`deck-dot ${i === index ? 'active' : ''}`}
            />
          ))}
        </div>
        <button
          className="deck-arrow"
          onClick={() => go(1)}
          disabled={index === SLIDE_LABELS.length - 1}
          aria-label="Siguiente"
        >
          ›
        </button>
      </nav>

      <PresentationStyles />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   Slides
   ════════════════════════════════════════════════════════════════ */

function Logo() {
  return (
    <div className="logo">
      <Image src="/presentation/shark-logo.png" alt="Sauteri" width={34} height={34} />
      <span>Sauteri</span>
    </div>
  )
}

function SlideCover() {
  return (
    <section id="s1" className="slide" data-label="01 Cover">
      <div className="glow g1" />
      <div className="glow g2" />
      <Logo />
      <div className="presented">
        Propuesta para <strong>BRHIUM</strong>
      </div>
      <h1>
        Agentes de
        <br />
        <em>voz con IA.</em>
      </h1>
      <p className="sub">
        Qué son, qué pueden hacer por vuestro negocio, y cómo los construimos juntos.
      </p>
      <div className="wave-deco">
        <Waveform />
      </div>
      <div className="bottom-bar" />
    </section>
  )
}

function Waveform() {
  const heights = [35, 65, 50, 90, 70, 100, 75, 55, 85, 60, 40, 80, 50, 70]
  return (
    <div className="waveform">
      {heights.map((h, i) => (
        <div
          key={i}
          className="b"
          style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

function PulseMic() {
  return (
    <div className="pulse">
      <div className="ring" />
      <div className="ring" />
      <div className="ring" />
      <div className="dot">
        <MicSvg size={24} stroke="2.2" />
      </div>
    </div>
  )
}

function MicSvg({ size = 60, stroke = '1.6' }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={stroke} strokeLinecap="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

function SlideQueEs() {
  return (
    <section id="s2" className="slide" data-label="02 Qué es un agente de voz con IA">
      <Logo />
      <div className="glow g1" />
      <div className="left">
        <div className="divider" />
        <h2>
          No es un menú de
          <br />
          opciones. Es una
          <br />
          <em>conversación real.</em>
        </h2>
        <p>
          El cliente llama, habla con normalidad y el agente entiende, responde y actúa.
          Sin esperas, sin opciones de teclado, sin frustración.
        </p>
        <div className="vs">
          <div className="vs-card">
            <div className="vs-label old">IVR tradicional</div>
            <div className="vs-text">
              "Pulse 1 para facturación,
              <br />
              pulse 2 para soporte…"
            </div>
          </div>
          <div className="vs-card vivid">
            <div className="vs-label new">Agente de voz IA</div>
            <div className="vs-text">
              "Hola, llamo porque mi pedido llegó incompleto…"
              <br />
              <span style={{ color: 'var(--pres-red)' }}>"Entendido, lo soluciono ahora mismo."</span>
            </div>
          </div>
        </div>
      </div>
      <div className="right">
        <PulseMic />
      </div>
    </section>
  )
}

function SlideComoFunciona() {
  const steps = [
    { n: '01', t: 'El cliente llama', d: 'Respuesta inmediata, sin tiempo de espera.', ms: '0 ms' },
    { n: '02', t: 'Reconocimiento de voz', d: 'Transcripción en tiempo real con +97% de precisión.', ms: '< 200ms' },
    { n: '03', t: 'IA entiende la intención', d: 'El modelo procesa contexto, tono y objetivo de la llamada.', ms: '< 350ms', highlight: true },
    { n: '04', t: 'Genera respuesta', d: 'Natural, coherente, con el tono exacto de tu marca.', ms: '< 500ms' },
    { n: '05', t: 'Actúa o deriva', d: 'Agenda, actualiza CRM, o transfiere a humano si es necesario.', ms: 'Instantáneo' },
  ]
  return (
    <section id="s3" className="slide" data-label="03 Cómo funciona">
      <Logo />
      <div className="divider" />
      <h2>
        Anatomía de una <em>llamada inteligente.</em>
      </h2>
      <div className="flow">
        {steps.map((s, i) => (
          <div key={s.n} className={`fstep ${s.highlight ? 'highlight' : ''}`}>
            <div className="fn">{s.n}</div>
            <div className="ft">{s.t}</div>
            <div className="fd">{s.d}</div>
            <div className="fms">{s.ms}</div>
            {i < steps.length - 1 && <div className="arr">›</div>}
          </div>
        ))}
      </div>
    </section>
  )
}

function SlideCasos() {
  return (
    <section id="s4" className="slide" data-label="04 Casos de uso para BRHIUM">
      <Logo />
      <div className="divider" />
      <h2>
        Lo que vemos para <em>vuestro negocio.</em>
      </h2>
      <div className="grid brhium-only">
        <div className="case featured">
          <div className="cbrand">BRHIUM</div>
          <div className="ctitle">Atención y seguimiento de pacientes</div>
          <div className="clist">
            <div className="ci">Información sobre productos y dosis fuera de horario</div>
            <div className="ci">Recordatorios de tratamiento y seguimiento de adherencia</div>
            <div className="ci">Derivación a farmacéutico o médico cuando sea necesario</div>
          </div>
        </div>
        <div className="case featured">
          <div className="cbrand">BRHIUM</div>
          <div className="ctitle">Captación y cualificación 24/7</div>
          <div className="clist">
            <div className="ci">Cualificación de leads para nuevos tratamientos</div>
            <div className="ci">Encuestas de satisfacción automatizadas</div>
            <div className="ci">Integración con CRM y sistemas de farmacia</div>
          </div>
        </div>
      </div>
    </section>
  )
}

type DemoMsg = { id: number; cls: 'agent-t' | 'user-t'; text: string }
type MicState = 'idle' | 'listening' | 'speaking'

function SlideDemo() {
  const router = useRouter()
  const [state, setState] = useState<MicState>('idle')
  const [error, setError] = useState<string | null>(null)
  const retellWebClientRef = useRef<RetellWebClient | null>(null)

  useEffect(() => {
    const client = new RetellWebClient()
    retellWebClientRef.current = client

    client.on('call_started', () => {
      setState('listening')
      setError(null)
    })

    client.on('call_ended', () => {
      setState('idle')
      startTransition(() => {
        router.refresh()
      })
    })

    client.on('agent_start_talking', () => {
      setState('speaking')
    })

    client.on('agent_stop_talking', () => {
      setState('listening')
    })

    client.on('error', (err) => {
      console.error('Retell error:', err)
      setState('idle')
      setError('Error de conexión.')
      client.stopCall()
    })

    return () => {
      client.stopCall()
    }
  }, [router])

  const toggleMic = async () => {
    const client = retellWebClientRef.current
    if (!client) return

    if (state !== 'idle') {
      client.stopCall()
      setState('idle')
      return
    }

    try {
      setState('listening') // Feedback inmediato
      setError(null)
      
      const response = await fetch('/api/retell/web-call', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Error de API')

      const data = await response.json()
      if (!data.access_token) throw new Error('Sin token')

      await client.startCall({
        accessToken: data.access_token,
      })
      
    } catch (err) {
      console.error('Call failed:', err)
      setState('idle')
      setError('No se pudo conectar.')
    }
  }

  const status = error || (state === 'listening' ? 'Escuchando…' : state === 'speaking' ? 'Agente respondiendo…' : 'Pulsa para hablar')
  const sceneClass = `mic-scene ${state === 'listening' ? 'listening' : state === 'speaking' ? 'speaking' : ''}`

  return (
    <section id="s5" className="slide" data-label="05 Demo en vivo">
      <Logo />
      <div className="demo-glow" />
      <div className="demo-wrap">
        <div className="demo-left">
          <div className="divider" />
          <h2 className="demo-h2">
            Hablad con
            <br />
            el agente <em>ahora.</em>
          </h2>
          <p className="demo-hint">
            El agente es experto en el catálogo de nutracéuticos de BRHIUM. Preguntadle sobre Micraflora, Relbix, Fluocol, protocolos de uso para profesionales, o puntos de venta.
          </p>
        </div>
        <div className="demo-right">
          <div className={sceneClass}>
            <div className="mic-wave-ring" id="ring1" />
            <div className="mic-wave-ring" id="ring2" />
            <div className="mic-wave-ring" id="ring3" />
            <div className="mic-wave-ring" id="ring4" />
            <button className={`mic-btn ${state !== 'idle' ? 'active' : ''}`} onClick={toggleMic}>
              <MicSvg />
            </button>
            <div className="mic-bars">
              {[
                { d: '0s', h: '30%' },
                { d: '0.07s', h: '65%' },
                { d: '0.14s', h: '45%' },
                { d: '0.21s', h: '90%' },
                { d: '0.28s', h: '55%' },
                { d: '0.35s', h: '100%' },
                { d: '0.42s', h: '70%' },
                { d: '0.49s', h: '40%' },
                { d: '0.56s', h: '80%' },
                { d: '0.63s', h: '50%' },
                { d: '0.7s', h: '75%' },
                { d: '0.77s', h: '35%' },
              ].map((b, i) => (
                <span key={i} className="mb" style={{ ['--d' as any]: b.d, ['--h' as any]: b.h }} />
              ))}
            </div>
          </div>
          <div className={`mic-status ${state !== 'idle' ? 'active' : ''}`}>{status}</div>
        </div>
      </div>
    </section>
  )
}

function SlideDiscovery() {
  const qs = [
    '¿Cuáles son los motivos de contacto más frecuentes de vuestros clientes hoy?',
    '¿Qué pasa cuando un cliente llama fuera de horario o no hay agente disponible?',
    '¿Tenéis CRM, sistema de citas o historial de cliente con el que integrar el agente?',
    '¿Qué tono y nombre de voz encajaría con la marca — BRHIUM?',
    '¿Cuál es el caso de uso que si funcionara bien lo cambiaría todo para vosotros?',
    '¿Tenéis ya guiones de atención al cliente o bases de conocimiento documentadas?',
  ]
  return (
    <section id="s6" className="slide" data-label="06 Preguntas para definir vuestro agente">
      <Logo />
      <div className="divider" />
      <h2>
        Para crear <em>vuestro agente</em> necesitamos entenderos.
      </h2>
      <div className="qs">
        {qs.map((q, i) => (
          <div className="q" key={i}>
            <div className="qn">{i + 1}</div>
            <div className="qt">{q}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SlideSiguientes() {
  return (
    <section id="s7" className="slide" data-label="07 Próximos pasos">
      <div className="glow g1" />
      <div className="eyebrow">Siguiente paso</div>
      <h2>
        En una semana tenéis
        <br />
        un prototipo <em>real</em> para probar.
      </h2>
      <p className="sub">
        Sin compromiso. Con vuestros casos de uso reales, vuestra voz de marca, conectado a vuestros datos.
      </p>
      <div className="steps-row">
        <div className="step">
          <div className="sn">Hoy</div>
          <div className="st">Discovery</div>
          <div className="sd">Respondemos las preguntas juntos</div>
        </div>
        <div className="step highlight">
          <div className="sn">S·1</div>
          <div className="st">Prototipo</div>
          <div className="sd">Agente configurado para vuestro caso</div>
        </div>
        <div className="step">
          <div className="sn">S·2</div>
          <div className="st">Validación</div>
          <div className="sd">Probáis con casos reales y dais feedback</div>
        </div>
        <div className="step">
          <div className="sn">S·4</div>
          <div className="st">Go-live</div>
          <div className="sd">Lanzamiento supervisado en producción</div>
        </div>
      </div>
      <button className="cta">Agendemos el siguiente paso</button>
      <div className="bottom-logo">
        <Image src="/presentation/shark-logo.png" alt="Sauteri" width={36} height={36} />
        <span>Sauteri</span>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════
   Styles (port pixel-perfect from design HTML)
   ════════════════════════════════════════════════════════════════ */

function PresentationStyles() {
  return (
    <style jsx global>{`
      .deck-root {
        --pres-bg: #05050d;
        --pres-surface: #0a0a18;
        --pres-card: #0e0e1e;
        --pres-border: #222240;
        --pres-red: #ff1f5e;
        --pres-red-dim: rgba(255, 31, 94, 0.18);
        --pres-red-glow: rgba(255, 31, 94, 0.4);
        --pres-fg: #f5f0ec;
        --pres-fg2: #9494b8;
        --pres-fg3: #4a4a72;
        --pres-font-d: var(--font-pres-display), 'Cormorant Garamond', Georgia, serif;
        --pres-font-b: var(--font-pres-body), 'DM Sans', system-ui, sans-serif;

        position: fixed;
        inset: 0;
        background: var(--pres-bg);
        color: var(--pres-fg);
        font-family: var(--pres-font-b);
        overflow: hidden;
      }
      .deck-viewport {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }
      .deck-track {
        display: flex;
        height: 100%;
        width: 100%;
        transition: transform 0.85s cubic-bezier(0.65, 0, 0.35, 1);
        will-change: transform;
      }
      .slide {
        position: relative;
        flex: 0 0 100%;
        width: 100%;
        height: 100%;
        background: var(--pres-bg);
        font-family: var(--pres-font-b);
        color: var(--pres-fg);
        overflow: hidden;
      }

      .deck-progress {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: rgba(255, 255, 255, 0.05);
        z-index: 50;
      }
      .deck-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--pres-red), rgba(255, 31, 94, 0.4));
        transition: width 0.7s ease-out;
        box-shadow: 0 0 12px rgba(255, 31, 94, 0.6);
      }

      .deck-nav {
        position: absolute;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 18px;
        background: rgba(10, 10, 24, 0.7);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid var(--pres-border);
        border-radius: 999px;
        padding: 8px 14px;
        z-index: 60;
      }
      .deck-arrow {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: transparent;
        border: 1px solid var(--pres-border);
        color: var(--pres-fg2);
        font-size: 22px;
        cursor: pointer;
        transition: all 0.2s;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .deck-arrow:hover:not(:disabled) {
        border-color: var(--pres-red);
        color: var(--pres-fg);
        background: rgba(255, 31, 94, 0.08);
      }
      .deck-arrow:disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }
      .deck-dots {
        display: flex;
        gap: 8px;
      }
      .deck-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        border: none;
        background: var(--pres-border);
        cursor: pointer;
        padding: 0;
        transition: all 0.3s;
      }
      .deck-dot:hover {
        background: var(--pres-fg3);
      }
      .deck-dot.active {
        width: 28px;
        background: var(--pres-red);
        box-shadow: 0 0 10px rgba(255, 31, 94, 0.6);
      }

      /* ── Common pieces ── */
      .logo {
        position: absolute;
        top: 52px;
        left: 96px;
        display: flex;
        align-items: center;
        gap: 14px;
        z-index: 10;
      }
      .logo img {
        height: 34px !important;
        width: auto !important;
        object-fit: contain;
      }
      .logo span {
        font-size: 26px;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: var(--pres-fg2);
      }
      .divider {
        width: 80px;
        height: 2px;
        background: linear-gradient(90deg, var(--pres-red), rgba(255, 31, 94, 0.2));
        box-shadow: 0 0 14px rgba(255, 31, 94, 0.6);
        margin-bottom: 28px;
      }
      .glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(140px);
        pointer-events: none;
      }

      @keyframes waveBar {
        0%, 100% { transform: scaleY(0.2); }
        50% { transform: scaleY(1); }
      }
      .waveform {
        display: flex;
        align-items: center;
        gap: 7px;
        height: 80px;
      }
      .waveform .b {
        width: 6px;
        background: var(--pres-red);
        border-radius: 3px;
        animation: waveBar 1.3s ease-in-out infinite;
        transform-origin: center;
        box-shadow: 0 0 10px rgba(255, 31, 94, 0.7);
      }

      @keyframes pulseRing {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      .pulse {
        position: relative;
        width: 110px;
        height: 110px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pulse .ring {
        position: absolute;
        inset: 0;
        border: 2px solid var(--pres-red);
        border-radius: 50%;
        animation: pulseRing 2.2s ease-out infinite;
      }
      .pulse .ring:nth-child(2) { animation-delay: 0.73s; }
      .pulse .ring:nth-child(3) { animation-delay: 1.46s; }
      .pulse .dot {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--pres-red), #c41230);
        border-radius: 50%;
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 30px rgba(255, 31, 94, 0.6);
      }

      /* ── S1 COVER ── */
      #s1 {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 112px;
      }
      #s1 .g1 {
        width: 1000px;
        height: 1000px;
        background: radial-gradient(circle, rgba(255, 31, 94, 0.22) 0%, transparent 60%);
        right: -250px;
        top: -300px;
      }
      #s1 .g2 {
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(100, 20, 200, 0.12) 0%, transparent 70%);
        left: -100px;
        bottom: -100px;
      }
      #s1 .presented {
        font-size: 26px;
        font-weight: 400;
        color: var(--pres-fg3);
        letter-spacing: 0.06em;
        margin-bottom: 40px;
      }
      #s1 .presented strong { color: var(--pres-fg2); font-weight: 500; }
      #s1 h1 {
        font-family: var(--pres-font-d);
        font-size: clamp(64px, 8vw, 104px);
        font-weight: 300;
        line-height: 1;
        letter-spacing: -0.025em;
        color: var(--pres-fg);
        max-width: 1000px;
        margin-bottom: 32px;
      }
      #s1 h1 em {
        font-style: italic;
        color: var(--pres-red);
        text-shadow: 0 0 40px rgba(255, 31, 94, 0.4);
      }
      #s1 .sub {
        font-size: clamp(22px, 2vw, 30px);
        font-weight: 300;
        color: var(--pres-fg2);
        line-height: 1.55;
        max-width: 700px;
      }
      #s1 .wave-deco {
        position: absolute;
        right: 112px;
        top: 50%;
        transform: translateY(-50%);
      }
      #s1 .bottom-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--pres-red) 0%, rgba(255, 31, 94, 0.4) 40%, transparent 75%);
      }

      /* ── S2 ── */
      #s2 {
        display: flex;
        align-items: center;
        padding: 0 112px;
        gap: 100px;
      }
      #s2 .g1 {
        width: 800px;
        height: 800px;
        background: radial-gradient(circle, rgba(255, 31, 94, 0.18) 0%, transparent 60%);
        right: -150px;
        top: 50%;
        transform: translateY(-50%);
      }
      #s2 .left { flex: 1; }
      #s2 .right {
        flex: 0 0 420px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #s2 h2 {
        font-family: var(--pres-font-d);
        font-size: clamp(46px, 5vw, 72px);
        font-weight: 300;
        line-height: 1.05;
        letter-spacing: -0.02em;
        color: var(--pres-fg);
        margin-bottom: 32px;
      }
      #s2 h2 em { font-style: italic; color: var(--pres-red); }
      #s2 p {
        font-size: clamp(20px, 1.7vw, 28px);
        color: var(--pres-fg2);
        font-weight: 300;
        line-height: 1.65;
        margin-bottom: 48px;
        max-width: 680px;
      }
      #s2 .vs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3px;
      }
      #s2 .vs-card {
        background: var(--pres-card);
        border: 1px solid var(--pres-border);
        padding: 32px 28px;
      }
      #s2 .vs-card.vivid {
        background: linear-gradient(135deg, rgba(255, 31, 94, 0.14) 0%, rgba(255, 31, 94, 0.04) 100%);
        border-color: rgba(255, 31, 94, 0.5);
      }
      #s2 .vs-label {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 16px;
      }
      #s2 .vs-label.old { color: var(--pres-fg3); }
      #s2 .vs-label.new { color: var(--pres-red); }
      #s2 .vs-text {
        font-size: clamp(18px, 1.5vw, 22px);
        color: var(--pres-fg2);
        font-weight: 300;
        line-height: 1.5;
      }

      /* ── S3 ── */
      #s3 {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 80px 112px;
      }
      #s3 h2 {
        font-family: var(--pres-font-d);
        font-size: clamp(46px, 5vw, 72px);
        font-weight: 300;
        letter-spacing: -0.02em;
        color: var(--pres-fg);
        margin-bottom: 64px;
      }
      #s3 h2 em { font-style: italic; color: var(--pres-red); }
      #s3 .flow {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 3px;
      }
      #s3 .fstep {
        background: var(--pres-card);
        border: 1px solid var(--pres-border);
        padding: 36px 26px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
      }
      #s3 .fstep.highlight {
        background: linear-gradient(135deg, rgba(255, 31, 94, 0.18) 0%, rgba(255, 31, 94, 0.06) 100%);
        border-color: rgba(255, 31, 94, 0.55);
      }
      #s3 .fn {
        font-family: var(--pres-font-d);
        font-size: 56px;
        font-weight: 300;
        color: var(--pres-red);
        opacity: 0.35;
        line-height: 1;
      }
      #s3 .ft {
        font-size: clamp(18px, 1.5vw, 22px);
        font-weight: 600;
        color: var(--pres-fg);
        line-height: 1.25;
      }
      #s3 .fd {
        font-size: clamp(15px, 1.2vw, 18px);
        color: var(--pres-fg2);
        font-weight: 300;
        line-height: 1.5;
      }
      #s3 .fms {
        font-size: 16px;
        font-weight: 500;
        color: var(--pres-red);
        letter-spacing: 0.06em;
        margin-top: auto;
      }
      #s3 .arr {
        position: absolute;
        right: -17px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        background: var(--pres-bg);
        border: 1px solid var(--pres-border);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        color: var(--pres-fg3);
        font-size: 24px;
        line-height: 1;
      }

      /* ── S4 ── */
      #s4 {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 80px 112px;
      }
      #s4 h2 {
        font-family: var(--pres-font-d);
        font-size: clamp(46px, 5vw, 72px);
        font-weight: 300;
        letter-spacing: -0.02em;
        color: var(--pres-fg);
        margin-bottom: 64px;
      }
      #s4 h2 em { font-style: italic; color: var(--pres-red); }
      #s4 .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 3px;
      }
      #s4 .grid.brhium-only {
        grid-template-columns: repeat(2, 1fr);
      }
      #s4 .case {
        background: var(--pres-card);
        border: 1px solid var(--pres-border);
        padding: 40px 32px;
      }
      #s4 .case.featured {
        background: linear-gradient(160deg, rgba(255, 31, 94, 0.13) 0%, rgba(255, 31, 94, 0.04) 100%);
        border-color: rgba(255, 31, 94, 0.45);
      }
      #s4 .cbrand {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--pres-red);
        margin-bottom: 24px;
      }
      #s4 .ctitle {
        font-family: var(--pres-font-d);
        font-size: clamp(28px, 2.4vw, 36px);
        font-weight: 300;
        color: var(--pres-fg);
        margin-bottom: 24px;
        line-height: 1.2;
      }
      #s4 .clist { display: flex; flex-direction: column; gap: 16px; }
      #s4 .ci {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        font-size: clamp(16px, 1.3vw, 20px);
        color: var(--pres-fg2);
        font-weight: 300;
        line-height: 1.4;
      }
      #s4 .ci::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--pres-red);
        flex-shrink: 0;
        margin-top: 10px;
        box-shadow: 0 0 8px rgba(255, 31, 94, 0.7);
      }

      /* ── S5 DEMO ── */
      #s5 {
        display: flex;
        align-items: stretch;
      }
      #s5 .demo-glow {
        position: absolute;
        width: 900px;
        height: 900px;
        background: radial-gradient(circle, rgba(255, 31, 94, 0.20) 0%, transparent 60%);
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        filter: blur(150px);
        pointer-events: none;
      }
      .demo-wrap {
        display: flex;
        width: 100%;
        align-items: center;
        padding: 0 112px;
        gap: 80px;
        position: relative;
        z-index: 1;
      }
      .demo-left {
        flex: 0 0 600px;
        display: flex;
        flex-direction: column;
      }
      .demo-h2 {
        font-family: var(--pres-font-d);
        font-size: clamp(46px, 5vw, 72px);
        font-weight: 300;
        letter-spacing: -0.02em;
        color: var(--pres-fg);
        margin-bottom: 20px;
        line-height: 1.05;
      }
      .demo-h2 em { font-style: italic; color: var(--pres-red); }
      .demo-hint {
        font-size: clamp(18px, 1.5vw, 22px);
        color: var(--pres-fg2);
        font-weight: 300;
        line-height: 1.6;
        margin-bottom: 28px;
      }
      .demo-transcript {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 300px;
        overflow-y: auto;
      }
      .transcript-msg {
        padding: 16px 20px;
        border-radius: 10px;
        font-size: clamp(16px, 1.3vw, 20px);
        font-weight: 300;
        line-height: 1.45;
        max-width: 90%;
      }
      .transcript-msg.agent-t {
        background: var(--pres-card);
        border: 1px solid var(--pres-border);
        color: var(--pres-fg);
        align-self: flex-start;
      }
      .transcript-msg.user-t {
        background: var(--pres-red);
        color: #fff;
        align-self: flex-end;
      }

      .demo-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 28px;
      }

      .mic-scene {
        position: relative;
        width: 380px;
        height: 380px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mic-wave-ring {
        position: absolute;
        border-radius: 50%;
        border: 2px solid var(--pres-red);
        opacity: 0;
        transition: opacity 0.3s;
      }
      .mic-scene #ring1 { width: 200px; height: 200px; }
      .mic-scene #ring2 { width: 268px; height: 268px; }
      .mic-scene #ring3 { width: 324px; height: 324px; }
      .mic-scene #ring4 { width: 376px; height: 376px; }

      @keyframes micRingExpand {
        0% { transform: scale(0.85); opacity: 0.75; }
        100% { transform: scale(1.3); opacity: 0; }
      }
      @keyframes micRingPulse {
        0%, 100% { transform: scale(0.96); opacity: 0.65; }
        50% { transform: scale(1.02); opacity: 0.25; }
      }

      .mic-scene.listening .mic-wave-ring { animation: micRingExpand 1.4s ease-out infinite; }
      .mic-scene.listening #ring1 { opacity: 1; animation-delay: 0s; }
      .mic-scene.listening #ring2 { opacity: 1; animation-delay: 0.25s; }
      .mic-scene.listening #ring3 { opacity: 1; animation-delay: 0.5s; }
      .mic-scene.listening #ring4 { opacity: 1; animation-delay: 0.75s; }

      .mic-scene.speaking .mic-wave-ring { animation: micRingPulse 0.55s ease-in-out infinite; }
      .mic-scene.speaking #ring1 { opacity: 0.9; animation-delay: 0s; }
      .mic-scene.speaking #ring2 { opacity: 0.6; animation-delay: 0.08s; }
      .mic-scene.speaking #ring3 { opacity: 0.35; animation-delay: 0.16s; }
      .mic-scene.speaking #ring4 { opacity: 0.18; animation-delay: 0.24s; }

      .mic-btn {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: linear-gradient(145deg, #ff1f5e, #c41230);
        border: 3px solid rgba(255, 255, 255, 0.18);
        cursor: pointer;
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s, box-shadow 0.2s;
        box-shadow:
          0 0 50px rgba(255, 31, 94, 0.55),
          0 0 100px rgba(255, 31, 94, 0.25),
          inset 0 2px 4px rgba(255, 255, 255, 0.15);
      }
      .mic-btn:hover {
        transform: scale(1.06);
        box-shadow:
          0 0 70px rgba(255, 31, 94, 0.75),
          0 0 140px rgba(255, 31, 94, 0.35);
      }
      .mic-btn.active {
        transform: scale(0.95);
        background: linear-gradient(145deg, #c41230, #8a0d22);
      }

      .mic-bars {
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: flex-end;
        gap: 5px;
        height: 64px;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .mic-scene.listening .mic-bars,
      .mic-scene.speaking .mic-bars { opacity: 1; }
      @keyframes micBar {
        0%, 100% { transform: scaleY(0.12); }
        50% { transform: scaleY(1); }
      }
      .mb {
        width: 5px;
        background: var(--pres-red);
        border-radius: 3px;
        height: var(--h);
        transform-origin: bottom;
        animation: micBar 0.9s ease-in-out infinite;
        animation-delay: var(--d);
        box-shadow: 0 0 8px rgba(255, 31, 94, 0.8);
      }

      .mic-status {
        font-size: 22px;
        font-weight: 400;
        color: var(--pres-fg2);
        letter-spacing: 0.04em;
        text-align: center;
        transition: color 0.3s;
      }
      .mic-status.active { color: var(--pres-red); }

      .demo-reset {
        font-family: var(--pres-font-b);
        font-size: 16px;
        font-weight: 400;
        color: var(--pres-fg3);
        background: none;
        border: 1px solid var(--pres-border);
        padding: 12px 28px;
        border-radius: 4px;
        cursor: pointer;
        letter-spacing: 0.06em;
        transition: color 0.2s, border-color 0.2s;
      }
      .demo-reset:hover {
        color: var(--pres-fg2);
        border-color: var(--pres-fg3);
      }

      /* ── S6 ── */
      #s6 {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 80px 112px;
      }
      #s6 h2 {
        font-family: var(--pres-font-d);
        font-size: clamp(46px, 5vw, 72px);
        font-weight: 300;
        letter-spacing: -0.02em;
        color: var(--pres-fg);
        margin-bottom: 60px;
      }
      #s6 h2 em { font-style: italic; color: var(--pres-red); }
      #s6 .qs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3px;
      }
      #s6 .q {
        background: var(--pres-card);
        border: 1px solid var(--pres-border);
        padding: 30px 36px;
        display: flex;
        gap: 24px;
        align-items: flex-start;
        transition: border-color 0.2s;
      }
      #s6 .q:hover { border-color: rgba(255, 31, 94, 0.35); }
      #s6 .qn {
        font-family: var(--pres-font-d);
        font-size: 52px;
        font-weight: 300;
        color: var(--pres-red);
        opacity: 0.4;
        line-height: 1;
        flex-shrink: 0;
        width: 52px;
      }
      #s6 .qt {
        font-size: clamp(18px, 1.5vw, 22px);
        font-weight: 500;
        color: var(--pres-fg);
        line-height: 1.3;
      }

      /* ── S7 ── */
      #s7 {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0 112px;
      }
      #s7 .g1 {
        width: 1100px;
        height: 1100px;
        background: radial-gradient(circle, rgba(255, 31, 94, 0.16) 0%, rgba(100, 20, 200, 0.06) 50%, transparent 65%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      #s7 .eyebrow {
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--pres-red);
        margin-bottom: 32px;
        position: relative;
        z-index: 1;
      }
      #s7 h2 {
        font-family: var(--pres-font-d);
        font-size: clamp(40px, 4vw, 56px);
        font-weight: 300;
        letter-spacing: -0.02em;
        color: var(--pres-fg);
        line-height: 1.1;
        max-width: 1300px;
        margin-bottom: 24px;
        position: relative;
        z-index: 1;
      }
      #s7 h2 em { font-style: italic; color: var(--pres-red); }
      #s7 .sub {
        font-size: clamp(20px, 1.7vw, 26px);
        color: var(--pres-fg2);
        font-weight: 300;
        line-height: 1.55;
        max-width: 900px;
        margin-bottom: 56px;
        position: relative;
        z-index: 1;
      }
      #s7 .steps-row {
        display: flex;
        gap: 4px;
        margin-bottom: 56px;
        position: relative;
        z-index: 1;
      }
      #s7 .step {
        background: var(--pres-card);
        border: 1px solid var(--pres-border);
        padding: 24px 36px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      #s7 .step.highlight {
        background: linear-gradient(135deg, rgba(255, 31, 94, 0.14) 0%, rgba(255, 31, 94, 0.04) 100%);
        border-color: rgba(255, 31, 94, 0.5);
      }
      #s7 .sn {
        font-family: var(--pres-font-d);
        font-size: 22px;
        font-weight: 300;
        color: var(--pres-red);
        line-height: 1;
        white-space: nowrap;
      }
      #s7 .st {
        font-size: 18px;
        font-weight: 600;
        color: var(--pres-fg);
      }
      #s7 .sd {
        font-size: 15px;
        color: var(--pres-fg2);
        font-weight: 300;
      }
      #s7 .cta {
        font-family: var(--pres-font-b);
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 20px 60px;
        border-radius: 4px;
        background: var(--pres-red);
        color: #fff;
        border: none;
        cursor: pointer;
        position: relative;
        z-index: 1;
        margin-bottom: 80px;
        box-shadow: 0 0 40px rgba(255, 31, 94, 0.5);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      #s7 .cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 60px rgba(255, 31, 94, 0.7);
      }
      #s7 .bottom-logo {
        position: absolute;
        bottom: 56px;
        display: flex;
        align-items: center;
        gap: 14px;
        z-index: 1;
      }
      #s7 .bottom-logo img {
        height: 36px !important;
        width: auto !important;
        object-fit: contain;
      }
      #s7 .bottom-logo span {
        font-size: 18px;
        font-weight: 600;
        color: var(--pres-fg3);
        letter-spacing: 0.1em;
      }

      /* Responsive */
      @media (max-width: 900px) {
        .logo { top: 24px; left: 28px; }
        .logo img { height: 28px !important; }
        .logo span { font-size: 18px; }
        #s1, #s2, #s7 { padding: 0 28px; }
        #s3, #s4, #s6 { padding: 80px 28px; }
        #s2 { flex-direction: column; gap: 40px; padding-top: 100px; padding-bottom: 80px; align-items: flex-start; }
        #s2 .right { flex: none; }
        #s1 .wave-deco { display: none; }
        #s3 .flow { grid-template-columns: 1fr; }
        #s3 .arr { display: none; }
        #s4 .grid, #s6 .qs { grid-template-columns: 1fr; }
        .demo-wrap { flex-direction: column; padding: 80px 28px; gap: 40px; }
        .demo-left { flex: none; }
        #s7 .steps-row { flex-direction: column; }
      }
    `}</style>
  )
}
