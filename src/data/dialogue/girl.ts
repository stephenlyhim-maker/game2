import type { DialogueLine } from '../../scenes/DialogueScene';

export const GIRL_DIALOGUES: Record<string, DialogueLine[]> = {
  // Merged intro + quest offer (single dialogue, no chaining).
  first: [
    { speaker: 'Young Girl', text: "They took my brother... said he was 'corrupted.'", color: '#ffa8c0' },
    { speaker: 'Young Girl', text: "He wasn't! He just... he just went to the ruins. Like you're probably going to.", color: '#ffa8c0' },
    { speaker: 'Young Girl', text: "His name was Elric. He was older than you, maybe. He said he was going to be a hero.", color: '#ffa8c0' },
    { speaker: 'Young Girl', text: "He had our mother's locket. He said he'd never take it off.", color: '#ffa8c0' },
    { speaker: 'Young Girl', text: "I know he's gone. I'm not stupid. But if you find the locket... please bring it to me. Something to remember him by.", color: '#ffa8c0' },
    { speaker: 'Blade', text: "I'll find it. I promise.", color: '#ffd870' },
  ],
  waiting: [
    { speaker: 'Young Girl', text: 'The Stalkers are everywhere in there. Please be careful.', color: '#ffa8c0' },
    { speaker: 'Young Girl', text: "If you find him, or the locket... I'll be here.", color: '#ffa8c0' },
  ],
  thanks: [
    { speaker: 'Young Girl', text: 'Is that... is that his locket?', color: '#ffa8c0' },
    { speaker: 'Young Girl', text: 'He kept it. He really kept it.', color: '#ffa8c0' },
    { speaker: 'Young Girl', text: "Elric found this in the ruins. He said it glowed when he held it. Take it — maybe it'll keep you safe.", color: '#ffa8c0' },
    { speaker: 'Blade', text: 'It is warm. Like someone is watching over me.', color: '#ffd870' },
  ],
  after: [
    { speaker: 'Young Girl', text: "Thank you again. I'll remember him as he was.", color: '#ffa8c0' },
  ],
};