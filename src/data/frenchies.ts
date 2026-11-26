import type { FilterCategory, FrenchieProfile } from '../types/frenchie';

/**
 * HD Frenchies Indy — Master Kennel Roster
 *
 * PHOTO SWAP GUIDE:
 * Every dog's portrait resolves from `/public/images/frenchies/`.
 * To replace any studio placeholder with a live Facebook or Google Drive photo:
 *   1. Drop the image into `public/images/frenchies/<filename>.jpg`
 *   2. Update the `photo` (and `pastLitter.puppyPhoto` / `adultPhoto`) path below
 *   3. Run `npm run drift` to verify all asset paths and bloodline links pass.
 */
export const FRENCHIES: readonly FrenchieProfile[] = [
  {
    id: 'nova',
    name: 'Nova',
    registeredName: 'HD Indy Supernova',
    coatColor: 'Lilac & Tan',
    coatTags: ['Lilac & Tan'],
    gender: 'Female',
    age: '8 Weeks',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Available Now',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/nova-lilac-tan-puppy.jpg',
    bio: 'Compact cobby structure with symmetrical tan points, open nares, and a confident, affectionate temperament raised in-home in Indianapolis.',
    weightEstimate: '18–21 lbs mature',
    geneticsSummary: 'at/at d/d co/co E/e ky/ky',
    sireId: 'titan',
    damId: 'willow',
    siblingIds: ['amethyst', 'kobe'],
  },
  {
    id: 'atlas',
    name: 'Atlas',
    registeredName: 'HD Indy Blue Atlas',
    coatColor: 'Blue Merle',
    coatTags: ['Merle'],
    gender: 'Male',
    age: '9 Weeks',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Available Now',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/atlas-blue-merle-puppy.jpg',
    bio: 'Crisp silver-blue merle marbling with heavy bone, wide chest, and playful curiosity. Vet-checked, microchipped, and current on vaccinations.',
    weightEstimate: '22–25 lbs mature',
    geneticsSummary: 'ay/at d/d B/b M/m',
    sireId: 'zeus',
    damId: 'cleo',
    siblingIds: ['kobe'],
  },
  {
    id: 'luna',
    name: 'Luna',
    registeredName: 'HD Indy Velvet Luna',
    coatColor: 'Lilac Merle',
    coatTags: ['Merle', 'Lilac & Tan'],
    gender: 'Female',
    age: '8 Weeks',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Available Now',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/luna-lilac-merle-puppy.jpg',
    bio: 'Rare lilac merle with distinct tan eyebrows and a velvety silver-lavender sheen. Socialized daily around family and household sounds.',
    weightEstimate: '17–20 lbs mature',
    geneticsSummary: 'at/at d/d co/co M/m',
    sireId: 'titan',
    damId: 'cleo',
    siblingIds: ['amethyst', 'kobe'],
  },
  {
    id: 'pearl',
    name: 'Pearl',
    registeredName: 'HD Indy Ivory Pearl',
    coatColor: 'Platinum Cream',
    coatTags: ['Platinum'],
    gender: 'Female',
    age: '8 Weeks',
    akcStatus: 'AKC Registered',
    dnaPanel: '4-Panel DNA Health Cleared',
    availability: 'Available Now',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/pearl-platinum-puppy.jpg',
    bio: 'Luminous platinum cream carrying lilac and tan underneath. Short backed, expressive dark eyes, and ready for Indianapolis pickup or flight nanny.',
    weightEstimate: '18–21 lbs mature',
    geneticsSummary: 'e/e d/d co/co at/a',
    sireId: 'titan',
    damId: 'willow',
    siblingIds: ['amethyst'],
  },
  {
    id: 'titan',
    name: 'Titan',
    registeredName: 'HD Indy King Titan',
    coatColor: 'Lilac & Tan',
    coatTags: ['Lilac & Tan'],
    gender: 'Male',
    age: '2.5 Years',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Stud Service',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/titan-lilac-tan-stud.jpg',
    bio: 'Proven AKC Lilac & Tan foundation sire. Thick bone, clean breathing, crisp tan points, and consistent producer of compact show-type litters.',
    weightEstimate: '24 lbs',
    geneticsSummary: 'at/at d/d co/co E/e n/n',
    siblingIds: ['amethyst'],
  },
  {
    id: 'zeus',
    name: 'Zeus',
    registeredName: 'HD Indy Storm Zeus',
    coatColor: 'Blue Merle',
    coatTags: ['Merle'],
    gender: 'Male',
    age: '3 Years',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Stud Service',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/zeus-blue-merle-stud.jpg',
    bio: 'High-contrast Blue Merle stud with balanced head-to-body ratio, athletic drive, and overnight chilled shipping or local Indianapolis stud service.',
    weightEstimate: '25 lbs',
    geneticsSummary: 'at/a d/d co/CO M/m',
    siblingIds: ['kobe'],
  },
  {
    id: 'cleo',
    name: 'Cleo',
    registeredName: 'HD Indy Duchess Cleo',
    coatColor: 'Blue Merle',
    coatTags: ['Merle'],
    gender: 'Female',
    age: '2 Years',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Breeding Dam',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/cleo-blue-merle-dam.jpg',
    bio: 'Refined Blue Merle foundation dam celebrated for her gentle mothering, clean topline, and balanced merle expression.',
    weightEstimate: '20 lbs',
    geneticsSummary: 'ay/at d/d M/m ky/ky',
    siblingIds: ['kobe'],
  },
  {
    id: 'willow',
    name: 'Willow',
    registeredName: 'HD Indy Velvet Willow',
    coatColor: 'Lilac & Tan',
    coatTags: ['Lilac & Tan'],
    gender: 'Female',
    age: '2.5 Years',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Breeding Dam',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/willow-lilac-tan-dam.jpg',
    bio: 'Velvety Lilac & Tan foundation dam with textbook bat ears, open nostrils, and sweet, people-first personality.',
    weightEstimate: '19 lbs',
    geneticsSummary: 'at/at d/d co/co E/e',
    siblingIds: ['amethyst'],
  },
  {
    id: 'kobe',
    name: 'Kobe',
    registeredName: 'HD Indy Kobe (2025 Litter)',
    coatColor: 'Blue & Tan',
    coatTags: ['Blue & Tan'],
    gender: 'Male',
    age: '18 Months',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Past Litters',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/kobe-blue-tan-puppy.jpg',
    bio: 'Alumni from our Spring 2025 Zeus × Cleo pairing—grown into a muscular, athletic 23 lb Blue & Tan companion living in Indianapolis.',
    weightEstimate: '23 lbs mature',
    geneticsSummary: 'at/at d/d B/b',
    sireId: 'zeus',
    damId: 'cleo',
    siblingIds: ['atlas', 'luna'],
    pastLitter: {
      puppyPhoto: '/images/frenchies/kobe-blue-tan-puppy.jpg',
      adultPhoto: '/images/frenchies/kobe-blue-tan-adult.jpg',
      adultAgeLabel: '18 Months Old',
      ownerReview:
        'Best temperament we have ever owned—healthy, compact, and turns heads everywhere in Broad Ripple.',
      ownerAttribution: 'Jordan M. — Indianapolis, IN',
    },
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    registeredName: 'HD Indy Amethyst (2024 Litter)',
    coatColor: 'Lilac & Tan',
    coatTags: ['Lilac & Tan'],
    gender: 'Female',
    age: '2 Years',
    akcStatus: 'AKC Registered',
    dnaPanel: '5-Panel DNA Health Cleared',
    availability: 'Past Litters',
    deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available',
    photo: '/images/frenchies/amethyst-lilac-tan-puppy.jpg',
    bio: 'Beloved Titan × Willow graduate showcasing our signature velvety lilac pigment, clean structure, and loyal family temperament.',
    weightEstimate: '19 lbs mature',
    geneticsSummary: 'at/at d/d co/co',
    sireId: 'titan',
    damId: 'willow',
    siblingIds: ['nova', 'pearl'],
    pastLitter: {
      puppyPhoto: '/images/frenchies/amethyst-lilac-tan-puppy.jpg',
      adultPhoto: '/images/frenchies/amethyst-lilac-tan-adult.jpg',
      adultAgeLabel: '2 Years Old',
      ownerReview:
        'Zero health issues, velvety lilac coat, and the sweetest snuggle bug from day one.',
      ownerAttribution: 'Taylor R. — Carmel, IN',
    },
  },
];

