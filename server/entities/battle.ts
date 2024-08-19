import { entityFactory, type CreateEntityParams } from './entity';

type CreateBattleParams = CreateEntityParams & {name: string, instagram: string, lat: number, lon: number}
export function battleFactory(params: CreateBattleParams) : Required<CreateBattleParams> {
  return {
    ...entityFactory(params),
    ...params,
  }
}