/**
 * Custom booking endpoints. The "01-" prefix makes Strapi register these before the core
 * `/bookings/:id` routes so `mine` / `availability` are not swallowed as ids.
 * All of them are called server-to-server by the website with the API token.
 */
export default {
  routes: [
    { method: 'POST', path: '/bookings/reserve', handler: 'booking.reserve', config: { policies: [] } },
    { method: 'GET', path: '/bookings/mine', handler: 'booking.mine', config: { policies: [] } },
    { method: 'GET', path: '/bookings/availability', handler: 'booking.availability', config: { policies: [] } },
    { method: 'POST', path: '/bookings/run-reminders', handler: 'booking.runReminders', config: { policies: [] } },
    { method: 'POST', path: '/bookings/:documentId/cancel', handler: 'booking.cancel', config: { policies: [] } },
  ],
};
