export interface ProcessRoutineParams {
  text: string
  userId: string
}

export interface ProcessedTask {
  title: string
  time: string
  frequency: string
  category: string
  priority: string
}

export interface ProcessedEvent {
  title: string
  date: string
  time: string
  duration: number
}

export interface ProcessedAutomation {
  trigger: string
  action: string
  benefit: string
}

export interface ProcessedSuggestion {
  type: string
  description: string
  impact: string
}

export interface ProcessedRoutine {
  tasks: ProcessedTask[]
  events: ProcessedEvent[]
  automations: ProcessedAutomation[]
  suggestions: ProcessedSuggestion[]
}

export async function processRoutineDescription({
  text,
  userId
}: ProcessRoutineParams): Promise<ProcessedRoutine> {
  // Simulação de processamento com IA
  // Em produção, isso seria uma chamada para uma API de IA como OpenAI, Claude, etc.

  const routineText = text.toLowerCase()

  // Análise básica do texto para extrair informações
  const tasks: ProcessedTask[] = []
  const events: ProcessedEvent[] = []
  const automations: ProcessedAutomation[] = []
  const suggestions: ProcessedSuggestion[] = []

  // Extrair tarefas baseadas em palavras-chave
  if (routineText.includes('acordar') || routineText.includes('acordo')) {
    tasks.push({
      title: 'Acordar e começar o dia',
      time: '07:00',
      frequency: 'diária',
      category: 'personal',
      priority: 'alta'
    })
  }

  if (routineText.includes('exercício') || routineText.includes('malhar')) {
    tasks.push({
      title: 'Fazer exercícios físicos',
      time: '07:30',
      frequency: 'diária',
      category: 'personal',
      priority: 'alta'
    })
  }

  if (routineText.includes('café') || routineText.includes('café da manhã')) {
    tasks.push({
      title: 'Tomar café da manhã',
      time: '08:00',
      frequency: 'diária',
      category: 'personal',
      priority: 'média'
    })
  }

  if (routineText.includes('trabalho') || routineText.includes('trabalhar')) {
    tasks.push({
      title: 'Trabalhar',
      time: '09:00',
      frequency: 'dias úteis',
      category: 'work',
      priority: 'alta'
    })
  }

  if (routineText.includes('almoço') || routineText.includes('almoçar')) {
    tasks.push({
      title: 'Almoçar',
      time: '12:00',
      frequency: 'diária',
      category: 'personal',
      priority: 'média'
    })
  }

  if (routineText.includes('estudar') || routineText.includes('estudo')) {
    tasks.push({
      title: 'Estudar',
      time: '19:00',
      frequency: 'diária',
      category: 'personal',
      priority: 'alta'
    })
  }

  // Criar eventos baseados no texto
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  if (tasks.length > 0) {
    events.push({
      title: 'Rotina Diária',
      date: tomorrowStr,
      time: '07:00',
      duration: 60
    })
  }

  // Sugestões de automação
  if (routineText.includes('trabalho') && routineText.includes('email')) {
    automations.push({
      trigger: 'Receber email de trabalho',
      action: 'Marcar como prioridade alta',
      benefit: 'Organização automática de emails importantes'
    })
  }

  if (routineText.includes('exercício')) {
    automations.push({
      trigger: '7:00 da manhã',
      action: 'Enviar lembrete de exercícios',
      benefit: 'Manter rotina de exercícios consistente'
    })
  }

  // Sugestões personalizadas
  suggestions.push({
    type: 'produtividade',
    description: 'Configure lembretes automáticos para suas tarefas principais',
    impact: 'alto'
  })

  suggestions.push({
    type: 'bem-estar',
    description: 'Adicione pausas curtas entre tarefas intensas',
    impact: 'médio'
  })

  if (routineText.includes('trabalho')) {
    suggestions.push({
      type: 'trabalho',
      description: 'Use a técnica Pomodoro para manter o foco',
      impact: 'alto'
    })
  }

  // Garantir pelo menos uma tarefa se nenhuma foi encontrada
  if (tasks.length === 0) {
    tasks.push({
      title: 'Revisar rotina diária',
      time: '08:00',
      frequency: 'diária',
      category: 'personal',
      priority: 'média'
    })
  }

  return {
    tasks,
    events,
    automations,
    suggestions
  }
}