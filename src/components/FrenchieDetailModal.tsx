import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Check,
  Copy,
  Dna,
  GitBranch,
  Instagram,
  MessageSquareText,
  Plane,
  RotateCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BRAND } from '../config/brand';
import {
  getFrenchieById,
  hasBloodlineConnections,
} from '../data/frenchies';
import type { BloodlineRole, FrenchieProfile } from '../types/frenchie';
import { buildInquiryMessage, buildSmsInquiryUrl } from '../utils/inquiry';

interface FrenchieDetailModalProps {
  dog: FrenchieProfile;
  isBloodlineActive: boolean;
  onClose: () => void;
  onToggleBloodline: (dog: FrenchieProfile) => void;
  onSelectRelative: (dog: FrenchieProfile) => void;
}

export function FrenchieDetailModal({
  dog,
  isBloodlineActive,
  onClose,
  onToggleBloodline,
  onSelectRelative,
}: FrenchieDetailModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedDm, setCopiedDm] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setCopiedDm(false);
  }, [dog.id]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const smsUrl = buildSmsInquiryUrl(dog);
  const showBloodlineBtn = hasBloodlineConnections(dog);
  const hasThenAndNow = Boolean(dog.pastLitter);

  const relatives = useMemo(() => {
    const list: Array<{ profile: FrenchieProfile; role: Exclude<BloodlineRole, 'Selected'> }> = [];
    if (dog.sireId) {
      const sire = getFrenchieById(dog.sireId);
      if (sire) list.push({ profile: sire, role: 'Sire' });
    }
    if (dog.damId) {
      const dam = getFrenchieById(dog.damId);
      if (dam) list.push({ profile: dam, role: 'Dam' });
    }
    if (dog.siblingIds) {
      for (const sid of dog.siblingIds) {
        const sib = getFrenchieById(sid);
        if (sib) list.push({ profile: sib, role: 'Grown Sibling' });
      }
    }
    return list;
  }, [dog]);

  const loci = useMemo(
    () => dog.geneticsSummary.split(/\s+/).filter(Boolean),
    [dog.geneticsSummary]
  );

  const handleCopyForDm = async () => {
    try {
      await navigator.clipboard.writeText(buildInquiryMessage(dog));
      setCopiedDm(true);
      window.setTimeout(() => setCopiedDm(false), 2200);
    } catch {
      window.open(BRAND.instagramUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="frenchie-modal-title"
      className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
    >
      {/* Rich darkened scrim — prevents any background sphere distraction or bleed-through */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-obsidian-950/82 backdrop-blur-xl transition-opacity"
      />

      {/* High-Opacity Luxury Dark Glassmorphic Detail Card */}
      <div className="animate-modal-reveal relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl glass-modal text-white no-scrollbar">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail card"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-obsidian-950/90 text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-seafoam-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12">
          {/* LEFT: Portrait / 3D Flip Stage */}
          <div className="relative flex flex-col justify-between bg-obsidian-950/70 p-4 sm:col-span-5 sm:p-5 border-b border-white/10 sm:border-b-0 sm:border-r">
            <div className="perspective-1200 relative aspect-square w-full overflow-visible">
              <div
                className={`preserve-3d relative h-full w-full transition-transform duration-700 ease-out ${
                  isFlipped ? 'flip-y' : ''
                }`}
              >
                {/* Front Face */}
                <div className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-2xl">
                  <img
                    src={dog.pastLitter ? dog.pastLitter.puppyPhoto : dog.photo}
                    alt={`${dog.name} — ${dog.coatColor} French Bulldog`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-2.5 top-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow ${
                        dog.availability === 'Available Now'
                          ? 'bg-seafoam-300 text-obsidian-950'
                          : dog.availability === 'Stud Service'
                            ? 'bg-amethyst-500 text-white'
                            : dog.availability === 'Past Litters'
                              ? 'bg-champagne-400 text-obsidian-950'
                              : 'bg-white text-obsidian-950'
                      }`}
                    >
                      {dog.availability}
                    </span>
                  </div>
                  {hasThenAndNow && (
                    <span className="absolute bottom-2.5 left-2.5 rounded-full bg-obsidian-950/85 px-2.5 py-1 font-mono text-[10px] text-white/95 ring-1 ring-white/15 backdrop-blur-md">
                      8 Weeks Old &bull; Then
                    </span>
                  )}
                </div>

                {/* Back Face (Past Litters Then & Now) */}
                {dog.pastLitter && (
                  <div className="backface-hidden flip-y absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-champagne-400/70 bg-obsidian-950 shadow-2xl">
                    <img
                      src={dog.pastLitter.adultPhoto}
                      alt={`${dog.name} grown up`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/50 to-transparent" />
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-champagne-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-obsidian-950">
                      Grown Up &bull; {dog.pastLitter.adultAgeLabel}
                    </span>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 rounded-xl bg-obsidian-950/90 p-2.5 ring-1 ring-white/15 backdrop-blur-md">
                      <p className="text-xs leading-snug text-white italic">
                        &ldquo;{dog.pastLitter.ownerReview}&rdquo;
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-champagne-300">
                        {dog.pastLitter.ownerAttribution}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Controls Below Photo */}
            <div className="mt-3.5 flex flex-col gap-2">
              {hasThenAndNow && (
                <button
                  type="button"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-champagne-400/55 bg-champagne-400/15 px-3.5 py-2.5 text-xs font-semibold text-champagne-300 transition-all hover:bg-champagne-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-400"
                >
                  <RotateCw
                    className={`h-3.5 w-3.5 transition-transform duration-500 ${
                      isFlipped ? 'rotate-180' : ''
                    }`}
                  />
                  <span>
                    {isFlipped ? 'Flip: View 8-Week Puppy' : 'Flip: Then & Now'}
                  </span>
                </button>
              )}

              {showBloodlineBtn && (
                <button
                  type="button"
                  onClick={() => onToggleBloodline(dog)}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amethyst-400 ${
                    isBloodlineActive
                      ? 'bg-amethyst-500 text-white shadow-amethyst'
                      : 'border border-amethyst-400/50 bg-amethyst-500/20 text-amethyst-400 hover:bg-amethyst-500/35 hover:text-white'
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>
                    {isBloodlineActive
                      ? 'Exit Bloodline Orbit'
                      : 'View Bloodline'}
                  </span>
                </button>
              )}

              {/* Quick-Jump Pedigree Avatars */}
              {relatives.length > 0 && (
                <div className="mt-1 rounded-xl bg-white/[0.04] p-2.5 ring-1 ring-white/10">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
                    Direct Bloodline
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {relatives.map(({ profile, role }) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => onSelectRelative(profile)}
                        className="group inline-flex items-center gap-1.5 rounded-full bg-obsidian-900/90 py-1 pl-1 pr-2.5 text-[11px] font-medium text-white/90 ring-1 ring-white/12 transition-all hover:border-seafoam-300/50 hover:bg-white/10 hover:text-white"
                      >
                        <img
                          src={profile.photo}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <span>{profile.name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/45 group-hover:text-seafoam-300">
                          {role === 'Grown Sibling' ? 'Sib' : role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Profile Specs, Genetics, Health Badges & One-Tap Reserve CTA */}
          <div className="flex flex-col justify-between p-5 sm:col-span-7 sm:p-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-seafoam-300">
                {dog.registeredName}
              </p>
              <h2
                id="frenchie-modal-title"
                className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
              >
                {dog.name}
              </h2>

              <div className="mt-3.5 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/[0.05] px-3 py-2 ring-1 ring-white/10">
                  <span className="block text-[10px] uppercase tracking-wider text-white/50">
                    Coat
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-white">
                    {dog.coatColor}
                  </span>
                </div>
                <div className="rounded-xl bg-white/[0.05] px-3 py-2 ring-1 ring-white/10">
                  <span className="block text-[10px] uppercase tracking-wider text-white/50">
                    Gender
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-white">
                    {dog.gender}
                  </span>
                </div>
                <div className="rounded-xl bg-white/[0.05] px-3 py-2 ring-1 ring-white/10">
                  <span className="block text-[10px] uppercase tracking-wider text-white/50">
                    Age
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-white">
                    {dog.age}
                  </span>
                </div>
              </div>

              <p className="mt-3.5 text-xs leading-relaxed text-white/85 sm:text-sm">
                {dog.bio}
              </p>

              {/* Genetic Loci Pills */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
                  <Dna className="h-3 w-3 text-amethyst-400" />
                  DNA Loci:
                </span>
                {loci.map((locus) => (
                  <span
                    key={locus}
                    className="rounded-md bg-amethyst-500/15 px-1.5 py-0.5 font-mono text-[10px] text-amethyst-400 ring-1 ring-amethyst-400/25"
                  >
                    {locus}
                  </span>
                ))}
                <span className="ml-auto font-mono text-[10px] text-white/55">
                  {dog.weightEstimate}
                </span>
              </div>

              {/* Crisp Health & Trust Badges */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-seafoam-300/[0.1] px-3 py-2 text-xs font-medium text-seafoam-300 ring-1 ring-seafoam-300/30">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{dog.dnaPanel}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1 text-[11px] font-semibold text-white/95 ring-1 ring-white/15">
                    <Award className="h-3.5 w-3.5 text-champagne-400" />
                    {dog.akcStatus}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1 text-[11px] font-semibold text-white/95 ring-1 ring-white/15">
                    <Plane className="h-3.5 w-3.5 text-seafoam-300" />
                    {dog.deliveryBadge}
                  </span>
                </div>
              </div>
            </div>

            {/* One-Tap Reserve / Inquiry CTA */}
            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4">
              <a
                href={smsUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-seafoam-300 via-seafoam-400 to-amethyst-400 px-5 py-3 text-sm font-bold text-obsidian-950 shadow-glow transition-all duration-200 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-seafoam-300"
              >
                <MessageSquareText className="h-4 w-4" />
                <span>Text / DM About {dog.name}</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={BRAND.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white/90 ring-1 ring-white/15 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <Instagram className="h-3.5 w-3.5 text-amethyst-400" />
                  <span>DM {BRAND.instagramHandle}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyForDm}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white/90 ring-1 ring-white/15 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {copiedDm ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-seafoam-300" />
                      <span className="text-seafoam-300">Message Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-white/65" />
                      <span>Copy DM Note</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
