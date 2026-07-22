/**
 * StepCounter AI Analytics Engine — Node.js Port
 *
 * Mirrors the Python analytics.py logic: trend detection via linear regression,
 * anomaly detection, weekend/weekday analysis, streak counting, wellness scoring,
 * and rich actionable insight generation.
 */

/**
 * Simple linear regression: returns { slope, intercept }
 */
function linearRegression(y) {
  const n = y.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
  const sumXX = x.reduce((a, xi) => a + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/**
 * Calculates mean of an array.
 */
function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Calculates standard deviation of an array.
 */
function stdDev(arr) {
  if (arr.length === 0) return 0;
  const avg = mean(arr);
  const squaredDiffs = arr.map(v => (v - avg) ** 2);
  return Math.sqrt(mean(squaredDiffs));
}

/**
 * Main analytics function.
 * @param {number[]} dailySteps - Array of daily step counts (chronological, most recent last)
 * @param {number} goal - Daily step goal
 * @returns {object} Full analytics response
 */
export function analyzeSteps(dailySteps, goal) {
  const n = dailySteps.length;
  const totalSteps = dailySteps.reduce((a, b) => a + b, 0);
  const averageSteps = Math.round(totalSteps / n);

  // ─── 1. Trend Detection (Linear Regression) ───
  const { slope } = linearRegression(dailySteps);
  const trendThreshold = 50; // steps/day change
  let trend = 'stable';
  if (slope > trendThreshold) trend = 'up';
  else if (slope < -trendThreshold) trend = 'down';

  // ─── 2. Streak Counting (from most recent) ───
  let streakDays = 0;
  for (let i = dailySteps.length - 1; i >= 0; i--) {
    if (dailySteps[i] >= goal) streakDays++;
    else break;
  }

  // ─── 3. Weekly Comparison ───
  let thisWeekAvg = 0;
  let lastWeekAvg = 0;
  let changePercent = 0;
  let weekDirection = 'stable';

  if (n >= 14) {
    const thisWeek = dailySteps.slice(-7);
    const lastWeek = dailySteps.slice(-14, -7);
    thisWeekAvg = Math.round(mean(thisWeek));
    lastWeekAvg = Math.round(mean(lastWeek));
    if (lastWeekAvg > 0) {
      changePercent = Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100 * 10) / 10;
    }
    if (changePercent > 5) weekDirection = 'up';
    else if (changePercent < -5) weekDirection = 'down';
  } else if (n >= 7) {
    thisWeekAvg = Math.round(mean(dailySteps.slice(-7)));
  }

  // ─── 4. Best Day ───
  const bestSteps = Math.max(...dailySteps);
  const bestIdx = dailySteps.indexOf(bestSteps);
  const daysAgo = n - 1 - bestIdx;
  const bestDate = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];

  // ─── 5. Wellness Score (0-100) ───
  // Goal completion rate (max 35 pts)
  const goalCompletion = Math.min(averageSteps / goal, 1.0);
  const scoreGoal = 35 * goalCompletion;

  // Consistency — inverse of coefficient of variation (max 25 pts)
  const sd = stdDev(dailySteps);
  const cv = averageSteps > 0 ? sd / averageSteps : 1;
  const consistency = Math.max(1 - cv, 0);
  const scoreConsistency = 25 * consistency;

  // Trend direction (max 20 pts)
  const scoreTrend = trend === 'up' ? 20 : trend === 'stable' ? 12 : 5;

  // Recent momentum — last 3 days vs overall (max 20 pts)
  const recent3 = n >= 3 ? mean(dailySteps.slice(-3)) : averageSteps;
  const momentum = averageSteps > 0 ? Math.min(recent3 / averageSteps, 1.2) / 1.2 : 0;
  const scoreMomentum = 20 * momentum;

  const wellnessScore = Math.min(Math.max(Math.round(scoreGoal + scoreConsistency + scoreTrend + scoreMomentum), 0), 100);

  // ─── 6. Insight Generation ───
  const insights = [];

  // Trend insight
  if (trend === 'up' && changePercent > 0) {
    insights.push({
      emoji: '🚀',
      title: 'Trending Up',
      description: `Your activity increased ${Math.abs(changePercent)}% this week. You're on track for your best month!`,
      severity: 'success',
    });
  } else if (trend === 'down') {
    insights.push({
      emoji: '📉',
      title: 'Slowing Down',
      description: `Your steps are trending downwards. Try adding a short 15-minute walk to your daily routine.`,
      severity: 'warning',
    });
  }

  // Streak insight
  if (streakDays >= 3) {
    insights.push({
      emoji: '🔥',
      title: `${streakDays}-Day Streak!`,
      description: `You've hit your ${goal.toLocaleString()} step goal ${streakDays} days in a row. Keep it going!`,
      severity: 'success',
    });
  }

  // Personal best
  if (bestSteps >= goal * 1.2) {
    const bestDayName = new Date(Date.now() - daysAgo * 86400000).toLocaleDateString('en-US', { weekday: 'long' });
    insights.push({
      emoji: '🏆',
      title: 'Personal Best',
      description: `${bestDayName} was your best day recently with ${bestSteps.toLocaleString()} steps!`,
      severity: 'success',
    });
  }

  // Weekend vs Weekday analysis
  if (n >= 7) {
    const todayWeekday = new Date().getDay(); // 0=Sun, 6=Sat
    const weekends = [];
    const weekdays = [];
    for (let i = 0; i < n; i++) {
      const dayDiff = n - 1 - i;
      const dayOfWeek = new Date(Date.now() - dayDiff * 86400000).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) weekends.push(dailySteps[i]);
      else weekdays.push(dailySteps[i]);
    }
    if (weekends.length > 0 && weekdays.length > 0) {
      const weekendAvg = mean(weekends);
      const weekdayAvg = mean(weekdays);
      if (weekdayAvg > 0) {
        const diffPercent = ((weekendAvg - weekdayAvg) / weekdayAvg) * 100;
        if (diffPercent < -20) {
          insights.push({
            emoji: '⚠️',
            title: 'Weekend Dip',
            description: `Your weekend steps dropped ${Math.abs(Math.round(diffPercent))}% vs weekdays. A 20-minute walk today will restore your baseline.`,
            severity: 'warning',
          });
        } else if (diffPercent > 20) {
          insights.push({
            emoji: '🌟',
            title: 'Weekend Warrior',
            description: `Your weekends are ${Math.round(diffPercent)}% more active than weekdays. Great job!`,
            severity: 'success',
          });
        }
      }
    }
  }

  // Consistency insight
  if (cv > 0.4) {
    insights.push({
      emoji: '📊',
      title: 'Consistency',
      description: `Your daily steps vary by ${Math.round(cv * 100)}%. Try to maintain a steadier pace.`,
      severity: 'info',
    });
  }

  // Rest day detection
  if (n >= 2) {
    const yesterday = dailySteps[n - 2];
    if (yesterday < averageSteps * 0.5) {
      insights.push({
        emoji: '💤',
        title: 'Rest Day Detected',
        description: `Yesterday had only ${yesterday.toLocaleString()} steps. Recovery is important, but try to stay above ${averageSteps.toLocaleString()} tomorrow.`,
        severity: 'info',
      });
    }
  }

  return {
    wellness_score: wellnessScore,
    trend,
    insights: insights.slice(0, 5),
    weekly_comparison: {
      this_week_avg: thisWeekAvg,
      last_week_avg: lastWeekAvg,
      change_percent: changePercent,
      direction: weekDirection,
    },
    average_steps: averageSteps,
    best_day: { date: bestDate, steps: bestSteps },
    total_steps: totalSteps,
    streak_days: streakDays,
  };
}
