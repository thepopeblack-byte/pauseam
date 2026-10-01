"use client";
import {useEffect,useState} from "react";
export function Connectivity(){
 const [offline,setOffline]=useState(false);
 useEffect(()=>{const update=()=>setOffline(!navigator.onLine);update();window.addEventListener("online",update);window.addEventListener("offline",update);return()=>{window.removeEventListener("online",update);window.removeEventListener("offline",update);};},[]);
 return offline?<div className="notice" role="status">You appear to be offline. Voice and new answers need a connection. If you suspect fraud, use an independently trusted bank contact. Any page already open remains readable.</div>:null;
}
