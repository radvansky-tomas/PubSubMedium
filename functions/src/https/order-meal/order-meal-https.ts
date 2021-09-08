import * as functions from 'firebase-functions';
import { OrderMealMessage } from '../../model/order-meal-message';
import { OrderMealPubSubClient } from '../../pubsub/order-meal/order-meal-pub-sub-client';


export const orderMealHttps = functions.https.onRequest(async (request, response) => {
    if (request.method !== 'POST') {
        response.status(450).send(`Invalid method ${request.method}`);
        return;
    }

    if (!(typeof request.body.item === 'string') || request.body.item.length === 0) {
        response.status(412).send(`Missing payload  ${request.body}`);
        return;
    }

    const orderMealPubSubClient = new OrderMealPubSubClient();
    const orderMealMessage: OrderMealMessage = {
        item: request.body.item,
        duration: request.body.duration ?? 5, // default 5s
    }

    await orderMealPubSubClient.sendMessage(orderMealMessage);
    response.status(200).send('Msg Sent');
});