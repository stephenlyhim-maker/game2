import type { DialogueLine } from '../../scenes/DialogueScene';

export const ELDER_DIALOGUES: Record<string, DialogueLine[]> = {
  warn: [
    { speaker: 'Elder', text: 'You have the look of someone about to do something foolish.', color: '#e0c890' },
    { speaker: 'Elder', text: 'The ruins are west. They were old before I was born. Now they are nests for Void Stalkers.', color: '#e0c890' },
    { speaker: 'Elder', text: 'You have no weapon. You have no training. Turn back.', color: '#e0c890' },
    { speaker: 'Blade', text: 'I understand. But I have to know.', color: '#ffd870' },
  ],
  send: [
    { speaker: 'Elder', text: 'You survived. Barely.', color: '#e0c890' },
    { speaker: 'Elder', text: 'The blacksmith owes this village a debt. Tell him I sent you — he will give you something to defend yourself.', color: '#e0c890' },
    { speaker: 'Elder', text: 'Come back to me when you have been through the ruins. There is more to say.', color: '#e0c890' },
  ],
  ruinsGuide: [
    { speaker: 'Elder', text: 'You actually came.', color: '#e0c890' },
    { speaker: 'Elder', text: 'Stubborn. Like my grandson.', color: '#e0c890' },
    { speaker: 'Elder', text: 'The Stalkers lunge before they strike. Watch their shoulders. Strike the neck.', color: '#e0c890' },
    { speaker: 'Elder', text: 'I will return to the village. Clear the ruins yourself — prove you can handle it.', color: '#e0c890' },
  ],
  backpackUntrust: [
    { speaker: 'Elder', text: 'You returned. And with blood on your blade.', color: '#e0c890' },
    { speaker: 'Elder', text: 'Take this pack. It was my grandson\'s. He will not be needing it anymore.', color: '#e0c890' },
    { speaker: 'Elder', text: 'The blacksmith can pay for Stalker parts. Go to him. Show him what you have.', color: '#e0c890' },
  ],
  amazed: [
    { speaker: 'Elder', text: 'You... you are still standing.', color: '#e0c890' },
    { speaker: 'Elder', text: 'I watched you walk west with that merchant. I did not expect to see you again.', color: '#e0c890' },
    { speaker: 'Elder', text: 'Take this pack. My grandson carried it. He will not be needing it anymore.', color: '#e0c890' },
    { speaker: 'Elder', text: 'The blacksmith pays for Stalker parts. Go to him. He will not be gentle, but he will deal.', color: '#e0c890' },
  ],
  repeat: [
    { speaker: 'Elder', text: 'You still walk. Good. Keep doing so.', color: '#e0c890' },
  ],
};