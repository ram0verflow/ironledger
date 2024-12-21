import { createContext, useContext, useState, useEffect } from 'react';
import { WalletProvider } from '@/lib/wallet/types';
import { UnisatWalletProvider } from '@/lib/wallet/providers/unisat';

interface WalletContextType {
    wallet: WalletProvider | null;
    address: string;
    connected: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [wallet, setWallet] = useState<WalletProvider | null>(null);
    const [address, setAddress] = useState('');
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        setWallet(new UnisatWalletProvider());
    }, []);

    // ... implement context methods
};