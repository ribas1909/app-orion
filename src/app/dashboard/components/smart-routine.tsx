"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Zap,
  Lightbulb,
  Loader2,
  Save,
  Clock,
  Target,
  TrendingUp
} from "lucide-react"
import { processRoutineDescription } from "@/lib/automations/routine-processor"
import { supabase } from "@/lib/supabase"

type ProcessedTask = {
  title: string
  time: string
  frequency: string
  category: string
  priority: string
}

type ProcessedEvent = {
  title: string
  date: string
  time: string
  duration: number
}

type ProcessedAutomation = {
  trigger: string
  action: string
  benefit: string
}

type ProcessedSuggestion = {
  type: string
  description: string
  impact: string
}

type ProcessedRoutine = {
  tasks: ProcessedTask[]
  events: ProcessedEvent[]
  automations: ProcessedAutomation[]
  suggestions: ProcessedSuggestion[]
}

export default function SmartRoutine() {
  const [routineText, setRoutineText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState<ProcessedRoutine | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleProcessRoutine = async () => {
    if (!routineText.trim()) return

    setIsProcessing(true)
    setSaveSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error("Usuário não autenticado")
        return
      }

      const result = await processRoutineDescription({
        text: routineText,
        userId: user.id
      })

      setProcessedData(result)
    } catch (error) {
      console.error("Erro ao processar rotina:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveAll = async () => {
    if (!processedData) return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error("Usuário não autenticado")
        return
      }

      // Validar e corrigir tarefas
      const validatedTasks = processedData.tasks.map(task => ({
        user_id: user.id,
        title: task.title || "Tarefa sem título",
        time: task.time || "09:00",
        frequency: task.frequency || "diária",
        category: task.category || "geral",
        priority: task.priority || "média",
        completed: false,
        created_at: new Date().toISOString()
      }))

      // Validar e corrigir eventos
      const validatedEvents = processedData.events.map(event => ({
        user_id: user.id,
        title: event.title || "Evento sem título",
        date: event.date || new Date().toISOString().split('T')[0],
        time: event.time || "09:00",
        duration: event.duration || 60,
        created_at: new Date().toISOString()
      }))

      // Validar e corrigir automações
      const validatedAutomations = processedData.automations.map(automation => ({
        user_id: user.id,
        trigger: automation.trigger || "Gatilho não definido",
        action: automation.action || "Ação não definida",
        benefit: automation.benefit || "Benefício não especificado",
        active: true,
        created_at: new Date().toISOString()
      }))

      // Validar e corrigir sugestões
      const validatedSuggestions = processedData.suggestions.map(suggestion => ({
        user_id: user.id,
        type: suggestion.type || "geral",
        description: suggestion.description || "Sugestão sem descrição",
        impact: suggestion.impact || "médio",
        created_at: new Date().toISOString()
      }))

      // Salvar tudo no banco de dados
      const promises = []

      if (validatedTasks.length > 0) {
        promises.push(
          supabase.from('tasks').insert(validatedTasks)
        )
      }

      if (validatedEvents.length > 0) {
        promises.push(
          supabase.from('events').insert(validatedEvents)
        )
      }

      if (validatedAutomations.length > 0) {
        promises.push(
          supabase.from('automations').insert(validatedAutomations)
        )
      }

      if (validatedSuggestions.length > 0) {
        promises.push(
          supabase.from('suggestions').insert(validatedSuggestions)
        )
      }

      await Promise.all(promises)

      setSaveSuccess(true)
      
      // Limpar após 3 segundos
      setTimeout(() => {
        setRoutineText("")
        setProcessedData(null)
        setSaveSuccess(false)
      }, 3000)

    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              Rotina Inteligente com IA
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Descreva sua rotina em linguagem natural e a IA irá criar automaticamente tarefas, eventos, automações e sugestões personalizadas para você.
            </p>
          </div>
        </div>
      </Card>

      {/* Input Area */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Descreva sua rotina
        </h3>
        <Textarea
          value={routineText}
          onChange={(e) => setRoutineText(e.target.value)}
          placeholder="Exemplo: Acordo às 7h, faço exercícios por 30 minutos, tomo café às 8h, trabalho das 9h às 18h com pausa para almoço ao meio-dia, estudo inglês às 19h por 1 hora..."
          className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 min-h-[150px] resize-none"
          disabled={isProcessing}
        />
        <Button
          onClick={handleProcessRoutine}
          disabled={!routineText.trim() || isProcessing}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold mt-4 w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processando com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Processar Rotina
            </>
          )}
        </Button>
      </Card>

      {/* Processed Results */}
      {processedData && (
        <div className="space-y-6">
          {/* Tasks */}
          {processedData.tasks.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">
                  Tarefas Criadas ({processedData.tasks.length})
                </h3>
              </div>
              <div className="space-y-3">
                {processedData.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="bg-black/30 border border-gray-700 rounded-lg p-4 hover:border-green-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{task.title}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {task.time}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            {task.frequency}
                          </Badge>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            {task.category}
                          </Badge>
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Events */}
          {processedData.events.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">
                  Eventos do Calendário ({processedData.events.length})
                </h3>
              </div>
              <div className="space-y-3">
                {processedData.events.map((event, idx) => (
                  <div
                    key={idx}
                    className="bg-black/30 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-all"
                  >
                    <p className="text-white font-medium mb-2">{event.title}</p>
                    <p className="text-sm text-gray-400">
                      {event.date} • {event.time} • {event.duration}min
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Automations */}
          {processedData.automations.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">
                  Automações Recomendadas ({processedData.automations.length})
                </h3>
              </div>
              <div className="space-y-3">
                {processedData.automations.map((automation, idx) => (
                  <div
                    key={idx}
                    className="bg-black/30 border border-gray-700 rounded-lg p-4 hover:border-yellow-500/50 transition-all"
                  >
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-semibold text-yellow-400 uppercase">
                          Gatilho
                        </span>
                        <p className="text-white text-sm mt-1">{automation.trigger}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-blue-400 uppercase">
                          Ação
                        </span>
                        <p className="text-white text-sm mt-1">{automation.action}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-green-400 uppercase">
                          Benefício
                        </span>
                        <p className="text-gray-300 text-sm mt-1">{automation.benefit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestions */}
          {processedData.suggestions.length > 0 && (
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">
                  Sugestões Personalizadas ({processedData.suggestions.length})
                </h3>
              </div>
              <div className="space-y-3">
                {processedData.suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="bg-black/30 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        {suggestion.type}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-white text-sm mb-1">{suggestion.description}</p>
                        <p className="text-gray-400 text-xs">
                          Impacto: {suggestion.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Save Button */}
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 p-6">
            <Button
              onClick={handleSaveAll}
              disabled={isSaving || saveSuccess}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Salvando no banco de dados...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Salvo com sucesso!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Confirmar e Salvar Tudo
                </>
              )}
            </Button>
            {saveSuccess && (
              <p className="text-center text-green-400 text-sm mt-3">
                Todos os dados foram salvos no banco de dados com sucesso!
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
