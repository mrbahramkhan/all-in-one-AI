export const metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Your AI Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your AI workspace is ready.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-muted-foreground text-xs">Tokens</p>
          <p className="text-lg font-bold mt-1">2.4M</p>
          <p className="text-xs mt-1 text-violet-500">Chat</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-muted-foreground text-xs">Cost</p>
          <p className="text-lg font-bold mt-1">$12.40</p>
          <p className="text-xs mt-1 text-green-500">Cost</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-muted-foreground text-xs">Chats</p>
          <p className="text-lg font-bold mt-1">142</p>
          <p className="text-xs mt-1 text-blue-500">Chats</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-muted-foreground text-xs">Agents</p>
          <p className="text-lg font-bold mt-1">8</p>
          <p className="text-xs mt-1 text-orange-500">Agents</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/chat" className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors">
            <div className="text-lg font-semibold text-violet-500">[Chat]</div>
            <div className="font-medium text-sm">New Chat</div>
            <div className="text-xs text-muted-foreground mt-1">Start AI conversation</div>
          </a>
          <a href="/agents" className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors">
            <div className="text-lg font-semibold text-violet-500">[Agents]</div>
            <div className="font-medium text-sm">Agents</div>
            <div className="text-xs text-muted-foreground mt-1">Build AI agents</div>
          </a>
          <a href="/workflows" className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors">
            <div className="text-lg font-semibold text-violet-500">[Workflows]</div>
            <div className="font-medium text-sm">Workflows</div>
            <div className="text-xs text-muted-foreground mt-1">Automate tasks</div>
          </a>
          <a href="/studio" className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors">
            <div className="text-lg font-semibold text-violet-500">[Studio]</div>
            <div className="font-medium text-sm">Studio</div>
            <div className="text-xs text-muted-foreground mt-1">Generate content</div>
          </a>
        </div>
      </div>
    </div>
  );
}
