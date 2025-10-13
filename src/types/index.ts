import { User, Suite, Listing, SellerApplication, ListingImage } from '@prisma/client';

export type UserRole = 'GUEST' | 'SELLER' | 'ADMIN';

export type ListingWithRelations = Listing & {
  seller: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
  suite: Suite;
  images: ListingImage[];
};

export type ApplicationWithRelations = SellerApplication & {
  user: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
  suite: Suite;
};

export interface SearchFilters {
  q?: string;
  area?: string;
  suite?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  seatsMin?: number;
  deliveryMethod?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'date' | 'price' | 'newest';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}
