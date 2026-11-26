import { ArrowLeft, GitBranch } from 'lucide-react';
import type { FrenchieProfile } from '../types/frenchie';

interface BloodlineBannerProps {
  subject: FrenchieProfile;
  memberCount: number;
  onExitBloodline: () => void;
}

export function BloodlineBanner({
  subject,
  memberCount,
  onExitBloodline,
}: BloodlineBannerProps) {
  return (
    <div className="fixed top-20 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none sm:top-24">
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 rounded-full glass-surface px-4 py-2 border-amethyst-400/45 shadow-amethyst">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amethyst-500/25 text-amethyst-400">
            <GitBranch className="h-3.5 w-3.5" />
          </span>
          <span className="font-display font-semibold text-white">
            {subject.name}&rsquo;s Bloodline Orbit
          </span>
          <span className="hidden text-xs text-white/65 sm:inline">
            &bull; {memberCount} orbiting dogs (Sire, Dam &amp; Siblings)
          </span>
        </div>

        <button
          type="button"
          onClick={onExitBloodline}
          className="inline-flex items-center gap-1.5 rounded-full bg-seafoam-300 px-3.5 py-1.5 text-xs font-bold text-obsidian-950 transition-all duration-200 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-seafoam-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Frenchies</span>
        </button>
      </div>
    </div>
  );
}
