import type { Server } from '../types';

// This is a mock service to simulate a real-time connection to a top-up provider.
class GarenaTopupCenter {
    /**
     * Simulates an API call to a Garena top-up service.
     * @param playerId The Free Fire player ID.
     * @param diamonds The number of diamonds to top up.
     * @param server The server ('BD' or 'IN').
     * @returns A promise that resolves with a transaction ID on success.
     * @throws An error on failure.
     */
    static async topup(playerId: string, diamonds: number, server: Server): Promise<{ transactionId: string }> {
        console.log(`[GarenaTopupCenter] Initiating top-up for Player ID: ${playerId} (${diamonds}💎) on ${server} server.`);
        
        // Simulate network delay
        await new Promise(res => setTimeout(res, 2500));

        // Simulate a high success rate
        const isSuccess = Math.random() > 0.05; // 95% success rate

        if (isSuccess) {
            const garenaTxId = `GARENA_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            console.log(`[GarenaTopupCenter] Top-up successful. Transaction ID: ${garenaTxId}`);
            return { transactionId: garenaTxId };
        } else {
            const errorMessage = "Invalid Player ID or server is busy. Please try again later.";
            console.error(`[GarenaTopupCenter] Top-up failed: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }
}

export default GarenaTopupCenter;
