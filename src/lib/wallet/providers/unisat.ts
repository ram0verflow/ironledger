import { BaseWalletProvider } from './base';

export class UnisatWalletProvider extends BaseWalletProvider {
    async connect(): Promise<string> {
        if (typeof window === 'undefined' || !window.unisat) {
            throw new Error('Unisat wallet not found');
        }

        try {
            const accounts = await window.unisat.requestAccounts();
            this.address = accounts[0];
            this.connected = true;
            return this.address;
        } catch (error) {
            console.error('Error connecting to Unisat:', error);
            throw error;
        }
    }

    // Implement other required methods
    // ...
}
