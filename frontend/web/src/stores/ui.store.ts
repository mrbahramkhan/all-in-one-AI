'use client';
import { create } from 'zustand';
interface UIState { sidebarOpen:boolean; theme:string; setSidebarOpen:(o:boolean)=>void; toggleSidebar:()=>void; setTheme:(t:string)=>void; }
export const useUIStore = create<UIState>((set)=>({ sidebarOpen:true, theme:'dark', setSidebarOpen:(sidebarOpen)=>set({sidebarOpen}), toggleSidebar:()=>set((s)=>({sidebarOpen:!s.sidebarOpen})), setTheme:(theme)=>set({theme}) }));