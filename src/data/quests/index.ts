import { DYING_WORLD, DYING_WORLD_TRUST } from './main';
import { DOLLS_ECHO } from './side';
import type { QuestDef } from './types';

export * from './types';

export const QUESTS: Record<string, QuestDef> = {
  [DYING_WORLD.id]: DYING_WORLD,
  [DYING_WORLD_TRUST.id]: DYING_WORLD_TRUST,
  [DOLLS_ECHO.id]: DOLLS_ECHO,
};