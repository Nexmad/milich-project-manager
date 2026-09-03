'use client';
import { useEffect } from 'react';

export default function PwaRegister(){
  useEffect(()=>{
    if('serviceWorker' in navigator){
      const base = window.location.pathname.startsWith('/milich-project-manager') ? '/milich-project-manager' : '';
      navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(()=>{});
    }
  },[]);
  return null;
}
