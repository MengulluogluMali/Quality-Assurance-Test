"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [data, setData] = useState({ name: "", email: "", password: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        setError("Invalid credentials");
      } else {
        router.push("/");
        router.refresh(); // Refresh layout to show auth state changes
      }
    } else {
      try {
        const fetchRes = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data.name, email: data.email, password: data.password })
        });
        
        if (!fetchRes.ok) {
           const err = await fetchRes.text();
           throw new Error(err);
        }

        const signInRes = await signIn("credentials", {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (signInRes?.error) {
            setError("Could not sign in automatically");
        } else {
            router.push("/");
            router.refresh();
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container glass animate-fade-in">
      <h1 className="auth-title text-gradient">{isLogin ? "Welcome Back" : "Create Account"}</h1>
      {error && <p style={{color: "var(--error-color)", marginBottom: "1rem"}}>{error}</p>}
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!isLogin && (
          <input 
            type="text" 
            placeholder="Name" 
            required 
            className="input"
            value={data.name} 
            onChange={e => setData({...data, name: e.target.value})}
          />
        )}
        <input 
          type="email" 
          placeholder="Email address" 
          required 
          className="input"
          value={data.email} 
          onChange={e => setData({...data, email: e.target.value})}
        />
        <input 
          type="password" 
          placeholder="Password" 
          required 
          className="input"
          value={data.password} 
          onChange={e => setData({...data, password: e.target.value})}
        />
        <button type="submit" disabled={loading} className="btn btn-primary" style={{marginTop: "0.5rem"}}>
          {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
        </button>
      </form>
      
      <p style={{marginTop: "1.5rem", color: "var(--text-secondary)", fontSize: "0.875rem"}}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={() => setIsLogin(!isLogin)} style={{color: "var(--accent-primary)", fontWeight: "500"}}>
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
