//Get info about the session and subscribe to session updates
import { PropsWithChildren, createContext, useContext, useEffect, useState} from "react";
import { Session, User } from "@supabase/supabase-js";
import {supabase} from "../lib/supabase";

type AuthContext = {
    session: Session | null;
    user: User | null;
    loading: boolean;
}


const AuthContext = createContext<AuthContext>({
    session: null,
    user: null,
    loading: true,
});
export default function AuthProvider({children}: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            console.log('SESSION FROM SUPABASE:', session);
            setSession(session);
            setLoading(false);
    });

    // Subscribing to updates like if the user signs out
    supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
    });
    },[]);
    const value = {
        session,
        user: session?.user ?? null,
        loading,
      };
    
      return (
        <AuthContext.Provider value={value}>
          {!loading && children}
        </AuthContext.Provider>
      );
    }
//custom hook to access the auth context
//shortcut
export const useAuth = () => useContext(AuthContext);