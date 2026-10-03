package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat
import android.graphics.Color as AndroidColor
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.db.AppDatabase
import com.example.data.repository.McqRepository
import com.example.ui.components.AppHeader
import com.example.ui.components.AppMenuBottomSheet
import com.example.ui.components.BottomNavBar
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.MoreScreen
import com.example.ui.screens.ResultsScreen
import com.example.ui.screens.SubjectDetailModal
import com.example.ui.screens.SubjectsScreen
import com.example.ui.screens.TestResultScreen
import com.example.ui.screens.TestRunnerScreen
import com.example.ui.screens.TestScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.MainTab
import com.example.ui.viewmodel.McqViewModel
import com.example.ui.viewmodel.McqViewModelFactory
import com.example.ui.viewmodel.ScreenState
import com.example.data.db.DatabaseSeeder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Ensure pure white status bar background with dark status bar icons
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.light(
                AndroidColor.TRANSPARENT,
                AndroidColor.TRANSPARENT
            ),
            navigationBarStyle = SystemBarStyle.light(
                AndroidColor.WHITE,
                AndroidColor.WHITE
            )
        )
        WindowCompat.getInsetsController(window, window.decorView)?.apply {
            isAppearanceLightStatusBars = true
            isAppearanceLightNavigationBars = true
        }

        val database = AppDatabase.getDatabase(applicationContext, lifecycleScope)
        lifecycleScope.launch(Dispatchers.IO) {
            DatabaseSeeder.seedDatabase(database, applicationContext)
        }
        val repository = McqRepository(database)
        val factory = McqViewModelFactory(repository)

        setContent {
            MyApplicationTheme {
                val viewModel: McqViewModel = viewModel(factory = factory)
                val currentScreen by viewModel.currentScreen.collectAsStateWithLifecycle()
                val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
                val selectedSubject by viewModel.selectedSubjectDetail.collectAsStateWithLifecycle()
                val dailyStreak by viewModel.dailyStreak.collectAsStateWithLifecycle()

                var showSplash by remember { mutableStateOf(true) }
                var showMenuSheet by remember { mutableStateOf(false) }
                val sheetState = rememberModalBottomSheetState()
                val coroutineScope = rememberCoroutineScope()

                if (showSplash) {
                    com.example.ui.screens.SplashScreen(onSplashFinished = { showSplash = false })
                } else {
                    when (currentScreen) {
                        ScreenState.TEST_RUNNER -> {
                            TestRunnerScreen(viewModel = viewModel)
                        }

                        ScreenState.TEST_RESULT -> {
                            TestResultScreen(viewModel = viewModel)
                        }

                    ScreenState.SUBJECT_DETAIL -> {
                        selectedSubject?.let { subject ->
                            SubjectDetailModal(
                                subject = subject,
                                onClose = { viewModel.closeSubjectDetail() },
                                onStartTest = { viewModel.startSubjectTest(it) },
                                onStartWeekTest = { weekItem ->
                                    viewModel.startWeekTest(
                                        subjectId = weekItem.subjectId,
                                        subjectTitle = subject.title,
                                        weekTitle = weekItem.title,
                                        weekNumber = weekItem.weekNumber,
                                        limit = weekItem.mcqCount
                                    )
                                }
                            )
                        } ?: run {
                            viewModel.closeSubjectDetail()
                        }
                    }

                    ScreenState.MAIN -> {
                        Scaffold(
                            modifier = Modifier.fillMaxSize(),
                            topBar = {
                                AppHeader(
                                    streakDays = dailyStreak.currentStreak,
                                    showStreak = currentTab == MainTab.HOME,
                                    showSearch = currentTab == MainTab.SUBJECTS || currentTab == MainTab.TEST,
                                    onSearchClick = { viewModel.selectTab(MainTab.SUBJECTS) },
                                    onMenuClick = {
                                        showMenuSheet = true
                                    }
                                )
                            },
                            bottomBar = {
                                BottomNavBar(
                                    currentTab = currentTab,
                                    onTabSelected = { tab ->
                                        viewModel.selectTab(tab)
                                    }
                                )
                            }
                        ) { innerPadding ->
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(innerPadding)
                            ) {
                                when (currentTab) {
                                    MainTab.HOME -> HomeScreen(viewModel = viewModel)
                                    MainTab.SUBJECTS -> SubjectsScreen(viewModel = viewModel)
                                    MainTab.TEST -> TestScreen(viewModel = viewModel)
                                    MainTab.RESULTS -> ResultsScreen(viewModel = viewModel)
                                    MainTab.MORE -> MoreScreen(viewModel = viewModel)
                                }
                            }
                        }

                        if (showMenuSheet) {
                            AppMenuBottomSheet(
                                sheetState = sheetState,
                                onDismiss = { showMenuSheet = false },
                                onSelectTab = { tab ->
                                    viewModel.selectTab(tab)
                                    coroutineScope.launch {
                                        sheetState.hide()
                                        showMenuSheet = false
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
        }
    }
}
