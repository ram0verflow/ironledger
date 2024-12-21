export interface WalletProvider {
    connect(): Promise<string>; // Returns address
    disconnect(): Promise<void>;
    signMessage(message: string): Promise<string>;
    signTransaction(tx: any): Promise<string>;
    getBalance(): Promise<number>;
    isConnected(): Promise<boolean>;
    getAddress(): Promise<string>;
}