import numpy as np
from datetime import datetime, timedelta
from typing import List, Literal
from .models import (
    StepAnalyticsResponse,
    InsightItem,
    WeeklyComparison,
    BestDay,
    WalkPlanResponse,
    TimeWindow,
    SuggestedRoute
)

def plan_walk(target_steps: int, stride_length_m: float = 0.75) -> WalkPlanResponse:
    distance_km = round((target_steps * stride_length_m) / 1000.0, 2)
    duration_mins = max(1, round(target_steps / 100.0))
    calories = max(1, round(target_steps * 0.045))
    
    time_windows = [
        TimeWindow(time="07:30 AM", label="Morning Peak", reason="Ideal circadian window for metabolic activation & vitamin D."),
        TimeWindow(time="01:15 PM", label="Post-Lunch Stroll", reason="Blunts postprandial glucose spikes and improves focus."),
        TimeWindow(time="06:45 PM", label="Sunset Cool Down", reason="Helps lower cortisol and promotes nocturnal sleep.")
    ]
    
    routes = [
        SuggestedRoute(title="Cyber Park Loop", distance_km=round(distance_km, 2), description="Paved urban park trail with flat terrain.", surface="Asphalt / Turf"),
        SuggestedRoute(title="Riverside Promenade", distance_km=round(distance_km * 1.15, 2), description="Scenic boardwalk route with gentle incline.", surface="Boardwalk"),
        SuggestedRoute(title="Metropolitan Circuit", distance_km=round(distance_km * 0.85, 2), description="Quick high-cadence city block route.", surface="Paved Sidewalk")
    ]
    
    return WalkPlanResponse(
        target_steps=target_steps,
        estimated_duration_mins=duration_mins,
        estimated_calories=calories,
        distance_km=distance_km,
        recommended_time_windows=time_windows,
        suggested_routes=routes
    )


