// src/lib/blockchain/bitcoin-service.ts
import { networks, payments, Psbt } from 'bitcoinjs-lib';
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

    async publishIPFSHash(ipfsHash: string, privateKey: string): Promise<string> {
        try {
            const keyPair = ECPair.fromWIF(privateKey, this.network);
            const { address } = payments.p2wpkh({ pubkey: keyPair.publicKey, network: this.network });

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
                    script: payments.p2wpkh({ pubkey: keyPair.publicKey, network: this.network }).output!,
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
            psbt.signInput(0, keyPair);
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