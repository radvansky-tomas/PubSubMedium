import { PubSub, Topic } from '@google-cloud/pubsub';
import { PublishOptions } from "@google-cloud/pubsub/build/src/publisher";
import { OrderMealMessage } from '../../model/order-meal-message';
import { OrderMealPubSubClient } from './order-meal-pub-sub-client';

// test settings and vars
const projectId = 'pub-sub-medium';
process.env.GCLOUD_PROJECT = projectId;
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

describe('Test EmailValidationPubSubClientV1', () => {

    test('sendMessage should publish JSON message on orderMeal TOPIC', async () => {
        const data: OrderMealMessage = {
            item: 'testItem',
            duration: 20
        };

        const pubSub: PubSub = new PubSub();
        const wrapped = new OrderMealPubSubClient({ pubSub: pubSub });

        const topicInstance = jest
            .spyOn(pubSub, 'topic')
            .mockImplementation((name: string, options: PublishOptions | undefined) => {
                return new Topic(pubSub, name, options);
            });

        const publishInstance = jest.spyOn(Topic.prototype, 'publishJSON').mockImplementation(() => {
            return data;
        });

        const res = await wrapped.sendMessage(data);

        expect(topicInstance).toHaveBeenCalled();
        expect(topicInstance).toHaveBeenCalledTimes(1);

        expect(publishInstance).toHaveBeenCalled();
        expect(publishInstance).toHaveBeenCalledTimes(1);

        expect(res).toMatchObject(data);
    });
});
