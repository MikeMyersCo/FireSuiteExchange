export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Fire Suite Exchange';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const SUITE_CAPACITY = 8;

export const SUITE_AREAS = {
  L: 'Lower Fire Suite',
  UNT: 'Upper North Terrace',
  UST: 'Upper South Terrace',
} as const;

export const DELIVERY_METHODS = {
  MOBILE_TRANSFER: 'Mobile Transfer',
  PAPER: 'Paper Tickets',
  PDF: 'PDF/E-Ticket',
  WILL_CALL: 'Will Call',
  OTHER: 'Other',
} as const;

export const LISTING_STATUS_LABELS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PENDING_MODERATION: 'Pending Review',
  SOLD: 'Sold',
  WITHDRAWN: 'Withdrawn',
  EXPIRED: 'Expired',
} as const;

export const APPLICATION_STATUS_LABELS = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  DENIED: 'Denied',
} as const;

export const SUITE_DATA = {
  areas: [
    {
      id: 'L',
      name: 'Lower Fire Suite',
      prefix: 'L',
      suites: Array.from({ length: 90 }, (_, i) => i + 1),
      color: '#F59E0B', // amber-500
    },
    {
      id: 'UNT',
      name: 'Upper North Terrace',
      prefix: 'UNT',
      suites: Array.from({ length: 20 }, (_, i) => i + 1),
      color: '#3B82F6', // blue-500
    },
    {
      id: 'UST',
      name: 'Upper South Terrace',
      prefix: 'UST',
      suites: Array.from({ length: 20 }, (_, i) => i + 1),
      color: '#8B5CF6', // violet-500
    },
  ],
};

// Helper function to format suite display name
export const formatSuiteName = (area: string, number: number): string => {
  return `${area}${number}`;
};

// Helper function to get all possible suites
export const getAllSuites = () => {
  return SUITE_DATA.areas.flatMap(area =>
    area.suites.map(num => ({
      area: area.id,
      number: num,
      displayName: formatSuiteName(area.prefix, num),
      areaName: area.name,
    }))
  );
};

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024; // bytes
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
