import * as functions from 'firebase-functions-test';
import { db } from '../../helpers/fb';
import { conditionCheck } from '../../helpers/utils';
import { orderMealHttps } from './order-meal-https';


// test settings and vars
const projectId = 'pub-sub-medium';
process.env.GCLOUD_PROJECT = projectId;
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085';

const testEnv = functions({
    projectId: projectId,
});

describe('Test orderMealHttps', () => {
    beforeAll(async () => {
        // Clear all data
        await testEnv.firestore.clearFirestoreData(projectId);
    });

    test('Should return status 450 if other than POST', async () => {
        let response;
        let responseStatus;
        const res: any = {
            send: (resp: string) => {
                response = resp;
            },
            status: (status: number) => {
                responseStatus = status;
                return {
                    send: (resp: string) => {
                        response = resp;
                    },
                }
            },
        };

        const req: any = {
            method: 'GET',
            body: {
                item: 'testItem'
            }
        };
        const spy = jest.spyOn(res, 'status');
        await orderMealHttps(req, res);

        expect(spy).toHaveBeenCalled();
        expect(responseStatus).toBe(450);
        expect(response).not.toBeUndefined();
        expect(response).not.toBeNull();
    });

    test('Should return status 412 if missing item in payload', async () => {
        let response;
        let responseStatus;
        const res: any = {
            send: (resp: string) => {
                response = resp;
            },
            status: (status: number) => {
                responseStatus = status;
                return {
                    send: (resp: string) => {
                        response = resp;
                    },
                }
            },
        };

        const req: any = {
            method: 'POST',
            body: {
            }
        };
        const spy = jest.spyOn(res, 'status');
        await orderMealHttps(req, res);

        expect(spy).toHaveBeenCalled();
        expect(responseStatus).toBe(412);
        expect(response).not.toBeUndefined();
        expect(response).not.toBeNull();
    });

    test('Test record is written', async () => {
        let response;
        let responseStatus;
        const res: any = {
            send: (resp: string) => {
                response = resp;
            },
            status: (status: number) => {
                responseStatus = status;
                return {
                    send: (resp: string) => {
                        response = resp;
                    },
                }
            },
        };

        const req: any = {
            method: 'POST',
            body: {
                item: 'testItem'
            }
        };
        const spy = jest.spyOn(res, 'status');
        await orderMealHttps(req, res);

        expect(spy).toHaveBeenCalled();
        expect(response).toBe('Msg Sent');
        expect(responseStatus).toBe(200);
        let snapshot: FirebaseFirestore.QuerySnapshot | undefined;

        const timedOut = await conditionCheck(async () => {
            // check record - sometmes you might not do this but is to show you can
            snapshot = await db().collection('Orders').get();
            return snapshot.docs.length === 1;
        }, 3000);


        if (!timedOut && snapshot) {
            expect(snapshot.docs.length).toBe(1);
            const data = snapshot.docs[0].data();
            expect(data.item).toBe('testItem');
        }
        else {
            fail('Trigger timed out');
        }

    });

    // Retry is not supported with firebase emulator
    // https://github.com/firebase/firebase-tools/issues/3738
    // jest.setTimeout(12000);
    test.skip('Test 2 records are written using RETRY', async () => {

        let response;
        let responseStatus;
        const res: any = {
            send: (resp: string) => {
                response = resp;
            },
            status: (status: number) => {
                responseStatus = status;
                return {
                    send: (resp: string) => {
                        response = resp;
                    },
                }
            },
        };

        const req: any = {
            method: 'POST',
            body: {
                item: 'testItem'
            }
        };
        const spy = jest.spyOn(res, 'status');

        await orderMealHttps(req, res);
        await orderMealHttps(req, res);

        expect(spy).toHaveBeenCalled();
        expect(response).toBe('Msg Sent');
        expect(responseStatus).toBe(200);
        let snapshot: FirebaseFirestore.QuerySnapshot | undefined;

        const timedOut = await conditionCheck(async () => {
            // check record - sometmes you might not do this but is to show you can
            snapshot = await db().collection('Orders').get();
            return snapshot.docs.length === 2;
        }, 10000);


        if (!timedOut && snapshot) {
            expect(snapshot.docs.length).toBe(1);
            const data = snapshot.docs[0].data();
            expect(data.item).toBe('testItem');
        }
        else {
            fail('Trigger timed out');
        }

    });
});
