export type QuestStepType = 'kill' | 'talk' | 'collect' | 'reach' | 'enter-level' | 'flag';

export interface QuestStep {
  type: QuestStepType;
  target?: string;
  count?: number;
  instruction: string;
}

export interface QuestReward {
  id: string; name: string; qty: number;
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  steps: QuestStep[];
  rewards: QuestReward[];
}