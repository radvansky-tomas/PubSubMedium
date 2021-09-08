import * as admin from "firebase-admin";
import { HttpsError } from 'firebase-functions/lib/providers/https';
import { Message } from "firebase-functions/lib/providers/pubsub";
import { OrderMealMessage } from "../../model/order-meal-message";

export class OrderMealAction {
    readonly _db: admin.firestore.Firestore;

    constructor(firestore: admin.firestore.Firestore) {
        this._db = firestore;
    }

    async processAndSend(pubSubMessage: Message) {

        const decodedData = this.decodeMessage(pubSubMessage.data);
        if (decodedData !== undefined && decodedData !== null && decodedData.item) {
            const ordersRef = this._db.collection('Orders');
            const newOrderRef = ordersRef.doc();

            const futureTasksRef = ordersRef.where('expiry', '>', new Date(Date.now()));
            const futureTasksSnapshot = await futureTasksRef.get();
            if (futureTasksSnapshot.docs.length > 0) {
                throw new HttpsError('deadline-exceeded', `another order in progress`);
            }

            await this._db.runTransaction(async (tx) => {

                const currentTime = Date.now();
                const expiredTime = currentTime + (decodedData.duration * 1000);
                tx.set(newOrderRef, { item: decodedData.item, expiry: new Date(expiredTime) });
            });
            const savedItem = await newOrderRef.get();
            return savedItem;
        }
        else {
            throw new HttpsError('invalid-argument', `invalid message ${decodedData}`);
        }
    }

    decodeMessage(dataStr?: string): OrderMealMessage | null {
        // decode the body
        const messageBody = dataStr ? Buffer.from(dataStr, 'base64').toString() : null;

        if (messageBody === null) {
            return null; // exit
        }

        return JSON.parse(messageBody) as OrderMealMessage;
    }
}