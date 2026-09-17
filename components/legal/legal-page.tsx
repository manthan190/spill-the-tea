import { Coffee } from 'lucide-react';

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <main className="min-h-screen pb-20">
      <nav className="sticky top-0 z-40 backdrop-blur-2xl bg-zinc-950/60 border-b border-zinc-900">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-display text-white">
              Spill<span className="text-gradient">TheTea</span>
            </span>
          </a>
          <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Home
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 pt-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold font-display text-white mb-2">
            {title}
          </h1>
          <p className="text-sm text-zinc-500">Last updated: {lastUpdated}</p>
        </div>

        <div className="legal-content space-y-8">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-wrap items-center gap-4 text-sm">
          <a href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms</a>
          <a href="/privacy" className="text-zinc-500 hover:text-white transition-colors">Privacy</a>
          <a href="/refunds" className="text-zinc-500 hover:text-white transition-colors">Refunds</a>
          <a href="/" className="text-zinc-500 hover:text-white transition-colors ml-auto">Back to home</a>
        </div>
      </div>

      <style>{`
        .legal-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.75rem;
          font-family: var(--font-display), system-ui, sans-serif;
        }
        .legal-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #e4e4e7;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .legal-content p {
          color: #a1a1aa;
          line-height: 1.7;
          margin-bottom: 0.75rem;
        }
        .legal-content ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .legal-content li {
          color: #a1a1aa;
          line-height: 1.7;
          margin-bottom: 0.25rem;
        }
        .legal-content a {
          color: #FF007A;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .legal-content a:hover {
          color: #ff3a9c;
        }
        .legal-content strong {
          color: #e4e4e7;
          font-weight: 600;
        }
      `}</style>
    </main>
  );
}
