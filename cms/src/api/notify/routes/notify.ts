export default {
  routes: [
    { method: 'POST', path: '/notify/welcome', handler: 'notify.welcome', config: { policies: [] } },
    { method: 'POST', path: '/notify/password-reset', handler: 'notify.passwordReset', config: { policies: [] } },
  ],
};
