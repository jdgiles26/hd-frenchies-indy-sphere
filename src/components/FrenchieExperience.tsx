import { useMemo, useRef, useState } from 'react';
import { AmbientCanvas } from '@/components/AmbientCanvas';
import { BloodlineBanner } from '@/components/BloodlineBanner';
import { FilterPills } from '@/components/FilterPills';
import { FrenchieDetailModal } from '@/components/FrenchieDetailModal';
import { FrenchieSphere } from '@/components/FrenchieSphere';
import { Header } from '@/components/Header';
import { FRENCHIES, getBloodlineIds } from '@/data/frenchies';
import type { FilterCategory, FrenchieProfile } from '@/types/frenchie';

export function FrenchieExperience() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [selectedDog, setSelectedDog] = useState<FrenchieProfile | null>(null);
  const [bloodlineSubject, setBloodlineSubject] =
    useState<FrenchieProfile | null>(null);

  // Shared 60fps velocity ref driving parallax between AmbientCanvas & FrenchieSphere
  const velocityRef = useRef({ x: 0, y: 0 });

  const bloodlineMemberCount = useMemo(
    () => (bloodlineSubject ? getBloodlineIds(bloodlineSubject).size : 0),
    [bloodlineSubject]
  );

  const handleSelectFilter = (filter: FilterCategory) => {
    setBloodlineSubject(null);
    setSelectedDog(null);
    setActiveFilter(filter);
  };

  const handleToggleBloodline = (dog: FrenchieProfile) => {
    if (bloodlineSubject?.id === dog.id) {
      setBloodlineSubject(null);
      setSelectedDog(null);
    } else {
      setBloodlineSubject(dog);
      setActiveFilter('All');
      setSelectedDog(null);
    }
  };

  const handleResetView = () => {
    setBloodlineSubject(null);
    setSelectedDog(null);
    setActiveFilter('All');
  };

  return (
    <main className="luxury-backdrop relative h-screen w-screen overflow-hidden text-white">
      <AmbientCanvas
        velocityRef={velocityRef}
        isBloodlineMode={bloodlineSubject !== null}
      />

      <Header onResetView={handleResetView} />

      {bloodlineSubject && !selectedDog && (
        <BloodlineBanner
          subject={bloodlineSubject}
          memberCount={bloodlineMemberCount}
          onExitBloodline={() => setBloodlineSubject(null)}
        />
      )}

      <FrenchieSphere
        frenchies={FRENCHIES}
        activeFilter={activeFilter}
        selectedId={selectedDog?.id ?? null}
        bloodlineSubject={bloodlineSubject}
        velocityRef={velocityRef}
        onSelectDog={(dog) => setSelectedDog(dog)}
      />

      {!selectedDog && (
        <FilterPills
          activeFilter={activeFilter}
          onSelectFilter={handleSelectFilter}
          disabled={bloodlineSubject !== null}
        />
      )}

      {selectedDog && (
        <FrenchieDetailModal
          dog={selectedDog}
          isBloodlineActive={bloodlineSubject?.id === selectedDog.id}
          onClose={() => setSelectedDog(null)}
          onToggleBloodline={handleToggleBloodline}
          onSelectRelative={(relative) => setSelectedDog(relative)}
        />
      )}
    </main>
  );
}

