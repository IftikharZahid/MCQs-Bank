package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AssignmentTurnedIn
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.OutlinedFlag
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.WarningAmber
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
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

    val questionListState = rememberLazyListState()

    // Auto-scroll the horizontal 1 2 3 4 list so current active question is kept in view
    LaunchedEffect(currentIndex) {
        val targetIndex = (currentIndex - 2).coerceAtLeast(0)
        questionListState.animateScrollToItem(targetIndex)
    }

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
            .navigationBarsPadding()
            .testTag("test_runner_screen")
    ) {
        // 1. Top App Bar for Exam with Pure White Status Bar Background
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .statusBarsPadding()
                .padding(horizontal = 10.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Close / Exit button
            IconButton(
                onClick = { showExitDialog = true },
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF8FAFC))
                    .testTag("test_runner_close_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Exit test",
                    tint = TextPrimary,
                    modifier = Modifier.size(18.dp)
                )
            }

            // Subject / Book Short Name Header (Clean and bold, without clutter)
            Text(
                text = currentQuestion.subjectTitle,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 10.dp)
            )

            // Professional Red Dark Animated Timer Component
            ExamCountdownTimer(
                formattedTime = formattedTime,
                isTimeLow = isTimeLow
            )

            Spacer(modifier = Modifier.width(6.dp))

            // Bookmark Button
            IconButton(
                onClick = { viewModel.toggleBookmark(currentQuestion) },
                modifier = Modifier
                    .size(38.dp)
                    .testTag("test_runner_bookmark_button")
            ) {
                Icon(
                    imageVector = if (currentQuestion.isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                    contentDescription = "Bookmark",
                    tint = if (currentQuestion.isBookmarked) AccentYellow else Color(0xFF64748B),
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        // Progress Line
        LinearProgressIndicator(
            progress = { (currentIndex + 1).toFloat() / questions.size },
            modifier = Modifier
                .fillMaxWidth()
                .height(3.dp),
            color = SubjectBlue,
            trackColor = Color(0xFFE2E8F0),
            strokeCap = StrokeCap.Square
        )

        // Question Navigator Quick Pill Bar (1, 2, 3, 4...) with Auto-Scroll
        LazyRow(
            state = questionListState,
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 14.dp, vertical = 9.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            itemsIndexed(questions, key = { _, q -> q.id }) { idx, q ->
                val isAnswered = selectedAnswers.containsKey(q.id)
                val isQFlagged = flaggedQuestions.contains(q.id)
                val isCurrent = idx == currentIndex

                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(
                            when {
                                isCurrent -> SubjectBlue
                                isAnswered -> Color(0xFF10B981) // Green for answered/completed
                                isQFlagged -> AccentYellow
                                else -> Color(0xFFF1F5F9)
                            }
                        )
                        .border(
                            width = if (isCurrent) 2.dp else 1.dp,
                            color = when {
                                isCurrent -> Color(0xFF1D4ED8)
                                isAnswered -> Color(0xFF059669)
                                else -> Color(0xFFE2E8F0)
                            },
                            shape = CircleShape
                        )
                        .clickable {
                            viewModel.jumpToQuestion(idx)
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${idx + 1}",
                        fontSize = 12.5.sp,
                        fontWeight = if (isCurrent) FontWeight.Black else FontWeight.Bold,
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
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Clean Question Meta Bar (No cluttered long topic paragraph)
            // Unified Academic Question Card
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color.White)
                        .border(1.2.dp, BorderLight, RoundedCornerShape(18.dp))
                        .padding(18.dp)
                        .testTag("test_runner_question_card")
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        // Card Top Header: Question Pill, Week badge & Flag button
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(SubjectBlue.copy(alpha = 0.1f))
                                        .padding(horizontal = 10.dp, vertical = 5.dp)
                                ) {
                                    Text(
                                        text = "QUESTION ${currentIndex + 1} OF ${questions.size}",
                                        fontSize = 11.5.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = SubjectBlue,
                                        letterSpacing = 0.5.sp
                                    )
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFFF1F5F9))
                                        .padding(horizontal = 8.dp, vertical = 5.dp)
                                ) {
                                    Text(
                                        text = "Week ${String.format("%02d", currentQuestion.weekNumber)}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextSecondary
                                    )
                                }
                            }

                            // Flag Button
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isFlagged) Color(0xFFFEF3C7) else Color(0xFFF8FAFC))
                                    .border(
                                        1.dp,
                                        if (isFlagged) Color(0xFFFCD34D) else BorderLight,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable { viewModel.toggleFlagQuestion(currentQuestion.id) }
                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = if (isFlagged) Icons.Default.Flag else Icons.Default.OutlinedFlag,
                                    contentDescription = null,
                                    tint = if (isFlagged) Color(0xFFD97706) else TextMuted,
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (isFlagged) "Flagged" else "Flag",
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (isFlagged) Color(0xFFD97706) else TextMuted
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        HorizontalDivider(thickness = 0.8.dp, color = Color(0xFFF1F5F9))
                        Spacer(modifier = Modifier.height(14.dp))

                        // Question Statement with Left Decorative Indicator Bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(4.dp)
                                    .height(26.dp)
                                    .clip(RoundedCornerShape(2.dp))
                                    .background(SubjectBlue)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = currentQuestion.questionText,
                                fontSize = 16.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF0F172A),
                                lineHeight = 25.sp,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            // Options A, B, C, D
            itemsIndexed(currentQuestion.options, key = { optIndex, _ -> optIndex }) { optIndex, optionText ->
                val isSelected = selectedOption == optIndex
                val optLetter = ('A'.code + optIndex).toChar().toString()

                OptionSelectCard(
                    letter = optLetter,
                    text = optionText,
                    isSelected = isSelected,
                    onClick = { viewModel.selectOption(currentQuestion.id, optIndex) }
                )
            }

            // Study Mode: Hint & Explanation is displayed ONLY when Flagged button is pressed
            if (isFlagged && currentQuestion.explanation.isNotBlank()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFFEF3C7).copy(alpha = 0.75f))
                            .border(1.dp, Color(0xFFFCD34D), RoundedCornerShape(12.dp))
                            .padding(14.dp)
                            .testTag("test_runner_hint_card")
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Lightbulb,
                                    contentDescription = null,
                                    tint = Color(0xFFD97706),
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Study Hint & Academic Explanation",
                                    fontSize = 12.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF92400E)
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))
                            HorizontalDivider(color = Color(0xFFFDE68A))
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = currentQuestion.explanation,
                                fontSize = 12.5.sp,
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
                .border(1.dp, BorderLight)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Previous Button
                OutlinedButton(
                    onClick = {
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
                    Text(text = "Previous", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
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
            containerColor = Color.White,
            shape = RoundedCornerShape(22.dp),
            icon = {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFFEE2E2)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.WarningAmber,
                        contentDescription = null,
                        tint = StatusError,
                        modifier = Modifier.size(24.dp)
                    )
                }
            },
            title = {
                Text(
                    text = "Quit Test?",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            text = {
                Text(
                    text = "Are you sure you want to exit? Your answers for this session will not be saved.",
                    fontSize = 13.5.sp,
                    color = Color(0xFF475569),
                    lineHeight = 20.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showExitDialog = false
                        viewModel.exitTest()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = StatusError,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Exit", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showExitDialog = false },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color(0xFF0F172A)
                    ),
                    border = BorderStroke(1.dp, Color(0xFFCBD5E1))
                ) {
                    Text("Continue Test", fontWeight = FontWeight.SemiBold)
                }
            }
        )
    }

    // Submit Confirmation Dialog
    if (showSubmitDialog) {
        val answeredCount = selectedAnswers.size
        val totalCount = questions.size
        val unansweredCount = totalCount - answeredCount

        AlertDialog(
            onDismissRequest = { showSubmitDialog = false },
            containerColor = Color.White,
            shape = RoundedCornerShape(22.dp),
            icon = {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEFF6FF)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AssignmentTurnedIn,
                        contentDescription = null,
                        tint = SubjectBlue,
                        modifier = Modifier.size(24.dp)
                    )
                }
            },
            title = {
                Text(
                    text = "Submit Examination?",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "You have answered $answeredCount of $totalCount questions.",
                        fontSize = 13.5.sp,
                        color = Color(0xFF475569),
                        textAlign = TextAlign.Center
                    )
                    if (unansweredCount > 0) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFFEF2F2))
                                .border(1.dp, Color(0xFFFECACA), RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "⚠️ $unansweredCount question(s) remain unanswered.",
                                color = StatusError,
                                fontSize = 12.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSubmitDialog = false
                        viewModel.submitTest()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = SubjectBlue,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Confirm & Submit", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showSubmitDialog = false },
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color(0xFF0F172A)
                    ),
                    border = BorderStroke(1.dp, Color(0xFFCBD5E1))
                ) {
                    Text("Review More", fontWeight = FontWeight.SemiBold)
                }
            }
        )
    }
}

