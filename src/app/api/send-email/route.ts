import { NextRequest, NextResponse } from 'next/server';
import { 
  sendWelcomeEmail,
  sendEventCreatedEmail,
  sendTaskReminderEmail,
  sendMeetingSummaryEmail,
  sendProductivityReportEmail,
  sendRescheduleNotificationEmail,
  sendCustomReminderEmail,
  sendEmailSummary,
  sendSocialPostScheduledEmail,
  sendDocumentSavedEmail,
  EmailType
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, ...data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: 'Tipo de e-mail e destinatário são obrigatórios' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type as EmailType) {
      case 'welcome':
        success = await sendWelcomeEmail(to, data.userName);
        break;

      case 'event_created':
        success = await sendEventCreatedEmail(
          to,
          data.eventTitle,
          data.eventDate,
          data.eventTime
        );
        break;

      case 'task_reminder':
        success = await sendTaskReminderEmail(to, data.taskTitle, data.dueTime);
        break;

      case 'meeting_summary':
        success = await sendMeetingSummaryEmail(
          to,
          data.meetingTitle,
          data.summary,
          data.actionItems || []
        );
        break;

      case 'productivity_report':
        success = await sendProductivityReportEmail(
          to,
          data.completedTasks,
          data.totalTasks,
          data.timeSpent,
          data.insights || []
        );
        break;

      case 'reschedule_notification':
        success = await sendRescheduleNotificationEmail(
          to,
          data.eventTitle,
          data.oldDate,
          data.newDate,
          data.reason
        );
        break;

      case 'custom_reminder':
        success = await sendCustomReminderEmail(
          to,
          data.title,
          data.message,
          data.priority || 'medium'
        );
        break;

      case 'email_summary':
        success = await sendEmailSummary(
          to,
          data.totalEmails,
          data.importantEmails || [],
          data.actionsNeeded || []
        );
        break;

      case 'social_post_scheduled':
        success = await sendSocialPostScheduledEmail(
          to,
          data.platform,
          data.postContent,
          data.scheduledTime
        );
        break;

      case 'document_saved':
        success = await sendDocumentSavedEmail(
          to,
          data.fileName,
          data.location,
          data.fileType
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de e-mail inválido' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'E-mail enviado com sucesso' 
      });
    } else {
      return NextResponse.json(
        { error: 'Falha ao enviar e-mail' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na API de e-mail:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
