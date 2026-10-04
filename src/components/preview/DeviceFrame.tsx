"use client";
import type { ViewerDevice } from "@/types";
export function DeviceFrame({device,children}:{device:ViewerDevice;children:React.ReactNode}){return <div className="flex min-h-[480px] items-center justify-center overflow-auto bg-slate-100 p-6 dark:bg-slate-950"><div style={{width:Math.min(device.width,900),height:Math.min(device.height,650),borderRadius:device.frame?device.radius:12}} className="overflow-hidden border-8 border-slate-900 bg-white shadow-2xl">{children}</div></div>;}
