import React, { createContext, useContext, useState, useCallback } from 'react';

interface SolanaWallet {
  publicKey: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const SolanaWalletContext = createContext<SolanaWallet | null>(null);

export const useSolanaWallet = () => {
  const context = useContext(SolanaWalletContext);
  if (!context) {
    throw new Error('useSolanaWallet must be used within SolanaWalletProvider');
  }
  return context;
};

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

export const SolanaWalletProvider: React.FC<SolanaWalletProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(async () => {
    try {
      // Check if Phantom wallet is available
      if ('solana' in window) {
        const solana = (window as any).solana;
        if (solana.isPhantom) {
          const response = await solana.connect();
          setPublicKey(response.publicKey.toString());
          setConnected(true);
        } else {
          throw new Error('Phantom wallet not found');
        }
      } else {
        // For MVP, simulate connection with a mock wallet
        const mockPublicKey = 'DemoSolanaWallet' + Math.random().toString(36).substring(7);
        setPublicKey(mockPublicKey);
        setConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
    setConnected(false);
  }, []);

  const value: SolanaWallet = {
    publicKey,
    connected,
    connect,
    disconnect,
  };

  return (
    <SolanaWalletContext.Provider value={value}>
      {children}
    </SolanaWalletContext.Provider>
  );
};