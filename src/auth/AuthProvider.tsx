import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from './useAuth';
import { SessionProvider } from './SessionProvider';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isTelegram: boolean;
  session: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <SessionProvider
        session={auth.session}
        isAuthenticated={auth.isAuthenticated}
        isAuthenticating={auth.isAuthenticating}
        logout={auth.logout}
      >
        {children}
      </SessionProvider>
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