def analyze_steps(daily_steps: list[int], goal: int) -> StepAnalyticsResponse:
    """
    Analyzes step count data and generates AI-powered insights.
    Assumes daily_steps is ordered chronologically, with the most recent day at the end.
    """
    steps_array = np.array(daily_steps)
    n_days = len(steps_array)
    
    # Basic Stats
    total_steps = int(np.sum(steps_array))
    average_steps = int(np.mean(steps_array))
    
    # 1. Trend Detection (Simple Linear Regression)
    x = np.arange(n_days)
    slope, intercept = np.polyfit(x, steps_array, 1)
    
    threshold = 50  # Steps per day increase/decrease to be considered a trend
    if slope > threshold:
        trend: Literal['up', 'down', 'stable'] = 'up'
    elif slope < -threshold:
        trend = 'down'
    else:
        trend = 'stable'
        
    # 2. Streak Counting (from end)
    streak_days = 0
    for steps in reversed(daily_steps):
        if steps >= goal:
            streak_days += 1
        else:
            break
            
    # 3. Weekly Comparison (last 7 vs previous 7)
    this_week_avg = 0
    last_week_avg = 0
    change_percent = 0.0
    dir_week: Literal['up', 'down', 'stable'] = 'stable'
    
    if n_days >= 14:
        this_week = steps_array[-7:]
        last_week = steps_array[-14:-7]
        this_week_avg = int(np.mean(this_week))
        last_week_avg = int(np.mean(last_week))
        if last_week_avg > 0:
            change_percent = round(((this_week_avg - last_week_avg) / last_week_avg) * 100, 1)
            
        if change_percent > 5:
            dir_week = 'up'
        elif change_percent < -5:
            dir_week = 'down'
    elif n_days >= 7:
        this_week_avg = int(np.mean(steps_array[-7:]))
        
    # 4. Best Day
    best_idx = int(np.argmax(steps_array))
    best_steps = int(steps_array[best_idx])
    # Assume today is the last index
    days_ago = n_days - 1 - best_idx
    best_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
    best_day = BestDay(date=best_date, steps=best_steps)
    
    # 5. Wellness Score
    # Goal completion rate (max 35)
    goal_completion = min(average_steps / goal, 1.0) if goal > 0 else 0
    score_goal = 35 * goal_completion
    
    # Consistency (max 25)
    std_dev = np.std(steps_array)
    cv = std_dev / average_steps if average_steps > 0 else 1
    consistency = max(1 - cv, 0) # 0 if cv >= 1
    score_consistency = 25 * consistency
    
    # Trend (max 20)
    if trend == 'up':
        score_trend = 20
    elif trend == 'stable':
        score_trend = 12
    else:
        score_trend = 5
        
    # Recent momentum (max 20)
    recent_3 = np.mean(steps_array[-3:]) if n_days >= 3 else average_steps
    momentum = min(recent_3 / average_steps, 1.2) / 1.2 if average_steps > 0 else 0
    score_momentum = 20 * momentum
    
    wellness_score = int(score_goal + score_consistency + score_trend + score_momentum)
    wellness_score = min(max(wellness_score, 0), 100)
    
    # 6. Insights Generation
    insights: List[InsightItem] = []
    
    # Trend Insight
    if trend == 'up' and change_percent > 0:
        insights.append(InsightItem(
            emoji="🚀",
            title="Trending Up",
            description=f"Your activity increased {change_percent}% this week. You're on track for your best month!",
            severity="success"
        ))
    elif trend == 'down':
        insights.append(InsightItem(
            emoji="📉",
            title="Slowing Down",
            description="Your steps are trending downwards. Try adding a short 15-minute walk to your daily routine.",
            severity="warning"
        ))
        
    # Streak Insight
    if streak_days >= 3:
        insights.append(InsightItem(
            emoji="🔥",
            title="Streak",
            description=f"{streak_days}-day streak hitting your {goal} step goal! Keep going!",
            severity="success"
        ))
        
    # Best Day Insight
    if best_steps >= goal * 1.2:
        days_str = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        best_day_name = (datetime.now() - timedelta(days=days_ago)).strftime('%A')
        insights.append(InsightItem(
            emoji="🏆",
            title="Personal Best",
            description=f"{best_day_name} was your best day recently with {best_steps:,} steps!",
            severity="success"
        ))
        
    # Weekend vs Weekday (Assume last 28 days for clean 4 weeks if possible)
    if n_days >= 7:
        today_weekday = datetime.now().weekday() # 0 = Monday, 6 = Sunday
        weekends = []
        weekdays = []
        for i in range(n_days):
            d_ago = n_days - 1 - i
            day_of_week = (today_weekday - d_ago) % 7
            if day_of_week >= 5: # Saturday or Sunday
                weekends.append(steps_array[i])
            else:
                weekdays.append(steps_array[i])
                
        if weekends and weekdays:
            weekend_avg = np.mean(weekends)
            weekday_avg = np.mean(weekdays)
            if weekday_avg > 0:
                diff_percent = ((weekend_avg - weekday_avg) / weekday_avg) * 100
                if diff_percent < -20:
                    insights.append(InsightItem(
                        emoji="⚠️",
                        title="Weekend Dip",
                        description=f"Your weekend steps dropped {abs(int(diff_percent))}% vs weekdays. A 20-minute walk today will restore your baseline.",
                        severity="warning"
                    ))
                elif diff_percent > 20:
                    insights.append(InsightItem(
                        emoji="🌟",
                        title="Weekend Warrior",
                        description=f"Your weekends are {int(diff_percent)}% more active than your weekdays. Great job staying active!",
                        severity="success"
                    ))
                    
    # Consistency Insight
    if cv > 0.4:
        insights.append(InsightItem(
            emoji="📊",
            title="Consistency",
            description=f"Your daily steps vary by {int(cv * 100)}%. Try to maintain a steadier pace.",
            severity="info"
        ))
        
    # Rest Day Anomaly
    if n_days >= 2:
        yesterday_steps = steps_array[-2]
        if yesterday_steps < average_steps * 0.5:
            target_tmrw = int(average_steps)
            insights.append(InsightItem(
                emoji="💤",
                title="Rest Day Detected",
                description=f"Yesterday had only {yesterday_steps:,} steps. Recovery is important, but try to stay above {target_tmrw:,} tomorrow.",
                severity="info"
            ))

    return StepAnalyticsResponse(
        wellness_score=wellness_score,
        trend=trend,
        insights=insights[:5], # Max 5 insights
        weekly_comparison=WeeklyComparison(
            this_week_avg=this_week_avg,
            last_week_avg=last_week_avg,
            change_percent=change_percent,
            direction=dir_week
        ),
        average_steps=average_steps,
        best_day=best_day,
        total_steps=total_steps,
        streak_days=streak_days
    )
