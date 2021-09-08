import { EventContext } from "firebase-functions";

/**
 * This function checks the age of an event and is used retry events
 * @param event
 */
export function allowedToExecute(event: EventContext): boolean {

    const eventAge = Date.now() - Date.parse(event.timestamp);
    const eventMaxAge = 30000; // 30 secs

    // Ignore events that are too old
    if (eventAge > eventMaxAge) {
        console.log(`Dropping event ${event} with age ${eventAge} ms.`);
        return false;
    }

    console.log(`Processing event ${event} with age ${eventAge} ms.`);
    return true;

}