import type { QuestDef } from './types';

// --- Non-trust ---
export const DYING_WORLD: QuestDef = {
  id: 'dying-world',
  name: 'Whispers of a Dying World',
  description: 'A dying world, a voice in the void. Find out where you are.',
  steps: [
    { type: 'talk',  target: 'miller',              instruction: 'Find out where you are — talk to the Old Miller' },
    { type: 'flag',  target: 'hasWeapon',           instruction: 'Find a weapon' },
    { type: 'enter-level', target: 'ruins',         instruction: 'Travel to the ruins west of the village' },
    { type: 'flag',  target: 'battleTutorialDone',  instruction: 'Complete the ruins trial' },
    { type: 'flag',  target: 'hasBackpack',         instruction: 'Return to the village Elder' },
    { type: 'flag',  target: 'exchangeUnlocked',    instruction: 'Return to the blacksmith' },
  ],
  rewards: [],
};

// --- Trust (merchant accepted) ---
export const DYING_WORLD_TRUST: QuestDef = {
  id: 'dying-world-trust',
  name: 'Whispers of a Dying World',
  description: 'The merchant has offered to guide you to the ruins.',
  steps: [
    { type: 'talk',  target: 'miller',              instruction: 'Find out where you are — talk to the Old Miller' },
    { type: 'flag',  target: 'merchantAccepted',    instruction: 'Travel to the ruins with the merchant' },
    { type: 'enter-level', target: 'ruins',         instruction: 'Travel to the ruins west of the village' },
    { type: 'flag',  target: 'battleTutorialDone',  instruction: 'Complete the ruins trial' },
    { type: 'flag',  target: 'seenMerchantGone',    instruction: 'Return to where the merchant was' },
    { type: 'flag',  target: 'hasBackpack',         instruction: 'Return to the village Elder' },
    { type: 'flag',  target: 'exchangeUnlocked',    instruction: 'Return to the blacksmith' },
  ],
  rewards: [],
};