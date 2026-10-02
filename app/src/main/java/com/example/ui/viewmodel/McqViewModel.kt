package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.model.DailyStreakInfo
import com.example.data.model.DayStreakItem
import com.example.data.model.DayStreakStatus
import com.example.data.model.PerformanceStats
import com.example.data.model.Question
import com.example.data.model.Subject
import com.example.data.model.TestAttempt
import com.example.data.model.WeeklyModule
import com.example.data.repository.McqRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class MainTab {
    HOME, SUBJECTS, TEST, RESULTS, MORE
}

enum class ScreenState {
    MAIN, TEST_RUNNER, TEST_RESULT, SUBJECT_DETAIL
}

data class QuestionReview(
    val question: Question,
    val selectedOption: Int?, // null if skipped
    val isCorrect: Boolean
)

data class TestResultSummary(
    val subjectTitle: String,
    val topic: String,
    val totalQuestions: Int,
    val correctCount: Int,
    val wrongCount: Int,
    val skippedCount: Int,
    val scorePercentage: Int,
    val durationSeconds: Int,
    val reviews: List<QuestionReview>
)

data class TestConfig(
    val subjectId: String = "theory-of-automata-week-02",
    val subjectTitle: String = "Theory of Automata",
    val topic: String = "All Topics",
    val difficulty: String = "All Levels",
    val questionsCount: Int = 20
)

class McqViewModel(private val repository: McqRepository) : ViewModel() {

    private val _currentTab = MutableStateFlow(MainTab.HOME)
    val currentTab: StateFlow<MainTab> = _currentTab.asStateFlow()

    private val _currentScreen = MutableStateFlow(ScreenState.MAIN)
    val currentScreen: StateFlow<ScreenState> = _currentScreen.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow("All")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    // Pagination for subjects list
    private val _pageSize = MutableStateFlow(6)
    val pageSize: StateFlow<Int> = _pageSize.asStateFlow()

