'use strict';

/**
 * mercado-pago service
 */

const mercadopago = require('mercadopago');

mercadopago.MercadoPagoConfig.accesToken = process.env.MERCADOPAGO_KEY
module.exports = {
    async crearPago(orden) {
        const datosDelPago = {
            transaction_amount: orden.total,
            description: `Orden: ${orden.slug}`,
            payment_method_id: orden.metodo_de_pago,
            payer: {
                email: orden.cliente_id.correo
            },
            external_reference: orden.slug
        }

        try {
            const payment = await mercadopago.Payment.create(datosDelPago)
            return payment.body
        } catch (error) {
            strapi.log.error(`Mercadopago error: ${error}`)
            throw new Error('Error creando el pago')
        }
        
    },

    async verificarPago(paymentId) {
        try{
            const payment = await mercadopago.Payment.findById(paymentId)
            return payment.body
        } catch (error) {
            strapi.log.error(`MercadoPago error: ${error}`)
            throw new Error('Error verificando el pago')
        }
    }
}