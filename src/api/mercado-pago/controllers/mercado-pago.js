'use strict';

/**
 * mercado-pago controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::mercado-pago.mercado-pago');


module.exports = {
  async webhook(ctx) {
    const { id } = ctx.request.body.data;

    try {
      // Verificar el pago en MercadoPago
      const payment = await strapi.service('api::mercado-pago.mercado-pago').verificarPago(id);

      // Actualizar el estado del pago en la base de datos
      await strapi.service('api::payment-status.payment-status').update({
        where: { order: payment.external_reference },
        data: {
          status: payment.status,
          paid: payment.status === 'approved',
          mp_status: payment.status,
        },
      });

      // Actualizar el estado del pedido
      await strapi.service('api::order.order').update({
        where: { id: payment.external_reference },
        data: {
          status: payment.status === 'approved' ? 'completed' : 'pending',
        },
      });

      ctx.send({ received: true });
    } catch (error) {
      strapi.log.error('Error processing webhook:', error);
      ctx.send({ error: 'Error processing webhook' }, 500);
    }
  },
};
