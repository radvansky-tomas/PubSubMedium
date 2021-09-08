import { PubSub } from "@google-cloud/pubsub";
import { logger } from 'firebase-functions';
import { TOPIC_ORDER_MEAL } from "../../helpers/constants";
import { OrderMealMessage } from "../../model/order-meal-message";

export class OrderMealPubSubClient {
    private pubSub: PubSub;

    constructor({ pubSub = new PubSub() } = {}) {
        this.pubSub = pubSub ?? new PubSub();
    }

    async sendMessage(data: OrderMealMessage): Promise<string> {
        logger.info('OrderMealPubSubClient.sendMessage: ', data);
        const topic = this.pubSub.topic(TOPIC_ORDER_MEAL);
        return await topic.publishJSON(data);
    }
}