export const FILTER_CATEGORIES: readonly FilterCategory[] = [
  'All',
  'Available Now',
  'Studs',
  'Lilac & Tan',
  'Merle',
  'Past Litters',
];

export function matchesFilter(
  frenchie: FrenchieProfile,
  filter: FilterCategory
): boolean {
  switch (filter) {
    case 'All':
      return true;
    case 'Available Now':
      return frenchie.availability === 'Available Now';
    case 'Studs':
      return frenchie.availability === 'Stud Service';
    case 'Lilac & Tan':
      return frenchie.coatTags.includes('Lilac & Tan');
    case 'Merle':
      return frenchie.coatTags.includes('Merle');
    case 'Past Litters':
      return frenchie.availability === 'Past Litters';
  }
}

export function getFrenchieById(id: string): FrenchieProfile | undefined {
  return FRENCHIES.find((dog) => dog.id === id);
}

export function getBloodlineIds(dog: FrenchieProfile): Set<string> {
  const ids = new Set<string>([dog.id]);
  if (dog.sireId) ids.add(dog.sireId);
  if (dog.damId) ids.add(dog.damId);
  if (dog.siblingIds) {
    for (const sibId of dog.siblingIds) {
      ids.add(sibId);
    }
  }
  return ids;
}

export function getBloodlineRole(
  subject: FrenchieProfile,
  candidateId: string
): 'Selected' | 'Sire' | 'Dam' | 'Grown Sibling' | null {
  if (candidateId === subject.id) return 'Selected';
  if (candidateId === subject.sireId) return 'Sire';
  if (candidateId === subject.damId) return 'Dam';
  if (subject.siblingIds?.includes(candidateId)) return 'Grown Sibling';
  return null;
}

export function hasBloodlineConnections(dog: FrenchieProfile): boolean {
  return Boolean(
    dog.sireId || dog.damId || (dog.siblingIds && dog.siblingIds.length > 0)
  );
}
