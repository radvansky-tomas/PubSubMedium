import * as functions from 'firebase-functions-test';
import * as admin from 'firebase-admin';
import * as mockito from 'ts-mockito';
import { pubsub } from 'firebase-functions';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import { CollectionReference, DocumentData, DocumentReference, Query, Transaction } from '@google-cloud/firestore';

import { OrderMealAction } from "./order-meal-action";
import { OrderMealMessage } from "../../model/order-meal-message";


// test settings and vars
const projectId = 'pub-sub-medium';
process.env.GCLOUD_PROJECT = projectId;

const testEnv = functions({
    projectId: projectId
});

describe('OrderMealAction()', () => {
    let mockedDb: admin.firestore.Firestore;
    let messageData: pubsub.Message;

    beforeAll(() => {
        /// This can only be called once
        const defaultApp = mockito.spy(admin.initializeApp());
        mockito.when(defaultApp).thenReturn();
    });

    beforeEach(async () => {
        // Clear all data
        mockedDb = mockito.spy(admin.firestore());
        mockito.resetCalls();
    });

    /// helper method to pass mocked instance into Service
    function getOrderMealAction() {
        const db = mockito.instance(mockedDb!);
        return new OrderMealAction(db);
    }

    describe('decodeMessage()', () => {

        test('should decode the incomming pubsub message', () => {
            const data = {
                item: 'testItem'
            } as OrderMealMessage;

            // use the test helpers to make a message
            messageData = testEnv.pubsub.makeMessage(data);

            const decoded = getOrderMealAction().decodeMessage(messageData.data);

            expect(decoded?.item).toBe(data.item);
        });

        test('should NULL for empty message', () => {
            const decoded = getOrderMealAction().decodeMessage('');
            expect(decoded).toBeNull();
        });

        test('should NULL for empty message', () => {
            const decoded = getOrderMealAction().decodeMessage();
            expect(decoded).toBeNull();
        });

        test('should RETURN newly created entry', async () => {
            const mockedOrdersRef = mockito.mock(CollectionReference) as CollectionReference<DocumentData>;
            const mockedOrderDocRef = mockito.mock(DocumentReference) as DocumentReference<DocumentData>;
            const mockedQuery = mockito.mock(Query) as Query<DocumentData>;

            const mockedCollectionInstance = mockito.instance(mockedOrdersRef);
            const mockedDocumentInstance = mockito.instance(mockedOrderDocRef);

            mockito.when(mockedDb.collection('Orders')).thenReturn(mockedCollectionInstance);
            //Returns empty new document
            mockito.when(mockedOrdersRef.doc()).thenReturn(mockedDocumentInstance);

            //Return future orders (expiry)
            mockito.when(mockedOrdersRef.where(mockito.anything(), mockito.anything(), mockito.anything())).thenReturn(mockito.instance(mockedQuery));
            mockito.when(mockedQuery.get()).thenCall(() => {
                return {
                    docs: []
                }
            });

            // Transactions handling
            const mockedTransaction = mockito.mock(Transaction);
            mockito.when(mockedDb.runTransaction(mockito.anything())).thenCall(() => {
                const [arg1] = mockito.capture<any, any>(mockedDb.runTransaction).last();
                return arg1(mockito.instance(mockedTransaction));
            });

            // Set entry in transaction
            mockito.when(mockedTransaction.set(mockito.anything(), mockito.anything())).thenCall(() => {
                return {
                    docs: []
                }
            });

            // Finally returns entry
            mockito.when(mockedOrderDocRef.get()).thenCall(() => {
                return {

                };
            });

            const data = {
                item: 'testItem',
                duration: 20
            } as OrderMealMessage;

            // use the test helpers to make a message
            messageData = testEnv.pubsub.makeMessage(data);
            try {
                const result = await getOrderMealAction().processAndSend(messageData);
                expect(result).not.toBeUndefined();
                expect(result).not.toBeNull();
            }
            catch (e) {
                console.log(e);
                fail('Should not error');
            }
        });

        test('should THROW deadline-exceeded for existing orders', async () => {
            const mockedOrdersRef = mockito.mock(CollectionReference) as CollectionReference<DocumentData>;
            const mockedOrderDocRef = mockito.mock(DocumentReference) as DocumentReference<DocumentData>;
            const mockedQuery = mockito.mock(Query) as Query<DocumentData>;

            const mockedCollectionInstance = mockito.instance(mockedOrdersRef);
            const mockedDocumentInstance = mockito.instance(mockedOrderDocRef);

            mockito.when(mockedDb.collection('Orders')).thenReturn(mockedCollectionInstance);
            //Returns empty new document
            mockito.when(mockedOrdersRef.doc()).thenReturn(mockedDocumentInstance);

            //Return future orders (expiry)
            mockito.when(mockedOrdersRef.where(mockito.anything(), mockito.anything(), mockito.anything())).thenReturn(mockito.instance(mockedQuery));
            mockito.when(mockedQuery.get()).thenCall(() => {
                return {
                    docs: [{

                    }]
                }
            });

            const data = {
                item: 'testItem',
                duration: 20
            } as OrderMealMessage;

            // use the test helpers to make a message
            messageData = testEnv.pubsub.makeMessage(data);
            try {
                await getOrderMealAction().processAndSend(messageData);
                fail('Should error');
            }
            catch (e) {
                expect(e).toBeInstanceOf(HttpsError);
                expect((e as HttpsError).code).toBe('deadline-exceeded')
            }
        });

        test('should THROW invalid argument for invalid message', async () => {

            messageData = testEnv.pubsub.makeMessage({});
            try {
                await getOrderMealAction().processAndSend(messageData);
                fail('Should throw');
            }
            catch (e) {
                expect(e).toBeInstanceOf(HttpsError);
                expect((e as HttpsError).code).toBe('invalid-argument')
            }
        });
    })

});