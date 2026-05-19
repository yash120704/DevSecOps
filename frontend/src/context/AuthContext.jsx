import { createContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, getToken, loginUser, logoutUser, registerUser } from '../services/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = () => {
      setUser(getCurrentUser());
      setLoading(false);
    };

    hydrate();
    window.addEventListener('auth-changed', hydrate);
    window.addEventListener('storage', hydrate);

    return () => {
      window.removeEventListener('auth-changed', hydrate);
      window.removeEventListener('storage', hydrate);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token: getToken(),
      isAuthenticated: Boolean(user),
      loading,
      async login(email, password) {
        const data = await loginUser(email, password);
        setUser(data.user || null);
        return data;
      },
      async register(email, password) {
        const data = await registerUser(email, password);
        setUser(data.user || null);
        return data;
      },
      async logout() {
        await logoutUser();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
