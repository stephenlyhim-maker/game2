import type { DialogueLine } from '../../scenes/DialogueScene';

export const LYRA_DIALOGUES: Record<string, DialogueLine[]> = {
  awakening: [
    { speaker: 'Lyra', text: '"You carry something... I cannot name it."', color: '#c0a0ff', character: 'cg-lyra' },
    { speaker: 'Lyra', text: '"The Tides hunger for what you are. Do not run blindly."', color: '#c0a0ff', character: 'cg-lyra' },
    { speaker: 'Blade', text: 'I wake in a dimly lit room. My body feels foreign. A small window shows grey dawn.', color: '#ffd870' },
    { speaker: 'Blade', text: 'Where am I? Who... what am I?', color: '#ffd870' },
    { speaker: 'Blade', text: 'I should find out where I am.', color: '#ffd870' },
  ],
  ruinsEntry: [
    { speaker: 'Lyra', text: '"You walk where the void is thinnest."', color: '#c0a0ff', character: 'cg-lyra' },
    { speaker: 'Lyra', text: '"The Stalkers are what remains of those who came before you. Do not join them."', color: '#c0a0ff', character: 'cg-lyra' },
    { speaker: 'Blade', text: 'The fog is thick. Something is breathing in the dark.', color: '#ffd870' },
  ],
  death: [
    { speaker: 'Lyra', text: '"Not yet... you still resonate."', color: '#c0a0ff', character: 'cg-lyra' },
  ],
};