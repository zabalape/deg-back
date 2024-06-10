'use strict';

/**
 * orden controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::orden.orden', ({strapi}) => ({
    async createCoreController(ctx) {
        const { data } = ctx.request.body
        try {
            const orden = await strapi.service('api::orden.orden').create({data})
            const payment = await strapi.service('api::mercado-pago.mercado-pago').crearPago(orden);

            await strapi.service('api::estado-de-pago.estado-de-pago').create({
                data: {
                    orden: orden.slug,
                    estadp: payment.status,
                    pago: payment.status === 'approved',
                    metodo_de_pago: payment.payment_method_id,
                    mp_alias: payment.payment_method_id,
                    mp_status: payment.status
                },
            })
            return {orden, payment}
        } catch (error) {
            strapi.log.error('Error creando orden', error)
            ctx.throw(500, 'Error creando Orden')
        }
    }
}))