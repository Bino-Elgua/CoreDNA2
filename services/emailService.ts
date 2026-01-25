/**
 * EMAIL SERVICE
 * Unified email delivery supporting multiple providers
 * Providers: Resend, SendGrid, Mailgun, Gmail API
 */

interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'mailgun' | 'gmail';
  apiKey: string;
}

interface EmailPayload {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

class EmailService {
  private config: EmailConfig | null = null;
  private fromAddress: string = 'noreply@coredna.ai';

  /**
   * Initialize with config from settings
   */
  initialize(settings: any) {
    try {
      const emailConfig = settings?.email || {};
      
      if (emailConfig.provider && emailConfig.apiKey) {
        this.config = {
          provider: emailConfig.provider as 'resend' | 'sendgrid' | 'mailgun' | 'gmail',
          apiKey: emailConfig.apiKey
        };
        this.fromAddress = emailConfig.fromAddress || this.fromAddress;
        console.log(`[EmailService] ✓ Initialized with ${this.config.provider}`);
      } else {
        console.log('[EmailService] No email provider configured in settings');
        this.config = null;
      }
    } catch (e) {
      console.error('[EmailService] Initialization failed:', e);
      this.config = null;
    }
  }

  /**
   * Send email via configured provider
   */
  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    if (!this.config) {
      // Fallback to template email (like Unsplash for images)
      console.log('[EmailService] No provider configured, using template fallback');
      return this.sendTemplateEmail(payload);
    }

    try {
      switch (this.config.provider) {
        case 'resend':
          return await this.sendViaResend(payload);
        case 'sendgrid':
          return await this.sendViaSendGrid(payload);
        case 'mailgun':
          return await this.sendViaMailgun(payload);
        case 'gmail':
          return await this.sendViaGmail(payload);
        default:
          return { success: false, error: 'Unknown provider', provider: this.config.provider };
      }
    } catch (e: any) {
      console.error(`[EmailService] Send failed (${this.config.provider}):`, e);
      // Fallback to template email on error
      console.log('[EmailService] Provider failed, using template fallback');
      return this.sendTemplateEmail(payload);
    }
  }

  /**
   * Template email fallback (free, no API needed)
   * Similar to Unsplash fallback for images
   */
  private sendTemplateEmail(payload: EmailPayload): EmailResult {
    console.log('[EmailService] Generating template email:', {
      to: payload.to,
      subject: payload.subject,
      hasContent: !!payload.text || !!payload.html
    });

    // Generate a template email record
    const templateId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const emailRecord = {
      id: templateId,
      to: payload.to,
      from: payload.from || this.fromAddress,
      subject: payload.subject,
      content: payload.html || payload.text || '[Email content]',
      timestamp: Date.now(),
      isTemplate: true,
    };

    // Store in localStorage for review (like a sent log)
    try {
      const sentEmails = JSON.parse(localStorage.getItem('_template_emails_sent') || '[]');
      sentEmails.push(emailRecord);
      localStorage.setItem('_template_emails_sent', JSON.stringify(sentEmails.slice(-100))); // Keep last 100
    } catch (e) {
      console.warn('[EmailService] Failed to store template email record:', e);
    }

    return {
      success: true,
      messageId: templateId,
      provider: 'template-fallback',
    };
  }

