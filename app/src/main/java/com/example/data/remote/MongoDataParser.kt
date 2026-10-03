package com.example.data.remote

import android.graphics.Color
import android.util.Log
import com.example.data.model.QuestionEntity
import com.example.data.model.SubjectEntity
import com.example.data.model.WeeklyModuleEntity
import org.json.JSONArray
import org.json.JSONObject

object MongoDataParser {
    private const val TAG = "MongoDataParser"

    fun parseSubjects(jsonStr: String): List<SubjectEntity> {
        val results = mutableListOf<SubjectEntity>()
        try {
            val trimmed = jsonStr.trim()
            val array: JSONArray = if (trimmed.startsWith("[")) {
                JSONArray(trimmed)
            } else {
                val obj = JSONObject(trimmed)
                when {
                    obj.has("subjects") -> obj.getJSONArray("subjects")
                    obj.has("data") -> obj.getJSONArray("data")
                    else -> JSONArray()
                }
            }

            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                val id = item.optString("id").ifEmpty {
                    item.optString("_id").ifEmpty { "subject-$i" }
                }
                val title = item.optString("title").ifEmpty {
                    item.optString("book", "Untitled Subject")
                }
                val course = item.optString("degreeCourse").ifEmpty {
                    item.optString("course", "BS Computer Science")
                }
                val totalMcqs = item.optInt("totalMcqs", item.optInt("totalQuestions", 0))
                val totalModules = item.optInt("totalModules", item.optInt("weeks", 1)).coerceAtLeast(1)
                val progress = item.optInt("progressPercent", item.optInt("progress", 0))
                val iconType = item.optString("iconType").ifEmpty {
                    deriveIconType(title, item.optString("category"))
                }
                val colorHex = parseColorHex(item.opt("colorHex"), i)
                val category = item.optString("category").ifEmpty {
                    item.optString("level", "Core CS")
                }
                val orderIndex = item.optInt("orderIndex", i + 1)

                results.add(
                    SubjectEntity(
                        id = id,
                        title = title,
                        degreeCourse = course,
                        totalMcqs = totalMcqs,
                        totalModules = totalModules,
                        progressPercent = progress,
                        iconType = iconType,
                        colorHex = colorHex,
                        category = category,
                        orderIndex = orderIndex
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing subjects from API: ${e.message}", e)
        }
        return results
    }

    fun parseQuestions(
        jsonStr: String,
        fallbackSubjectId: String? = null,
        fallbackSubjectTitle: String? = null
    ): List<QuestionEntity> {
        val results = mutableListOf<QuestionEntity>()
        try {
            val trimmed = jsonStr.trim()
            val array: JSONArray = if (trimmed.startsWith("[")) {
                JSONArray(trimmed)
            } else {
                val obj = JSONObject(trimmed)
                when {
                    obj.has("questions") -> obj.getJSONArray("questions")
                    obj.has("data") -> obj.getJSONArray("data")
                    else -> JSONArray()
                }
            }

            for (i in 0 until array.length()) {
                val item = array.getJSONObject(i)
                val subjectId = item.optString("subjectId").ifEmpty {
                    item.optString("subject", fallbackSubjectId ?: "general")
                }
                val subjectTitle = item.optString("subjectTitle").ifEmpty {
                    fallbackSubjectTitle ?: "General Preparation"
                }
                val topic = item.optString("topic").ifEmpty {
                    item.optString("chapter", "General")
                }
                val difficulty = item.optString("difficulty").ifEmpty {
                    item.optString("level", "Medium")
                }
                val weekNumber = item.optInt("weekNumber", item.optInt("week", 1)).coerceAtLeast(1)
                val questionText = item.optString("questionText").ifEmpty {
                    item.optString("question", "")
                }
                if (questionText.isBlank()) continue

                // Parse Options
                var optA = item.optString("optionA", "")
                var optB = item.optString("optionB", "")
                var optC = item.optString("optionC", "")
                var optD = item.optString("optionD", "")

                if (item.has("options")) {
                    val optArr = item.getJSONArray("options")
                    if (optArr.length() > 0) optA = optArr.optString(0, "")
                    if (optArr.length() > 1) optB = optArr.optString(1, "")
                    if (optArr.length() > 2) optC = optArr.optString(2, "")
                    if (optArr.length() > 3) optD = optArr.optString(3, "")
                }

                // Parse Answer
                val answerRaw = if (item.has("correctOption")) {
                    item.opt("correctOption")
                } else {
                    item.opt("answer")
                }
                val correctIndex = parseAnswerIndex(answerRaw, optA, optB, optC, optD)
                val explanation = item.optString("explanation", "")

                results.add(
                    QuestionEntity(
                        id = 0, // Auto-generated or matched in Room upsert
                        subjectId = subjectId,
                        subjectTitle = subjectTitle,
                        topic = topic,
                        difficulty = difficulty,
                        weekNumber = weekNumber,
                        questionText = questionText,
                        optionA = optA,
                        optionB = optB,
                        optionC = optC,
                        optionD = optD,
                        correctOption = correctIndex,
                        explanation = explanation,
                        isBookmarked = false
                    )
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing questions from API: ${e.message}", e)
        }
        return results
    }

    fun parseWeeklyModules(jsonStr: String): List<WeeklyModuleEntity> {
        val results = mutableListOf<WeeklyModuleEntity>()
        try {
            val trimmed = jsonStr.trim()
            if (!trimmed.startsWith("[")) {
                val obj = JSONObject(trimmed)
                if (obj.has("modules")) {
                    val arr = obj.getJSONArray("modules")
                    for (i in 0 until arr.length()) {
                        val item = arr.getJSONObject(i)
                        results.add(
                            WeeklyModuleEntity(
                                id = item.optString("id", "mod-$i"),
                                weekNumber = item.optInt("weekNumber", 1),
                                title = item.optString("title", "Week ${item.optInt("weekNumber", 1)}"),
                                mcqCount = item.optInt("mcqCount", 20),
                                subjectId = item.optString("subjectId", ""),
                                isCompleted = item.optBoolean("isCompleted", false)
                            )
                        )
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing weekly modules: ${e.message}", e)
        }
        return results
    }

    private fun parseAnswerIndex(
        raw: Any?,
        optionA: String,
        optionB: String,
        optionC: String,
        optionD: String
    ): Int {
        if (raw == null) return 0
        return when (raw) {
            is Number -> {
                val num = raw.toInt()
                if (num in 0..3) num
                else if (num in 1..4) num - 1 // 1-based to 0-based
                else 0
            }
            is String -> {
                val s = raw.trim()
                when (s.uppercase()) {
                    "A", "0" -> 0
                    "B", "1" -> 1
                    "C", "2" -> 2
                    "D", "3" -> 3
                    "4" -> 3
                    else -> {
                        val options = listOf(optionA, optionB, optionC, optionD)
                        val found = options.indexOfFirst { it.equals(s, ignoreCase = true) }
                        if (found >= 0) found else 0
                    }
                }
            }
            else -> 0
        }
    }

    private fun parseColorHex(raw: Any?, index: Int): Long {
        if (raw == null) return defaultColors[index % defaultColors.size]
        return when (raw) {
            is Number -> raw.toLong()
            is String -> {
                try {
                    val s = raw.trim()
                    if (s.startsWith("#")) {
                        Color.parseColor(s).toLong() and 0xFFFFFFFFL
                    } else if (s.startsWith("0x", ignoreCase = true)) {
                        java.lang.Long.decode(s)
                    } else {
                        defaultColors[index % defaultColors.size]
                    }
                } catch (e: Exception) {
                    defaultColors[index % defaultColors.size]
                }
            }
            else -> defaultColors[index % defaultColors.size]
        }
    }

    private fun deriveIconType(title: String, category: String): String {
        val t = title.lowercase()
        return when {
            t.contains("architecture") || t.contains("cpu") || t.contains("hardware") -> "cpu"
            t.contains("database") || t.contains("sql") || t.contains("data") -> "database"
            t.contains("automata") || t.contains("graph") || t.contains("theory") -> "graph"
            t.contains("object") || t.contains("oop") || t.contains("class") -> "cube"
            t.contains("network") || t.contains("web") -> "terminal"
            t.contains("ai") || t.contains("intelligence") || t.contains("ml") -> "robot"
            else -> "code"
        }
    }

    private val defaultColors = listOf(
        0xFF7C3AEDL, // Purple
        0xFF059669L, // Emerald Green
        0xFF0D9488L, // Teal
        0xFF2563EBL, // Blue
        0xFFE11D48L, // Rose
        0xFFD97706L  // Amber
    )
}
