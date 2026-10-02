package com.example.data.model

data class PerformanceStats(
    val testsCompleted: Int,
    val questionsSolved: Int,
    val correctAnswers: Int,
    val accuracyPercentage: Int,
    val bestScorePercentage: Int,
    val strongAreas: List<String>,
    val needsPracticeAreas: List<String>
)
