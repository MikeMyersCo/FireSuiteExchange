import { z } from 'zod';

export const createListingSchema = z.object({
  eventTitle: z.string().min(2, 'Event title must be at least 2 characters'),
  eventDatetime: z.coerce.date({
    required_error: 'Event date and time is required',
    invalid_type_error: 'Invalid date format',
  }),
  quantity: z.coerce
    .number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity must be a number',
    })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(8, 'Quantity cannot exceed 8 seats'),
  pricePerSeat: z.coerce
    .number({
      required_error: 'Price per seat is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive('Price must be positive')
    .max(10000, 'Price per seat cannot exceed $10,000'),
  deliveryMethod: z.enum(['MOBILE_TRANSFER', 'PAPER', 'PDF', 'WILL_CALL', 'OTHER'], {
    required_error: 'Please select a delivery method',
  }),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  allowMessages: z.boolean().default(false),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  seatNumbers: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE']).default('ACTIVE'),
});

export const updateListingSchema = createListingSchema.partial();

export const markListingSoldSchema = z.object({
  soldPriceTotal: z.coerce.number().positive().optional(),
  soldBuyerName: z.string().optional(),
  soldBuyerEmail: z.string().email().optional().or(z.literal('')),
});

export const listingSearchSchema = z.object({
  q: z.string().optional(),
  area: z.enum(['NORTH_TERRACE', 'SOUTH_TERRACE', 'LOWER_FIRE']).optional(),
  suite: z.coerce.number().int().positive().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
  seatsMin: z.coerce.number().int().min(1).max(8).optional(),
  deliveryMethod: z
    .enum(['MOBILE_TRANSFER', 'PAPER', 'PDF', 'WILL_CALL', 'OTHER'])
    .optional(),
  status: z.enum(['ACTIVE', 'SOLD']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['date', 'price', 'newest']).default('date'),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type MarkListingSoldInput = z.infer<typeof markListingSoldSchema>;
export type ListingSearchInput = z.infer<typeof listingSearchSchema>;
