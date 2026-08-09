'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export interface User { id:string; email:string; name:string; avatarUrl?:string; role:string; plan:string; credits:number; monthlySpend:number; emailVerified:boolean; mfaEnabled:boolean; }
interface AuthState { user:User|null; accessToken:string|null; refreshToken:string|null; isLoading:boolean; setUser:(u:User|null)=>void; setTokens:(a:string,r:string)=>void; setLoading:(l:boolean)=>void; logout:()=>void; }
export const useAuthStore = create<AuthState>()(persist((set)=>({
  user:null, accessToken:null, refreshToken:null, isLoading:false,
  setUser:(user)=>set({user}),
  setTokens:(accessToken,refreshToken)=>{ if(typeof window!=='undefined'){localStorage.setItem('access_token',accessToken);localStorage.setItem('refresh_token',refreshToken);} set({accessToken,refreshToken}); },
  setLoading:(isLoading)=>set({isLoading}),
  logout:()=>{ if(typeof window!=='undefined'){localStorage.removeItem('access_token');localStorage.removeItem('refresh_token');} set({user:null,accessToken:null,refreshToken:null}); },
}),{name:'auth-store',partialize:(s)=>({user:s.user,accessToken:s.accessToken,refreshToken:s.refreshToken})}));