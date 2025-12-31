import nodemailer from 'nodemailer';
import { Resend } from 'resend'; // Ensure you run: npm install resend
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Initialize Resend outside the handler to reuse the instance
const resend = new Resend(env.RESEND_API_KEY);

export async function POST({ request }) {
  try {
    const { recipient, summary, actionItems, pdfBase64, fileDetails } = await request.json();

    // --------- BASIC VALIDATION ----------
    if (!recipient || !summary) {
      throw new Error('Missing required email fields');
    }

    // Validation for credentials based on the selected sender
    if (env.MAIL_SENDER === 'resend') {
      if (!env.RESEND_API_KEY) throw new Error('Resend API key is not configured');
    } else {
      if (!env.GMAIL_ADDRESS || !env.GMAIL_APP_PASSWORD) {
        throw new Error('Gmail credentials are not configured');
      }
    }

    // --------- FIX: Clean base64 PDF ----------
    const cleanPdfBase64 =
      typeof pdfBase64 === 'string' && pdfBase64.includes(',')
        ? pdfBase64.split(',')[1]
        : pdfBase64;

    // --------- FORMAT ACTION ITEMS ----------
    let actionItemsHtml = '';
    if (Array.isArray(actionItems) && actionItems.length > 0) {
      const listItems = actionItems
        .map((item) => {
          const text =
            typeof item === 'object' && item !== null
              ? item.task ||
                item.text ||
                item.content ||
                item.description ||
                JSON.stringify(item)
              : item;

          return `<li style="margin-bottom: 10px; color: #334155;">${text}</li>`;
        })
        .join('');

      actionItemsHtml = `
        <div style="margin-top: 25px; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h3 style="color: #6366f1; margin-top: 0; font-size: 18px;">✅ Key Action Items</h3>
          <ul style="padding-left: 20px; margin-bottom: 0;">${listItems}</ul>
        </div>
      `;
    }

    // --------- FORMAT FILE DETAILS ----------
    const detailsHtml = fileDetails ? `
      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 12px; margin-bottom: 25px; font-size: 13px; color: #475569;">
        <p style="margin: 0 0 5px 0;"><strong>Meeting Type:</strong> ${fileDetails.meeting_type || 'General'}</p>
        <p style="margin: 0 0 5px 0;"><strong>File Name:</strong> ${fileDetails.name || 'N/A'}</p>
        <p style="margin: 0 0 5px 0;"><strong>Duration:</strong> ${fileDetails.duration || 'N/A'}</p>
        ${fileDetails.rep_id ? `<p style="margin: 0;"><strong>Report ID:</strong> #${fileDetails.rep_id}</p>` : ''}
      </div>
    ` : '';

    // --------- EMAIL TEMPLATE ----------
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #1e293b; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 16px;">
        <h1 style="color: #6366f1; text-align: center;">Meeting Insights</h1>
        
        ${detailsHtml}

        <h3 style="border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #0f172a;">Summary</h3>
        <p style="line-height: 1.6; white-space: pre-wrap; color: #334155;">${summary}</p>

        ${actionItemsHtml}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px;">
            The full visual dashboard with analysis charts is attached as a PDF.
          </p>
        </div>
      </div>
    `;

    // Dynamic Subject and Filename using the Filename
    const displayTitle = fileDetails?.name || fileDetails?.meeting_type || 'General Meeting';
    const subject = `Meeting Analysis: ${displayTitle} (${new Date().toLocaleDateString()})`;
    const cleanFileName = displayTitle.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_');
    const filename = `${cleanFileName}_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

    // --------- CONDITIONAL LOGIC: RESEND VS NODEMAILER ----------
    if (env.MAIL_SENDER === 'resend') {
      const { error } = await resend.emails.send({
        from: 'MeetLens AI <reports@reports.tifflo.in>',
        to: recipient,
        subject: subject,
        html: emailHtml,
        attachments: [
          {
            filename: filename,
            content: cleanPdfBase64,
          }
        ]
      });

      if (error) throw error;
    } else {
      // --------- SMTP TRANSPORT (NODEMAILER) ----------
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: env.GMAIL_ADDRESS,
          pass: env.GMAIL_APP_PASSWORD
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000
      });

      await transporter.sendMail({
        from: `"MeetLens AI" <${env.GMAIL_ADDRESS}>`,
        to: recipient,
        subject: subject,
        html: emailHtml,
        attachments: [
          {
            filename: filename,
            content: cleanPdfBase64,
            encoding: 'base64'
          }
        ]
      });
    }

    return json({ success: true });
  } catch (err) {
    console.error('EMAIL ERROR:', err);
    return json(
      {
        success: false,
        error: err.message || 'Internal Server Error'
      },
      { status: 500 }
    );
  }
}