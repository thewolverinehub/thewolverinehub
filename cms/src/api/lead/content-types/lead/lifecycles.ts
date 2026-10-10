import { contactAckEmail, contactLeadEmail, sendEmail } from '../../../../utils/email';

/**
 * Every contact-form submission is saved as a Lead (visible in the Strapi admin). On top of that:
 *  - the business gets a "New enquiry" email (to CONTACT_NOTIFY_EMAIL, else the email set in Global)
 *  - the visitor gets a short "we got your message" email
 * Until a real email provider is connected both are only recorded in the Email Log.
 */
export default {
  async afterCreate(event: any) {
    const lead = event.result;
    if (!lead || lead.formKey !== 'contact') return;
    try {
      let to = process.env.CONTACT_NOTIFY_EMAIL || '';
      if (!to) {
        const global: any = await strapi.documents('api::global.global').findFirst({ status: 'published' } as any).catch(() => null);
        to = global?.email || '';
      }
      const data = {
        name: String(lead.name ?? ''),
        email: String(lead.email ?? ''),
        phone: lead.phone || undefined,
        topic: lead.topic || undefined,
        prefer: lead.preferredContact || undefined,
        message: lead.message || undefined,
        receivedAt: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' }) + ' (Sri Lanka time)',
      };
      if (to) await sendEmail(strapi, contactLeadEmail(to, data));
      if (data.email) await sendEmail(strapi, contactAckEmail(data));
    } catch (err: any) {
      strapi.log.error(`[lead] notification failed: ${err?.message ?? err}`);
    }
  },
};
