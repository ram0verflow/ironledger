export interface LightningProvider {
    createInvoice(amount: number, memo: string): Promise<string>;
    payInvoice(invoice: string): Promise<string>;
    checkPayment(paymentHash: string): Promise<boolean>;
}
export class LNbitsProvider implements LightningProvider {
    private apiKey: string;
    private apiUrl: string;

    constructor() {
        this.apiKey = process.env.LNBITS_API_KEY || '';
        this.apiUrl = process.env.LNBITS_API_URL || '';
    }

    async createInvoice(amount: number, memo: string): Promise<string> {
        // Implement LNbits invoice creation
        return 'invoice_here';
    }

    async payInvoice(invoice: string): Promise<string> {
        // Implement LNbits payment
        return 'payment_hash';
    }

    async checkPayment(paymentHash: string): Promise<boolean> {
        // Implement payment verification
        return true;
    }
}