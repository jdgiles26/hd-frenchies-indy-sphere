import { FilterCategory } from '../types/frenchie';
import { FILTER_CATEGORIES, FRENCHIES, matchesFilter } from '../data/frenchies';

interface FilterPillsProps {
  activeFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  disabled?: boolean;
}

export function FilterPills({
  activeFilter,
  onSelectFilter,
  disabled = false,
}: FilterPillsProps) {
  return (
    <div className="fixed bottom-5 left-0 right-0 z-30 flex justify-center px-3 sm:bottom-7 pointer-events-none">
      <div
        role="tablist"
        aria-label="Filter French Bulldogs by coat and availability"
        className="pointer-events-auto no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full glass-surface p-1.5"
      >
        {FILTER_CATEGORIES.map((category) => {
          const isActive = !disabled && activeFilter === category;
          const count = FRENCHIES.filter((dog) =>
            matchesFilter(dog, category)
          ).length;

          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectFilter(category)}
              className={`group relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-seafoam-300 sm:px-4 ${
                isActive
                  ? 'bg-gradient-to-r from-seafoam-300/25 via-seafoam-400/25 to-amethyst-500/30 text-white ring-1 ring-seafoam-300/60 shadow-glow'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{category}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none transition-colors ${
                  isActive
                    ? 'bg-seafoam-300/20 text-seafoam-300'
                    : 'bg-white/5 text-white/45 group-hover:text-white/75'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
