"use client"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase, checkSupabaseConnection } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type Screen = "login" | "signup" | "forgot-password"

export default function Home() {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  // Signup state
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Forgot password state
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)

  // Função para enviar e-mail via API
  const sendEmailViaAPI = async (type: string, to: string, data: any) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          to,
          ...data
        })
      });

      if (!response.ok) {
        console.error('Erro ao enviar e-mail:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return false;
    }
  };

  // Função para salvar/atualizar perfil do usuário
  const saveUserProfile = async (userId: string, email: string, name?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          full_name: name || '',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (error) {
        console.error('Erro ao salvar perfil:', error)
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      // Verificar se Supabase está configurado
      checkSupabaseConnection()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Mensagens de erro mais amigáveis
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('E-mail ou senha incorretos. Verifique seus dados e tente novamente.')
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Por favor, confirme seu e-mail antes de fazer login.')
        } else {
          setErrorMessage(error.message)
        }
        return
      }

      // Salvar dados do usuário no banco
      if (data.user) {
        await saveUserProfile(
          data.user.id,
          data.user.email || email,
          data.user.user_metadata?.name
        )
      }

      // Redirecionar para dashboard
      router.push('/dashboard')
    } catch (error: any) {
      if (error.message.includes('Supabase não está configurado')) {
        setErrorMessage('Sistema não configurado. Por favor, conecte sua conta do Supabase nas Configurações do Projeto.')
      } else {
        setErrorMessage(error.message || "Erro ao fazer login. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    
    if (signupPassword !== confirmPassword) {
      setErrorMessage("As senhas não coincidem!")
      return
    }

    if (signupPassword.length < 8) {
      setErrorMessage("A senha deve ter no mínimo 8 caracteres")
      return
    }

    setLoading(true)

    try {
      // Verificar se Supabase está configurado
      checkSupabaseConnection()

      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name: signupName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        // Mensagens de erro mais amigáveis
        if (error.message.includes('User already registered')) {
          setErrorMessage('Este e-mail já está cadastrado. Faça login ou recupere sua senha.')
        } else if (error.message.includes('Password should be at least')) {
          setErrorMessage('A senha deve ter no mínimo 8 caracteres.')
        } else {
          setErrorMessage(error.message)
        }
        return
      }

      // Salvar dados do usuário no banco
      if (data.user) {
        await saveUserProfile(
          data.user.id,
          data.user.email || signupEmail,
          signupName
        )

        // Enviar e-mail de boas-vindas
        await sendEmailViaAPI('welcome', signupEmail, {
          userName: signupName || signupEmail.split('@')[0]
        });

        // Verificar se precisa confirmar email
        if (data.user.identities && data.user.identities.length === 0) {
          setErrorMessage("Verifique seu e-mail para confirmar a conta antes de fazer login.")
        } else {
          // Redirecionar para dashboard
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      if (error.message.includes('Supabase não está configurado')) {
        setErrorMessage('Sistema não configurado. Por favor, conecte sua conta do Supabase nas Configurações do Projeto.')
      } else {
        setErrorMessage(error.message || "Erro ao criar conta. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      // Verificar se Supabase está configurado
      checkSupabaseConnection()

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/dashboard`,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setResetSent(true)
    } catch (error: any) {
      if (error.message.includes('Supabase não está configurado')) {
        setErrorMessage('Sistema não configurado. Por favor, conecte sua conta do Supabase nas Configurações do Projeto.')
      } else {
        setErrorMessage(error.message || "Erro ao enviar e-mail de recuperação. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      // Verificar se Supabase está configurado
      checkSupabaseConnection()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
      }
    } catch (error: any) {
      if (error.message.includes('Supabase não está configurado')) {
        setErrorMessage('Sistema não configurado. Por favor, conecte sua conta do Supabase nas Configurações do Projeto.')
      } else {
        setErrorMessage(error.message || "Erro ao fazer login com Google. Tente novamente.")
      }
      setLoading(false)
    }
  }

  const handleAppleLogin = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      // Verificar se Supabase está configurado
      checkSupabaseConnection()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
      }
    } catch (error: any) {
      if (error.message.includes('Supabase não está configurado')) {
        setErrorMessage('Sistema não configurado. Por favor, conecte sua conta do Supabase nas Configurações do Projeto.')
      } else {
        setErrorMessage(error.message || "Erro ao fazer login com Apple. Tente novamente.")
      }
      setLoading(false)
    }
  }

  // Login Screen
  if (currentScreen === "login") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-black to-emerald-500/10 pointer-events-none" />
        
        <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl relative z-10">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <Sparkles className="w-8 h-8 text-black" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                ORION
              </h1>
              <p className="text-gray-400 text-sm">
                Seu Assistente Inteligente de Produtividade
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-300 font-semibold py-6 transition-all hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </Button>

              <Button
                onClick={handleAppleLogin}
                disabled={loading}
                variant="outline"
                className="w-full bg-black hover:bg-gray-900 text-white border-gray-600 font-semibold py-6 transition-all hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continuar com Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">ou</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 py-6"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 py-6"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-700 bg-black text-green-500 focus:ring-green-500/20"
                  />
                  Lembrar-me
                </label>
                <button
                  type="button"
                  onClick={() => setCurrentScreen("forgot-password")}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-6 text-base transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-400">
              Não tem uma conta?{" "}
              <button
                onClick={() => setCurrentScreen("signup")}
                className="text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                Criar conta
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Signup Screen
  if (currentScreen === "signup") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-black to-emerald-500/10 pointer-events-none" />
        
        <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl relative z-10">
          <div className="p-8 space-y-6">
            <button
              onClick={() => {
                setCurrentScreen("login")
                setErrorMessage("")
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <Sparkles className="w-8 h-8 text-black" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Criar Conta
              </h1>
              <p className="text-gray-400 text-sm">
                Comece sua jornada de produtividade
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                variant="outline"
                className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-300 font-semibold py-6 transition-all hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </Button>

              <Button
                onClick={handleAppleLogin}
                disabled={loading}
                variant="outline"
                className="w-full bg-black hover:bg-gray-900 text-white border-gray-600 font-semibold py-6 transition-all hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continuar com Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">ou</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-gray-300">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10 bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 py-6"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-300">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10 bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 py-6"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10 pr-10 bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 py-6"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-300">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 py-6"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-6 text-base transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30"
              >
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-400">
              Já tem uma conta?{" "}
              <button
                onClick={() => {
                  setCurrentScreen("login")
                  setErrorMessage("")
                }}
                className="text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                Fazer login
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Forgot Password Screen
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-black to-emerald-500/10 pointer-events-none" />
      
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl relative z-10">
        <div className="p-8 space-y-6">
          <button
            onClick={() => {
              setCurrentScreen("login")
              setResetSent(false)
              setErrorMessage("")
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                <Lock className="w-8 h-8 text-black" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Recuperar Senha
            </h1>
            <p className="text-gray-400 text-sm">
              {resetSent 
                ? "Instruções enviadas para seu e-mail"
                : "Digite seu e-mail para receber instruções"}
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {!resetSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-300">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 bg-black border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 py-6"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-6 text-base transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30"
              >
                {loading ? "Enviando..." : "Enviar Instruções"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <p className="text-green-400 text-sm">
                  Enviamos um e-mail com instruções para redefinir sua senha. Verifique sua caixa de entrada e spam.
                </p>
              </div>

              <Button
                onClick={() => {
                  setCurrentScreen("login")
                  setResetSent(false)
                  setResetEmail("")
                  setErrorMessage("")
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-bold py-6 text-base transition-all hover:scale-[1.02] shadow-lg shadow-green-500/30"
              >
                Voltar ao Login
              </Button>

              <button
                onClick={() => setResetSent(false)}
                className="w-full text-center text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                Não recebeu? Reenviar e-mail
              </button>
            </div>
          )}

          <div className="text-center text-sm text-gray-400">
            Lembrou sua senha?{" "}
            <button
              onClick={() => {
                setCurrentScreen("login")
                setResetSent(false)
                setErrorMessage("")
              }}
              className="text-green-400 hover:text-green-300 font-semibold transition-colors"
            >
              Fazer login
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
