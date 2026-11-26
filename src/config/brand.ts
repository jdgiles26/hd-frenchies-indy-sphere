export interface BrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  location: string;
  smsPhone: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  facebookHandle: string;
  facebookUrl: string;
  tiktokHandle: string;
  websiteUrl: string;
  logoPath: string;
  bannerPath: string;
}

const smsPhone =
  (import.meta.env.VITE_SMS_PHONE as string | undefined)?.trim() ||
  '+13175550199';

const instagramHandle =
  (import.meta.env.VITE_INSTAGRAM_HANDLE as string | undefined)?.trim() ||
  'hdfrenchiesindy';

const facebookHandle =
  (import.meta.env.VITE_FACEBOOK_HANDLE as string | undefined)?.trim() ||
  'hdfrenchiesindy';

const tiktokHandle =
  (import.meta.env.VITE_TIKTOK_HANDLE as string | undefined)?.trim() ||
  'hdfrenchiesindy';

const contactEmail =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim() ||
  'hdfrenchiesindy@gmail.com';

export const BRAND: BrandConfig = {
  name: 'HD FRENCHIES INDY',
  shortName: 'HD Frenchies Indy',
  tagline: 'Rooted in Love, Growing a Higher Dimension',
  location: 'Indianapolis, Indiana',
  smsPhone,
  email: contactEmail,
  instagramHandle: `@${instagramHandle.replace(/^@/, '')}`,
  instagramUrl: `https://www.instagram.com/${instagramHandle.replace(/^@/, '')}/`,
  facebookHandle: 'HD Frenchies Indy',
  facebookUrl: `https://www.facebook.com/${facebookHandle.replace(/^@/, '')}`,
  tiktokHandle: `@${tiktokHandle.replace(/^@/, '')}`,
  websiteUrl: 'https://www.hdfrenchiesindy.com',
  logoPath: '/brand/hd-frenchies-logo.svg',
  bannerPath: '/brand/hd-frenchies-banner.jpg',
};