@Composable
fun ExamCountdownTimer(
    formattedTime: String,
    isTimeLow: Boolean,
    modifier: Modifier = Modifier
) {
    // Subtle animated pulse for the clock icon
    val infiniteTransition = rememberInfiniteTransition(label = "timer_pulse")
    val clockAlpha by infiniteTransition.animateFloat(
        initialValue = if (isTimeLow) 0.5f else 0.85f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (isTimeLow) 400 else 1000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "clock_alpha"
    )
    val clockScale by infiniteTransition.animateFloat(
        initialValue = if (isTimeLow) 0.9f else 0.96f,
        targetValue = 1.04f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (isTimeLow) 400 else 1000),
            repeatMode = RepeatMode.Reverse
        ),
        label = "clock_scale"
    )

    // Professional App Primary Blue Theme styling (with urgent crimson if time < 2m)
    val containerColor = if (isTimeLow) Color(0xFFDC2626) else SubjectBlue
    val borderColor = if (isTimeLow) Color(0xFFB91C1C) else Color(0xFF1D4ED8)

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(containerColor)
            .border(1.dp, borderColor, RoundedCornerShape(10.dp))
            .padding(horizontal = 10.dp, vertical = 6.dp)
            .testTag("exam_timer_badge")
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            // Professional Clock Icon with subtle pulse
            Icon(
                imageVector = Icons.Default.Timer,
                contentDescription = "Remaining exam time",
                tint = Color.White.copy(alpha = clockAlpha),
                modifier = Modifier
                    .size(15.dp)
                    .scale(clockScale)
            )

            Spacer(modifier = Modifier.width(6.dp))

            // Crisp Monospaced Countdown Numbers
            Text(
                text = formattedTime,
                fontSize = 13.5.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = 0.5.sp
            )
        }
    }
}

