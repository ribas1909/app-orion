"use client"

import { useState, useEffect } from "react"
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Briefcase,
  TrendingUp,
  Clock,
  Target,
  Zap,
  LogOut,
  ArrowRight,
  Settings,
  Play,
  Pause,
  FileText,
  Users,
  Bell,
  RefreshCw,
  BarChart3,
  Link2,
  Sparkles,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SmartRoutine from "./components/smart-routine"

type Difficulty = "FÁCIL" | "NORMAL" | "DIFÍCIL"
type Category = "work" | "personal" | "urgent"

type Task = {
  id: number
  title: string
  completed: boolean
  difficulty: Difficulty
  category: Category
  completedAt?: Date
}

type Tab = "tasks" | "automations" | "analytics" | "routine"

type Automation = {
  id: number
  title: string
  description: string
  trigger: string
  actions: string[]
  modules: string[]
  benefit: string
  icon: any
  color: string
  active: boolean
  activatedAt?: Date
  timeSaved: number // em minutos
}

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("tasks")
  const [newTask, setNewTask] = useState("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editingTaskTitle, setEditingTaskTitle] = useState("")
  const [editingTaskDifficulty, setEditingTaskDifficulty] = useState<Difficulty>("NORMAL")
  const [showAutomationList, setShowAutomationList] = useState(false)
  const [activeAutomationsList, setActiveAutomationsList] = useState<number[]>([])
  const [startTime] = useState<Date>(new Date())

  const [availableAutomations] = useState<Automation[]>([
    {
      id: 1,
      title: "Eventos Automáticos de E-mail",
      description: "Cria eventos no calendário automaticamente quando detecta datas em e-mails",
      trigger: "Recebimento de e-mail com data/horário mencionado",
      actions: [
        "Analisa conteúdo do e-mail com IA",
        "Extrai data, hora e título do evento",
        "Cria evento no Calendário Inteligente",
        "Envia confirmação por e-mail"
      ],
      modules: ["E-mail Automático", "Calendário Inteligente"],
      benefit: "Nunca mais perca compromissos importantes mencionados em e-mails",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      active: false,
      timeSaved: 15
    },
    {
      id: 2,
      title: "Sincronização Inteligente de Tarefas",
      description: "Aloca tarefas automaticamente nos horários livres do calendário",
      trigger: "Nova tarefa criada ou horário livre detectado",
      actions: [
        "Analisa prioridade e tempo estimado da tarefa",
        "Identifica horários livres no calendário",
        "Aloca tarefa no melhor horário disponível",
        "Envia lembrete 15 minutos antes"
      ],
      modules: ["Trabalho Integrado", "Calendário Inteligente"],
      benefit: "Otimiza seu tempo alocando tarefas automaticamente nos melhores horários",
      icon: Target,
      color: "from-purple-500 to-purple-600",
      active: false,
      timeSaved: 20
    },
    {
      id: 3,
      title: "Postagens Sociais Programadas",
      description: "Programa posts automáticos baseados em conteúdo e horários ideais",
      trigger: "Conteúdo aprovado ou horário de pico detectado",
      actions: [
        "Analisa melhor horário para engajamento",
        "Formata conteúdo para cada rede social",
        "Agenda publicação automática",
        "Gera relatório de performance"
      ],
      modules: ["Redes Sociais", "Calendário Inteligente"],
      benefit: "Maximize engajamento publicando no momento certo automaticamente",
      icon: MessageSquare,
      color: "from-pink-500 to-pink-600",
      active: false,
      timeSaved: 30
    },
    {
      id: 4,
      title: "Resumos Automáticos de E-mail",
      description: "Gera resumos diários dos e-mails mais importantes",
      trigger: "Todo dia às 8h ou acúmulo de 20+ e-mails não lidos",
      actions: [
        "Categoriza e-mails por prioridade",
        "Gera resumo executivo com IA",
        "Destaca ações necessárias",
        "Envia resumo por e-mail ou notificação"
      ],
      modules: ["E-mail Automático", "Trabalho Integrado"],
      benefit: "Economize horas processando apenas o essencial dos seus e-mails",
      icon: FileText,
      color: "from-emerald-500 to-emerald-600",
      active: false,
      timeSaved: 45
    },
    {
      id: 5,
      title: "Resumos de Reuniões com IA",
      description: "Transcreve e resume reuniões automaticamente",
      trigger: "Reunião iniciada no calendário",
      actions: [
        "Grava e transcreve reunião (com permissão)",
        "Identifica pontos-chave e decisões",
        "Gera resumo e lista de ações",
        "Compartilha com participantes via e-mail"
      ],
      modules: ["Calendário Inteligente", "E-mail Automático", "Trabalho Integrado"],
      benefit: "Nunca mais perca detalhes importantes de reuniões",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      active: false,
      timeSaved: 25
    },
    {
      id: 6,
      title: "Integração com Google Drive",
      description: "Sincroniza documentos e anexos automaticamente",
      trigger: "Anexo recebido por e-mail ou documento criado",
      actions: [
        "Detecta anexos em e-mails importantes",
        "Salva automaticamente no Google Drive",
        "Organiza em pastas por projeto/categoria",
        "Cria link compartilhável e notifica equipe"
      ],
      modules: ["E-mail Automático", "Trabalho Integrado"],
      benefit: "Mantenha todos os documentos organizados e acessíveis automaticamente",
      icon: Link2,
      color: "from-cyan-500 to-cyan-600",
      active: false,
      timeSaved: 10
    },
    {
      id: 7,
      title: "Sincronização com Trello/Notion",
      description: "Mantém tarefas sincronizadas entre ORION e ferramentas externas",
      trigger: "Tarefa criada/atualizada em qualquer plataforma",
      actions: [
        "Detecta mudanças em Trello ou Notion",
        "Sincroniza bidirecionamente com ORION",
        "Mantém status e prioridades atualizados",
        "Notifica sobre conflitos de sincronização"
      ],
      modules: ["Trabalho Integrado", "Calendário Inteligente"],
      benefit: "Use suas ferramentas favoritas sem perder sincronização",
      icon: RefreshCw,
      color: "from-indigo-500 to-indigo-600",
      active: false,
      timeSaved: 15
    },
    {
      id: 8,
      title: "Relatórios de Produtividade",
      description: "Gera relatórios semanais automáticos de performance",
      trigger: "Toda segunda-feira às 9h",
      actions: [
        "Analisa tarefas completadas vs. pendentes",
        "Calcula tempo gasto por categoria",
        "Identifica padrões de produtividade",
        "Envia relatório visual por e-mail"
      ],
      modules: ["Trabalho Integrado", "E-mail Automático", "Calendário Inteligente"],
      benefit: "Entenda seus padrões de produtividade e melhore continuamente",
      icon: BarChart3,
      color: "from-yellow-500 to-yellow-600",
      active: false,
      timeSaved: 20
    },
    {
      id: 9,
      title: "Reagendamento Inteligente",
      description: "Reorganiza agenda automaticamente quando surgem imprevistos",
      trigger: "Evento cancelado ou conflito de horário detectado",
      actions: [
        "Identifica compromissos afetados",
        "Sugere novos horários baseado em prioridades",
        "Envia propostas de reagendamento",
        "Atualiza calendário após confirmação"
      ],
      modules: ["Calendário Inteligente", "E-mail Automático"],
      benefit: "Adapte sua agenda automaticamente sem estresse",
      icon: RefreshCw,
      color: "from-red-500 to-red-600",
      active: false,
      timeSaved: 30
    },
    {
      id: 10,
      title: "Lembretes Personalizados Inteligentes",
      description: "Envia lembretes contextuais baseados em comportamento e prioridades",
      trigger: "Análise contínua de padrões e prazos",
      actions: [
        "Aprende seus padrões de trabalho",
        "Identifica tarefas em risco de atraso",
        "Envia lembretes no momento ideal",
        "Ajusta frequência baseado em resposta"
      ],
      modules: ["Trabalho Integrado", "E-mail Automático", "Calendário Inteligente"],
      benefit: "Receba lembretes inteligentes que realmente ajudam, não incomodam",
      icon: Bell,
      color: "from-teal-500 to-teal-600",
      active: false,
      timeSaved: 10
    }
  ])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Erro ao obter usuário:', userError)
        router.push('/')
        return
      }
      
      setUserEmail(user.email || '')
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário')

      // Salvar/atualizar perfil do usuário no banco
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
        
        if (profileError) {
          console.error('Erro ao salvar perfil:', profileError)
        } else {
          console.log('Perfil salvo com sucesso')
        }
      } catch (error) {
        console.error('Erro ao salvar perfil:', error)
      }
    } catch (error) {
      console.error('Erro geral:', error)
      router.push('/')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title: newTask,
          completed: false,
          difficulty: "NORMAL",
          category: "work",
        },
      ])
      setNewTask("")
    }
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => 
      task.id === id ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined } : task
    ))
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id)
    setEditingTaskTitle(task.title)
    setEditingTaskDifficulty(task.difficulty)
  }

  const saveEditTask = () => {
    if (editingTaskId !== null && editingTaskTitle.trim()) {
      setTasks(tasks.map((task) => 
        task.id === editingTaskId 
          ? { ...task, title: editingTaskTitle, difficulty: editingTaskDifficulty } 
          : task
      ))
      cancelEditTask()
    }
  }

  const cancelEditTask = () => {
    setEditingTaskId(null)
    setEditingTaskTitle("")
    setEditingTaskDifficulty("NORMAL")
  }

  const activateAutomation = (id: number) => {
    setActiveAutomationsList([...activeAutomationsList, id])
    setShowAutomationList(false)
  }

  const deactivateAutomation = (id: number) => {
    setActiveAutomationsList(activeAutomationsList.filter(automationId => automationId !== id))
  }

  const getAutomationById = (id: number) => {
    return availableAutomations.find(auto => auto.id === id)
  }

  const getAvailableAutomations = () => {
    return availableAutomations.filter(auto => !activeAutomationsList.includes(auto.id))
  }

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "DIFÍCIL":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "NORMAL":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "FÁCIL":
        return "bg-green-500/20 text-green-400 border-green-500/30"
    }
  }

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case "work":
        return <Briefcase className="w-4 h-4" />
      case "personal":
        return <Target className="w-4 h-4" />
      case "urgent":
        return <Zap className="w-4 h-4" />
    }
  }

  // Cálculos de métricas dinâmicas
  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const activeAutomations = activeAutomationsList.length

  // Calcular tempo economizado baseado nas automações ativas
  const calculateTimeSaved = () => {
    const now = new Date()
    const elapsedHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    
    let totalMinutesSaved = 0
    activeAutomationsList.forEach(id => {
      const automation = getAutomationById(id)
      if (automation) {
        // Calcula tempo economizado proporcionalmente ao tempo decorrido
        totalMinutesSaved += (automation.timeSaved * elapsedHours) / 24
      }
    })
    
    return totalMinutesSaved
  }

  // Calcular média diária de tarefas completadas
  const calculateDailyAverage = () => {
    const now = new Date()
    const elapsedDays = Math.max(1, (now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24))
    return completedTasks / elapsedDays
  }

  // Calcular tempo médio por tarefa
  const calculateAverageTime = () => {
    const completedTasksWithTime = tasks.filter(t => t.completed && t.completedAt)
    if (completedTasksWithTime.length === 0) return 0
    
    let totalMinutes = 0
    completedTasksWithTime.forEach(task => {
      if (task.completedAt) {
        // Simula tempo baseado na dificuldade
        const baseTime = task.difficulty === "DIFÍCIL" ? 60 : task.difficulty === "NORMAL" ? 45 : 30
        totalMinutes += baseTime
      }
    })
    
    return totalMinutes / completedTasksWithTime.length
  }

  const timeSavedMinutes = calculateTimeSaved()
  const timeSavedHours = timeSavedMinutes / 60
  const dailyAverage = calculateDailyAverage()
  const averageTime = calculateAverageTime()

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-black to-emerald-500/5 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              ORION Dashboard
            </h1>
            <p className="text-gray-400 mt-1 text-sm sm:text-base">
              Bem-vindo, {userName}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-7 px-2.5 text-xs"
          >
            <LogOut className="w-3 h-3 sm:mr-1.5" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card 
            className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4 sm:p-6 cursor-pointer hover:border-green-500/50 transition-all"
            onClick={() => setActiveTab("tasks")}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-gray-400 text-xs sm:text-sm">Tarefas Concluídas</p>
                <p className="text-xl sm:text-3xl font-bold text-green-400 mt-1">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500/50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-gray-400 text-xs sm:text-sm">Produtividade</p>
                <p className="text-xl sm:text-3xl font-bold text-emerald-400 mt-1">
                  {Math.round(progressPercentage)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500/50" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-gray-400 text-xs sm:text-sm">Tempo Economizado</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-400 mt-1">
                  {timeSavedHours >= 1 ? `${timeSavedHours.toFixed(1)}h` : `${Math.round(timeSavedMinutes)}min`}
                </p>
              </div>
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500/50" />
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4 sm:p-6 cursor-pointer hover:border-purple-500/50 transition-all"
            onClick={() => setActiveTab("automations")}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-gray-400 text-xs sm:text-sm">Automações Ativas</p>
                <p className="text-xl sm:text-3xl font-bold text-purple-400 mt-1">{activeAutomations}</p>
              </div>
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500/50" />
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-white">Progresso Diário</h3>
            <span className="text-sm text-gray-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            onClick={() => setActiveTab("tasks")}
            variant={activeTab === "tasks" ? "default" : "outline"}
            size="sm"
            className={
              activeTab === "tasks"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-black font-semibold whitespace-nowrap"
                : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap"
            }
          >
            <Target className="w-4 h-4 mr-2" />
            Tarefas
          </Button>
          <Button
            onClick={() => setActiveTab("automations")}
            variant={activeTab === "automations" ? "default" : "outline"}
            size="sm"
            className={
              activeTab === "automations"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-black font-semibold whitespace-nowrap"
                : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap"
            }
          >
            <Zap className="w-4 h-4 mr-2" />
            Automações
          </Button>
          <Button
            onClick={() => setActiveTab("analytics")}
            variant={activeTab === "analytics" ? "default" : "outline"}
            size="sm"
            className={
              activeTab === "analytics"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-black font-semibold whitespace-nowrap"
                : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap"
            }
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Análises
          </Button>
          <Button
            onClick={() => setActiveTab("routine")}
            variant={activeTab === "routine" ? "default" : "outline"}
            size="sm"
            className={
              activeTab === "routine"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-black font-semibold whitespace-nowrap"
                : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 whitespace-nowrap"
            }
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Rotina IA
          </Button>
        </div>

        {/* Content */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Adicionar Nova Tarefa</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTask()}
                  placeholder="Digite uma nova tarefa..."
                  className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 flex-1"
                />
                <Button
                  onClick={addTask}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold w-full sm:w-auto"
                >
                  <Plus className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Adicionar</span>
                </Button>
              </div>
            </Card>

            {tasks.length === 0 ? (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8 sm:p-12">
                <div className="text-center">
                  <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
                    Nenhuma tarefa criada
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Adicione sua primeira tarefa acima para começar!
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-3 sm:p-4 hover:border-green-500/50 transition-all"
                  >
                    {editingTaskId === task.id ? (
                      // Modo de edição
                      <div className="space-y-3">
                        <Input
                          value={editingTaskTitle}
                          onChange={(e) => setEditingTaskTitle(e.target.value)}
                          className="bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
                          placeholder="Nome da tarefa"
                        />
                        <div className="flex items-center gap-2">
                          <Select
                            value={editingTaskDifficulty}
                            onValueChange={(value) => setEditingTaskDifficulty(value as Difficulty)}
                          >
                            <SelectTrigger className="bg-black border-gray-700 text-white flex-1">
                              <SelectValue placeholder="Dificuldade" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="FÁCIL" className="text-white hover:bg-gray-800">
                                FÁCIL
                              </SelectItem>
                              <SelectItem value="NORMAL" className="text-white hover:bg-gray-800">
                                NORMAL
                              </SelectItem>
                              <SelectItem value="DIFÍCIL" className="text-white hover:bg-gray-800">
                                DIFÍCIL
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={saveEditTask}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={cancelEditTask}
                            size="sm"
                            variant="outline"
                            className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Modo de visualização
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div 
                          className="flex-shrink-0 cursor-pointer"
                          onClick={() => toggleTask(task.id)}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm sm:text-base break-words ${
                              task.completed
                                ? "line-through text-gray-500"
                                : "text-white"
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          <div className="text-gray-400 hidden sm:block">
                            {getCategoryIcon(task.category)}
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getDifficultyColor(task.difficulty)} text-xs hidden sm:inline-flex`}
                          >
                            {task.difficulty}
                          </Badge>
                          <Button
                            onClick={() => startEditTask(task)}
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 sm:p-2"
                          >
                            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteTask(task.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 sm:p-2"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "automations" && (
          <div className="space-y-6">
            {/* Header Section */}
            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Automações Inteligentes ORION
                  </h2>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    Conecte seus módulos e deixe a IA trabalhar por você. Cada automação foi projetada para economizar tempo e aumentar sua produtividade.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      {activeAutomations} Ativas
                    </Badge>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                      {availableAutomations.length - activeAutomations} Disponíveis
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Botão + para adicionar automações */}
            <div className="relative">
              <Button
                onClick={() => setShowAutomationList(!showAutomationList)}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Adicionar Automação
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAutomationList ? 'rotate-180' : ''}`} />
              </Button>

              {/* Lista de automações disponíveis */}
              {showAutomationList && getAvailableAutomations().length > 0 && (
                <Card className="absolute top-full mt-2 left-0 right-0 sm:right-auto sm:w-full sm:max-w-md bg-gray-900 border-gray-700 p-4 z-50 max-h-96 overflow-y-auto">
                  <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Automações Disponíveis</h3>
                  <div className="space-y-2">
                    {getAvailableAutomations().map((automation) => {
                      const Icon = automation.icon
                      return (
                        <div
                          key={automation.id}
                          onClick={() => activateAutomation(automation.id)}
                          className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-750 rounded-lg cursor-pointer transition-all border border-gray-700 hover:border-green-500/50"
                        >
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${automation.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-xs sm:text-sm">{automation.title}</p>
                            <p className="text-gray-400 text-xs truncate">{automation.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}

              {showAutomationList && getAvailableAutomations().length === 0 && (
                <Card className="absolute top-full mt-2 left-0 right-0 sm:right-auto sm:w-full sm:max-w-md bg-gray-900 border-gray-700 p-4 z-50">
                  <p className="text-gray-400 text-xs sm:text-sm text-center">Todas as automações já estão ativas!</p>
                </Card>
              )}
            </div>

            {/* Automações Ativas */}
            {activeAutomationsList.length === 0 ? (
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8 sm:p-12">
                <div className="text-center">
                  <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
                    Nenhuma automação ativa
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Clique no botão "+" acima para adicionar sua primeira automação!
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {activeAutomationsList.map((automationId) => {
                  const automation = getAutomationById(automationId)
                  if (!automation) return null
                  
                  const Icon = automation.icon
                  return (
                    <Card
                      key={automation.id}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4 sm:p-6 hover:border-green-500/50 transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 sm:gap-4 mb-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${automation.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                            {automation.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400">
                            {automation.description}
                          </p>
                        </div>
                      </div>

                      {/* Trigger */}
                      <div className="mb-4 p-3 bg-black/30 rounded-lg border border-gray-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          <span className="text-xs font-semibold text-green-400 uppercase">
                            Gatilho
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300">
                          {automation.trigger}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                          <span className="text-xs font-semibold text-blue-400 uppercase">
                            Ações Automáticas
                          </span>
                        </div>
                        <div className="space-y-2">
                          {automation.actions.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-400 mt-1.5 sm:mt-2 flex-shrink-0" />
                              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                                {action}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Modules */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                          <span className="text-xs font-semibold text-purple-400 uppercase">
                            Módulos Integrados
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {automation.modules.map((module, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs"
                            >
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Benefit */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          <span className="text-xs font-semibold text-green-400 uppercase">
                            Benefício
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                          {automation.benefit}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          <Play className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                        <Button
                          onClick={() => deactivateAutomation(automation.id)}
                          size="sm"
                          variant="outline"
                          className="bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Excluir</span>
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "routine" && <SmartRoutine />}

        {activeTab === "analytics" && (
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Análise de Produtividade</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-base text-gray-300">Tarefas Completadas</span>
                  <span className="text-sm sm:text-base text-green-400 font-semibold">{completedTasks}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-base text-gray-300">Tarefas Pendentes</span>
                  <span className="text-sm sm:text-base text-yellow-400 font-semibold">{totalTasks - completedTasks}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"
                    style={{ width: `${100 - progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Estatísticas da Semana</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs sm:text-sm">Média Diária</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-400 mt-1">
                      {dailyAverage.toFixed(1)} tarefas
                    </p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs sm:text-sm">Tempo Médio</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">
                      {Math.round(averageTime)} min
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}