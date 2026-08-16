import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

const URL='https://kdfzpqqyklqxprcweuqu.supabase.co';
const KEY='sb_publishable_V6eyM6swE72C5UmPs9KKOg_hKtpRbwZ';
const STORE='andergo.session.v1';
type Session={access_token:string;email:string;userId:string};
type Auth={ready:boolean;session:Session|null;signIn:(email:string,password:string)=>Promise<void>;signOut:()=>Promise<void>};
const Context=createContext<Auth|null>(null);

export function AuthProvider({children}:PropsWithChildren){
 const [session,setSession]=useState<Session|null>(null);const [ready,setReady]=useState(false);
 useEffect(()=>{AsyncStorage.getItem(STORE).then(raw=>{if(raw)setSession(JSON.parse(raw));}).finally(()=>setReady(true));},[]);
 const value=useMemo<Auth>(()=>({ready,session,async signIn(email,password){const r=await fetch(`${URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});const data=await r.json();if(!r.ok)throw new Error(data.error_description||'No pudimos iniciar sesión.');const next={access_token:data.access_token,email:data.user?.email||email,userId:data.user?.id||''};setSession(next);await AsyncStorage.setItem(STORE,JSON.stringify(next));},async signOut(){setSession(null);await AsyncStorage.removeItem(STORE);}}),[ready,session]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('useAuth must be inside AuthProvider');return value;}