    val allSubjects: StateFlow<List<Subject>> = repository.allSubjects
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val filteredSubjects: StateFlow<List<Subject>> = combine(
        allSubjects,
        _searchQuery,
        _selectedCategory,
        _pageSize
    ) { subjects, query, category, limit ->
        subjects.filter { subject ->
            val matchesQuery = query.isBlank() ||
                    subject.title.contains(query, ignoreCase = true) ||
                    subject.degreeCourse.contains(query, ignoreCase = true)
            val matchesCategory = category == "All" || subject.category == category
            matchesQuery && matchesCategory
        }.take(limit)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val weeklyModules: StateFlow<List<WeeklyModule>> = repository.allModules
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val testAttempts: StateFlow<List<TestAttempt>> = repository.allAttempts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val bookmarkedQuestions: StateFlow<List<Question>> = repository.bookmarkedQuestions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _performanceStats = MutableStateFlow(
        PerformanceStats(
            testsCompleted = 12,
            questionsSolved = 340,
            correctAnswers = 265,
            accuracyPercentage = 78,
            bestScorePercentage = 92,
            strongAreas = listOf("Programming Fundamentals", "Database Systems"),
            needsPracticeAreas = listOf("Automata", "Computer Architecture")
        )
    )
    val performanceStats: StateFlow<PerformanceStats> = _performanceStats.asStateFlow()

    // Daily Learning Streak State
    private val _dailyStreak = MutableStateFlow(
        DailyStreakInfo(
            currentStreak = 5,
            bestStreak = 14,
            todaySolved = 15,
            dailyGoalTarget = 15,
            streakFreezeCount = 1,
            days = listOf(
                DayStreakItem("Mon", "28", DayStreakStatus.COMPLETED, 20),
                DayStreakItem("Tue", "29", DayStreakStatus.COMPLETED, 25),
                DayStreakItem("Wed", "30", DayStreakStatus.COMPLETED, 18),
                DayStreakItem("Thu", "01", DayStreakStatus.COMPLETED, 30),
                DayStreakItem("Fri", "02", DayStreakStatus.TODAY_COMPLETED, 15),
                DayStreakItem("Sat", "03", DayStreakStatus.FUTURE, 0),
                DayStreakItem("Sun", "04", DayStreakStatus.FUTURE, 0)
            )
        )
    )
    val dailyStreak: StateFlow<DailyStreakInfo> = _dailyStreak.asStateFlow()

    // Test Config State
    private val _testConfig = MutableStateFlow(TestConfig())
    val testConfig: StateFlow<TestConfig> = _testConfig.asStateFlow()

    // Active Test Runner State
    private val _activeQuestions = MutableStateFlow<List<Question>>(emptyList())
    val activeQuestions: StateFlow<List<Question>> = _activeQuestions.asStateFlow()

    private val _currentQuestionIndex = MutableStateFlow(0)
    val currentQuestionIndex: StateFlow<Int> = _currentQuestionIndex.asStateFlow()

    private val _selectedAnswers = MutableStateFlow<Map<Int, Int>>(emptyMap())
    val selectedAnswers: StateFlow<Map<Int, Int>> = _selectedAnswers.asStateFlow()

    private val _flaggedQuestions = MutableStateFlow<Set<Int>>(emptySet())
    val flaggedQuestions: StateFlow<Set<Int>> = _flaggedQuestions.asStateFlow()

    private val _remainingSeconds = MutableStateFlow(1200) // 20 mins default
    val remainingSeconds: StateFlow<Int> = _remainingSeconds.asStateFlow()

    private val _testResult = MutableStateFlow<TestResultSummary?>(null)
    val testResult: StateFlow<TestResultSummary?> = _testResult.asStateFlow()

    // Subject Detail Dialog/Screen State
    private val _selectedSubjectDetail = MutableStateFlow<Subject?>(null)
    val selectedSubjectDetail: StateFlow<Subject?> = _selectedSubjectDetail.asStateFlow()

    private var timerJob: Job? = null
    private var testStartTime: Long = 0

    init {
        refreshStats()
    }

    fun selectTab(tab: MainTab) {
        _currentTab.value = tab
        _currentScreen.value = ScreenState.MAIN
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun selectCategory(category: String) {
        _selectedCategory.value = category
    }

    fun loadMoreSubjects() {
        _pageSize.update { it + 4 }
    }

    fun updateTestConfig(
        subjectId: String? = null,
        subjectTitle: String? = null,
        topic: String? = null,
        difficulty: String? = null,
        questionsCount: Int? = null
    ) {
        _testConfig.update { current ->
            current.copy(
                subjectId = subjectId ?: current.subjectId,
                subjectTitle = subjectTitle ?: current.subjectTitle,
                topic = topic ?: current.topic,
                difficulty = difficulty ?: current.difficulty,
                questionsCount = questionsCount ?: current.questionsCount
            )
        }
    }

    fun startConfiguredTest() {
        val config = _testConfig.value
        viewModelScope.launch {
            val questions = repository.getQuestionsForTest(
                subjectId = config.subjectId,
                topic = config.topic,
                difficulty = config.difficulty,
                limit = config.questionsCount
            )
            startTestWithQuestions(questions, config.subjectTitle, config.topic)
        }
    }

    fun startRandomTest() {
        viewModelScope.launch {
            val questions = repository.getRandomQuestions(20)
            startTestWithQuestions(questions, "Random Assessment", "All Subjects & Topics")
        }
    }

    fun startSubjectTest(subject: Subject) {
        updateTestConfig(subjectId = subject.id, subjectTitle = subject.title, topic = "All Topics")
        viewModelScope.launch {
            val questions = repository.getQuestionsForTest(
                subjectId = subject.id,
                topic = null,
                difficulty = null,
                limit = 20
            )
            startTestWithQuestions(questions, subject.title, "Subject Master Test")
        }
    }

    fun startWeeklyModuleTest(module: WeeklyModule) {
        viewModelScope.launch {
            val questions = repository.getQuestionsForTest(
                subjectId = module.subjectId,
                topic = null,
                difficulty = null,
                limit = module.mcqCount.coerceAtMost(25)
            )
            startTestWithQuestions(questions, module.title, "Weekly Assessment")
        }
    }

    fun startWeekTest(
        subjectId: String,
        subjectTitle: String,
        weekTitle: String,
        weekNumber: Int,
        limit: Int = 20
    ) {
        updateTestConfig(subjectId = subjectId, subjectTitle = subjectTitle, topic = weekTitle)
        viewModelScope.launch {
            val questions = repository.getQuestionsForWeek(
                subjectId = subjectId,
                subjectTitle = subjectTitle,
                weekNumber = weekNumber,
                limit = limit
            )
            val finalQuestions = if (questions.isEmpty()) {
                repository.getQuestionsForTest(subjectId, null, null, limit)
            } else {
                questions
            }
            startTestWithQuestions(finalQuestions, weekTitle, "$subjectTitle • Week $weekNumber")
        }
    }

    private fun startTestWithQuestions(questions: List<Question>, title: String, topic: String) {
        if (questions.isEmpty()) return
        _activeQuestions.value = questions
        _currentQuestionIndex.value = 0
        _selectedAnswers.value = emptyMap()
        _flaggedQuestions.value = emptySet()
        _remainingSeconds.value = questions.size * 60 // 1 minute per question
        testStartTime = System.currentTimeMillis()
        _currentScreen.value = ScreenState.TEST_RUNNER

        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (_remainingSeconds.value > 0) {
                delay(1000)
                _remainingSeconds.update { it - 1 }
            }
            submitTest()
        }
    }

    fun selectOption(questionId: Int, optionIndex: Int) {
        _selectedAnswers.update { current ->
            current + (questionId to optionIndex)
        }
    }

    fun toggleFlagQuestion(questionId: Int) {
        _flaggedQuestions.update { current ->
            if (current.contains(questionId)) current - questionId else current + questionId
        }
    }

    fun toggleBookmark(question: Question) {
        viewModelScope.launch {
            repository.toggleBookmark(question.id, !question.isBookmarked)
            _activeQuestions.update { list ->
                list.map { if (it.id == question.id) it.copy(isBookmarked = !it.isBookmarked) else it }
            }
        }
    }

    fun nextQuestion() {
        if (_currentQuestionIndex.value < _activeQuestions.value.size - 1) {
            _currentQuestionIndex.update { it + 1 }
        }
    }

    fun prevQuestion() {
        if (_currentQuestionIndex.value > 0) {
            _currentQuestionIndex.update { it - 1 }
        }
    }

    fun jumpToQuestion(index: Int) {
        if (index in _activeQuestions.value.indices) {
            _currentQuestionIndex.value = index
        }
    }

    fun submitTest() {
        timerJob?.cancel()
        val questions = _activeQuestions.value
        val answers = _selectedAnswers.value
        val duration = ((System.currentTimeMillis() - testStartTime) / 1000).toInt().coerceAtLeast(10)

        var correct = 0
        var wrong = 0
        var skipped = 0

        val reviews = questions.map { q ->
            val userAns = answers[q.id]
            val isCorrect = userAns != null && userAns == q.correctOption
            if (userAns == null) {
                skipped++
            } else if (isCorrect) {
                correct++
            } else {
                wrong++
            }
            QuestionReview(q, userAns, isCorrect)
        }

        val total = questions.size
        val scorePercent = if (total > 0) ((correct.toDouble() / total) * 100).toInt() else 0

        val summary = TestResultSummary(
            subjectTitle = _testConfig.value.subjectTitle,
            topic = _testConfig.value.topic,
            totalQuestions = total,
            correctCount = correct,
            wrongCount = wrong,
            skippedCount = skipped,
            scorePercentage = scorePercent,
            durationSeconds = duration,
            reviews = reviews
        )

        _testResult.value = summary
        _currentScreen.value = ScreenState.TEST_RESULT

        // Persist attempt into Room Database
        viewModelScope.launch {
            repository.saveTestAttempt(
                subjectId = _testConfig.value.subjectId,
                subjectTitle = _testConfig.value.subjectTitle,
                topic = _testConfig.value.topic,
                difficulty = _testConfig.value.difficulty,
                totalQuestions = total,
                correctCount = correct,
                wrongCount = wrong,
                scorePercentage = scorePercent,
                durationSeconds = duration
            )
            incrementDailyStreak(correct + wrong)
            refreshStats()
        }
    }

    fun incrementDailyStreak(solved: Int) {
        _dailyStreak.update { current ->
            val newTodaySolved = current.todaySolved + solved
            val isNowCompleted = newTodaySolved >= current.dailyGoalTarget
            val updatedDays = current.days.map { day ->
                if (day.status == DayStreakStatus.TODAY_PENDING || day.status == DayStreakStatus.TODAY_COMPLETED) {
                    day.copy(
                        status = if (isNowCompleted) DayStreakStatus.TODAY_COMPLETED else DayStreakStatus.TODAY_PENDING,
                        solvedCount = newTodaySolved
                    )
                } else day
            }
            val newStreak = if (isNowCompleted && current.todaySolved < current.dailyGoalTarget) {
                current.currentStreak + 1
            } else {
                current.currentStreak
            }
            current.copy(
                todaySolved = newTodaySolved,
                currentStreak = newStreak,
                bestStreak = maxOf(current.bestStreak, newStreak),
                days = updatedDays
            )
        }
    }

    fun startDailySprintTest() {
        startConfiguredTest()
    }

    fun exitTest() {
        timerJob?.cancel()
        _currentScreen.value = ScreenState.MAIN
    }

    fun showSubjectDetail(subject: Subject) {
        _selectedSubjectDetail.value = subject
        _currentScreen.value = ScreenState.SUBJECT_DETAIL
    }

    fun closeSubjectDetail() {
        _selectedSubjectDetail.value = null
        _currentScreen.value = ScreenState.MAIN
    }

    private fun refreshStats() {
        viewModelScope.launch {
            _performanceStats.value = repository.calculateStats()
        }
    }
}

class McqViewModelFactory(private val repository: McqRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(McqViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return McqViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
