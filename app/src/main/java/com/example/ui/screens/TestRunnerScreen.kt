package com.example.ui.screens

import androidx.activity.compose.BackHandler
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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.OutlinedFlag
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.model.Question
import com.example.ui.theme.AccentYellow
import com.example.ui.theme.BackgroundSlate
import com.example.ui.theme.BorderLight
import com.example.ui.theme.StatusError
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.viewmodel.McqViewModel

@Composable
fun TestRunnerScreen(
    viewModel: McqViewModel,
    modifier: Modifier = Modifier
) {
    val questions by viewModel.activeQuestions.collectAsStateWithLifecycle()
    val currentIndex by viewModel.currentQuestionIndex.collectAsStateWithLifecycle()
    val selectedAnswers by viewModel.selectedAnswers.collectAsStateWithLifecycle()
    val flaggedQuestions by viewModel.flaggedQuestions.collectAsStateWithLifecycle()
    val remainingSeconds by viewModel.remainingSeconds.collectAsStateWithLifecycle()

    var showExitDialog by remember { mutableStateOf(false) }
    var showSubmitDialog by remember { mutableStateOf(false) }
    var showExplanation by remember { mutableStateOf(false) }

    BackHandler {
        showExitDialog = true
    }

    if (questions.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(text = "Preparing assessment...", color = TextSecondary)
        }
        return
    }

    val currentQuestion = questions[currentIndex]
    val selectedOption = selectedAnswers[currentQuestion.id]
    val isFlagged = flaggedQuestions.contains(currentQuestion.id)
    val isLast = currentIndex == questions.size - 1

    val minutes = remainingSeconds / 60
    val seconds = remainingSeconds % 60
    val formattedTime = String.format("%02d:%02d", minutes, seconds)
    val isTimeLow = remainingSeconds < 120

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundSlate)
            .statusBarsPadding()
            .navigationBarsPadding()
            .testTag("test_runner_screen")
    ) {
        // 1. Top App Bar for Exam
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 8.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { showExitDialog = true },
                modifier = Modifier.testTag("test_runner_close_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Exit test",
                    tint = TextPrimary
                )
            }

            // Question Count Badge
            Text(
                text = "Question ${currentIndex + 1} of ${questions.size}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )

            // Timer Badge
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (isTimeLow) Color(0xFFFEE2E2) else Color(0xFFF1F5F9))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Timer,
                        contentDescription = null,
                        tint = if (isTimeLow) StatusError else Color(0xFF1E293B),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = formattedTime,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isTimeLow) StatusError else Color(0xFF1E293B)
                    )
                }
            }

            // Bookmark Button
            IconButton(
                onClick = { viewModel.toggleBookmark(currentQuestion) },
                modifier = Modifier.testTag("test_runner_bookmark_button")
            ) {
                Icon(
                    imageVector = if (currentQuestion.isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                    contentDescription = "Bookmark",
                    tint = if (currentQuestion.isBookmarked) AccentYellow else Color(0xFF64748B)
                )
            }
        }

        // Progress Line
        LinearProgressIndicator(
            progress = { (currentIndex + 1).toFloat() / questions.size },
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp),
            color = SubjectBlue,
            trackColor = Color(0xFFE2E8F0),
            strokeCap = StrokeCap.Square
        )

        // Question Navigator Quick Pill Bar
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            itemsIndexed(questions) { idx, q ->
                val isAnswered = selectedAnswers.containsKey(q.id)
                val isQFlagged = flaggedQuestions.contains(q.id)
                val isCurrent = idx == currentIndex

                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(
                            when {
                                isCurrent -> SubjectBlue
                                isAnswered -> Color(0xFF10B981)
                                isQFlagged -> AccentYellow
                                else -> Color(0xFFF1F5F9)
                            }
                        )
                        .clickable { viewModel.jumpToQuestion(idx) },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${idx + 1}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isCurrent || isAnswered) Color.White else TextPrimary
                    )
                }
            }
        }

        HorizontalDivider(thickness = 1.dp, color = BorderLight)

        // 2. Question & Options Content
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Subject & Topic Badge
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFFEFF6FF))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${currentQuestion.subjectTitle}  •  ${currentQuestion.topic}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = SubjectBlue
                        )
                    }

                    // Flag for review button
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .clickable { viewModel.toggleFlagQuestion(currentQuestion.id) }
                            .padding(horizontal = 6.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (isFlagged) Icons.Default.Flag else Icons.Default.OutlinedFlag,
                            contentDescription = null,
                            tint = if (isFlagged) AccentYellow else TextMuted,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (isFlagged) "Flagged" else "Flag",
                            fontSize = 11.sp,
                            color = if (isFlagged) AccentYellow else TextMuted
                        )
                    }
                }
            }

            // Question Statement
            item {
                Text(
                    text = currentQuestion.questionText,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary,
                    lineHeight = 24.sp
                )
            }

            // Options A, B, C, D
            itemsIndexed(currentQuestion.options) { optIndex, optionText ->
                val isSelected = selectedOption == optIndex
                val optLetter = ('A'.code + optIndex).toChar().toString()

                OptionSelectCard(
                    letter = optLetter,
                    text = optionText,
                    isSelected = isSelected,
                    onClick = { viewModel.selectOption(currentQuestion.id, optIndex) }
                )
            }

            // Study Mode: Instant Academic Explanation
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFFEF3C7).copy(alpha = 0.6f))
                        .border(1.dp, Color(0xFFFDE68A), RoundedCornerShape(12.dp))
                        .clickable { showExplanation = !showExplanation }
                        .padding(12.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Lightbulb,
                                    contentDescription = null,
                                    tint = Color(0xFFD97706),
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (showExplanation) "Hide Academic Explanation" else "Study Hint & Academic Explanation",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF92400E)
                                )
                            }
                            Text(
                                text = if (showExplanation) "▲" else "▼",
                                fontSize = 10.sp,
                                color = Color(0xFF92400E)
                            )
                        }

                        if (showExplanation) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = currentQuestion.explanation,
                                fontSize = 12.sp,
                                color = Color(0xFF78350F),
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }
        }

        // 3. Bottom Controls Bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Previous Button
                OutlinedButton(
                    onClick = {
                        showExplanation = false
                        viewModel.prevQuestion()
                    },
                    enabled = currentIndex > 0,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.height(46.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Previous", fontSize = 13.sp)
                }

                // Next or Submit Button
                if (isLast) {
                    Button(
                        onClick = { showSubmitDialog = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AccentYellow,
                            contentColor = Color(0xFF111827)
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .height(46.dp)
                            .testTag("test_runner_submit_button")
                    ) {
                        Text(
                            text = "Submit Test",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Button(
                        onClick = {
                            showExplanation = false
                            viewModel.nextQuestion()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = SubjectBlue,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .height(46.dp)
                            .testTag("test_runner_next_button")
                    ) {
                        Text(text = "Next", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }

    // Exit Confirmation Dialog
    if (showExitDialog) {
        AlertDialog(
            onDismissRequest = { showExitDialog = false },
            title = { Text("Quit Test?") },
            text = { Text("Are you sure you want to exit? Your answers for this session will not be saved.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showExitDialog = false
                        viewModel.exitTest()
                    }
                ) {
                    Text("Exit", color = StatusError, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showExitDialog = false }) {
                    Text("Continue Test")
                }
            }
        )
    }

    // Submit Confirmation Dialog
    if (showSubmitDialog) {
        val answeredCount = selectedAnswers.size
        val totalCount = questions.size
        val unanswered = totalCount - answeredCount

        AlertDialog(
            onDismissRequest = { showSubmitDialog = false },
            title = { Text("Submit Examination?") },
            text = {
                Text(
                    if (unanswered > 0)
                        "You have answered $answeredCount of $totalCount questions. $unanswered questions are unanswered. Do you want to submit now?"
                    else
                        "You have answered all $totalCount questions! Are you ready to see your detailed score?"
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSubmitDialog = false
                        viewModel.submitTest()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentYellow, contentColor = Color(0xFF111827))
                ) {
                    Text("Confirm Submit", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSubmitDialog = false }) {
                    Text("Review More")
                }
            }
        )
    }
}

@Composable
fun OptionSelectCard(
    letter: String,
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(if (isSelected) Color(0xFFEFF6FF) else Color.White)
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) SubjectBlue else BorderLight,
                shape = RoundedCornerShape(14.dp)
            )
            .clickable(onClick = onClick)
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(if (isSelected) SubjectBlue else Color(0xFFF1F5F9)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = letter,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) Color.White else TextPrimary
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Text(
                text = text,
                fontSize = 14.sp,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                color = TextPrimary,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
