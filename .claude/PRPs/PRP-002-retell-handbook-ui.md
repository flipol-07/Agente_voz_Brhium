# PRP: Expansión de Retell Voice Integration V2 (Handbook & Advanced UI)

## Objetivo
Lograr paridad total con el dashboard de Retell AI añadiendo los ajustes del "Agent Handbook", selector de timezone y reorganizando la interfaz del dashboard para que sea más intuitiva (Esencial vs Avanzado).

## Por Qué
El dashboard actual está creciendo demasiado en vertical. Separar los ajustes esenciales de los técnicos mejorará la UX. Además, los ajustes del Handbook (Personalidad, Empatía, etc.) son críticos para el comportamiento del agente.

## Qué (Criterios de Éxito)
1.  **UI Reorganizada**: Secciones "Esenciales" visibles por defecto. Secciones "Avanzadas" colapsadas bajo un botón.
2.  **Handbook Integration**: Toggles para todas las opciones del Handbook (Personalidad, Relleno, Empatía, NATO, etc.).
3.  **Timezone Selector**: Selector de zona horaria (Europe/Madrid por defecto).
4.  **Sincronización Total**: Todos los nuevos campos se persisten en Supabase/LocalStore y se sincronizan bidireccionalmente con Retell AI.

## Contexto (Arquitectura)
- **Frontend**: `dashboard-client.tsx` usará un estado `showAdvanced` para colapsar secciones.
- **Backend**: `service.ts` actualizará el mapeo en `updateRetellAgentConfig` y `syncAssistantConfigFromRetell`.
- **Types**: `AssistantConfig` ya tiene los campos (añadidos en paso previo).

## Blueprint
### FASE 1: Lógica de Persistencia (Backend)
- Mapear campos `handbook_*` y `timezone` en `service.ts`.
- Asegurar que `syncAssistantConfigFromRetell` lea correctamente el objeto `handbook_config` de la API.

### FASE 2: Componentes UI
- Crear componente `HandbookToggle` o usar `ConfigSwitch` con descripciones ricas.
- Implementar el contenedor colapsable en `dashboard-client.tsx`.

### FASE 3: Reorganización de Secciones
- Mover "Voz", "Prompt" y "Ajustes Básicos" a Esenciales.
- Mover "Transcripción", "Pronunciación", "DTMF", "Recordatorios" y "Handbook" a Avanzados.

### FASE 4: QA y Verificación
- Probar sincronización en ambos sentidos.
- Verificar que el colapsable funciona suavemente.

## Aprendizajes (Pendiente)
- [ ] Verificar nombres exactos de campos Handbook en la API de Retell si difieren de `full_agent.txt`.
