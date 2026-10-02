package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Replay
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.theme.AccentYellow
import com.example.ui.theme.BackgroundSlate
import com.example.ui.theme.BorderLight
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.viewmodel.McqViewModel
import com.example.ui.viewmodel.QuestionReview
import com.example.util.ResultExportHelper

@Composable
fun TestResultScreen(
    viewModel: McqViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val resultSummary by viewModel.testResult.collectAsStateWithLifecycle()

    BackHandler {
        viewModel.exitTest()
    }

    if (resultSummary == null) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text("No test results found.")
        }
        return
    }

    val summary = resultSummary!!
    val durationMins = summary.durationSeconds / 60
    val durationSecs = summary.durationSeconds % 60
    val formattedDuration = "${durationMins}m ${durationSecs}s"

    val grade = when {
        summary.scorePercentage >= 90 -> "Distinction - Grade A+"
        summary.scorePercentage >= 80 -> "Excellent - Grade A"
        summary.scorePercentage >= 70 -> "Good - Grade B"
        summary.scorePercentage >= 60 -> "Satisfactory - Grade C"
        else -> "Needs Revision - Grade F"
    }

    val scoreColor = when {
        summary.scorePercentage >= 75 -> StatusSuccess
        summary.scorePercentage >= 60 -> AccentYellow
        else -> StatusError
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundSlate)
            .statusBarsPadding()
            .navigationBarsPadding()
            .testTag("test_result_screen")
    ) {
        // FIXED TOP BAR (Stays pinned on top even when the screen is scrolled)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .border(1.dp, BorderLight)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Top Left Back Button - Professionally styled, fixed on top left
            IconButton(
                onClick = { viewModel.exitTest() },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF1F5F9))
                    .border(1.dp, BorderLight, CircleShape)
                    .testTag("result_fixed_back_button")
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back to Syllabus",
                    tint = TextPrimary,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Center Title & Subject
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "Examination Result",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = summary.subjectTitle,
                    fontSize = 11.5.sp,
                    color = TextSecondary,
                    maxLines = 1
                )
            }

            // Top Right Action 1: Save Result as PNG in Gallery
            IconButton(
                onClick = {
                    val bitmap = ResultExportHelper.generateProfessionalResultBitmap(context, summary)
                    ResultExportHelper.saveResultToGallery(context, bitmap, summary.subjectTitle)
                },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFF1F5F9))
                    .border(1.dp, BorderLight, CircleShape)
                    .testTag("result_save_png_icon_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Download,
                    contentDescription = "Save Result PNG",
                    tint = TextPrimary,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Top Right Action 2: Fixed Print Button (Printer icon)
            IconButton(
                onClick = {
                    val bitmap = ResultExportHelper.generateProfessionalResultBitmap(context, summary)
                    ResultExportHelper.printResultReport(context, bitmap, summary.subjectTitle)
                },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(SubjectBlue.copy(alpha = 0.12f))
                    .border(1.dp, SubjectBlue.copy(alpha = 0.3f), CircleShape)
                    .testTag("result_fixed_print_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Print,
                    contentDescription = "Print Result",
                    tint = SubjectBlue,
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        // Scrollable Academic Review Content
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Result Header Card
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White)
                        .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
                        .padding(20.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(CircleShape)
                                .background(scoreColor.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.EmojiEvents,
                                contentDescription = null,
                                tint = scoreColor,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "Examination Completed!",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )

                        Text(
                            text = "${summary.subjectTitle}  •  ${summary.topic}",
                            fontSize = 13.sp,
                            color = TextSecondary,
                            modifier = Modifier.padding(top = 2.dp)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Score Big Badge
                        Text(
                            text = "${summary.scorePercentage}%",
                            fontSize = 42.sp,
                            fontWeight = FontWeight.Black,
                            color = scoreColor
                        )

                        Text(
                            text = grade,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = scoreColor
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        // Quick Breakdown Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            ScoreMiniStat(label = "Correct", count = "${summary.correctCount}", color = StatusSuccess)
                            ScoreMiniStat(label = "Wrong", count = "${summary.wrongCount}", color = StatusError)
                            ScoreMiniStat(label = "Skipped", count = "${summary.skippedCount}", color = Color(0xFF64748B))
                            ScoreMiniStat(label = "Time", count = formattedDuration, color = SubjectBlue)
                        }
                    }
                }
            }

            // Action Buttons Row (Retake, Save PNG, Done)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { viewModel.startConfiguredTest() },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(46.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Replay, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Retake", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            val bitmap = ResultExportHelper.generateProfessionalResultBitmap(context, summary)
                            ResultExportHelper.saveResultToGallery(context, bitmap, summary.subjectTitle)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF059669),
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1.3f)
                            .height(46.dp)
                            .testTag("result_save_png_button")
                    ) {
                        Icon(imageVector = Icons.Default.Download, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Save PNG", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { viewModel.exitTest() },
                        colors = ButtonDefaults.buttonColors(containerColor = SubjectBlue, contentColor = Color.White),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(46.dp)
                            .testTag("result_done_button")
                    ) {
                        Text("Done", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // 2. Question Review Section Header
            item {
                Text(
                    text = "Detailed Academic Review",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            // 3. Question Reviews List
            itemsIndexed(summary.reviews) { idx, review ->
                QuestionReviewCard(index = idx + 1, review = review)
            }

            item {
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}

@Composable
fun ScoreMiniStat(label: String, count: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = count, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = color)
        Text(text = label, fontSize = 11.sp, color = TextSecondary)
    }
}

@Composable
fun QuestionReviewCard(index: Int, review: QuestionReview) {
    val q = review.question
    val isCorrect = review.isCorrect
    val userSelected = review.selectedOption

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(
                1.dp,
                if (userSelected == null) BorderLight else if (isCorrect) Color(0xFFBBF7D0) else Color(0xFFFECACA),
                RoundedCornerShape(16.dp)
            )
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Question $index",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary
                )

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(
                            when {
                                userSelected == null -> Color(0xFFF1F5F9)
                                isCorrect -> Color(0xFFDCFCE7)
                                else -> Color(0xFFFEE2E2)
                            }
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = when {
                            userSelected == null -> "Skipped"
                            isCorrect -> "Correct"
                            else -> "Incorrect"
                        },
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = when {
                            userSelected == null -> Color(0xFF64748B)
                            isCorrect -> StatusSuccess
                            else -> StatusError
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = q.questionText,
                fontSize = 14.5.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            val optionLabels = listOf("A", "B", "C", "D")

            q.options.forEachIndexed { optIndex, text ->
                val label = optionLabels.getOrElse(optIndex) { "${optIndex + 1}" }
                val isSelectedByUser = userSelected == optIndex
                val isActuallyCorrect = q.correctOption == optIndex

                val (bgColor, borderColor, textColor) = when {
                    isActuallyCorrect -> Triple(Color(0xFFF0FDF4), StatusSuccess, Color(0xFF166534))
                    isSelectedByUser && !isCorrect -> Triple(Color(0xFFFEF2F2), StatusError, Color(0xFF991B1B))
                    else -> Triple(Color.Transparent, Color.Transparent, TextPrimary)
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(bgColor)
                        .border(
                            1.dp,
                            if (borderColor != Color.Transparent) borderColor else Color.Transparent,
                            RoundedCornerShape(10.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "$label.",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (borderColor != Color.Transparent) borderColor else TextSecondary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = text,
                            fontSize = 13.sp,
                            color = textColor,
                            modifier = Modifier.weight(1f)
                        )
                        if (isActuallyCorrect) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Correct Answer",
                                tint = StatusSuccess,
                                modifier = Modifier.size(16.dp)
                            )
                        } else if (isSelectedByUser && !isCorrect) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Your Choice",
                                tint = StatusError,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }

            // Academic Concept & Explanation Section
            if (q.explanation.isNotBlank()) {
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = Color(0xFFF1F5F9))
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Academic Concept & Explanation:",
                    fontSize = 11.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF059669)
                )
                Text(
                    text = q.explanation,
                    fontSize = 12.sp,
                    color = Color(0xFF334155),
                    lineHeight = 17.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
    }
}
