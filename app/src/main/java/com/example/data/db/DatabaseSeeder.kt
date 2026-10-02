package com.example.data.db

import android.content.Context
import android.util.Log
import com.example.data.model.QuestionEntity
import com.example.data.model.SubjectEntity
import com.example.data.model.WeeklyModuleEntity
import org.json.JSONObject

object DatabaseSeeder {
    private const val TAG = "DatabaseSeeder"

    suspend fun seedDatabase(database: AppDatabase, context: Context? = null) {
        val subjectDao = database.subjectDao()
        val questionDao = database.questionDao()
        val weeklyModuleDao = database.weeklyModuleDao()

        val currentCount = questionDao.getTotalQuestionCount()
        val hasOldData = subjectDao.getSubjectById("cs") != null

        // If genuine MongoDB questions already present and not old dummy data, skip
        if (currentCount >= 170 && !hasOldData) {
            Log.d(TAG, "Database already populated with $currentCount MongoDB questions")
            return
        }

        // Clear out any old dummy data to display accurate MongoDB records
        subjectDao.deleteAll()
        questionDao.deleteAll()
        weeklyModuleDao.deleteAll()

        if (context != null) {
            try {
                val jsonString = context.assets.open("mongodb_mcqs.json").bufferedReader().use { it.readText() }
                val root = JSONObject(jsonString)

                // 1. Subjects
                val subjectsArray = root.getJSONArray("subjects")
                val subjects = mutableListOf<SubjectEntity>()
                for (i in 0 until subjectsArray.length()) {
                    val obj = subjectsArray.getJSONObject(i)
                    val hexStr = obj.getString("colorHex")
                    val colorLong = java.lang.Long.decode(hexStr)
                    subjects.add(
                        SubjectEntity(
                            id = obj.getString("id"),
                            title = obj.getString("title"),
                            degreeCourse = obj.getString("degreeCourse"),
                            totalMcqs = obj.getInt("totalMcqs"),
                            totalModules = obj.getInt("totalModules"),
                            progressPercent = obj.optInt("progressPercent", 0),
                            iconType = obj.getString("iconType"),
                            colorHex = colorLong,
                            category = obj.getString("category"),
                            orderIndex = obj.getInt("orderIndex")
                        )
                    )
                }
                subjectDao.insertSubjects(subjects)

                // 2. Weekly Modules
                val modulesArray = root.getJSONArray("modules")
                val modules = mutableListOf<WeeklyModuleEntity>()
                for (i in 0 until modulesArray.length()) {
                    val obj = modulesArray.getJSONObject(i)
                    modules.add(
                        WeeklyModuleEntity(
                            id = obj.getString("id"),
                            weekNumber = obj.getInt("weekNumber"),
                            title = obj.getString("title"),
                            mcqCount = obj.getInt("mcqCount"),
                            subjectId = obj.getString("subjectId"),
                            isCompleted = obj.optBoolean("isCompleted", false)
                        )
                    )
                }
                weeklyModuleDao.insertModules(modules)

                // 3. Questions
                val questionsArray = root.getJSONArray("questions")
                val questions = mutableListOf<QuestionEntity>()
                for (i in 0 until questionsArray.length()) {
                    val obj = questionsArray.getJSONObject(i)
                    questions.add(
                        QuestionEntity(
                            id = obj.getInt("id"),
                            subjectId = obj.getString("subjectId"),
                            subjectTitle = obj.getString("subjectTitle"),
                            topic = obj.getString("topic"),
                            difficulty = obj.getString("difficulty"),
                            weekNumber = obj.getInt("weekNumber"),
                            questionText = obj.getString("questionText"),
                            optionA = obj.getString("optionA"),
                            optionB = obj.getString("optionB"),
                            optionC = obj.getString("optionC"),
                            optionD = obj.getString("optionD"),
                            correctOption = obj.getInt("correctOption"),
                            explanation = obj.optString("explanation", ""),
                            isBookmarked = false
                        )
                    )
                }
                questionDao.insertQuestions(questions)
                Log.d(TAG, "Seeded ${subjects.size} subjects, ${modules.size} modules, and ${questions.size} questions from MongoDB")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to load mongodb_mcqs.json from assets: ${e.message}", e)
                seedFallbackData(database)
            }
        } else {
            seedFallbackData(database)
        }
    }

