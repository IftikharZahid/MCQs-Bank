package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "questions")
data class QuestionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val subjectId: String,
    val subjectTitle: String,
    val topic: String,
    val difficulty: String, // "Easy", "Medium", "Hard"
    val weekNumber: Int,
    val questionText: String,
    val optionA: String,
    val optionB: String,
    val optionC: String,
    val optionD: String,
    val correctOption: Int, // 0 = A, 1 = B, 2 = C, 3 = D
    val explanation: String,
    val isBookmarked: Boolean = false
)

data class Question(
    val id: Int,
    val subjectId: String,
    val subjectTitle: String,
    val topic: String,
    val difficulty: String,
    val weekNumber: Int,
    val questionText: String,
    val options: List<String>,
    val correctOption: Int,
    val explanation: String,
    val isBookmarked: Boolean
)

fun QuestionEntity.toDomain() = Question(
    id = id,
    subjectId = subjectId,
    subjectTitle = subjectTitle,
    topic = topic,
    difficulty = difficulty,
    weekNumber = weekNumber,
    questionText = questionText,
    options = listOf(optionA, optionB, optionC, optionD),
    correctOption = correctOption,
    explanation = explanation,
    isBookmarked = isBookmarked
)
