import { z } from 'zod';

export const sellerApplicationSchema = z.object({
  legalName: z.string().min(2, 'Legal name must be at least 2 characters'),
  suiteArea: z.enum(['NORTH_TERRACE', 'SOUTH_TERRACE', 'LOWER_FIRE'], {
    required_error: 'Please select a suite area',
  }),
  suiteNumber: z.coerce
    .number({
      required_error: 'Suite number is required',
      invalid_type_error: 'Suite number must be a number',
    })
    .int('Suite number must be a whole number')
    .positive('Suite number must be positive'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().min(10, 'Please provide more details (at least 10 characters)'),
  inviteCode: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'DENIED']),
  adminNote: z.string().optional(),
});

export type SellerApplicationInput = z.infer<typeof sellerApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
