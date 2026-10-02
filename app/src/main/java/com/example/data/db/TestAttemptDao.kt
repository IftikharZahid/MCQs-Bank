package com.example.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.model.TestAttemptEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TestAttemptDao {
    @Query("SELECT * FROM test_attempts ORDER BY timestamp DESC")
    fun getAllAttempts(): Flow<List<TestAttemptEntity>>

    @Query("SELECT * FROM test_attempts WHERE subjectId = :subjectId ORDER BY timestamp DESC")
    fun getAttemptsBySubject(subjectId: String): Flow<List<TestAttemptEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttempt(attempt: TestAttemptEntity): Long

    @Query("SELECT COUNT(*) FROM test_attempts")
    suspend fun getTestsCount(): Int

    @Query("SELECT SUM(totalQuestions) FROM test_attempts")
    suspend fun getTotalQuestionsSolved(): Int?

    @Query("SELECT SUM(correctCount) FROM test_attempts")
    suspend fun getTotalCorrectAnswers(): Int?

    @Query("SELECT MAX(scorePercentage) FROM test_attempts")
    suspend fun getBestScore(): Int?

    @Query("DELETE FROM test_attempts")
    suspend fun clearAllAttempts()
}
