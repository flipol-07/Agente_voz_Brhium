import { randomUUID } from 'node:crypto'
import { hashPassword } from '@/features/brhium-platform/auth'
import type { PlatformStore } from '@/features/brhium-platform/types'

function id(prefix: string) {
  return `${prefix}_${randomUUID().slice(0, 8)}`
}

function isoMinutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString()
}

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export function createSeedState(): PlatformStore {
  const workspaceId = 'workspace_brhium'
  
  // Usamos el ID de Retell de las variables de entorno si está disponible, 
  // sino usamos un fallback para desarrollo local.
  const envAgentId = process.env.RETELL_AGENT_ID?.replace(/['"]+/g, '').trim()
  const assistantId = envAgentId || 'assistant_alba'
  
  const assistantConfigId = `config_${assistantId}`
  const phoneNumberId = 'phone_main'

  const phoneCallId = 'call_siboval'
  const transferCallId = 'call_relbix'
  const demoCallId = 'call_demo'

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    workspaces: [
      {
        id: workspaceId,
        name: 'Brhium',
        slug: 'brhium',
        brandColor: '#2f7f7b',
        timezone: 'Europe/Madrid',
        createdAt: isoDaysAgo(30),
      },
    ],
    users: [
      {
        id: 'user_admin',
        workspaceId,
        role: 'admin_agencia',
        email: 'admin@brhium.demo',
        name: 'Lucia Ramos',
        title: 'Admin agencia',
        passwordHash: hashPassword('brhium2026'),
        createdAt: isoDaysAgo(30),
      },
      {
        id: 'user_client',
        workspaceId,
        role: 'cliente_brhium',
        email: 'cliente@brhium.demo',
        name: 'Brhium Equipo',
        title: 'Cliente Brhium',
        passwordHash: hashPassword('brhium2026'),
        createdAt: isoDaysAgo(25),
      },
    ],
    assistants: [
      {
        id: assistantId,
        workspaceId,
        name: 'Alba Brhium',
        slug: 'alba-brhium',
        language: 'es-ES',
        voiceStyle: 'calma, clara y humana',
        status: 'active',
        providerMode: 'browser_demo',
        channels: ['web', 'phone'],
        configId: assistantConfigId,
        createdAt: isoDaysAgo(21),
      },
    ],
    assistantConfigs: [
      {
        id: assistantConfigId,
        assistantId,
        agentName: 'Alba Brhium',
        language: 'es-ES',
        voiceId: 'eleven_labs_spanish_female_1', // Default dummy voice ID
        voiceSpeed: 1.05,
        voiceTemperature: 0.8,
        voiceEmotion: 'friendly',
        model: 'gpt-4o',
        modelTemperature: 0.5,
        beginMessage: 'Hola, gracias por llamar a BRHIUM. Soy Alba, ¿en qué puedo ayudarte hoy?',
        interruptionSensitivity: 0.5,
        responsiveness: 0.8,
        enableBackchannel: true,
        ambientSound: 'none',
        startSpeaker: 'agent',
        hidePrices: true,
        systemPrompt: `# AGENTE DE VOZ BRHIUM: ALBA

## 1. IDENTIDAD Y TONO
- **Nombre:** Alba.
- **Rol:** Asistente virtual oficial de BRHIUM nutraceutics.
- **Personalidad:** Profesional, científica, honesta, cercana y empática.
- **Voz:** Tranquila, segura y clara. Evita sonar robótica o excesivamente comercial.
- **Pronunciación:** Di "BRHIUM" como "Brium" (la H es muda).

## 2. OBJETIVOS PRINCIPALES
- **Informa:** Resuelve dudas sobre la marca y sus productos usando EXCLUSIVAMENTE la Base de Conocimiento.
- **Leads:** Recoge datos de contacto de farmacias, distribuidores o clientes interesados.
- **Escalado:** Detecta cuándo una consulta requiere atención humana (médica, comercial seria o reclamación) y ofrece tomar los datos para un contacto posterior.

## 3. GUARDARRAÍLES DE ESTILO (CRÍTICO)
- **Brevedad:** Responde en máximo 2 frases cortas. No satures al usuario.
- **Interactividad:** Haz una sola pregunta a la vez. Espera respuesta antes de seguir.
- **Naturalidad:** Usa conectores naturales como "Entiendo", "Claro", "Un segundo", "Déjame revisar".
- **Empatía:** Si el usuario está frustrado, valida su sentimiento: "Siento mucho escuchar eso, déjame ver cómo puedo ayudarte".

## 4. SEGURIDAD Y CUMPLIMIENTO MÉDICO
- **NO DIAGNOSTIQUES:** Nunca des consejos médicos personalizados.
- **DESCARGO DE RESPONSABILIDAD:** Si preguntan por síntomas graves, embarazo o medicación, di: "Es importante que consultes con tu médico o farmacéutico antes de tomar cualquier decisión sobre tu salud".
- **HONESTIDAD:** Si no sabes algo, di: "No tengo esa información exacta ahora mismo, pero puedo tomar tus datos para que un experto del equipo te responda".

## 5. FLUJO DE CONVERSACIÓN
1. **Saludo:** "Hola, gracias por llamar a BRHIUM. Soy Alba, ¿en qué puedo ayudarte hoy?"
2. **Consulta:** Responde brevemente usando la Base de Conocimiento.
3. **Cierre/Lead:** "¿Te gustaría que alguien del equipo te contacte para darte más detalles?" -> Si acepta, pide Nombre, Teléfono y Motivo.
4. **Despedida:** "Gracias por tu tiempo. Que tengas un buen día."

## 6. PRONUNCIACIÓN DE PRODUCTOS
- **Fluocol:** "Flu-o-col".
- **Estavit:** "Es-ta-vit".
- **Micraflora:** "Mi-cra-flo-ra".
- **Irbosyn:** "Ir-bo-sin".`,
        updatedAt: isoDaysAgo(1),
      },
    ],
    phoneNumbers: [
      {
        id: phoneNumberId,
        workspaceId,
        label: 'Central atencion Brhium',
        e164: '+34 910 000 321',
        assistantId,
        isActive: true,
        forwardTo: '+34 911 111 222',
        createdAt: isoDaysAgo(21),
      },
      {
        id: 'phone_support',
        workspaceId,
        label: 'Linea soporte lanzamientos',
        e164: '+34 910 000 654',
        assistantId,
        isActive: false,
        forwardTo: '+34 911 111 222',
        createdAt: isoDaysAgo(19),
      },
    ],
    contacts: [],
    supportCases: [],
    callbacks: [],
    consents: [],
    calls: [],
    callTranscripts: [],
    callEvents: [],
    callSummaries: [],
    whatsappEvents: [],
    knowledgeProducts: [
      {
        slug: 'siboval',
        name: 'Siboval',
        category: 'Salud intestinal',
        purpose:
          'Complemento alimenticio orientado al equilibrio intestinal y el bienestar digestivo.',
        composition: ['Lactobacillus rhamnosus LR06', 'Fructooligosacaridos'],
        modeOfUse: 'Una capsula al dia durante tres meses.',
        warnings: [
          'No superar la dosis diaria recomendada.',
          'Mantener fuera del alcance de los ninos.',
          'No sustituye una dieta variada y equilibrada.',
        ],
        purchaseUrl: 'https://www.brhium.com/productos/siboval/',
        sourceUrl: 'https://www.brhium.com/productos/siboval/',
        escalateWhen: ['Embarazo o lactancia', 'Menores', 'Sintomas digestivos agudos'],
      },
      {
        slug: 'irbosyn',
        name: 'Irbosyn',
        category: 'Salud urinaria',
        purpose:
          'Complemento alimenticio pensado para apoyar el confort y equilibrio del tracto urinario.',
        composition: ['D-manosa', 'Arandano rojo americano', 'Lactobacillus acidophilus SGL11'],
        modeOfUse: 'Dos capsulas al dia durante quince dias. Despues, una capsula al dia hasta completar tres meses.',
        warnings: [
          'No superar la dosis diaria recomendada.',
          'Mantener fuera del alcance de los ninos.',
          'No usar como sustituto de tratamiento medico.',
        ],
        purchaseUrl: 'https://www.brhium.com/productos/irbosyn/',
        sourceUrl: 'https://www.brhium.com/productos/irbosyn/',
        escalateWhen: ['Infeccion activa con sintomas intensos', 'Embarazo', 'Uso junto a medicacion prescrita'],
      },
      {
        slug: 'fluocol',
        name: 'Fluocol',
        category: 'Colesterol y riesgo cardiovascular',
        purpose:
          'Complemento alimenticio dirigido al mantenimiento de niveles normales de colesterol junto a un estilo de vida saludable.',
        composition: ['Monacolina K de arroz rojo fermentado', 'Policosanoles', 'Coenzima Q10'],
        modeOfUse: 'Una capsula al dia, preferiblemente por la noche.',
        warnings: [
          'No usar en embarazo o lactancia sin criterio profesional.',
          'Consultar con un profesional si se toman hipolipemiantes u otra medicacion.',
          'No superar la dosis recomendada.',
        ],
        purchaseUrl: 'https://www.brhium.com/productos/fluocol/',
        sourceUrl: 'https://www.brhium.com/productos/fluocol/',
        escalateWhen: ['Uso de estatinas u otra medicacion', 'Antecedentes cardiovasculares', 'Embarazo o lactancia'],
      },
      {
        slug: 'estavit',
        name: 'Estavit',
        category: 'Estres y sueno',
        purpose:
          'Complemento alimenticio asociado al equilibrio emocional, manejo del estres y descanso.',
        composition: ['Ashwagandha', 'Magnesio', 'Vitaminas del grupo B'],
        modeOfUse: 'Una capsula al dia, preferiblemente de forma continuada durante tres meses.',
        warnings: [
          'No sustituye una dieta variada y equilibrada.',
          'Consultar con un profesional en embarazo, lactancia o si se esta bajo tratamiento.',
          'Mantener fuera del alcance de los ninos.',
        ],
        purchaseUrl: 'https://www.brhium.com/productos/estavit/',
        sourceUrl: 'https://www.brhium.com/productos/estavit/',
        escalateWhen: ['Ansiedad intensa', 'Insomnio grave', 'Uso junto a psicofarmacos'],
      },
      {
        slug: 'relbix',
        name: 'Relbix',
        category: 'Bienestar digestivo',
        purpose:
          'Complemento alimenticio relacionado con el bienestar gastrointestinal y el equilibrio digestivo.',
        composition: ['Glutamina', 'Zinc', 'Vitaminas del grupo B'],
        modeOfUse: 'Dos capsulas al dia en una o dos tomas, segun la informacion publica.',
        warnings: [
          'No recomendar en casos con medicacion concomitante sin revision humana.',
          'No sustituye el consejo de un profesional sanitario.',
          'No superar la dosis diaria recomendada.',
        ],
        purchaseUrl: 'https://www.brhium.com/productos/relbix/',
        sourceUrl: 'https://www.brhium.com/productos/relbix/',
        escalateWhen: ['Medicacion concomitante', 'Sintomas persistentes', 'Embarazo o lactancia'],
      },
      {
        slug: 'micraflora',
        name: 'Micraflora',
        category: 'Microbiota',
        purpose:
          'Complemento alimenticio con foco en el equilibrio de la microbiota y el bienestar digestivo.',
        composition: ['Mezcla de probioticos', 'Prebioticos', 'Vitaminas de soporte'],
        modeOfUse: 'Una capsula al dia o segun pauta indicada en el envase.',
        warnings: [
          'Mantener fuera del alcance de los ninos.',
          'No usar como sustituto de una dieta equilibrada.',
          'Consultar con un profesional en situaciones clinicas sensibles.',
        ],
        purchaseUrl: 'https://www.brhium.com/productos/micraflora/',
        sourceUrl: 'https://www.brhium.com/productos/micraflora/',
        escalateWhen: ['Inmunosupresion', 'Patologia digestiva activa', 'Embarazo o lactancia'],
      },
    ],
    companyKnowledge: {
      summary:
        'Brhium trabaja con soluciones nutraceuticas orientadas a salud intestinal, urinaria, metabolismo y equilibrio emocional.',
      philosophy:
        'La marca habla de bienestar desde un enfoque integral y de apoyo, sin sustituir la valoracion profesional individual.',
      contactChannel: 'Formulario de contacto web y seguimiento operativo por telefono o WhatsApp.',
      contactUrl: 'https://www.brhium.com/contacto/',
    },
    usageMetrics: [],
  }
}
