from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

class StepAnalyticsRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    daily_steps: list[int] = Field(..., min_length=1, max_length=30)
    goal: int = Field(10000, gt=0)

class InsightItem(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    emoji: str
    title: str
    description: str
    severity: Literal['info', 'warning', 'alert', 'success']

class WeeklyComparison(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    this_week_avg: int
    last_week_avg: int
    change_percent: float
    direction: Literal['up', 'down', 'stable']

class BestDay(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    date: str
    steps: int

class StepAnalyticsResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    wellness_score: int
    trend: Literal['up', 'down', 'stable']
    insights: list[InsightItem]
    weekly_comparison: WeeklyComparison
    average_steps: int
    best_day: BestDay
    total_steps: int
    streak_days: int

class WalkPlanRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    target_steps: int = Field(3000, gt=0)
    stride_length_m: float = Field(0.75, gt=0)

class TimeWindow(BaseModel):
    model_config = ConfigDict(extra='forbid')
    time: str
    label: str
    reason: str

class SuggestedRoute(BaseModel):
    model_config = ConfigDict(extra='forbid')
    title: str
    distance_km: float
    description: str
    surface: str

class WalkPlanResponse(BaseModel):
    model_config = ConfigDict(extra='forbid')
    target_steps: int
    estimated_duration_mins: int
    estimated_calories: int
    distance_km: float
    recommended_time_windows: list[TimeWindow]
    suggested_routes: list[SuggestedRoute]

