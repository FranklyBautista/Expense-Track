import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { useState } from "react";
import {useNavigate } from "react-router-dom";
import React from "react";
import { useAuthContext } from "@/context/auth.context";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"; 

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useAuthContext();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    async function handleLogin(e: React.FormEvent){
        
        e.preventDefault();
        console.log("Submitting login:", { email, password });
        

        try{
            const res = await fetch(`${API_URL}/auth/login`,{
                method: "POST",
                headers:{"Content-Type":"application/json"},
                credentials:"include",
                body: JSON.stringify({email,password})
            });

            const data = await res.json().catch(()=>({}));
            
            if(!res.ok){
                throw new Error(data.error || data.message || "Login Failed")
            }

            // Actualizar el contexto con el usuario (el backend devuelve { id, email, name })
            if (data.id && data.email && data.name) {
                setUser({
                    id: data.id,
                    email: data.email,
                    name: data.name
                });
            }

            navigate("/dashboard")

        }catch(err:any){
            alert(err.message || "Error al iniciar sesión");
            console.error("Login error:", err);
        }
    }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm 
            email = {email}
            setEmail = {setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleLogin}
            />
            
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}