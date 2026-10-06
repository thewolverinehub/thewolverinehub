export default {
  routes: [
    { method: 'GET', path: '/payments/by-order/:orderId', handler: 'payment.byOrder', config: { policies: [] } },
    { method: 'POST', path: '/payments/:orderId/complete', handler: 'payment.complete', config: { policies: [] } },
    { method: 'POST', path: '/payments/:orderId/fail', handler: 'payment.fail', config: { policies: [] } },
  ],
};
