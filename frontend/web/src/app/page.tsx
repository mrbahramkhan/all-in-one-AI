import Link from 'next/link';

const MODELS = [
  { name: 'GPT-4o', provider: 'OpenAI', color: 'from-green-400 to-green-600' },
  { name: 'Claude', provider: 'Anthropic', color: 'from-orange-400 to-orange-600' },
  { name: 'Gemini', provider: 'Google', color: 'from-blue-400 to-blue-600' },
  { name: 'Grok', provider: 'xAI', color: 'from-gray-400 to-gray-600' },
  { name: 'Llama', provider: 'Meta', color: 'from-indigo-400 to-indigo-600' },
  { name: 'DeepSeek', provider: 'DeepSeek', color: 'from-cyan-400 to-cyan-600' },
  { name: 'Mistral', provider: 'Mistral', color: 'from-rose-400 to-rose-600' },
  { name: 'DALL-E 3', provider: 'OpenAI', color: 'from-purple-400 to-purple-600' },
];

const FEATURES = [
  { icon: '💬', title: 'Universal AI Chat', desc: 'Access 15+ AI models from one interface. Compare responses side-by-side.' },
  { icon: '⚡', title: 'Smart AI Router', desc: 'Auto-selects the best model for your task — quality, speed, or cost.' },
  { icon: '🤖', title: 'Agent Builder', desc: 'Create custom AI agents with memory, tools, and knowledge bases.' },
  { icon: '🔄', title: 'Workflow Automation', desc: 'Visual drag-and-drop workflows connecting AI with 200+ integrations.' },
  { icon: '📚', title: 'Knowledge Base', desc: 'Upload docs, PDFs, websites. Ask questions with cited RAG answers.' },
  { icon: '🎨', title: 'Content Studio', desc: 'Generate text, images, videos, and voiceovers from one workspace.' },
  { icon: '💻', title: 'AI Code Workspace', desc: 'AI-powered editor with code generation, debugging, and deployment.' },
  { icon: '🛒', title: 'AI Marketplace', desc: 'Buy and sell agents, prompts, and workflows. Earn 70% revenue share.' },
];

const PRICING = [
  { name: 'Free', price: '$0', credits: '50K tokens', features: ['5 AI models', '50 conversations/mo', '1 agent', 'Community support'], cta: 'Start Free', highlight: false },
  { name: 'Starter', price: '$19', credits: '500K tokens', features: ['10 AI models', 'Unlimited conversations', '5 agents', '500MB knowledge base', 'Email support'], cta: 'Get Started', highlight: false },
  { name: 'Pro', price: '$49', credits: '2M tokens', features: ['All 15+ AI models', 'Compare & Battle mode', '20 agents', '5GB knowledge base', '50 workflows', 'AI Coding workspace', 'Priority support'], cta: 'Go Pro', highlight: true },
  { name: 'Business', price: '$149', credits: '10M tokens', features: ['Everything in Pro', '100 agents', '50GB knowledge base', '500 workflows', 'Team seats (20)', 'SSO / SAML', '99.95% SLA', '24/7 support'], cta: 'Get Business', highlight: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F2E] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">AI</div>
          <span className="font-bold text-lg">All-In-One AI</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#models" className="hover:text-white transition-colors">Models</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Sign in</Link>
          <Link href="/register" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-8">
          ✨ Now supporting 15+ AI models including Claude Opus 4.6 and GPT-4o
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          One Platform.<br />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Every AI.</span><br />
          Zero Compromise.
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
          Stop switching between 10+ AI tools. Access ChatGPT, Claude, Gemini, Grok, and more from a single dashboard. Compare, automate, and build — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity">
            Start for Free — No credit card needed
          </Link>
          <Link href="/chat" className="px-8 py-4 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/5 transition-colors">
            Try the Demo →
          </Link>
        </div>
        <p className="text-sm text-white/40 mt-4">50,000 free tokens included • No credit card required</p>
      </section>

      {/* Model grid */}
      <section id="models" className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-center text-white/40 text-sm mb-8 uppercase tracking-widest">ALL MODELS IN ONE PLACE</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MODELS.map(m => (
            <div key={m.name} className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center text-xs font-bold`}>
                {m.name[0]}
              </div>
              <div>
                <div className="font-medium text-sm">{m.name}</div>
                <div className="text-xs text-white/40">{m.provider}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">Replace 10+ subscriptions with one platform that does it all.</p>
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

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-white/60 text-center mb-12">Start free. Scale as you grow. Cancel anytime.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING.map(p => (
            <div key={p.name} className={`p-6 rounded-xl border ${p.highlight ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/50' : 'border-white/10 bg-white/5'}`}>
              {p.highlight && <div className="text-xs font-bold text-violet-400 mb-3 uppercase tracking-wider">Most Popular</div>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold">{p.price}</span>
                {p.price !== '$0' && <span className="text-white/50 text-sm">/month</span>}
              </div>
              <p className="text-xs text-white/50 mb-6">{p.credits} included</p>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => (
                  <li key={f} className="text-sm text-white/70 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`block w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors ${p.highlight ? 'bg-violet-600 hover:bg-violet-700' : 'border border-white/20 hover:bg-white/10'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 text-center text-white/40 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">AI</div>
          <span className="font-bold text-white">All-In-One AI</span>
        </div>
        <p>© 2026 All-In-One AI. Built for the AI-first generation.</p>
      </footer>
    </div>
  );
}
