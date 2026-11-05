import net from 'node:net';
import tls from 'node:tls';

type SMTPConnection = net.Socket | tls.TLSSocket;

class SMTPChannel {
  private buffer = '';
  private waiters: Array<{ resolve: (value: string) => void; reject: (error: Error) => void }> = [];
  private readonly onData = (chunk: Buffer) => {
    this.buffer += chunk.toString('utf8');
    this.flush();
  };
  private readonly onError = (error: Error) => {
    this.waiters.splice(0).forEach((waiter) => waiter.reject(error));
  };

  constructor(public socket: SMTPConnection) {
    socket.on('data', this.onData);
    socket.on('error', this.onError);
  }

  public detach() {
    this.socket.off('data', this.onData);
    this.socket.off('error', this.onError);
  }

  private flush() {
    if (this.waiters.length === 0) return;
    const lines = this.buffer.split(/\r?\n/);
    let finalIndex = -1;
    for (let index = 0; index < lines.length; index++) {
      if (/^\d{3} /.test(lines[index])) finalIndex = index;
    }
    if (finalIndex < 0) return;
    const finalLine = lines[finalIndex];
    const consumed = this.buffer.indexOf(finalLine) + finalLine.length;
    const response = this.buffer.slice(0, consumed);
    this.buffer = this.buffer.slice(consumed).replace(/^\r?\n/, '');
    this.waiters.shift()?.resolve(response);
    this.flush();
  }

  readReply(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.waiters.push({ resolve, reject });
      this.flush();
    });
  }

  async command(value: string, expected: number[]): Promise<string> {
    this.socket.write(`${value}\r\n`);
    const reply = await this.readReply();
    const code = Number(reply.trim().split(/\r?\n/).at(-1)?.slice(0, 3));
    if (!expected.includes(code)) throw new Error(`SMTP command failed (${code}): ${reply.trim()}`);
    return reply;
  }
}

export class EmailService {
  public isConfigured(): boolean {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM);
  }

  public async sendCodeChefReminder(to: string, name: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('[Reminder] SMTP is not configured. CodeChef reminder was not sent.');
      return false;
    }

    const host = process.env.SMTP_HOST!;
    const port = Number(process.env.SMTP_PORT || (process.env.SMTP_SECURE === 'true' ? 465 : 587));
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const username = process.env.SMTP_USER!;
    const password = process.env.SMTP_PASS!;
    const from = process.env.MAIL_FROM!;
    const fromAddress = from.match(/<([^>]+)>/)?.[1] || from;
    const helo = process.env.SMTP_HELO || 'careerpilotx.local';

    let channel: SMTPChannel;
    if (secure) {
      const socket = tls.connect({ host, port, servername: host });
      channel = new SMTPChannel(socket);
      await new Promise<void>((resolve, reject) => {
        socket.once('secureConnect', resolve);
        socket.once('error', reject);
      });
      await channel.readReply();
    } else {
      const raw = net.connect({ host, port });
      await new Promise<void>((resolve, reject) => {
        raw.once('connect', resolve);
        raw.once('error', reject);
      });
      channel = new SMTPChannel(raw);
      await channel.readReply();
      await channel.command(`EHLO ${helo}`, [250]);
      await channel.command('STARTTLS', [220]);
      channel.detach();

      const secureSocket = tls.connect({ socket: raw, servername: host });
      channel = new SMTPChannel(secureSocket);
      await new Promise<void>((resolve, reject) => {
        secureSocket.once('secureConnect', resolve);
        secureSocket.once('error', reject);
      });
    }

    try {
      await channel.command(`EHLO ${helo}`, [250]);
      await channel.command('AUTH LOGIN', [334]);
      await channel.command(Buffer.from(username).toString('base64'), [334]);
      await channel.command(Buffer.from(password).toString('base64'), [235]);
      await channel.command(`MAIL FROM:<${fromAddress}>`, [250]);
      await channel.command(`RCPT TO:<${to}>`, [250, 251]);
      await channel.command('DATA', [354]);

      const body = [
        `Hi ${name},`,
        '',
        'Your CareerPilot X reminder: CodeChef Starters takes place on Wednesday.',
        'Take a little time to review your DSA patterns and get ready for the contest.',
        '',
        'Keep learning, keep practicing.',
        'CareerPilot X',
      ].join('\r\n');
      const message = [
        `From: ${from}`,
        `To: ${to}`,
        'Subject: CodeChef Starters is coming up this Wednesday',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        '',
        body,
        '.',
      ].join('\r\n');
      channel.socket.write(`${message}\r\n`);
      const dataReply = await channel.readReply();
      if (!dataReply.trim().startsWith('250')) throw new Error(`SMTP message rejected: ${dataReply.trim()}`);
      await channel.command('QUIT', [221]);
      channel.socket.end();
      return true;
    } catch (error) {
      channel.socket.destroy();
      throw error;
    }
  }
}

export const emailService = new EmailService();
