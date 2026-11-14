import type { QuestDef } from './types';

export const DOLLS_ECHO: QuestDef = {
  id: 'dolls-echo',
  name: "A Doll's Echo",
  description: "Elric went into the ruins and never returned. Bring his locket back to his sister.",
  steps: [
    { type: 'kill', target: 'void-stalker', count: 5, instruction: 'Defeat 5 Void Stalkers in the ruins' },
    { type: 'collect', target: 'locket-of-elric', instruction: 'Collect the Locket of Elric' },
    { type: 'talk', target: 'girl', instruction: 'Return the Locket to the Young Girl' },
  ],
  rewards: [
    { id: 'shard-of-resonance', name: 'Shard of Resonance', qty: 1 },
  ],
};