import { BRAND } from '../config/brand';
import type { FrenchieProfile } from '../types/frenchie';

/**
 * Builds an iOS & Android compatible `sms:` URI pre-filled with the puppy's name
 * and coat color so prospective owners can reserve or inquire in one tap.
 */
export function buildSmsInquiryUrl(dog: FrenchieProfile): string {
  const actionPhrase =
    dog.availability === 'Stud Service'
      ? `stud service with ${dog.name}`
      : dog.availability === 'Past Litters'
        ? `upcoming litters similar to ${dog.name}`
        : `reserving ${dog.name}`;

  const message = `Hi HD Frenchies Indy! I'm interested in ${actionPhrase} (${dog.coatColor} ${dog.gender}). Could you share availability, pricing, and next steps?`;

  const isIos =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/i.test(navigator.userAgent);
  const separator = isIos ? '&' : '?';
  const cleanPhone = BRAND.smsPhone.replace(/[^\d+]/g, '');

  return `sms:${cleanPhone}${separator}body=${encodeURIComponent(message)}`;
}

export function buildInquiryMessage(dog: FrenchieProfile): string {
  return `Hi HD Frenchies Indy! I'm reaching out about ${dog.name} (${dog.coatColor}, ${dog.gender}) from your 3D Frenchie Sphere. Is ${dog.name} still available?`;
}

export function buildMailtoInquiryUrl(dog: FrenchieProfile): string {
  const subject = `HD Frenchies Indy Inquiry — ${dog.name} (${dog.coatColor})`;
  const body = buildInquiryMessage(dog);
  return `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
