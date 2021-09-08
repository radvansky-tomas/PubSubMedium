import { EventContext } from "firebase-functions";
import { allowedToExecute } from "./retry-check";


describe('Retry function tests', () => {

    let evt: EventContext;

    it('should allow if event is new', () => {

        const d = new Date();
        const rfc3999Date = ISODateString(d);

        evt = {
            timestamp: rfc3999Date
        } as EventContext

        expect(allowedToExecute(evt)).toBe(true);

    });

    it('should deny if event is old', () => {

        const d = new Date();
        d.setDate(d.getDate() - 5);

        const rfc3999Date = ISODateString(d);

        evt = {
            timestamp: rfc3999Date
        } as EventContext

        expect(allowedToExecute(evt)).toBe(false);

    });



})


function ISODateString(d: Date) {
    function pad(n: any) {
        return n < 10 ? '0' + n : n
    }

    return d.getUTCFullYear() + '-'
        + pad(d.getUTCMonth() + 1) + '-'
        + pad(d.getUTCDate()) + 'T'
        + pad(d.getUTCHours()) + ':'
        + pad(d.getUTCMinutes()) + ':'
        + pad(d.getUTCSeconds()) + 'Z'
}

