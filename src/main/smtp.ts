import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean; // TLS
  user: string;
  pass: string;
  from?: string;
};

export function loadSmtpConfig(): SmtpConfig | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM } =
    process.env as Record<string, string | undefined>;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  const port = parseInt(SMTP_PORT, 10);
  if (Number.isNaN(port)) return null;

  const secure =
    (SMTP_SECURE || "").toLowerCase() === "true" || SMTP_SECURE === "1";

  return {
    host: SMTP_HOST,
    port,
    secure,
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: SMTP_FROM || undefined,
  };
}

export type EmailAttachment = {
  filename: string;
  path?: string;
  content?: Buffer | string;
};

export type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
};

export async function smtpEmailClient(
  opts: SendEmailOptions,
): Promise<{ messageId: string | null; error?: boolean }> {
  const cfg = loadSmtpConfig();
  if (!cfg) {
    console.warn(
      "SMTP: missing configuration in environment variables; skipping send",
    );
    return { error: true, messageId: null };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
    });

    const from = cfg.from || cfg.user;

    const mail = {
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        path: a.path,
        content: a.content,
      })),
    } as any;

    const info = await transporter.sendMail(mail);
    return { messageId: info.messageId };
  } catch (err) {
    console.error("sendEmail failed:", err);
    return { error: true, messageId: null };
  }
}
