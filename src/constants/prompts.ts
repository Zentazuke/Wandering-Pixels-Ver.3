/**
 * prompts.ts — a daily writing prompt per spread.
 * The blank page is the #1 reason people stop journaling; each mode offers a
 * rotating question, picked by day-of-year so it changes every day but stays
 * stable within one day.
 */
import type { WorkspaceMode } from '../types';

const PROMPTS: Record<WorkspaceMode, string[]> = {
  default: [
    'What made today different from yesterday?',
    'What is taking up most of your headspace right now?',
    'What would you tell yourself this morning, knowing how today went?',
    'What small thing did you almost not notice today?',
    'If today had a title, what would it be — and why?',
    'What are you avoiding writing about?',
    'What do you want to remember about this ordinary day?',
  ],
  travel: [
    'What is a place you can’t stop thinking about?',
    'Describe the last street you walked that felt foreign.',
    'What did you eat somewhere that you still crave?',
    'Where would you go tomorrow if nothing held you back?',
    'What is the smallest detail you remember from your last trip?',
    'Who did you meet on the road that you never wrote about?',
    'Which journey changed your mind about something?',
  ],
  love: [
    'What did they do lately that you never said thank you for?',
    'Describe the moment you knew.',
    'What is a small ritual only the two of you understand?',
    'What do you hope you never forget about them?',
    'When did you last feel completely understood?',
    'Write about a love that isn’t romantic.',
    'What would you write if they were going to read it?',
  ],
  family: [
    'What is a family story that deserves to be written down?',
    'Describe a meal at the family table.',
    'What did you inherit that isn’t a thing?',
    'Who in your family do you wish you’d asked more questions?',
    'What tradition do you want to keep alive?',
    'Write about the sound of your childhood home.',
    'What would you tell the youngest member of your family?',
  ],
  game: [
    'What moment in a game genuinely surprised you lately?',
    'Which game world would you live in — and why that one?',
    'Describe a mechanic that felt perfect in the hands.',
    'What is the hardest thing you’ve overcome in a game?',
    'Which game deserves a second chance from you?',
    'What did a game make you feel that nothing else has?',
    'Write about a session you didn’t want to end.',
  ],
  pets: [
    'What did they do today that made you laugh?',
    'Describe how they greet you.',
    'What do you think they dream about?',
    'What habit of theirs would you miss most?',
    'Write about the day they arrived.',
    'What have they taught you without meaning to?',
    'Describe their favourite spot in the house.',
  ],
  children: [
    'What did they say today that you never want to forget?',
    'What are they obsessed with right now?',
    'Describe their laugh.',
    'What surprised you about them this week?',
    'What do you hope they remember about being this age?',
    'Write about something they taught you.',
    'What was bedtime like tonight?',
  ],
  sports: [
    'What did your body do today that it couldn’t do a year ago?',
    'Describe the moment you wanted to quit — and didn’t.',
    'What does your best session feel like?',
    'Who pushes you, and how?',
    'Write about a defeat that taught you more than a win.',
    'What is the next milestone — and what is in the way?',
    'How did you feel in the first five minutes today?',
  ],
  dreams: [
    'What fragment is still with you from last night?',
    'Describe a place you’ve only ever visited in dreams.',
    'Which dream do you wish you could re-enter?',
    'What was the strangest thing your mind showed you this week?',
    'Write the dream as if it really happened.',
    'Who appears in your dreams uninvited?',
    'What might that recurring dream be trying to say?',
  ],
  gratitude: [
    'Who made today easier?',
    'What is something ordinary you would miss terribly?',
    'What went right today that you almost didn’t notice?',
    'Name a comfort you usually take for granted.',
    'Who deserves a thank-you they haven’t received?',
    'What did your past self do that you’re grateful for now?',
    'What made you smile without trying?',
  ],
  work: [
    'What did you actually accomplish today — not what did you do?',
    'What is the problem you can’t put down?',
    'Describe a small win nobody else noticed.',
    'What would make tomorrow at work better than today?',
    'What are you learning right now, even if slowly?',
    'Write about a colleague who made a difference this week.',
    'If you could delete one task forever, which one?',
  ],
  wellbeing: [
    'How is your body feeling right now — actually check.',
    'What drained you today, and what refilled you?',
    'What would rest look like tonight?',
    'What is one worry you can set down until tomorrow?',
    'When did you last feel calm — what was around you?',
    'What does your mind keep circling back to?',
    'What is one kind thing you can do for yourself today?',
  ],
  food: [
    'What did you eat today that deserves to be remembered?',
    'Describe a dish that tastes like home.',
    'What would you cook if someone you love came over tonight?',
    'What is the best thing you’ve eaten this month?',
    'Write about a meal that was about more than the food.',
    'Which smell from a kitchen takes you back?',
    'What do you want to learn to cook?',
  ],
  friends: [
    'Who did you think about today but didn’t message?',
    'Describe the last conversation that ran past midnight.',
    'Which friendship has changed the most this year?',
    'What is an inside joke that still makes you grin?',
    'Who knew you “back when” — and what would they say now?',
    'Write about a friend you’re slowly losing touch with.',
    'What makes someone easy to be around?',
  ],
};

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

/** Today's prompt for a spread — different modes land on different prompts
 *  the same day (mode name offsets the index). */
export function getDailyPrompt(mode: WorkspaceMode, today = new Date()): string {
  const list = PROMPTS[mode] ?? PROMPTS.default;
  const offset = [...mode].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return list[(dayOfYear(today) + offset) % list.length];
}

/** A random prompt from the spread's bank — never the one already showing,
 *  so the shuffle button always visibly does something. */
export function getRandomPrompt(mode: WorkspaceMode, exclude?: string): string {
  const list = PROMPTS[mode] ?? PROMPTS.default;
  const pool = list.filter((p) => p !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? list[0];
}
