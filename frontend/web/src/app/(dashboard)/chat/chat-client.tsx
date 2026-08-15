'use client';
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { chatApi } from '@/lib/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MODELS = [{id:'gpt-4o',label:'GPT-4o'},{id:'gpt-4o-mini',label:'GPT-4o Mini'},{id:'claude-sonnet-4-6',label:'Claude Sonnet'},{id:'claude-haiku-4-5',label:'Claude Haiku'},{id:'gemini-2.0-flash',label:'Gemini Flash'}];
export function ChatClient() {
  const {conversations,activeConversationId,messages,streamingContent,isStreaming,selectedModels,chatMode,setConversations,addConversation,setActiveConversation,setMessages,addMessage,appendStreamChunk,setStreaming,clearStream,setSelectedModels,setChatMode}=useChatStore();
  const [input,setInput]=useState('');
  const endRef=useRef<HTMLDivElement>(null);
  const activeMessages=messages[activeConversationId??'']??[];
  useEffect(()=>{chatApi.getConversations().then(r=>setConversations(r.data.data||[])).catch(()=>{});},[]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[activeMessages,streamingContent]);
  const newConv=async()=>{try{const{data}=await chatApi.createConversation({title:'New Chat',model:selectedModels[0],mode:chatMode});addConversation(data.data);setActiveConversation(data.data.id);setMessages(data.data.id,[]);}catch{}};
  const selectConv=async(id:string)=>{setActiveConversation(id);try{const{data}=await chatApi.getMessages(id);setMessages(id,data.data||[]);}catch{}};
  const send=async()=>{
    if(!input.trim()||isStreaming)return;
    let convId=activeConversationId;
    if(!convId){try{const{data}=await chatApi.createConversation({title:input.slice(0,60),model:selectedModels[0]});addConversation(data.data);convId=data.data.id;setActiveConversation(convId);setMessages(convId,[]);}catch{return;}}
    addMessage(convId!,{id:crypto.randomUUID(),conversationId:convId!,role:'user',content:input,createdAt:new Date()});
    const prompt=input;setInput('');clearStream();setStreaming(true);
    try{
      const token=typeof window!=='undefined'?localStorage.getItem('access_token'):null;
      const res=await fetch(API_URL+'/api/v1/ai/complete/stream',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({model:selectedModels[0],messages:[{role:'user',content:prompt}]})});
      const reader=res.body!.getReader();const decoder=new TextDecoder();
      while(true){const{done,value}=await reader.read();if(done)break;
        decoder.decode(value).split('\n').filter(l=>l.startsWith('data: ')).forEach(line=>{const d=line.slice(6);if(d==='[DONE]')return;try{const p=JSON.parse(d);if(p.delta)appendStreamChunk(p.delta);}catch{}});
      }
    }catch(e){console.error(e);}
    setStreaming(false);clearStream();
  };
  return(
    <div className="flex h-full">
      <div className="w-56 border-r border-border flex flex-col shrink-0 bg-card">
        <div className="p-3 border-b border-border"><button onClick={newConv} className="w-full px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium">+ New Chat</button></div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {conversations.map(c=><button key={c.id} onClick={()=>selectConv(c.id)} className={"w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors "+(c.id===activeConversationId?'bg-accent text-foreground':'text-muted-foreground hover:bg-accent/50')}>💬 {c.title}</button>)}
          {conversations.length===0&&<p className="text-xs text-muted-foreground px-3 py-4 text-center">No conversations yet</p>}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-4 py-2 flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['single','compare','router'] as const).map(m=><button key={m} onClick={()=>setChatMode(m)} className={"px-3 py-1.5 text-xs font-medium "+(chatMode===m?'bg-primary text-primary-foreground':'text-muted-foreground')}>{m}</button>)}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MODELS.map(m=><button key={m.id} onClick={()=>setSelectedModels([m.id])} className={"px-2.5 py-1 rounded-full text-xs border "+(selectedModels.includes(m.id)?'border-violet-500 bg-violet-500/20 text-violet-300':'border-border text-muted-foreground')}>{m.label}</button>)}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {activeMessages.map(msg=>(
              <div key={msg.id} className={"flex gap-3 "+(msg.role==='user'?'flex-row-reverse':'')}>
                <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 "+(msg.role==='user'?'bg-primary text-primary-foreground':'bg-gradient-to-br from-violet-500 to-cyan-500 text-white')}>{msg.role==='user'?'U':'AI'}</div>
                <div className={"max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap "+(msg.role==='user'?'bg-primary text-primary-foreground rounded-tr-sm':'bg-card border border-border rounded-tl-sm')}>{msg.content}</div>
              </div>
            ))}
            {isStreaming&&streamingContent&&<div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs text-white shrink-0">AI</div><div className="flex-1 bg-card rounded-2xl rounded-tl-sm px-4 py-3 text-sm border border-border whitespace-pre-wrap">{streamingContent}<span className="inline-block w-0.5 h-4 bg-violet-500 animate-pulse ml-0.5"/></div></div>}
            {isStreaming&&!streamingContent&&<div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs text-white shrink-0">AI</div><div className="flex gap-1 px-4 py-3">{[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" style={{animationDelay:i*150+'ms'}}/>)}</div></div>}
            {activeMessages.length===0&&!isStreaming&&<div className="text-center py-16"><div className="text-4xl mb-4">💬</div><h3 className="font-semibold mb-2">Start a conversation</h3><p className="text-muted-foreground text-sm">Pick a model and ask anything.</p></div>}
            <div ref={endRef}/>
          </div>
        </div>
        <div className="border-t border-border p-4">
          <div className="max-w-3xl mx-auto flex gap-2 items-end rounded-xl border border-border bg-card px-3 py-2 focus-within:ring-1 focus-within:ring-violet-500">
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder={"Ask "+(MODELS.find(m=>m.id===selectedModels[0])?.label??'AI')+"..."} rows={1} className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground py-1" style={{minHeight:'1.5rem'}} onInput={e=>{const t=e.target as HTMLTextAreaElement;t.style.height='auto';t.style.height=t.scrollHeight+'px';}}/>
            <button onClick={send} disabled={isStreaming||!input.trim()} className="shrink-0 w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center text-white">
              {isStreaming?<div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>:'↑'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}