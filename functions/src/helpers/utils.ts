export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function conditionCheck(conditionIsMet: () => Promise<boolean>, timeout: number = 5000) {
    return new Promise(resolve => {
        // For instance, check every 100ms
        let currentInterval = 0;
        const intervalId = setInterval(async () => {
            if (currentInterval + 100 >= timeout) {
                clearInterval(intervalId);
                resolve(true);
            }
            if (await conditionIsMet()) {
                clearInterval(intervalId);
                resolve(false);
            }
            currentInterval += 100;
        }, 100);
    });
}