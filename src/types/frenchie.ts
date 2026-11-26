export type AvailabilityStatus =
  | 'Available Now'
  | 'Stud Service'
  | 'Breeding Dam'
  | 'Past Litters';

export type FilterCategory =
  | 'All'
  | 'Available Now'
  | 'Studs'
  | 'Lilac & Tan'
  | 'Merle'
  | 'Past Litters';

export type DogGender = 'Male' | 'Female';

export type BloodlineRole = 'Selected' | 'Sire' | 'Dam' | 'Grown Sibling';

export interface PastLitterTransform {
  puppyPhoto: string;
  adultPhoto: string;
  adultAgeLabel: string;
  ownerReview: string;
  ownerAttribution: string;
}

export interface FrenchieProfile {
  id: string;
  name: string;
  registeredName: string;
  coatColor: string;
  coatTags: Array<'Lilac & Tan' | 'Merle' | 'Blue & Tan' | 'Platinum'>;
  gender: DogGender;
  age: string;
  akcStatus: 'AKC Registered' | 'AKC Registration Pending';
  dnaPanel: '4-Panel DNA Health Cleared' | '5-Panel DNA Health Cleared';
  availability: AvailabilityStatus;
  deliveryBadge: 'Indianapolis Pickup / Flight Nanny Available';
  photo: string;
  bio: string;
  weightEstimate: string;
  geneticsSummary: string;
  sireId?: string;
  damId?: string;
  siblingIds?: string[];
  pastLitter?: PastLitterTransform;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SphericalAngles {
  rotX: number;
  rotY: number;
}

export interface BloodlineRelation {
  profile: FrenchieProfile;
  role: BloodlineRole;
}
