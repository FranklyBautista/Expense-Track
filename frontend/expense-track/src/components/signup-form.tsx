import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const API_URL =  import.meta.env.VITE_API_URL || "VITE_API_URL=http://localhost:3000";


export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name,setName] = useState("");


  async function handleSignup(e: React.FormEvent){
    e.preventDefault();

    if(password !==confirmPassword){
      alert("Passwords do not match")
    }
    console.log("Submitting signup:", {email,password,confirmPassword});

    try{

      const res = await fetch(`${API_URL}/auth/register`,{
        method: "POST",
        headers:{"Content-type":"application/json"},
        credentials:"include",
        body: JSON.stringify({email,password,name})
      })

      const data = await res.json().catch(()=>{})

      if(!res.ok){
        throw new Error(data.error || data.message || "Login Failed")
      }

      navigate("/Login")


    }catch(err:any){
      alert(err.message || "Error al crear la cuenta")
    }
  }


  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e)=> setName(e.target.value)}/>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)}/>
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/Login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
