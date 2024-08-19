import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import * as v from 'valibot';
import { battleTable } from '~/server/database/schema';
import { battleFactory } from '~/server/entities/battle';
import { useDatabase } from '~/server/utils/useDatabase';

const createBattleSchema = v.object({
  name: v.string('name is required'),
  instagram: v.string('instagram is required'),
  lat: v.number('lat is required'),
  lon: v.number('lon is required'),
})

function battleValidator(data: unknown) {
  return v.safeParse(createBattleSchema, data)
}

export default defineEventHandler(
  async (event) => {
    const result = await readValidatedBody(event, battleValidator)
    if (!result.success) throw createError({
      statusCode: StatusCodes.BAD_REQUEST,
      statusMessage: ReasonPhrases.BAD_REQUEST,
      message: result.issues.map((issue) => issue.message).join(', ')
    })
    const db = await useDatabase(event);
    const [createdBattle] = await db.insert(battleTable)
      .values(battleFactory(result.output))
      .returning({
        id: battleTable.id,
      });
    const { id } = createdBattle;
    setResponseStatus(event, StatusCodes.CREATED)
    return { ...result.output, id };
  }
)
