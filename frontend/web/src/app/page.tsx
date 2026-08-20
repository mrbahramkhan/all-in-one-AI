import Link from 'next/link';
const FEATURES = [
  { icon: '💬', title: 'Universal AI Chat', desc: 'GPT-4o, Claude, Gemini + 10 more from one interface' },
  { icon: '⚡', title: 'Smart AI Router', desc: 'Auto-selects best model for your task' },
  { icon: '🤖', title: 'Agent Builder', desc: 'Create custom AI agents with memory and tools' },
  { icon: '📚', title: 'Knowledge Base', desc: 'RAG-powered document Q&A with citations' },
  { icon: '🔄', title: 'Workflow Automation', desc: 'Connect AI with 200+ apps visually' },
  { icon: '🎨', title: 'Content Studio', desc: 'Generate text, images, video, voiceovers' },
  { icon: '💻', title: 'AI Code Workspace', desc: 'AI-powered editor with deployment tools' },
  { icon: '🛒', title: 'Marketplace', desc: 'Buy/sell AI agents. Earn 70% revenue' },
];
const PRICING = [
  { name: 'Free', price: '$0', credits: '50K tokens', features: ['5 AI models', '50 chats/mo', '1 agent'], cta: 'Start Free', h: false },
  { name: 'Starter', price: '$19', credits: '500K tokens', features: ['10 AI models', 'Unlimited chats', '5 agents', '500MB KB'], cta: 'Get Started', h: false },
  { name: 'Pro', price: '$49', credits: '2M tokens', features: ['All 15+ models', 'Compare mode', '20 agents', '5GB KB', '50 workflows'], cta: 'Go Pro', h: true },
  { name: 'Business', price: '$149', credits: '10M tokens', features: ['Everything in Pro', '100 agents', '50GB KB', 'SSO/SAML', 'Team seats'], cta: 'Get Business', h: false },
];
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F2E] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">AI</div>
          <span className="font-bold text-lg">All-In-One AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white">Sign in</Link>
          <Link href="/register" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium">Get Started Free</Link>
        </div>
      </nav>
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-8">
          ✨ 15+ AI models — GPT-4o, Claude, Gemini, Grok and more
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          One Platform.<br />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Every AI.</span><br />
          Zero Compromise.
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
          Stop switching between 10+ AI tools. Access ChatGPT, Claude, Gemini and more from a single dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold text-lg hover:opacity-90">Start for Free</Link>
          <Link href="/login" className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/5">Sign In →</Link>
        </div>
        <p className="text-sm text-white/40 mt-4">50,000 free tokens • No credit card required</p>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-white/60 text-center mb-12">Replace 10+ subscriptions with one platform.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-white/60 text-center mb-12">Start free. Scale as you grow.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING.map(p => (
            <div key={p.name} className={`p-6 rounded-xl border ${p.h ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5'}`}>
              {p.h && <div className="text-xs font-bold text-violet-400 mb-3 uppercase tracking-wider">Most Popular</div>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold">{p.price}</span>
                {p.price !== '$0' && <span className="text-white/50 text-sm">/mo</span>}
              </div>
              <p className="text-xs text-white/50 mb-4">{p.credits}</p>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => (
                  <li key={f} className="text-sm text-white/70 flex items-center gap-2">
                    <span className="text-green-400">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`block w-full py-2.5 rounded-lg text-sm font-semibold text-center ${p.h ? 'bg-violet-600 hover:bg-violet-700' : 'border border-white/20 hover:bg-white/10'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">AI</div>
          <span className="font-bold text-white">All-In-One AI</span>
        </div>
        <p>© 2026 All-In-One AI. Built for the AI-first generation.</p>
      </footer>
    </div>
  );
}