export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Fire Suite Exchange';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const SUITE_CAPACITY = 8;

export const SUITE_AREAS = {
  NORTH_TERRACE: 'North Terrace',
  SOUTH_TERRACE: 'South Terrace',
  LOWER_FIRE: 'Lower Fire Suite',
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
      id: 'NORTH_TERRACE',
      name: 'North Terrace',
      suites: Array.from({ length: 20 }, (_, i) => i + 1),
      color: '#3B82F6', // blue-500
    },
    {
      id: 'SOUTH_TERRACE',
      name: 'South Terrace',
      suites: Array.from({ length: 20 }, (_, i) => i + 1),
      color: '#8B5CF6', // violet-500
    },
    {
      id: 'LOWER_FIRE',
      name: 'Lower Fire Suite',
      suites: Array.from({ length: 90 }, (_, i) => i + 1),
      color: '#F59E0B', // amber-500
    },
  ],
};

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024; // bytes
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
