import Link from 'next/link';
const FEATURES=[{icon:'💬',title:'Universal AI Chat',desc:'GPT-4o, Claude, Gemini + 10 more models from one interface'},{icon:'⚡',title:'AI Router',desc:'Auto-selects best model for your task'},{icon:'🤖',title:'Agent Builder',desc:'Build custom AI agents with memory and tools'},{icon:'📚',title:'Knowledge Base',desc:'RAG-powered document Q&A with citations'},{icon:'⚡',title:'Workflow Automation',desc:'Zapier-like AI automation builder'},{icon:'🎨',title:'Content Studio',desc:'Generate text, images, videos, and voiceovers'},{icon:'💻',title:'AI Code Workspace',desc:'AI-powered code editor with deployment tools'},{icon:'🛒',title:'Marketplace',desc:'Buy/sell AI agents. Earn 70% revenue share'}];
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0F2E] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">AI</div><span className="font-bold text-lg">All-In-One AI</span></div>
        <div className="flex items-center gap-3"><Link href="/login" className="text-sm text-white/70 hover:text-white">Sign in</Link><Link href="/register" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium transition-colors">Get Started Free</Link></div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-8">✨ 15+ AI models — GPT-4o, Claude, Gemini, Grok & more</div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">One Platform.<br/><span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Every AI.</span><br/>Zero Compromise.</h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">Stop switching between 10+ AI tools. Access ChatGPT, Claude, Gemini and more from a single dashboard.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold text-lg hover:opacity-90">Start for Free</Link>
          <Link href="/login" className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/5">Sign In →</Link>
        </div>
        <p className="text-sm text-white/40 mt-4">50,000 free tokens • No credit card required</p>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{FEATURES.map(f=><div key={f.title} className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"><div className="text-3xl mb-3">{f.icon}</div><h3 className="font-semibold mb-2">{f.title}</h3><p className="text-sm text-white/60">{f.desc}</p></div>)}</div>
      </section>
      <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">© 2026 All-In-One AI — Built for the AI-first generation</footer>
    </div>
  );
}