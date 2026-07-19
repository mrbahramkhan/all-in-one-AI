'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

const CONTENT_TYPES = [
  { id: 'article', label: '📰 Article / Blog', desc: 'Long-form content with SEO optimization' },
  { id: 'social', label: '📱 Social Media', desc: 'Platform-optimized posts and captions' },
  { id: 'marketing', label: '📣 Marketing Copy', desc: 'Ads, landing pages, email sequences' },
  { id: 'image', label: '🖼 AI Image', desc: 'Generate images with DALL-E 3 or Flux' },
];

export default function StudioPage() {
  const [activeType, setActiveType] = useState('article');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [generating, setGenerating] = useState(false);
  const [options, setOptions] = useState({ tone: 'professional', length: 'medium', platform: 'general' });

  const generate = async () => {
    if (!prompt) return;
    setGenerating(true); setResult('');
    try {
      const { data } = await api.post('/content/generate', { type: activeType, prompt, options });
      setResult(data.data?.content ?? data.data?.url ?? '');
    } catch { setResult('Generation failed. Please try again.'); }
    setGenerating(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🎨 Content Studio</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate any content with AI — text, images, and more.</p>
      </div>

      {/* Content type tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {CONTENT_TYPES.map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id)}
            className={`p-3 rounded-xl border text-left transition-colors ${activeType === t.id ? 'border-violet-500 bg-violet-500/10' : 'border-border bg-card hover:bg-accent'}`}>
            <div className="font-medium text-sm">{t.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">What do you want to create?</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={6}
              placeholder={activeType === 'article' ? 'Write a comprehensive guide about AI automation for small businesses...' : activeType === 'image' ? 'A futuristic AI dashboard with glowing purple elements, dark theme...' : 'Describe what you want to create...'}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tone</label>
              <select value={options.tone} onChange={e => setOptions(o => ({ ...o, tone: e.target.value }))}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none">
                {['professional', 'casual', 'friendly', 'authoritative', 'humorous'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Length</label>
              <select value={options.length} onChange={e => setOptions(o => ({ ...o, length: e.target.value }))}
                className="w-full px-2 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none">
                {['short', 'medium', 'long', 'comprehensive'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <button onClick={generate} disabled={generating || !prompt}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white rounded-xl font-semibold disabled:opacity-50 transition-opacity">
            {generating ? '✨ Generating...' : '✨ Generate'}
          </button>
        </div>

        {/* Output */}
        <div className="bg-card border border-border rounded-xl p-4 min-h-[300px]">
          {result ? (
            activeType === 'image' && result.startsWith('http') ? (
              <img src={result} alt="Generated" className="w-full rounded-lg" />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )
          ) : generating ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Generating your content...</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-sm">Your generated content will appear here</p>
              </div>
            </div>
          )}
          {result && !result.startsWith('http') && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button onClick={() => navigator.clipboard.writeText(result)} className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-accent transition-colors">📋 Copy</button>
              <button className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-accent transition-colors">📥 Export</button>
              <button onClick={generate} className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-accent transition-colors">🔄 Regenerate</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
