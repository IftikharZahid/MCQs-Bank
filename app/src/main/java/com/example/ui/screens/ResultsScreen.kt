package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.model.TestAttempt
import com.example.ui.components.charts.AccuracyOverTimeChart
import com.example.ui.components.charts.SubjectProficiencyChart
import com.example.ui.components.charts.WeeklyActivityChart
import com.example.ui.theme.AccentYellow
import com.example.ui.theme.BackgroundSlate
import com.example.ui.theme.BorderLight
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.viewmodel.McqViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ResultsScreen(
    viewModel: McqViewModel,
    modifier: Modifier = Modifier
) {
    val stats by viewModel.performanceStats.collectAsStateWithLifecycle()
    val attempts by viewModel.testAttempts.collectAsStateWithLifecycle()
    val subjects by viewModel.allSubjects.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundSlate)
            .testTag("results_screen_list"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Dashboard Header
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Performance Dashboard",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Visualized user progress, accuracy trends, and subject proficiency.",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
            }
        }

        // 2. High-Level Summary Card
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White)
                    .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
                    .padding(18.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Overall Preparation Index",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0xFFDCFCE7))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "On Track",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = StatusSuccess
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        AnalyticStatItem(title = "Accuracy", value = "${stats.accuracyPercentage}%", color = SubjectBlue)
                        AnalyticStatItem(title = "Solved", value = "${stats.questionsSolved}", color = Color(0xFF7C3AED))
                        AnalyticStatItem(title = "Tests", value = "${stats.testsCompleted}", color = Color(0xFF059669))
                        AnalyticStatItem(title = "Best Score", value = "${stats.bestScorePercentage}%", color = AccentYellow)
                    }
                }
            }
        }

        // 3. Accuracy Over Time Chart (Line & Area spline with interactive tooltips)
        item {
            AccuracyOverTimeChart(attempts = attempts)
        }

        // 4. Subject-Wise Proficiency Chart (Grouped bars with benchmark comparison)
        item {
            SubjectProficiencyChart(
                subjects = subjects,
                onSubjectClick = { subject ->
                    viewModel.showSubjectDetail(subject)
                }
            )
        }

        // 5. Weekly Study Velocity & Activity Bar Chart
        item {
            WeeklyActivityChart()
        }

        // 6. Test History Section Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.History,
                        contentDescription = null,
                        tint = TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Session History (${attempts.size} tests)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }
            }
        }

        // 7. Recent Test Attempt Items
        items(attempts, key = { it.id }) { attempt ->
            TestAttemptHistoryCard(attempt = attempt)
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun AnalyticStatItem(title: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = color)
        Text(text = title, fontSize = 11.sp, color = TextSecondary)
    }
}

@Composable
fun TestAttemptHistoryCard(attempt: TestAttempt) {
    val dateFormat = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
    val formattedDate = dateFormat.format(Date(attempt.timestamp))

    val isPassed = attempt.scorePercentage >= 70

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(if (isPassed) Color(0xFFDCFCE7) else Color(0xFFFEE2E2)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "${attempt.scorePercentage}%",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isPassed) StatusSuccess else StatusError
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = attempt.subjectTitle,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "${attempt.topic}  •  ${attempt.totalQuestions} Questions",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
                Text(
                    text = formattedDate,
                    fontSize = 11.sp,
                    color = Color(0xFF94A3B8)
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${attempt.correctCount} / ${attempt.totalQuestions}",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = if (isPassed) "Passed" else "Review",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isPassed) StatusSuccess else StatusError
                )
            }
        }
    }
}
