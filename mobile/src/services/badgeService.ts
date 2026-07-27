/**
 * Badge Service — Cyber Badges & Achievement System
 */

export interface CyberBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  glowColor: string;
  category: 'Streak' | 'Volume' | 'Pace' | 'Habit';
  unlocked: boolean;
  progressPercent: number;
  unlockedAt?: string;
  requirementText: string;
}

const BADGES_DEFINITIONS: Omit<CyberBadge, 'unlocked' | 'progressPercent' | 'unlockedAt'>[] = [
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Reach 100% of your daily step goal.',
    icon: '🎯',
    glowColor: '#00F5FF',
    category: 'Habit',
    requirementText: '10,000 steps in a single day',
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 7-day goal streak without missing a beat.',
    icon: '🔥',
    glowColor: '#FF007A',
    category: 'Streak',
    requirementText: '7 consecutive days at 100% goal',
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Crush over 8,000 steps on both Saturday and Sunday.',
    icon: '⚔️',
    glowColor: '#9D00FF',
    category: 'Habit',
    requirementText: '8,000+ steps on Sat & Sun',
  },
  {
    id: 'night_walker',
    title: 'Night Walker',
    description: 'Log over 2,000 steps during late evening (8 PM – Midnight).',
    icon: '🌙',
    glowColor: '#39FF14',
    category: 'Habit',
    requirementText: '2,000+ evening steps',
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Accumulate a total of 100,000 lifetime steps.',
    icon: '👑',
    glowColor: '#FFD700',
    category: 'Volume',
    requirementText: '100,000 cumulative steps',
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Achieve a brisk walking cadence exceeding 110 steps / min.',
    icon: '⚡',
    glowColor: '#FF9900',
    category: 'Pace',
    requirementText: 'Cadence > 110 steps/min',
  },
];

export async function getCyberBadges(
  todaySteps: number,
  goal: number,
  streakDays: number,
  totalLifetimeSteps: number,
  cadence: number = 0
): Promise<CyberBadge[]> {
  const isWeekend = [0, 6].includes(new Date().getDay());

  return BADGES_DEFINITIONS.map((def) => {
    let unlocked = false;
    let progressPercent = 0;

    switch (def.id) {
      case 'goal_crusher':
        progressPercent = Math.min(100, Math.round((todaySteps / goal) * 100));
        unlocked = todaySteps >= goal;
        break;

      case 'streak_master':
        progressPercent = Math.min(100, Math.round((streakDays / 7) * 100));
        unlocked = streakDays >= 7;
        break;

      case 'weekend_warrior':
        progressPercent = isWeekend ? Math.min(100, Math.round((todaySteps / 8000) * 100)) : 85;
        unlocked = isWeekend && todaySteps >= 8000;
        break;

      case 'night_walker':
        const currentHour = new Date().getHours();
        const nightSteps = currentHour >= 20 ? todaySteps : Math.round(todaySteps * 0.3);
        progressPercent = Math.min(100, Math.round((nightSteps / 2000) * 100));
        unlocked = nightSteps >= 2000;
        break;

      case 'century_club':
        progressPercent = Math.min(100, Math.round((totalLifetimeSteps / 100000) * 100));
        unlocked = totalLifetimeSteps >= 100000;
        break;

      case 'speed_demon':
        progressPercent = Math.min(100, Math.round((cadence / 110) * 100));
        unlocked = cadence >= 110;
        break;

      default:
        break;
    }

    return {
      ...def,
      unlocked,
      progressPercent,
      unlockedAt: unlocked ? new Date().toISOString().split('T')[0] : undefined,
    };
  });
}
