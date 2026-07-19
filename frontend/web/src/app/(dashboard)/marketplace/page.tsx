'use client';
import { useState, useEffect } from 'react';
import { marketplaceApi } from '@/lib/api';

const CATEGORIES = ['All', 'Agents', 'Prompts', 'Workflows', 'Knowledge Bases'];

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => { loadListings(); }, [category]);

  const loadListings = async () => {
    try {
      const { data } = await marketplaceApi.list({ type: category === 'All' ? undefined : category.toLowerCase(), q: search || undefined });
      setListings(data.data ?? []);
    } catch {}
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🛒 AI Marketplace</h1>
          <p className="text-muted-foreground text-sm mt-1">Discover, buy, and sell AI agents, prompts, and workflows.</p>
        </div>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">
          + List Your Asset
        </button>
      </div>

      {/* Search + Categories */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadListings()}
          placeholder="Search agents, prompts, workflows..." className="flex-1 px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-violet-500" />
        <div className="flex gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === c ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Listings grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}
        {listings.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">🛒</div>
            <p className="font-medium">No listings yet</p>
            <p className="text-sm mt-1">Be the first to publish an agent or workflow!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: any }) {
  const [buying, setBuying] = useState(false);
  const handleBuy = async () => {
    setBuying(true);
    try { await marketplaceApi.purchase(listing.id); alert('Purchase successful!'); } catch { alert('Purchase failed.'); }
    setBuying(false);
  };
  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-violet-500/30 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shrink-0">
          {listing.type === 'agent' ? '🤖' : listing.type === 'prompt' ? '✍️' : '⚡'}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
          <span className="text-xs text-muted-foreground capitalize">{listing.type}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{listing.description}</p>
      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
        <span>⬇️ {listing.downloads?.toLocaleString() ?? 0} downloads</span>
        <span>⭐ {listing.ratingAvg?.toFixed(1) ?? '—'}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="font-bold">{listing.price > 0 ? `$${listing.price}` : 'Free'}</span>
        <button onClick={handleBuy} disabled={buying} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors">
          {buying ? '...' : listing.price > 0 ? 'Buy Now' : 'Install Free'}
        </button>
      </div>
    </div>
  );
}
