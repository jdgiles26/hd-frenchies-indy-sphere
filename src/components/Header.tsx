import { Instagram, MessageSquareText } from 'lucide-react';
import { BRAND } from '../config/brand';

interface HeaderProps {
  onResetView: () => void;
}

export function Header({ onResetView }: HeaderProps) {
  const smsHref = `sms:${BRAND.smsPhone.replace(/[^\d+]/g, '')}?body=${encodeURIComponent(
    'Hi HD Frenchies Indy! I would love to learn more about your available AKC French Bulldog puppies.'
  )}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <button
          type="button"
          onClick={onResetView}
          className="pointer-events-auto group flex items-center gap-3 rounded-full glass-pill px-3.5 py-2 transition-all duration-300 hover:border-seafoam-300/40 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-seafoam-300"
          aria-label="HD Frenchies Indy — Reset 3D Sphere View"
        >
          <img
            src={BRAND.logoPath}
            alt="HD Frenchies Indy Crest"
            className="h-8 w-8 rounded-full object-contain ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="text-left">
            <span className="block font-display text-sm font-bold tracking-[0.16em] text-white sm:text-base">
              {BRAND.name}
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-seafoam-300/85 sm:block">
              AKC French Bulldogs &bull; Indianapolis, IN
            </span>
          </div>
        </button>

        <nav
          aria-label="Contact and Social"
          className="pointer-events-auto flex items-center gap-2"
        >
          <a
            href={smsHref}
            className="hidden sm:inline-flex items-center gap-2 rounded-full glass-pill px-4 py-2 text-xs font-semibold tracking-wide text-white/90 transition-all duration-200 hover:border-seafoam-300/50 hover:text-seafoam-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-seafoam-300"
          >
            <MessageSquareText className="h-3.5 w-3.5 text-seafoam-300" />
            <span>Contact</span>
          </a>

          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full glass-pill px-4 py-2 text-xs font-semibold tracking-wide text-white transition-all duration-200 hover:border-amethyst-400/60 hover:bg-amethyst-500/20 hover:shadow-amethyst focus:outline-none focus-visible:ring-2 focus-visible:ring-amethyst-400"
          >
            <Instagram className="h-3.5 w-3.5 text-amethyst-400" />
            <span className="sm:hidden">Contact / IG</span>
            <span className="hidden sm:inline">Instagram {BRAND.instagramHandle}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
