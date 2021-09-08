import * as functions from 'firebase-functions'
import { TOPIC_ORDER_MEAL } from '../../helpers/constants';
import { db } from '../../helpers/fb';
import { allowedToExecute } from '../../helpers/retry-check';
import { OrderMealAction } from './order-meal-action';


export const orderMealOnPublish = functions.runWith({ failurePolicy: true }).pubsub
    .topic(TOPIC_ORDER_MEAL)
    .onPublish(async (message, context) => {

        functions.logger.info('orderMealOnPublish: ', message, context);

        // RETRY CHECK
        if (!allowedToExecute(context)) {
            functions.logger.warn('orderMealOnPublish: failed allowedToExecute');
            return; // old do not retry
        }

        // get action class
        const action: OrderMealAction = new OrderMealAction(db());

        const result = await action.processAndSend(message);

        return result;

    });
