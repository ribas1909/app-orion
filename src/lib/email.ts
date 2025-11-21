import nodemailer from 'nodemailer';

// Configuração do transportador de e-mail com Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'orionnoreply25@gmail.com',
    pass: '0rionR&u2025'
  }
});

// Tipos de e-mail
export type EmailType = 
  | 'welcome'
  | 'event_created'
  | 'task_reminder'
  | 'meeting_summary'
  | 'productivity_report'
  | 'reschedule_notification'
  | 'custom_reminder'
  | 'email_summary'
  | 'social_post_scheduled'
  | 'document_saved';

// Interface para opções de e-mail
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
}

// Templates de e-mail
const emailTemplates = {
  welcome: (userName: string) => ({
    subject: 'Bem-vindo ao ORION! 🚀',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; font-size: 32px; margin: 0;">ORION</h1>
          <p style="color: #6b7280; margin-top: 10px;">Seu Assistente Inteligente de Produtividade</p>
        </div>
        
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #10b981;">
          <h2 style="color: #ffffff; margin-top: 0;">Olá, ${userName}! 👋</h2>
          <p style="color: #d1d5db; line-height: 1.6;">
            Seja bem-vindo ao <strong style="color: #10b981;">ORION</strong>, sua plataforma de automação inteligente!
          </p>
          <p style="color: #d1d5db; line-height: 1.6;">
            Estamos empolgados em tê-lo conosco. Com o ORION, você pode:
          </p>
          <ul style="color: #d1d5db; line-height: 1.8;">
            <li>✅ Automatizar tarefas repetitivas</li>
            <li>📅 Sincronizar calendários inteligentemente</li>
            <li>📧 Gerenciar e-mails automaticamente</li>
            <li>📊 Receber relatórios de produtividade</li>
            <li>🤖 E muito mais com IA!</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            Este é um e-mail automático do ORION. Não responda a esta mensagem.
          </p>
        </div>
      </div>
    `
  }),

  event_created: (eventTitle: string, eventDate: string, eventTime: string) => ({
    subject: `📅 Novo Evento Criado: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #3b82f6; margin-top: 0;">📅 Evento Criado Automaticamente</h2>
          <p style="color: #d1d5db; line-height: 1.6;">
            Um novo evento foi adicionado ao seu calendário:
          </p>
          <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #ffffff; margin-top: 0;">${eventTitle}</h3>
            <p style="color: #9ca3af; margin: 10px 0;">
              📆 <strong>Data:</strong> ${eventDate}
            </p>
            <p style="color: #9ca3af; margin: 10px 0;">
              🕐 <strong>Horário:</strong> ${eventTime}
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Este evento foi criado automaticamente a partir de um e-mail detectado pelo ORION.
          </p>
        </div>
      </div>
    `
  }),

  task_reminder: (taskTitle: string, dueTime: string) => ({
    subject: `⏰ Lembrete: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #f59e0b; margin-top: 0;">⏰ Lembrete de Tarefa</h2>
          <p style="color: #d1d5db; line-height: 1.6;">
            Você tem uma tarefa agendada:
          </p>
          <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #ffffff; margin-top: 0;">${taskTitle}</h3>
            <p style="color: #9ca3af; margin: 10px 0;">
              🕐 <strong>Horário:</strong> ${dueTime}
            </p>
          </div>
          <p style="color: #10b981; font-weight: bold;">
            ✨ Dica: Mantenha o foco e complete esta tarefa no horário planejado!
          </p>
        </div>
      </div>
    `
  }),

  meeting_summary: (meetingTitle: string, summary: string, actionItems: string[]) => ({
    subject: `📝 Resumo da Reunião: ${meetingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <h2 style="color: #8b5cf6; margin-top: 0;">📝 Resumo da Reunião</h2>
          <h3 style="color: #ffffff;">${meetingTitle}</h3>
          
          <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #10b981; margin-top: 0;">Resumo Executivo</h4>
            <p style="color: #d1d5db; line-height: 1.6;">${summary}</p>
          </div>
          
          ${actionItems.length > 0 ? `
            <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #f59e0b; margin-top: 0;">Ações Necessárias</h4>
              <ul style="color: #d1d5db; line-height: 1.8;">
                ${actionItems.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Este resumo foi gerado automaticamente pela IA do ORION.
          </p>
        </div>
      </div>
    `
  }),

  productivity_report: (completedTasks: number, totalTasks: number, timeSpent: string, insights: string[]) => ({
    subject: '📊 Seu Relatório Semanal de Produtividade',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #10b981;">
          <h2 style="color: #10b981; margin-top: 0;">📊 Relatório Semanal de Produtividade</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background: #111827; padding: 20px; border-radius: 6px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 14px;">Tarefas Concluídas</p>
              <p style="color: #10b981; font-size: 32px; font-weight: bold; margin: 10px 0;">${completedTasks}/${totalTasks}</p>
            </div>
            <div style="background: #111827; padding: 20px; border-radius: 6px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 14px;">Tempo Gasto</p>
              <p style="color: #3b82f6; font-size: 32px; font-weight: bold; margin: 10px 0;">${timeSpent}</p>
            </div>
          </div>
          
          <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #f59e0b; margin-top: 0;">💡 Insights da Semana</h4>
            <ul style="color: #d1d5db; line-height: 1.8;">
              ${insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
          </div>
          
          <p style="color: #10b981; font-weight: bold; text-align: center;">
            Continue assim! Você está no caminho certo! 🚀
          </p>
        </div>
      </div>
    `
  }),

  reschedule_notification: (eventTitle: string, oldDate: string, newDate: string, reason: string) => ({
    subject: `🔄 Reagendamento: ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <h2 style="color: #ef4444; margin-top: 0;">🔄 Evento Reagendado</h2>
          <p style="color: #d1d5db; line-height: 1.6;">
            O seguinte evento foi reagendado automaticamente:
          </p>
          
          <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #ffffff; margin-top: 0;">${eventTitle}</h3>
            <p style="color: #9ca3af; margin: 10px 0;">
              ❌ <strong>Data Anterior:</strong> <span style="text-decoration: line-through;">${oldDate}</span>
            </p>
            <p style="color: #10b981; margin: 10px 0;">
              ✅ <strong>Nova Data:</strong> ${newDate}
            </p>
            <p style="color: #9ca3af; margin: 10px 0;">
              📝 <strong>Motivo:</strong> ${reason}
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            O ORION reorganizou sua agenda automaticamente para otimizar seu tempo.
          </p>
        </div>
      </div>
    `
  }),

  custom_reminder: (title: string, message: string, priority: 'high' | 'medium' | 'low') => {
    const priorityColors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#3b82f6'
    };
    const priorityLabels = {
      high: '🔴 Alta Prioridade',
      medium: '🟡 Média Prioridade',
      low: '🔵 Baixa Prioridade'
    };
    
    return {
      subject: `${priorityLabels[priority]}: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
          <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid ${priorityColors[priority]};">
            <h2 style="color: ${priorityColors[priority]}; margin-top: 0;">🔔 Lembrete Personalizado</h2>
            <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #ffffff; margin-top: 0;">${title}</h3>
              <p style="color: #d1d5db; line-height: 1.6;">${message}</p>
              <p style="color: ${priorityColors[priority]}; font-weight: bold; margin-top: 15px;">
                ${priorityLabels[priority]}
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Este lembrete foi enviado pela IA do ORION baseado em seus padrões de trabalho.
            </p>
          </div>
        </div>
      `
    };
  },

  email_summary: (totalEmails: number, importantEmails: any[], actionsNeeded: string[]) => ({
    subject: '📬 Resumo Diário de E-mails',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #06b6d4;">
          <h2 style="color: #06b6d4; margin-top: 0;">📬 Resumo Diário de E-mails</h2>
          
          <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">Total de E-mails Recebidos</p>
            <p style="color: #06b6d4; font-size: 32px; font-weight: bold; margin: 10px 0;">${totalEmails}</p>
          </div>
          
          ${importantEmails.length > 0 ? `
            <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #f59e0b; margin-top: 0;">⭐ E-mails Importantes</h4>
              ${importantEmails.map(email => `
                <div style="border-bottom: 1px solid #374151; padding: 10px 0;">
                  <p style="color: #ffffff; margin: 5px 0; font-weight: bold;">${email.subject}</p>
                  <p style="color: #9ca3af; margin: 5px 0; font-size: 14px;">De: ${email.from}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${actionsNeeded.length > 0 ? `
            <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #ef4444; margin-top: 0;">⚡ Ações Necessárias</h4>
              <ul style="color: #d1d5db; line-height: 1.8;">
                ${actionsNeeded.map(action => `<li>${action}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }),

  social_post_scheduled: (platform: string, postContent: string, scheduledTime: string) => ({
    subject: `📱 Post Agendado no ${platform}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #ec4899;">
          <h2 style="color: #ec4899; margin-top: 0;">📱 Post Agendado com Sucesso</h2>
          
          <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #9ca3af; margin: 0 0 10px 0;">Plataforma: <strong style="color: #ffffff;">${platform}</strong></p>
            <p style="color: #9ca3af; margin: 0 0 10px 0;">Horário: <strong style="color: #10b981;">${scheduledTime}</strong></p>
            <div style="background: #000000; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <p style="color: #d1d5db; line-height: 1.6; margin: 0;">${postContent}</p>
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            O ORION agendou este post no horário ideal para máximo engajamento.
          </p>
        </div>
      </div>
    `
  }),

  document_saved: (fileName: string, location: string, fileType: string) => ({
    subject: `💾 Documento Salvo: ${fileName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; border-radius: 10px;">
        <div style="background: #1f2937; padding: 30px; border-radius: 8px; border-left: 4px solid #14b8a6;">
          <h2 style="color: #14b8a6; margin-top: 0;">💾 Documento Salvo Automaticamente</h2>
          
          <div style="background: #111827; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #ffffff; margin-top: 0;">📄 ${fileName}</h3>
            <p style="color: #9ca3af; margin: 10px 0;">
              📁 <strong>Local:</strong> ${location}
            </p>
            <p style="color: #9ca3af; margin: 10px 0;">
              📋 <strong>Tipo:</strong> ${fileType}
            </p>
          </div>
          
          <p style="color: #10b981; font-weight: bold;">
            ✅ Documento organizado e pronto para acesso!
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            O ORION salvou este documento automaticamente na pasta correta.
          </p>
        </div>
      </div>
    `
  })
};

// Função principal para enviar e-mail
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: '"ORION 🚀" <orionnoreply25@gmail.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail enviado com sucesso para ${options.to} (Tipo: ${options.type})`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return false;
  }
}

// Funções auxiliares para cada tipo de e-mail
export async function sendWelcomeEmail(to: string, userName: string) {
  const template = emailTemplates.welcome(userName);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'welcome'
  });
}

export async function sendEventCreatedEmail(to: string, eventTitle: string, eventDate: string, eventTime: string) {
  const template = emailTemplates.event_created(eventTitle, eventDate, eventTime);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'event_created'
  });
}

export async function sendTaskReminderEmail(to: string, taskTitle: string, dueTime: string) {
  const template = emailTemplates.task_reminder(taskTitle, dueTime);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'task_reminder'
  });
}

export async function sendMeetingSummaryEmail(to: string, meetingTitle: string, summary: string, actionItems: string[]) {
  const template = emailTemplates.meeting_summary(meetingTitle, summary, actionItems);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'meeting_summary'
  });
}

export async function sendProductivityReportEmail(to: string, completedTasks: number, totalTasks: number, timeSpent: string, insights: string[]) {
  const template = emailTemplates.productivity_report(completedTasks, totalTasks, timeSpent, insights);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'productivity_report'
  });
}

export async function sendRescheduleNotificationEmail(to: string, eventTitle: string, oldDate: string, newDate: string, reason: string) {
  const template = emailTemplates.reschedule_notification(eventTitle, oldDate, newDate, reason);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'reschedule_notification'
  });
}

export async function sendCustomReminderEmail(to: string, title: string, message: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  const template = emailTemplates.custom_reminder(title, message, priority);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'custom_reminder'
  });
}

export async function sendEmailSummary(to: string, totalEmails: number, importantEmails: any[], actionsNeeded: string[]) {
  const template = emailTemplates.email_summary(totalEmails, importantEmails, actionsNeeded);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'email_summary'
  });
}

export async function sendSocialPostScheduledEmail(to: string, platform: string, postContent: string, scheduledTime: string) {
  const template = emailTemplates.social_post_scheduled(platform, postContent, scheduledTime);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'social_post_scheduled'
  });
}

export async function sendDocumentSavedEmail(to: string, fileName: string, location: string, fileType: string) {
  const template = emailTemplates.document_saved(fileName, location, fileType);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    type: 'document_saved'
  });
}
