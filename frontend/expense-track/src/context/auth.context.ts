import { createContext, useContext } from "react";
import type { UserType } from "@/types/auth.types";

type AuthContextType = {
    user: UserType | null;
    setUser: (user: UserType | null) => void;
    loading: boolean;
    logOut:()=> Promise<void>
}

export const AuthContext = createContext<AuthContextType|null>(null)

export function useAuthContext(){
    const context = useContext(AuthContext)
    if(!context){
        throw new Error("useAuthContext must be used within AuthProvider")
    }
    return context;
}
