import { ref, set,runTransaction  } from 'firebase/database';
import { db } from '../firebase';

/**
 * Initialize the order counter (run once)
 * @param {number} startingNumber - First order number (e.g., 100000)
 */
export const initializeOrderCounter = async (startingNumber = 100000) => {
    try {
        await set(ref(db, 'counters/orders'), startingNumber);
        console.log(`Counter initialized to ${startingNumber}`);
    } catch (error) {
        console.error("Failed to initialize counter:", error);
        throw error;
    }
};

export const getNextOrderNumber = async () => {
    const counterRef = ref(db, 'counters/orders');

    try {
        const { snapshot } = await runTransaction(counterRef, (currentValue) => {
            if (currentValue === null) {
                throw new Error("Order counter not initialized - run initializeOrderCounter() first");
            }
            return currentValue + 1;
        });

        return snapshot.val();
    } catch (error) {
        console.error("Failed to generate order number:", error);
        throw error;
    }
};