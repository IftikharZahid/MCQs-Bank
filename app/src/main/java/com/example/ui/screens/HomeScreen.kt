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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
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
import com.example.data.model.Subject
import com.example.data.repository.SyncStatus
import com.example.ui.components.HeroCard
import com.example.ui.components.StatsGrid
import com.example.ui.components.SubjectCard
import com.example.ui.theme.BackgroundSlate
import com.example.ui.theme.BorderLight
import com.example.ui.theme.BrandNavyDark
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.viewmodel.MainTab
import com.example.ui.viewmodel.McqViewModel

@Composable
fun HomeScreen(
    viewModel: McqViewModel,
    modifier: Modifier = Modifier
) {
    val allSubjects by viewModel.allSubjects.collectAsStateWithLifecycle()
    val topSubjects = remember(allSubjects) { allSubjects.take(4) }
    val syncStatus by viewModel.syncStatus.collectAsStateWithLifecycle()
    val isSyncing by viewModel.isSyncing.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundSlate)
            .testTag("home_screen_list"),
        contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = 8.dp, bottom = 10.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // 1. Dark Navy Hero Banner (Compact Summary Banner)
        item {
            HeroCard(
                onStartPracticeTest = { viewModel.startConfiguredTest() },
                onExploreSubjects = { viewModel.selectTab(MainTab.SUBJECTS) }
            )
        }

        // 2. Today Tests Counter Card
        // [REMOVED]

        // 3. 4-Metrics Quick Stats Bar (Compact Summary Strip)
        item {
            StatsGrid()
        }

        // 4. Live MongoDB Synchronization Strip
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(
                        when (syncStatus) {
                            is SyncStatus.Syncing -> Color(0xFFEFF6FF)
                            is SyncStatus.Success -> Color(0xFFECFDF5)
                            is SyncStatus.Error -> Color(0xFFFFFBEB)
                            else -> Color.White
                        }
                    )
                    .border(
                        1.dp,
                        when (syncStatus) {
                            is SyncStatus.Syncing -> Color(0xFFBFDBFE)
                            is SyncStatus.Success -> Color(0xFFA7F3D0)
                            is SyncStatus.Error -> Color(0xFFFDE68A)
                            else -> BorderLight
                        },
                        RoundedCornerShape(10.dp)
                    )
                    .clickable { viewModel.syncWithBackend() }
                    .padding(horizontal = 12.dp, vertical = 7.dp)
                    .testTag("backend_sync_status_strip")
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = when (syncStatus) {
                                is SyncStatus.Syncing -> Icons.Default.Sync
                                is SyncStatus.Success -> Icons.Default.CloudDone
                                is SyncStatus.Error -> Icons.Default.CloudOff
                                else -> Icons.Default.Sync
                            },
                            contentDescription = null,
                            tint = when (syncStatus) {
                                is SyncStatus.Syncing -> Color(0xFF2563EB)
                                is SyncStatus.Success -> Color(0xFF059669)
                                is SyncStatus.Error -> Color(0xFFD97706)
                                else -> Color(0xFF64748B)
                            },
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = when (val s = syncStatus) {
                                is SyncStatus.Syncing -> "Syncing live with MongoDB Atlas..."
                                is SyncStatus.Success -> s.message
                                is SyncStatus.Error -> s.message
                                else -> "MongoDB Atlas: Tap to check for new questions"
                            },
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Medium,
                            color = when (syncStatus) {
                                is SyncStatus.Syncing -> Color(0xFF1D4ED8)
                                is SyncStatus.Success -> Color(0xFF065F46)
                                is SyncStatus.Error -> Color(0xFF92400E)
                                else -> Color(0xFF475569)
                            },
                            maxLines = 1
                        )
                    }
                    Text(
                        text = if (isSyncing) "Syncing..." else "Refresh",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2563EB)
                    )
                }
            }
        }

        // 3. Section Header: Explore Question Banks
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0xFFFEF3C7)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.MenuBook,
                                contentDescription = null,
                                tint = Color(0xFFD97706),
                                modifier = Modifier.size(14.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(6.dp))

                        Text(
                            text = "Explore Question Banks",
                            fontSize = 14.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }

                    // View All button
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .border(1.dp, SubjectBlue.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                            .clickable { viewModel.selectTab(MainTab.SUBJECTS) }
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                            .testTag("home_view_all_subjects_chip")
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "View All",
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = SubjectBlue
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                tint = SubjectBlue,
                                modifier = Modifier.size(11.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = "Select a subject to begin your academic practice.",
                    fontSize = 11.5.sp,
                    color = TextSecondary
                )
            }
        }

        // 4. List of Top 4 Subjects (Virtualized with stable key)
        items(topSubjects, key = { it.id }) { subject ->
            SubjectCard(
                subject = subject,
                onClick = { viewModel.showSubjectDetail(subject) }
            )
        }

        // 5. Outlined Action: View All Subjects
        item {
            OutlinedButton(
                onClick = { viewModel.selectTab(MainTab.SUBJECTS) },
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = SubjectBlue
                ),
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = androidx.compose.ui.graphics.SolidColor(Color(0xFFCBD5E1))
                ),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(38.dp)
                    .testTag("home_view_all_subjects_button")
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.GridView,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "View All Subjects",
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }

        // Bottom space
        item {
            Spacer(modifier = Modifier.height(6.dp))
        }
    }
}
