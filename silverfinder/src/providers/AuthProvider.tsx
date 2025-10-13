//Get info about the session and subscribe to session updates
import { PropsWithChildren, createContext, useContext, useEffect, useState} from "react";
import { Session, User } from "@supabase/supabase-js";
import {supabase} from "../lib/supabase";

type AuthContext = {
    session: Session | null;
    user: User | null;
}


const AuthContext = createContext<AuthContext>({
    session: null,
    user: null,
});
export default function AuthProvider({children}: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
    });

    // Subscribing to updates like if the user signs out
    supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
    });
    },[]);


    return<AuthContext.Provider value={{session, user: session?.user}}>{children}</AuthContext.Provider>
}
//custom hook to access the auth context
//shortcut
export const useAuth = () => useContext(AuthContext);