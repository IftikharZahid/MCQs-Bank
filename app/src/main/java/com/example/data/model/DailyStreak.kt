package com.example.data.model

enum class DayStreakStatus {
    COMPLETED,
    TODAY_COMPLETED,
    TODAY_PENDING,
    FUTURE,
    MISSED
}

data class DayStreakItem(
    val dayLabel: String,      // "Mon", "Tue", etc.
    val dayNumber: String,     // "28", "29", etc.
    val status: DayStreakStatus,
    val solvedCount: Int
)

data class DailyStreakInfo(
    val currentStreak: Int = 5,
    val bestStreak: Int = 14,
    val todaySolved: Int = 15,
    val dailyGoalTarget: Int = 15,
    val streakFreezeCount: Int = 1,
    val days: List<DayStreakItem> = emptyList()
)