@Composable
fun OptionSelectCard(
    letter: String,
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val borderColor = if (isSelected) SubjectBlue else Color(0xFFE2E8F0)
    val bgColor = if (isSelected) Color(0xFFF0F7FF) else Color.White

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(bgColor)
            .border(
                width = if (isSelected) 2.dp else 1.2.dp,
                color = borderColor,
                shape = RoundedCornerShape(14.dp)
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 14.dp)
            .testTag("option_card_$letter")
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Letter Circle Indicator (A, B, C, D)
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(if (isSelected) SubjectBlue else Color(0xFFF1F5F9))
                    .border(
                        width = 1.dp,
                        color = if (isSelected) SubjectBlue else Color(0xFFE2E8F0),
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = letter,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) Color.White else Color(0xFF334155)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            // Option Statement Text
            Text(
                text = text,
                fontSize = 14.5.sp,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium,
                color = if (isSelected) Color(0xFF0F172A) else Color(0xFF1E293B),
                lineHeight = 22.sp,
                modifier = Modifier.weight(1f)
            )

            Spacer(modifier = Modifier.width(10.dp))

            // Radio / Checkmark Selection Indicator
            if (isSelected) {
                Box(
                    modifier = Modifier
                        .size(22.dp)
                        .clip(CircleShape)
                        .background(SubjectBlue),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Selected",
                        tint = Color.White,
                        modifier = Modifier.size(14.dp)
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .size(20.dp)
                        .clip(CircleShape)
                        .border(1.5.dp, Color(0xFFCBD5E1), CircleShape)
                )
            }
        }
    }
}
