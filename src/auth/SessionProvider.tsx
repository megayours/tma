import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from './useAuth';

interface SessionContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  session: Session | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  logout: () => void;
}

export function SessionProvider({
  children,
  session,
  isAuthenticated,
  isAuthenticating,
  logout,
}: SessionProviderProps) {
  return (
    <SessionContext.Provider
      value={{
        session,
        isAuthenticated,
        isAuthenticating,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
