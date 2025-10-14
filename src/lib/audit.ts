import { db } from './db';

export interface AuditEventData {
  actorId?: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditEvent(data: AuditEventData) {
  try {
    await db.auditEvent.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        metadata: (data.metadata || {}) as any,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit event:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

export const AuditActions = {
  // User actions
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGIN_FAILED: 'USER_LOGIN_FAILED',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_PASSWORD_RESET_REQUESTED: 'USER_PASSWORD_RESET_REQUESTED',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',

  // Seller application actions
  SELLER_APPLICATION_CREATED: 'SELLER_APPLICATION_CREATED',
  SELLER_APPLICATION_APPROVED: 'SELLER_APPLICATION_APPROVED',
  SELLER_APPLICATION_DENIED: 'SELLER_APPLICATION_DENIED',

  // Listing actions
  LISTING_CREATED: 'LISTING_CREATED',
  LISTING_UPDATED: 'LISTING_UPDATED',
  LISTING_DELETED: 'LISTING_DELETED',
  LISTING_MARKED_SOLD: 'LISTING_MARKED_SOLD',
  LISTING_WITHDRAWN: 'LISTING_WITHDRAWN',
  LISTING_MODERATED: 'LISTING_MODERATED',

  // Admin actions
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  USER_LOCKED: 'USER_LOCKED',
  USER_UNLOCKED: 'USER_UNLOCKED',
} as const;
