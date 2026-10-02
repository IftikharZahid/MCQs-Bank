package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "test_attempts")
data class TestAttemptEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val subjectId: String,
    val subjectTitle: String,
    val topic: String,
    val difficulty: String,
    val totalQuestions: Int,
    val correctCount: Int,
    val wrongCount: Int,
    val scorePercentage: Int,
    val durationSeconds: Int,
    val timestamp: Long = System.currentTimeMillis()
)

data class TestAttempt(
    val id: Long,
    val subjectId: String,
    val subjectTitle: String,
    val topic: String,
    val difficulty: String,
    val totalQuestions: Int,
    val correctCount: Int,
    val wrongCount: Int,
    val scorePercentage: Int,
    val durationSeconds: Int,
    val timestamp: Long
)

fun TestAttemptEntity.toDomain() = TestAttempt(
    id = id,
    subjectId = subjectId,
    subjectTitle = subjectTitle,
    topic = topic,
    difficulty = difficulty,
    totalQuestions = totalQuestions,
    correctCount = correctCount,
    wrongCount = wrongCount,
    scorePercentage = scorePercentage,
    durationSeconds = durationSeconds,
    timestamp = timestamp
)
