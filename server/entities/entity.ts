import { randomUUID } from 'crypto';

export type CreateEntityParams = {id?: string, createdAt?: Date, updatedAt?: Date, deletedAt?: Date | null };
export function entityFactory(params?: CreateEntityParams) {
  return {
    id:  params?.id || randomUUID(),
    createdAt: params?.createdAt || new Date(),
    updatedAt: params?.updatedAt || new Date(),
    deletedAt: params?.deletedAt || null,
  }
}