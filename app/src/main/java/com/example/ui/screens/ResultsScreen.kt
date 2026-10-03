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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.model.Subject
import com.example.data.model.TestAttempt
import com.example.ui.components.ResponsiveScaffold
import com.example.ui.components.charts.AccuracyDistributionCard
import com.example.ui.components.charts.AccuracyOverTimeChart
import com.example.ui.components.charts.SubjectProficiencyChart
import com.example.ui.components.charts.WeeklyActivityChart
import com.example.ui.components.getSubjectIcon
import com.example.ui.theme.AccentYellow
import com.example.ui.theme.BackgroundSlate
import com.example.ui.theme.BorderLight
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextMuted
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

    var selectedSubjectId by remember { mutableStateOf<String?>(null) } // null = All Subjects

    val selectedSubject = remember(subjects, selectedSubjectId) {
        subjects.find { it.id == selectedSubjectId }
    }

    val filteredAttempts = remember(attempts, selectedSubjectId) {
        if (selectedSubjectId == null) attempts
        else attempts.filter { it.subjectId == selectedSubjectId }
    }

    // Dynamic subject stats
    val displayAccuracy = if (selectedSubject != null) {
        selectedSubject.progressPercent
    } else {
        stats.accuracyPercentage
    }

    val displaySolved = if (selectedSubject != null) {
        (selectedSubject.totalMcqs * (selectedSubject.progressPercent / 100f)).toInt()
    } else {
        stats.questionsSolved
    }

    val displayTests = if (selectedSubject != null) {
        filteredAttempts.size.coerceAtLeast(1)
    } else {
        stats.testsCompleted
    }

    val displayBestScore = if (filteredAttempts.isNotEmpty()) {
        filteredAttempts.maxOf { it.scorePercentage }
    } else if (selectedSubject != null) {
        (selectedSubject.progressPercent + 8).coerceAtMost(100)
    } else {
        stats.bestScorePercentage
    }

    // Dynamic Improvement Rate
    val improvementOverTime = remember(filteredAttempts, selectedSubject) {
        if (filteredAttempts.size >= 2) {
            val sorted = filteredAttempts.sortedBy { it.timestamp }
            sorted.last().scorePercentage - sorted.first().scorePercentage
        } else {
            14
        }
    }

    ResponsiveScaffold { screenSizeInfo ->
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

            // 2. Interactive Subject Filter Tabs (Recharts-style multi-subject selector)
            item {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(bottom = 8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = null,
                            tint = TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Filter by Subject",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextSecondary
                        )
                    }

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        // All Subjects Pill
                        item {
                            val isAllSelected = selectedSubjectId == null
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isAllSelected) SubjectBlue else Color.White)
                                    .border(
                                        1.dp,
                                        if (isAllSelected) SubjectBlue else BorderLight,
                                        RoundedCornerShape(10.dp)
                                    )
                                    .clickable { selectedSubjectId = null }
                                    .padding(horizontal = 14.dp, vertical = 8.dp)
                                    .testTag("subject_filter_all")
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "All Subjects",
                                        fontSize = 12.5.sp,
                                        fontWeight = if (isAllSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isAllSelected) Color.White else TextPrimary
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(if (isAllSelected) Color.White.copy(alpha = 0.25f) else Color(0xFFF1F5F9))
                                            .padding(horizontal = 5.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "${subjects.size}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isAllSelected) Color.White else TextSecondary
                                        )
                                    }
                                }
                            }
                        }

                        // Individual Subject Filter Pills
                        items(subjects, key = { it.id }) { subject ->
                            val isSelected = selectedSubjectId == subject.id
                            val subjectColor = Color(subject.colorHex)

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) SubjectBlue else Color.White)
                                    .border(
                                        1.dp,
                                        if (isSelected) SubjectBlue else BorderLight,
                                        RoundedCornerShape(10.dp)
                                    )
                                    .clickable { selectedSubjectId = subject.id }
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                                    .testTag("subject_filter_${subject.id}")
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(if (isSelected) Color.White else subjectColor)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    val shortName = subject.title.split(" ").take(2).joinToString(" ")
                                    Text(
                                        text = shortName,
                                        fontSize = 12.5.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) Color.White else TextPrimary
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "${subject.progressPercent}%",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) Color.White.copy(alpha = 0.9f) else subjectColor
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 3. Dynamic Overview & Metric Cards
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White)
                        .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
                        .padding(18.dp)
                        .testTag("results_summary_card")
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = if (selectedSubject != null) "${selectedSubject.title} Index" else "Overall Preparation Index",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.TrendingUp,
                                        contentDescription = null,
                                        tint = StatusSuccess,
                                        modifier = Modifier.size(13.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = if (improvementOverTime >= 0) "+${improvementOverTime}% improvement over time" else "${improvementOverTime}% trajectory",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = StatusSuccess
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (displayAccuracy >= 70) Color(0xFFDCFCE7) else Color(0xFFFEF3C7))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = if (displayAccuracy >= 70) "On Track" else "Needs Practice",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (displayAccuracy >= 70) StatusSuccess else Color(0xFFB45309),
                                    maxLines = 1
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            AnalyticStatItem(title = "Accuracy", value = "$displayAccuracy%", color = SubjectBlue)
                            AnalyticStatItem(title = "Solved", value = "$displaySolved", color = Color(0xFF7C3AED))
                            AnalyticStatItem(title = "Tests", value = "$displayTests", color = Color(0xFF059669))
                            AnalyticStatItem(title = "Best Score", value = "$displayBestScore%", color = AccentYellow)
                        }
                    }
                }
            }

            // 4. Subject Proficiency Breakdown Card
            item {
                SubjectProficiencyChart(
                    subjects = subjects,
                    onSubjectClick = { subject ->
                        viewModel.showSubjectDetail(subject)
                    }
                )
            }

            // 8. Test History Section Header
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
                        val subjectLabel = selectedSubject?.title?.split(" ")?.take(2)?.joinToString(" ")
                        Text(
                            text = if (subjectLabel != null) "$subjectLabel History (${filteredAttempts.size} tests)" else "Session History (${filteredAttempts.size} tests)",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                }
            }

            // 9. Recent Test Attempt Items
            if (filteredAttempts.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.White)
                            .border(1.dp, BorderLight, RoundedCornerShape(14.dp))
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "No tests recorded for this subject yet.",
                                fontSize = 13.5.sp,
                                color = TextSecondary,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            } else {
                items(filteredAttempts, key = { it.id }) { attempt ->
                    TestAttemptHistoryCard(attempt = attempt)
                }
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
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
