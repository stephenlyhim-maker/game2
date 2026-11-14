import type { DialogueLine } from '../../scenes/DialogueScene';

export const MILLER_DIALOGUES: Record<string, DialogueLine[]> = {
  first: [
    { speaker: 'Old Miller', text: "You're the one who woke up in the old house. I can tell.", color: '#d0a878' },
    { speaker: 'Old Miller', text: "Most people here don't belong either. Nothing good comes from asking questions about the Tides.", color: '#d0a878' },
    { speaker: 'Old Miller', text: 'The well runs dry. The water is corrupted, same as everything else. I just... wait.', color: '#d0a878' },
  ],
  repeat: [
    { speaker: 'Old Miller', text: 'Still here? Stay away from the north, stranger. The Tides do not forgive.', color: '#d0a878' },
  ],
};