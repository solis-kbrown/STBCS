import { z } from 'zod';

const QUO_API_BASE = 'https://api.openphone.com/v1';

const MessageResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    object: z.string(),
    from: z.string(),
    to: z.array(z.string()),
    body: z.string().optional(),
    content: z.string().optional(),
    createdAt: z.string(),
    status: z.string().optional(),
  }).passthrough(),
});

const PhoneNumbersResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    object: z.string(),
    phoneNumber: z.string(),
    formattedPhoneNumber: z.string().optional(),
    name: z.string().optional(),
  }).passthrough()),
});

const CallsResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    object: z.string(),
    direction: z.enum(['incoming', 'outgoing']).optional(),
    status: z.string().optional(),
    duration: z.number().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    createdAt: z.string().optional(),
    answeredAt: z.string().optional(),
    completedAt: z.string().optional(),
    recordingUrl: z.string().optional(),
  }).passthrough()).optional(),
});

const ContactSchema = z.object({
  id: z.string(),
  object: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  emails: z.array(z.object({ value: z.string() })).optional(),
  phoneNumbers: z.array(z.object({ value: z.string() })).optional(),
  customFields: z.record(z.string()).optional(),
}).passthrough();

const ContactsResponseSchema = z.object({
  data: z.array(ContactSchema).optional(),
});

export class QuoService {
  private apiKey: string;
  private fromNumber: string;

  constructor() {
    const apiKey = process.env.QUO_API_KEY;
    if (!apiKey) {
      throw new Error('QUO_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
    this.fromNumber = '+18557821987';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${QUO_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Quo API error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  async getPhoneNumbers() {
    const response = await this.request<unknown>('/phone-numbers');
    return PhoneNumbersResponseSchema.parse(response);
  }

  async sendSMS(to: string, content: string, fromNumber?: string) {
    const toFormatted = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;
    
    const payload = {
      from: fromNumber || this.fromNumber,
      to: [toFormatted],
      content,
      setInboxStatus: 'done',
    };

    const response = await this.request<unknown>('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return MessageResponseSchema.parse(response);
  }

  async sendIncidentAlert(to: string, incidentType: string, details: string) {
    const message = `[STBCS ALERT] ${incidentType.toUpperCase()}\n\n${details}\n\nCall us: (855) STB-1987\nstoptbcs.com`;
    return this.sendSMS(to, message);
  }

  async sendWelcomeSMS(to: string, name?: string) {
    const greeting = name ? `Hi ${name}!` : 'Hello!';
    const message = `${greeting} Welcome to STB Cybersecurity. Our team is ready to help with incident response, ransomware recovery, and threat hunting.\n\n24/7 Hotline: (855) STB-1987\nstoptbcs.com`;
    return this.sendSMS(to, message);
  }

  async sendThreatAlert(to: string, threatType: string, severity: string, description: string) {
    const message = `[STBCS THREAT ALERT]\nType: ${threatType}\nSeverity: ${severity}\n\n${description}\n\nFor assistance: (855) STB-1987`;
    return this.sendSMS(to, message);
  }

  async getRecentCalls(phoneNumberId?: string, limit: number = 50) {
    const params = new URLSearchParams();
    if (phoneNumberId) params.set('phoneNumberId', phoneNumberId);
    params.set('maxResults', String(limit));
    
    const response = await this.request<unknown>(`/calls?${params.toString()}`);
    return CallsResponseSchema.parse(response);
  }

  async getContacts(limit: number = 100) {
    const params = new URLSearchParams();
    params.set('maxResults', String(limit));
    
    const response = await this.request<unknown>(`/contacts?${params.toString()}`);
    return ContactsResponseSchema.parse(response);
  }

  async createContact(contact: {
    firstName?: string;
    lastName?: string;
    company?: string;
    emails?: string[];
    phoneNumbers: string[];
  }) {
    const payload = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      emails: contact.emails?.map(e => ({ value: e })),
      phoneNumbers: contact.phoneNumbers.map(p => ({ value: p })),
    };

    const response = await this.request<unknown>('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return ContactSchema.parse(response);
  }

  async sendRansomwareAlert(to: string, groupName: string, victim: string, sector?: string) {
    const sectorInfo = sector ? `\nSector: ${sector}` : '';
    const message = `[STBCS RANSOMWARE ALERT]\nGroup: ${groupName}\nVictim: ${victim}${sectorInfo}\n\nNew attack detected. Monitor for potential supply chain impact.\n\nstoptbcs.com`;
    return this.sendSMS(to, message);
  }

  async sendCVEAlert(to: string, cveId: string, severity: string, description: string) {
    const message = `[STBCS CVE ALERT]\n${cveId}\nSeverity: ${severity}\n\n${description.slice(0, 200)}...\n\nPatch immediately if affected.\nstoptbcs.com`;
    return this.sendSMS(to, message);
  }
}

let quoServiceInstance: QuoService | null = null;

export function getQuoService(): QuoService {
  if (!quoServiceInstance) {
    quoServiceInstance = new QuoService();
  }
  return quoServiceInstance;
}

export function isQuoConfigured(): boolean {
  return !!process.env.QUO_API_KEY;
}
