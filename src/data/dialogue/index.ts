import { LYRA_DIALOGUES } from './lyra';
import { MILLER_DIALOGUES } from './miller';
import { GIRL_DIALOGUES } from './girl';
import { BLACKSMITH_DIALOGUES } from './blacksmith';
import { ELDER_DIALOGUES } from './elder';
import { MERCHANT_DIALOGUES } from './merchant';
import type { DialogueLine } from '../../scenes/DialogueScene';

export const DIALOGUES: Record<string, DialogueLine[]> = {
  'lyra-awakening':   LYRA_DIALOGUES.awakening,
  'lyra-ruins-entry': LYRA_DIALOGUES.ruinsEntry,
  'lyra-death':       LYRA_DIALOGUES.death,

  'miller-first':  MILLER_DIALOGUES.first,
  'miller-repeat': MILLER_DIALOGUES.repeat,

  'girl-first':   GIRL_DIALOGUES.first,
  'girl-waiting': GIRL_DIALOGUES.waiting,
  'girl-thanks':  GIRL_DIALOGUES.thanks,
  'girl-after':   GIRL_DIALOGUES.after,

  'blacksmith-first':            BLACKSMITH_DIALOGUES.first,
  'blacksmith-quest':            BLACKSMITH_DIALOGUES.quest,
  'blacksmith-exchange-trust':   BLACKSMITH_DIALOGUES.exchangeTrust,
  'blacksmith-exchange-nontrust': BLACKSMITH_DIALOGUES.exchangeUntrust,
  'blacksmith-repeat':           BLACKSMITH_DIALOGUES.repeat,

  'elder-warn':          ELDER_DIALOGUES.warn,
  'elder-send':          ELDER_DIALOGUES.send,
  'elder-ruins-guide':   ELDER_DIALOGUES.ruinsGuide,
  'elder-backpack':      ELDER_DIALOGUES.backpackUntrust,
  'elder-amazed':        ELDER_DIALOGUES.amazed,
  'elder-repeat':        ELDER_DIALOGUES.repeat,

  'merchant-first':       MERCHANT_DIALOGUES.first,
  'merchant-ruins-guide': MERCHANT_DIALOGUES.ruinsGuide,
  'merchant-gone-thought': MERCHANT_DIALOGUES.goneThought,
  'merchant-repeat':      MERCHANT_DIALOGUES.repeat,
};