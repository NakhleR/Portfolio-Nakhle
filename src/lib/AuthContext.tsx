import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { login as apiLogin, getUserProfile } from './api';

interface User {
    _id: string;
    email: string;
    isAdmin: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('userToken');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userProfile = await getUserProfile();
                setUser(userProfile);
            } catch (err) {
                localStorage.removeItem('userToken');
                console.error('Auth error:', err);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = await apiLogin(email, password);
            localStorage.setItem('userToken', data.token);
            setUser(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}; 