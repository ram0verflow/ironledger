// src/lib/blockchain/bitcoin-service.ts
import { networks, payments, Psbt, Signer } from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';

const ECPair = ECPairFactory(ecc);

export interface BitcoinConfig {
    network: 'mainnet' | 'testnet';
    apiKey?: string;
    mempoolUrl?: string;
}

export class BitcoinService {
    private network: networks.Network;
    private mempoolUrl: string;

    constructor(config: BitcoinConfig) {
        this.network = config.network === 'mainnet' ? networks.bitcoin : networks.testnet;
        this.mempoolUrl = config.mempoolUrl || 'https://mempool.space/api';

    }
    async publishUpdate(updateData: string): Promise<string> {
        try {
            const psbt = new Psbt({ network: this.network });

            // Add inputs...

            // Add OP_RETURN output with update data
            psbt.addOutput({
                script: payments.embed({
                    data: [Buffer.from(updateData)]
                }).output!,
                value: 0
            });

            // Rest of transaction building...
            return txId;
        } catch (error) {
            console.error('Error publishing update:', error);
            throw error;
        }
    }

    async publishIPFSHash(ipfsHash: string, privateKey: string): Promise<string> {
        try {
            const keyPair = ECPair.fromWIF(privateKey, this.network);
            const signer: Signer = {
                publicKey: Buffer.from(keyPair.publicKey),
                sign: (hash: Buffer): Buffer => {
                    return Buffer.from(keyPair.sign(hash));
                }
            }
            const { address } = payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey), network: this.network });
            console.log(address)
            // Get UTXOs for the address
            const utxos = await this.getUTXOs(address!);
            if (!utxos.length) throw new Error('No UTXOs available');

            // Create transaction with OP_RETURN
            const psbt = new Psbt({ network: this.network });

            // Add input
            psbt.addInput({
                hash: utxos[0].txid,
                index: utxos[0].vout,
                witnessUtxo: {
                    script: payments.p2wpkh({ pubkey: Buffer.from(keyPair.publicKey), network: this.network }).output!,
                    value: utxos[0].value,
                },
            });

            // Add OP_RETURN output with IPFS hash
            psbt.addOutput({
                script: payments.embed({ data: [Buffer.from(ipfsHash)] }).output!,
                value: 0,
            });

            // Add change output (implement proper fee calculation in production)
            const fee = 1000; // Example fee
            psbt.addOutput({
                address: address!,
                value: utxos[0].value - fee,
            });
            // Sign and broadcast
            psbt.signInput(0, signer);
            psbt.finalizeAllInputs();

            const tx = psbt.extractTransaction();
            const txHex = tx.toHex();

            // Broadcast transaction
            const txid = await this.broadcastTransaction(txHex);
            return txid;
        } catch (error) {
            console.error('Error publishing IPFS hash to Bitcoin:', error);
            throw error;
        }
    }

    async verifyIPFSHash(txid: string): Promise<{ verified: boolean; ipfsHash?: string }> {
        try {
            // Get transaction details from mempool
            const txData = await this.getTransactionDetails(txid);

            // Find OP_RETURN output
            const opReturnOutput = txData.vout.find(output =>
                output.scriptpubkey_type === 'op_return'
            );

            if (!opReturnOutput) {
                return { verified: false };
            }

            // Extract IPFS hash from OP_RETURN data
            const ipfsHash = Buffer.from(opReturnOutput.scriptpubkey_asm.split(' ')[1], 'hex').toString();

            return { verified: true, ipfsHash };
        } catch (error) {
            console.error('Error verifying IPFS hash:', error);
            return { verified: false };
        }
    }

    private async getUTXOs(address: string) {
        const response = await axios.get(`${this.mempoolUrl}/address/${address}/utxo`);
        return response.data;
    }
    async verifyTransactionWithCID(txid: string, targetCid: string): Promise<boolean> {
        try {
            const txData = await this.getTransactionDetails(txid);
            const opReturnOutput = txData.vout.find(output =>
                output.scriptpubkey_type === 'op_return'
            );

            if (!opReturnOutput) return false;

            const data = Buffer.from(opReturnOutput.scriptpubkey_asm.split(' ')[2], 'hex').toString();

            // Check if it's an update transaction
            if (data.startsWith('UPDATE')) {
                const [prevCid, newCid] = data.split(' ')[1].split(':');
                // Transaction is valid if it contains either the previous or new CID
                return prevCid === targetCid || newCid === targetCid;
            }

            // Regular transaction verification...
            return data === targetCid;
        } catch (error) {
            console.error('Error verifying transaction:', error);
            return false;
        }
    }
    async getProjectTransactions(cid: string, govAddress: string, contractorAddress: string): Promise<any[]> {
        try {
            // Get transactions for both addresses
            const [govTxs, contractorTxs] = await Promise.all([
                axios.get(`${this.mempoolUrl}/address/${govAddress}/txs`),
                axios.get(`${this.mempoolUrl}/address/${contractorAddress}/txs`)
            ]);

            // Combine and process all transactions
            const allTxs = [...govTxs.data, ...contractorTxs.data];
            const uniqueTxs = Array.from(new Set(allTxs.map(tx => tx.txid)))
                .map(txid => allTxs.find(tx => tx.txid === txid));
            // Verify each transaction against the CID and get details
            const verifiedTxs = await Promise.all(
                uniqueTxs.map(async (tx) => {
                    const isVerified = await this.verifyTransactionWithCID(tx.txid, cid);
                    if (!isVerified) return null;

                    const txDetails = await this.getTransactionDetails(tx.txid);
                    return {
                        txId: tx.txid,
                        timestamp: tx.status.block_time * 1000,
                        confirmations: txDetails.status.confirmed ? txDetails.confirmations : 0,
                        type: this.determineTransactionType(txDetails, govAddress, contractorAddress),
                        amount: this.calculateTransactionAmount(txDetails, govAddress, contractorAddress),
                        fee: txDetails.fee,
                        status: txDetails.status.confirmed ? 'confirmed' : 'pending'
                    };
                })
            );

            return verifiedTxs.filter(tx => tx !== null);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    private determineTransactionType(
        txDetails: any,
        govAddress: string,
        contractorAddress: string
    ): 'payment' | 'update' | 'creation' {
        // Check if transaction has value transfer to contractor
        const hasPayment = txDetails.vout.some(output =>
            output.scriptpubkey_address === contractorAddress && output.value > 0
        );

        return hasPayment ? 'payment' :
            txDetails.vin[0].prevout.scriptpubkey_address === govAddress ? 'update' :
                'creation';
    }

    private calculateTransactionAmount(
        txDetails: any,
        govAddress: string,
        contractorAddress: string
    ): number {
        // Sum all outputs to contractor
        return txDetails.vout
            .filter(output => output.scriptpubkey_address === contractorAddress)
            .reduce((sum, output) => sum + output.value, 0);
    }
    private async broadcastTransaction(txHex: string): Promise<string> {
        const response = await axios.post(`${this.mempoolUrl}/tx`, txHex);
        return response.data.txid;
    }

    private async getTransactionDetails(txid: string) {
        const response = await axios.get(`${this.mempoolUrl}/tx/${txid}`);
        return response.data;
    }

    async getTransactionStatus(txid: string): Promise<'confirmed' | 'pending' | 'not_found'> {
        try {
            const response = await axios.get(`${this.mempoolUrl}/tx/${txid}`);
            return response.data.status.confirmed ? 'confirmed' : 'pending';
        } catch (error) {
            return 'not_found';
        }
    }
}