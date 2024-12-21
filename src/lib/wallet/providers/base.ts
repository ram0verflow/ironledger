import { WalletProvider } from "../types";

export abstract class BaseWalletProvider implements WalletProvider {
    protected connected: boolean = false;
    protected address: string = '';

    abstract connect(): Promise<string>;
    abstract disconnect(): Promise<void>;
    abstract signMessage(message: string): Promise<string>;
    abstract signTransaction(tx: any): Promise<string>;
    abstract getBalance(): Promise<number>;

    async isConnected(): Promise<boolean> {
        return this.connected;
    }

    async getAddress(): Promise<string> {
        return this.address;
    }
}