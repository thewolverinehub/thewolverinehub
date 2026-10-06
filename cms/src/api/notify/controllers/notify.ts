import { passwordResetEmail, sendEmail, welcomeEmail } from '../../../utils/email';

/** Small server-to-server helpers so every email is sent (or logged) from one place — the CMS. */
export default {
  /** POST /api/notify/welcome { userId } */
  async welcome(ctx: any) {
    const user = await (strapi.db as any).query('plugin::users-permissions.user').findOne({ where: { id: Number(ctx.request.body?.userId) } });
    if (!user) { ctx.status = 404; ctx.body = { error: { message: 'User not found.' } }; return; }
    ctx.body = await sendEmail(strapi, welcomeEmail(user.fullName || user.username, user.email));
  },

  /** POST /api/notify/password-reset { email, name, link } */
  async passwordReset(ctx: any) {
    const { email, name, link } = ctx.request.body ?? {};
    if (!email || !link) { ctx.status = 400; ctx.body = { error: { message: 'email and link are required.' } }; return; }
    ctx.body = await sendEmail(strapi, passwordResetEmail(String(name || 'there'), String(email), String(link)));
  },
};
