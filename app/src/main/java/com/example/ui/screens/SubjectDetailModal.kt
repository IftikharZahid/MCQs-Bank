package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Subject
import com.example.ui.components.getSubjectIcon
import com.example.ui.theme.AccentYellow
import com.example.ui.theme.BackgroundSlate
import com.example.ui.theme.BorderLight
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

data class WeekModuleItem(
    val weekNumber: Int,
    val weekBadge: String,
    val title: String,
    val subtitle: String,
    val mcqCount: Int,
    val subjectId: String
)

@Composable
fun SubjectDetailModal(
    subject: Subject,
    onClose: () -> Unit,
    onStartTest: (Subject) -> Unit,
    onStartWeekTest: (WeekModuleItem) -> Unit = {},
    modifier: Modifier = Modifier
) {
    BackHandler {
        onClose()
    }

    val subjectColor = Color(subject.colorHex)
    val icon = getSubjectIcon(subject.iconType)

    val realModules: List<WeekModuleItem> = when {
        subject.id.contains("object-oriented") || subject.title.contains("OOP") || subject.title.contains("Object") -> listOf(
            WeekModuleItem(
                weekNumber = 1,
                weekBadge = "Week 01",
                title = "OOP Paradigm, Classes, Objects & Encapsulation",
                subtitle = "State & Behavior, Information Hiding, Abstract Classes & Constructors",
                mcqCount = 20,
                subjectId = "object-oriented-programming-week-2"
            ),
            WeekModuleItem(
                weekNumber = 2,
                weekBadge = "Week 02",
                title = "OOAD using UML, CRC Cards & Object Modeling",
                subtitle = "View Models, Class Diagrams, Noun/Verb Analysis, Collaborator Cards",
                mcqCount = 20,
                subjectId = "object-oriented-programming-week-2"
            ),
            WeekModuleItem(
                weekNumber = 3,
                weekBadge = "Week 03",
                title = "Classes, Objects, Methods & Namespaces",
                subtitle = "Parameterized/Non-Parameterized Methods, Value/Ref Parameters & Scopes",
                mcqCount = 20,
                subjectId = "object-oriented-programming-week-3"
            )
        )
        subject.id.contains("architecture") || subject.title.contains("Architecture") -> listOf(
            WeekModuleItem(
                weekNumber = 1,
                weekBadge = "Week 01",
                title = "Digital Logic & Computer Hardware Systems",
                subtitle = "Review of Digital Logic, Combinational Circuits & Computer Organization",
                mcqCount = 39,
                subjectId = "computer-architecture-and-organization-week-01"
            )
        )
        subject.id.contains("database") || subject.title.contains("Database") -> listOf(
            WeekModuleItem(
                weekNumber = 2,
                weekBadge = "Week 02",
                title = "Three-Level Schema Architecture & Data Independence",
                subtitle = "Physical, Conceptual & External Schema Levels, Mappings & Independence",
                mcqCount = 39,
                subjectId = "database-systems-week-02"
            )
        )
        subject.id.contains("automata") || subject.title.contains("Automata") -> listOf(
            WeekModuleItem(
                weekNumber = 2,
                weekBadge = "Week 02",
                title = "Regular Expressions & Recursive Language Definitions",
                subtitle = "Formal Languages, Alphabets, Recursive Language Rules & Regular Expressions",
                mcqCount = 40,
                subjectId = "theory-of-automata-week-02"
            )
        )
        else -> listOf(
            WeekModuleItem(
                weekNumber = 1,
                weekBadge = "Week 01",
                title = "Examination Practice & Course Review",
                subtitle = "Comprehensive Syllabus Review & Examination Preparation Questions",
                mcqCount = subject.totalMcqs,
                subjectId = subject.id
            )
        )
    }

    val totalQuestionsCount = realModules.sumOf { it.mcqCount }
    val totalModulesCount = realModules.size

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundSlate)
            .statusBarsPadding()
            .navigationBarsPadding()
            .testTag("subject_detail_screen")
    ) {
        // Top App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onClose) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = TextPrimary
                )
            }
            Text(
                text = subject.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }

        HorizontalDivider(thickness = 1.dp, color = BorderLight)

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Overview Card
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
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(subjectColor),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(30.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(14.dp))

                            Column {
                                Text(
                                    text = subject.title,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = subject.degreeCourse,
                                    fontSize = 13.sp,
                                    color = TextSecondary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        // Stats bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Total MCQs: $totalQuestionsCount", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                            Text(text = "Modules: $totalModulesCount", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                            Text(text = "Preparation: ${subject.progressPercent}%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = subjectColor)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        LinearProgressIndicator(
                            progress = { subject.progressPercent / 100f },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = subjectColor,
                            trackColor = Color(0xFFE2E8F0),
                            strokeCap = StrokeCap.Round
                        )
                    }
                }
            }

            // Modules Section Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Structured Course Modules",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Tap week to start",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextSecondary
                    )
                }
            }

            // List of all Weeks Tests
            itemsIndexed(realModules) { _, mod ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color.White)
                        .border(1.dp, BorderLight, RoundedCornerShape(14.dp))
                        .clickable { onStartWeekTest(mod) }
                        .padding(14.dp)
                        .testTag("week_module_item_${mod.weekNumber}")
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Week number badge
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(subjectColor.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "WK",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = subjectColor
                                )
                                Text(
                                    text = String.format("%02d", mod.weekNumber),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = subjectColor
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(Color(0xFFF1F5F9))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = mod.weekBadge,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextSecondary
                                    )
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "${mod.mcqCount} MCQs",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = subjectColor
                                )
                            }
                            Spacer(modifier = Modifier.height(3.dp))
                            Text(
                                text = mod.title,
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = mod.subtitle,
                                fontSize = 11.sp,
                                color = TextSecondary,
                                maxLines = 2
                            )
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        // Interactive Start Action Pill
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(AccentYellow)
                                .padding(horizontal = 10.dp, vertical = 7.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PlayArrow,
                                    contentDescription = null,
                                    tint = Color(0xFF111827),
                                    modifier = Modifier.size(13.dp)
                                )
                                Spacer(modifier = Modifier.width(3.dp))
                                Text(
                                    text = "Start",
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF111827)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Bottom CTA
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(16.dp)
        ) {
            Button(
                onClick = { onStartTest(subject) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentYellow,
                    contentColor = Color(0xFF111827)
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("detail_start_test_button")
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Start Practice Test",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
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