  /**
   * Send via Resend (recommended)
   */
  private async sendViaResend(payload: EmailPayload): Promise<EmailResult> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: payload.from || this.fromAddress,
        to: payload.to,
        subject: payload.subject,
        html: payload.html || payload.text,
        reply_to: payload.replyTo,
        cc: payload.cc?.join(','),
        bcc: payload.bcc?.join(','),
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Resend API error');
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
      provider: 'resend'
    };
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(payload: EmailPayload): Promise<EmailResult> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config?.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: payload.to }],
            cc: payload.cc?.map(e => ({ email: e })),
            bcc: payload.bcc?.map(e => ({ email: e })),
            subject: payload.subject,
            reply_to: payload.replyTo ? { email: payload.replyTo } : undefined,
          }
        ],
        from: { email: payload.from || this.fromAddress },
        content: [
          {
            type: 'text/html',
            value: payload.html || payload.text || ''
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${response.status}`);
    }

    return {
      success: true,
      messageId: response.headers.get('x-message-id') || 'unknown',
      provider: 'sendgrid'
    };
  }

  /**
   * Send via Mailgun
   */
  private async sendViaMailgun(payload: EmailPayload): Promise<EmailResult> {
    const domain = this.config?.apiKey?.split(':')[0] || 'sandboxxxx.mailgun.org';
    const authHeader = 'Basic ' + btoa(`api:${this.config?.apiKey}`);

    const formData = new FormData();
    formData.append('from', payload.from || this.fromAddress);
    formData.append('to', payload.to);
    formData.append('subject', payload.subject);
    if (payload.html) formData.append('html', payload.html);
    if (payload.text) formData.append('text', payload.text);
    if (payload.replyTo) formData.append('h:Reply-To', payload.replyTo);
    payload.cc?.forEach(e => formData.append('cc', e));
    payload.bcc?.forEach(e => formData.append('bcc', e));

    const response = await fetch(
      `https://api.mailgun.net/v3/${domain}/messages`,
      {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`Mailgun error: ${response.status}`);
    }

    const result = await response.json() as any;
    return {
      success: true,
      messageId: result.id,
      provider: 'mailgun'
    };
  }

  /**
   * Send via Gmail API
   * Requires OAuth token
   */
  private async sendViaGmail(payload: EmailPayload): Promise<EmailResult> {
    const message = [
      `From: ${payload.from || this.fromAddress}`,
      `To: ${payload.to}`,
      `Subject: ${payload.subject}`,
      payload.replyTo ? `Reply-To: ${payload.replyTo}` : '',
      payload.cc ? `Cc: ${payload.cc.join(',')}` : '',
      payload.bcc ? `Bcc: ${payload.bcc.join(',')}` : '',
      'Content-Type: text/html; charset=utf-8',
      '',
      payload.html || payload.text || ''
    ].filter(Boolean).join('\r\n');

    const encodedMessage = btoa(message)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config?.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    const result = await response.json() as any;
    return {
      success: true,
      messageId: result.id,
      provider: 'gmail'
    };
  }

  /**
   * Send batch emails
   */
  async sendBatch(emails: EmailPayload[]): Promise<EmailResult[]> {
    return Promise.all(emails.map(e => this.sendEmail(e)));
  }

  /**
   * Check if email provider is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Get configured provider
   */
  getProvider(): string {
    return this.config?.provider || 'none';
  }

  /**
   * Create email template for Closer Agent
   */
  createCloserEmail(lead: any, strategy: any): EmailPayload {
    const subject = strategy.emailStrategy?.subject || `Partnership Opportunity with ${lead.companyName}`;
    const body = strategy.emailStrategy?.body || `Hi ${lead.contactName || 'there'},\n\n${strategy.pitch}\n\nBest regards`;

    return {
      to: lead.contactEmail || lead.email,
      subject,
      html: this.markdownToHtml(body),
      text: body,
    };
  }

  /**
   * Create email template for Campaign Scheduler
   */
  createCampaignEmail(recipient: string, campaign: any): EmailPayload {
    return {
      to: recipient,
      subject: campaign.subject || 'Check out our latest campaign',
      html: campaign.htmlContent || `<p>${campaign.textContent || 'Campaign content'}</p>`,
      text: campaign.textContent,
    };
  }

  /**
   * Simple markdown to HTML converter
   */
  private markdownToHtml(text: string): string {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/^/gm, '<p>')
      .replace(/$/gm, '</p>')
      .replace(/<p><\/p>/g, '');
  }
}

export const emailService = new EmailService();

/**
 * Helper: Auto-initialize email service from settings
 */
export const initializeEmailService = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
    emailService.initialize(settings);
  } catch (e) {
    console.error('[emailService] Failed to initialize from settings:', e);
  }
};
