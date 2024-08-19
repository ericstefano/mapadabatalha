import { randomUUID } from 'crypto';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { entityFactory } from './entity';
describe('entityFactory', () => {
  afterAll(() => {
    vi.mock('crypto', () => ({
      randomUUID: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a random id', () => {
    const id = '1111-1111-1111-1111-1111';

    vi.mocked(randomUUID).mockReturnValue(id);

    const entity = entityFactory();

    expect(entity.id).toBeTruthy();
    expect(entity.id).toBe(id);
  });

  it('should be able to create with a passed id', () => {
    const id = 'abcd';
    const entity = entityFactory({id});
    expect(entity.id).toBe(id);
    expect(randomUUID).not.toBeCalled();
  });

  it('should be able to create with all params', () => {
    const entityData = {
      id :'abcd',
      createdAt :new Date('2022-01-01'),
      updatedAt :new Date('2023-01-05'),
      deletedAt :new Date(),
    }

    const entity = entityFactory(entityData);
    expect(entity).toMatchObject(entityData);
  });
});
