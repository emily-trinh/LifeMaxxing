import { createContext, useContext, useEffect, useState } from 'react';
import { JwtPayload, Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { signOut as signOutUser } from '../services/authService';
import { clearCalendarState } from '../services/calendarService';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    claims: JwtPayload | null;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [claims, setClaims] = useState<JwtPayload | null>(null);

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('Unable to restore Supabase session:', error);
            }

            if (!mounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!session) clearCalendarState();
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                void supabase.auth.getClaims().then(({ data, error }) => {
                    if (error) {
                        console.error('Unable to read Supabase auth claims:', error);
                        return;
                    }
                    if (mounted) setClaims(data?.claims ?? null);
                });
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
        });
        if (error) throw error;

        if (!data.session) {
            throw new Error('Account created, but email confirmation is still required in Supabase.');
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });
        if (error) throw error;
    };


    const signOut = async () => {
        await signOutUser();
    };

    return (
        <AuthContext.Provider value={{ session, user, claims, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}