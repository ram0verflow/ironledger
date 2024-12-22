'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ProjectsAuthContextType {
  isGovernment: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const ProjectsAuthContext = createContext<ProjectsAuthContextType>({
  isGovernment: false,
  address: null,
  connect: async () => { },
  disconnect: () => { }
});

export function ProjectsAuthProvider({
  children,
  isGov
}: {
  children: ReactNode;
  isGov: boolean;
}) {
  const [address, setAddress] = useState<string | null>(null);
  const [isGovernment, setIsGovernment] = useState(isGov);

  useEffect(() => {
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsGovernment(savedAddress === process.env.NEXT_PUBLIC_TESTNET_ADDR);
    }
  }, []);

  const connect = async () => {
    try {
      if (!window.unisat) {
        throw new Error('Please install UniSat wallet');
      }

      const [account] = await window.unisat.requestAccounts();

      setAddress(account);
      localStorage.setItem('userAddress', account);
      setIsGovernment(account === process.env.NEXT_PUBLIC_TESTNET_ADDR);
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsGovernment(false);
    localStorage.removeItem('walletAddress');
  };

  return (
    <ProjectsAuthContext.Provider
      value={{
        isGovernment,
        address,
        connect,
        disconnect
      }}
    >
      {children}
    </ProjectsAuthContext.Provider>
  );
}

export function useProjectsAuth() {
  const context = useContext(ProjectsAuthContext);
  if (!context) {
    throw new Error('useProjectsAuth must be used within ProjectsAuthProvider');
  }
  return context;
}