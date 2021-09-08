import * as functions from 'firebase-functions-test';
import { EventContext, pubsub } from 'firebase-functions';
import { orderMealOnPublish } from './order-meal-on-publish';
import { OrderMealMessage } from '../../model/order-meal-message';

// test settings and vars
const projectId = 'pub-sub-medium';
process.env.GCLOUD_PROJECT = projectId;
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

const testEnv = functions({
    projectId: projectId
});


describe('Function onPublish', () => {

    let messageData: pubsub.Message;
    let data: OrderMealMessage


    beforeEach(async () => {
        // Clear all data
        await testEnv.firestore.clearFirestoreData(projectId);
        data = {
            item: 'testItem',
            duration: 20
        } as OrderMealMessage;

        // use the test helpers to make a message
        messageData = testEnv.pubsub.makeMessage(data);
    });

    test('Integration test to trigger onPublish', async () => {
        const context: EventContext = {
            timestamp: Date().toString(),
            eventId: 'eventId',
            params: {},
            resource: { name: 'name', service: 'service' },
            eventType: 'eventType'
        }
        try {
            const result = await orderMealOnPublish(messageData, context);
            expect(result).not.toBeUndefined();
            expect(result).not.toBeNull();
        }
        catch (e) {
            console.log(e);
            fail('Should not error');
        }
    })

    test('Integration should fail', async () => {
        const context: EventContext = {
            timestamp: Date().toString(),
            eventId: 'eventId',
            params: {},
            resource: { name: 'name', service: 'service' },
            eventType: 'eventType'
        }
        try {
            await orderMealOnPublish(testEnv.pubsub.makeMessage({}), context);
            fail('should fail');
        }
        catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    })

    test('test old message should SKIP logic', async () => {
        const date = new Date(Date.now() - 30 * 60 * 1000);
        const context: EventContext = {
            timestamp: date.toString(),
            eventId: 'eventId',
            params: {},
            resource: { name: 'name', service: 'service' },
            eventType: 'eventType'
        }
        await orderMealOnPublish(messageData, context);
    })
});