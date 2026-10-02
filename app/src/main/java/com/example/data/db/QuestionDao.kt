package com.example.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.QuestionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface QuestionDao {
    @Query("SELECT * FROM questions ORDER BY id ASC")
    fun getAllQuestions(): Flow<List<QuestionEntity>>

    @Query("SELECT * FROM questions WHERE subjectId = :subjectId ORDER BY id ASC")
    fun getQuestionsBySubject(subjectId: String): Flow<List<QuestionEntity>>

    @Query("SELECT * FROM questions WHERE isBookmarked = 1 ORDER BY id DESC")
    fun getBookmarkedQuestions(): Flow<List<QuestionEntity>>

    @Query("SELECT * FROM questions WHERE subjectId = :subjectId AND (:topic IS NULL OR topic = :topic) AND (:difficulty IS NULL OR difficulty = :difficulty) ORDER BY RANDOM() LIMIT :limit")
    suspend fun getQuestionsForTest(
        subjectId: String,
        topic: String?,
        difficulty: String?,
        limit: Int
    ): List<QuestionEntity>

    @Query("SELECT * FROM questions WHERE (subjectId = :subjectId OR subjectTitle LIKE '%' || :subjectTitle || '%') AND (:weekNumber IS NULL OR weekNumber = :weekNumber) ORDER BY RANDOM() LIMIT :limit")
    suspend fun getQuestionsForWeek(
        subjectId: String,
        subjectTitle: String,
        weekNumber: Int?,
        limit: Int
    ): List<QuestionEntity>

    @Query("SELECT * FROM questions ORDER BY RANDOM() LIMIT :limit")
    suspend fun getRandomQuestions(limit: Int): List<QuestionEntity>

    @Query("SELECT DISTINCT topic FROM questions WHERE subjectId = :subjectId")
    suspend fun getTopicsForSubject(subjectId: String): List<String>

    @Query("SELECT COUNT(*) FROM questions")
    suspend fun getTotalQuestionCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuestions(questions: List<QuestionEntity>)

    @Update
    suspend fun updateQuestion(question: QuestionEntity)

    @Query("UPDATE questions SET isBookmarked = :isBookmarked WHERE id = :id")
    suspend fun toggleBookmark(id: Int, isBookmarked: Boolean)

    @Query("DELETE FROM questions")
    suspend fun deleteAll()
}
