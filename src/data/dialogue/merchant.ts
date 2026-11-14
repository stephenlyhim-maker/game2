import type { DialogueLine } from '../../scenes/DialogueScene';
import { Progression } from '../../systems/Progression';

export const MERCHANT_DIALOGUES: Record<string, DialogueLine[]> = {
  first: [
    {
      speaker: 'Merchant',
      text: 'Well now. Another lost soul. You look like you have questions.',
      color: '#e0c070', character: 'cg-merchant',
    },
    {
      speaker: 'Merchant',
      text: 'The ruins west of here might hold answers. I could guide you there — for a small favour later.',
      color: '#e0c070', character: 'cg-merchant',
      choices: [
        { label: 'Accept his offer', onSelect: () => { Progression.merchantTrusted = true; },  next: 2 },
        { label: 'Refuse',           onSelect: () => { Progression.merchantTrusted = false; }, next: 3 },
      ],
    },
    {
      speaker: 'Merchant',
      text: 'Good choice. I will meet you at the ruins entrance.',
      color: '#e0c070', character: 'cg-merchant', closeAfter: true,
    },
    {
      speaker: 'Merchant',
      text: 'Suit yourself. The ruins will not explore themselves. I will be here when you need me.',
      color: '#e0c070', character: 'cg-merchant', closeAfter: true,
    },
  ],
  ruinsGuide: [
    { speaker: 'Merchant', text: 'You made it. I was starting to think you had lost your nerve.', color: '#e0c070', character: 'cg-merchant' },
    { speaker: 'Merchant', text: 'Take this dagger. Consider it an investment.', color: '#e0c070', character: 'cg-merchant' },
    { speaker: 'Merchant', text: 'The trick with Stalkers is simple — they lunge. Dodge, strike, do not get cornered.', color: '#e0c070', character: 'cg-merchant' },
    { speaker: 'Merchant', text: 'I will be here when you are done. Or not.', color: '#e0c070', character: 'cg-merchant' },
  ],
  goneThought: [
    { speaker: 'Blade', text: 'The merchant\'s camp is empty. He is gone.', color: '#ffd870' },
    { speaker: 'Blade', text: 'I never got the chance to ask him what he meant by "a small favour."', color: '#ffd870' },
    { speaker: 'Blade', text: 'I will keep this dagger. And I have a feeling we will meet again.', color: '#ffd870' },
  ],
  repeat: [
    { speaker: 'Merchant', text: 'The ruins will not explore themselves.', color: '#e0c070', character: 'cg-merchant' },
  ],
};