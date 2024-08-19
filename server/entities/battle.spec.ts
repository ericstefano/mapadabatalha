import { randomUUID } from 'crypto';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { battleFactory } from './battle';

describe('battleFactory', () => {
  afterAll(() => {
    vi.mock('crypto', () => ({
      randomUUID: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a Battle with a random id', () => {
    const id = '1111-1111-1111-1111-1111';
    vi.mocked(randomUUID).mockReturnValue(id);
    const battleData = {
      name: 'Battle 1',
      instagram: '@battle1',
      lat: 10.123456,
      lon: 20.654321,
    }
    const battle = battleFactory(battleData);
    expect(battle.id).toBeTruthy();
    expect(battle.id).toBe(id);
    expect(battle).toMatchObject(battleData)
  });

  it('should be able to create a Battle with a passed id', () => {
    const battleData = {
      id :'abcd',
      name :'Battle 2',
      instagram :'@battle2',
      lat :30.123456,
      lon :40.654321,
    }
    expect(randomUUID).not.toBeCalled();
    const battle = battleFactory(battleData);
    expect(battle).toMatchObject(battleData)
  });

  it('should be able to create a Battle with all params', () => {
    const battleData = {
      id: 'abcd',
      name: 'Battle 3',
      instagram: '@battle3',
      lat: 50.123456,
      lon: 60.654321,
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2023-01-05'),
      deletedAt: new Date(),
    }

    const battle = battleFactory(battleData);
    expect(battle).toMatchObject(battleData);
  });
});