    private suspend fun seedFallbackData(database: AppDatabase) {
        val subjectDao = database.subjectDao()
        val questionDao = database.questionDao()
        val weeklyModuleDao = database.weeklyModuleDao()

        val subjects = listOf(
            SubjectEntity(
                id = "computer-architecture-and-organization-week-01",
                title = "Computer Architecture & Organization",
                degreeCourse = "BS Computer Science • Lec. Iftikhar Zahid",
                totalMcqs = 39,
                totalModules = 1,
                progressPercent = 0,
                iconType = "cpu",
                colorHex = 0xFF7C3AED,
                category = "Systems",
                orderIndex = 1
            ),
            SubjectEntity(
                id = "database-systems-week-02",
                title = "Database Systems",
                degreeCourse = "BS Computer Science • Lec. Iftikhar Zahid",
                totalMcqs = 39,
                totalModules = 1,
                progressPercent = 0,
                iconType = "database",
                colorHex = 0xFF059669,
                category = "Data & AI",
                orderIndex = 2
            ),
            SubjectEntity(
                id = "theory-of-automata-week-02",
                title = "Theory of Automata",
                degreeCourse = "BS Computer Science • Lec. Iftikhar Zahid",
                totalMcqs = 40,
                totalModules = 1,
                progressPercent = 0,
                iconType = "graph",
                colorHex = 0xFF0D9488,
                category = "Core CS",
                orderIndex = 3
            ),
            SubjectEntity(
                id = "object-oriented-programming-week-2",
                title = "OOP: Analysis & UML Design",
                degreeCourse = "BS Computer Science • Iftikhar Zahid",
                totalMcqs = 20,
                totalModules = 1,
                progressPercent = 0,
                iconType = "cube",
                colorHex = 0xFF2563EB,
                category = "Programming",
                orderIndex = 4
            ),
            SubjectEntity(
                id = "object-oriented-programming-week-3",
                title = "OOP: Classes, Methods & Namespaces",
                degreeCourse = "ADP Semester 2 • Iftikhar Zahid",
                totalMcqs = 20,
                totalModules = 1,
                progressPercent = 0,
                iconType = "cube",
                colorHex = 0xFFE11D48,
                category = "Programming",
                orderIndex = 5
            )
        )
        subjectDao.insertSubjects(subjects)

        val modules = listOf(
            WeeklyModuleEntity(
                id = "mod-arch-01",
                weekNumber = 1,
                title = "Week 01: Digital Logic & Computer Organization",
                mcqCount = 39,
                subjectId = "computer-architecture-and-organization-week-01",
                isCompleted = false
            ),
            WeeklyModuleEntity(
                id = "mod-db-02",
                weekNumber = 2,
                title = "Week 02: Three-Level Schema Architecture & Data Independence",
                mcqCount = 39,
                subjectId = "database-systems-week-02",
                isCompleted = false
            ),
            WeeklyModuleEntity(
                id = "mod-automata-02",
                weekNumber = 2,
                title = "Week 02: Regular Expressions & Recursive Language Definitions",
                mcqCount = 40,
                subjectId = "theory-of-automata-week-02",
                isCompleted = false
            ),
            WeeklyModuleEntity(
                id = "mod-oop-01",
                weekNumber = 1,
                title = "Week 01: OOP Paradigm, Classes, Objects & Encapsulation",
                mcqCount = 20,
                subjectId = "object-oriented-programming-week-2",
                isCompleted = false
            ),
            WeeklyModuleEntity(
                id = "mod-oop-02",
                weekNumber = 2,
                title = "Week 02: OOAD using UML, CRC Cards & Object Modeling",
                mcqCount = 20,
                subjectId = "object-oriented-programming-week-2",
                isCompleted = false
            ),
            WeeklyModuleEntity(
                id = "mod-oop-03",
                weekNumber = 3,
                title = "Week 03: Classes, Objects, Methods & Namespaces",
                mcqCount = 20,
                subjectId = "object-oriented-programming-week-3",
                isCompleted = false
            )
        )
        weeklyModuleDao.insertModules(modules)
        Log.d(TAG, "Seeded fallback MongoDB data successfully")
    }
}
