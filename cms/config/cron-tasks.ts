import { sendDayBeforeReminders } from '../src/utils/booking';

/**
 * Scheduled jobs. They only run when ENABLE_CRON=true (set it on the Railway CMS service ONLY —
 * local dev shares the same database, so running it there too would double-process reminders).
 */
export default {
  /** 18:00 Sri Lanka time every day: email everyone booked in for tomorrow. */
  bookingReminders: {
    task: async ({ strapi }: { strapi: any }) => {
      await sendDayBeforeReminders(strapi);
    },
    options: { rule: '0 18 * * *', tz: 'Asia/Colombo' },
  },
};
