import type { DialogueLine } from '../../scenes/DialogueScene';

export const BLACKSMITH_DIALOGUES: Record<string, DialogueLine[]> = {
  first: [
    { speaker: 'Blacksmith', text: "If you're here to complain about the noise, leave. If you're here to buy something, leave. I'm not open.", color: '#c88860' },
    { speaker: 'Blacksmith', text: 'Void Stalker got my arm. I killed it, but it took a piece of me.', color: '#c88860' },
    { speaker: 'Blacksmith', text: 'I have nothing left to give, stranger. Unless someone vouches for you.', color: '#c88860' },
  ],
  quest: [
    { speaker: 'Blacksmith', text: 'Did she now? The Elder does not vouch for just anyone.', color: '#c88860' },
    { speaker: 'Blacksmith', text: "There's an old iron dagger in the back. Take it. It's not much, but it'll cut a Stalker's hide if you're strong enough.", color: '#c88860' },
    { speaker: 'Blade', text: "I'll take it. Thank you.", color: '#ffd870' },
    { speaker: 'Blacksmith', text: 'Bring me monster drops when you find them. Stalker cores. I will pay.', color: '#c88860' },
  ],
  exchangeUntrust: [
    { speaker: 'Blacksmith', text: 'You survived the ruins. Barely, by the look of you.', color: '#c88860' },
    { speaker: 'Blacksmith', text: 'The Elder says you cleared out the Stalkers. Good. Business needs to breathe.', color: '#c88860' },
    { speaker: 'Blacksmith', text: 'Bring me their cores. I will buy them. Not much, but enough.', color: '#c88860' },
  ],
  exchangeTrust: [
    { speaker: 'Blacksmith', text: 'You. The one who walked off with the merchant.', color: '#c88860' },
    { speaker: 'Blacksmith', text: 'Heard you came back with your hide intact. Lucky. Or dangerous.', color: '#c88860' },
    { speaker: 'Blade', text: 'I have Stalker parts. I am told you buy them.', color: '#ffd870' },
    { speaker: 'Blacksmith', text: 'That I do. Show me what you have — the Stalkers won\'t be the last thing you kill.', color: '#c88860' },
  ],
  repeat: [
    { speaker: 'Blacksmith', text: 'Bring me Stalker cores when you can. I pay.', color: '#c88860' },
  ],
};