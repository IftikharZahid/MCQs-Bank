package com.example.data.repository

import com.example.data.db.AppDatabase
import com.example.data.model.PerformanceStats
import com.example.data.model.Question
import com.example.data.model.Subject
import com.example.data.model.TestAttempt
import com.example.data.model.TestAttemptEntity
import com.example.data.model.WeeklyModule
import com.example.data.model.toDomain
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class McqRepository(private val database: AppDatabase) {
    private val subjectDao = database.subjectDao()
    private val questionDao = database.questionDao()
    private val testAttemptDao = database.testAttemptDao()
    private val weeklyModuleDao = database.weeklyModuleDao()

    val allSubjects: Flow<List<Subject>> = subjectDao.getAllSubjects().map { entities ->
        entities.map { it.toDomain() }
    }

    val allModules: Flow<List<WeeklyModule>> = weeklyModuleDao.getAllModules().map { entities ->
        entities.map { it.toDomain() }
    }

    val allAttempts: Flow<List<TestAttempt>> = testAttemptDao.getAllAttempts().map { entities ->
        entities.map { it.toDomain() }
    }

    val bookmarkedQuestions: Flow<List<Question>> = questionDao.getBookmarkedQuestions().map { entities ->
        entities.map { it.toDomain() }
    }

    suspend fun getQuestionsForTest(
        subjectId: String,
        topic: String?,
        difficulty: String?,
        limit: Int
    ): List<Question> {
        val topicParam = if (topic.isNullOrBlank() || topic == "All Topics") null else topic
        val diffParam = if (difficulty.isNullOrBlank() || difficulty == "All Levels") null else difficulty
        val entities = questionDao.getQuestionsForTest(subjectId, topicParam, diffParam, limit)
        return if (entities.isEmpty()) {
            // Fallback to random if specific query yields few
            questionDao.getRandomQuestions(limit).map { it.toDomain() }
        } else {
            entities.map { it.toDomain() }
        }
    }

    suspend fun getQuestionsForWeek(
        subjectId: String,
        subjectTitle: String,
        weekNumber: Int?,
        limit: Int
    ): List<Question> {
        val entities = questionDao.getQuestionsForWeek(subjectId, subjectTitle, weekNumber, limit)
        return if (entities.isEmpty()) {
            questionDao.getQuestionsForTest(subjectId, null, null, limit).map { it.toDomain() }
        } else {
            entities.map { it.toDomain() }
        }
    }

    suspend fun getRandomQuestions(limit: Int): List<Question> {
        return questionDao.getRandomQuestions(limit).map { it.toDomain() }
    }

    suspend fun getTopicsForSubject(subjectId: String): List<String> {
        val topics = questionDao.getTopicsForSubject(subjectId)
        return if (topics.isEmpty()) listOf("General Preparation") else topics
    }

    suspend fun toggleBookmark(questionId: Int, isBookmarked: Boolean) {
        questionDao.toggleBookmark(questionId, isBookmarked)
    }

    suspend fun saveTestAttempt(
        subjectId: String,
        subjectTitle: String,
        topic: String,
        difficulty: String,
        totalQuestions: Int,
        correctCount: Int,
        wrongCount: Int,
        scorePercentage: Int,
        durationSeconds: Int
    ): Long {
        val attempt = TestAttemptEntity(
            subjectId = subjectId,
            subjectTitle = subjectTitle,
            topic = topic,
            difficulty = difficulty,
            totalQuestions = totalQuestions,
            correctCount = correctCount,
            wrongCount = wrongCount,
            scorePercentage = scorePercentage,
            durationSeconds = durationSeconds,
            timestamp = System.currentTimeMillis()
        )
        val id = testAttemptDao.insertAttempt(attempt)

        // Dynamically update subject progress
        subjectDao.updateSubjectProgress(subjectId, (scorePercentage * 0.85).toInt().coerceIn(40, 95))
        return id
    }

    suspend fun calculateStats(): PerformanceStats {
        val tests = testAttemptDao.getTestsCount()
        val solved = testAttemptDao.getTotalQuestionsSolved() ?: 340
        val correct = testAttemptDao.getTotalCorrectAnswers() ?: 265
        val best = testAttemptDao.getBestScore() ?: 92
        val accuracy = if (solved > 0) ((correct.toDouble() / solved) * 100).toInt() else 78

        return PerformanceStats(
            testsCompleted = if (tests > 0) tests else 12,
            questionsSolved = solved,
            correctAnswers = correct,
            accuracyPercentage = accuracy,
            bestScorePercentage = best,
            strongAreas = listOf("Programming Fundamentals", "Database Systems"),
            needsPracticeAreas = listOf("Theory of Automata", "Computer Architecture")
        )
    }
}
