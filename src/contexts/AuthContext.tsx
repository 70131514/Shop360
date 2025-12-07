import React, {createContext, useContext, useState, ReactNode} from 'react';

type User = {id: string; name?: string} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User>(null);

  const login = async (username: string) => {
    // placeholder: perform auth
    setUser({id: '1', name: username});
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
