package com.example.ui.components

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.DailyStreakInfo
import com.example.data.model.DayStreakItem
import com.example.data.model.DayStreakStatus
import com.example.ui.theme.BorderLight
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun DailyStreakCard(
    streakInfo: DailyStreakInfo,
    onPracticeClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isTodayAchieved = streakInfo.todaySolved >= streakInfo.dailyGoalTarget

    // Flame flicker animation
    val infiniteTransition = rememberInfiniteTransition(label = "flame_flicker")
    val flameScale by infiniteTransition.animateFloat(
        initialValue = 0.94f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 700),
            repeatMode = RepeatMode.Reverse
        ),
        label = "flame_scale"
    )
    val flameGlowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0.85f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 700),
            repeatMode = RepeatMode.Reverse
        ),
        label = "flame_glow"
    )

    val progressFraction = (streakInfo.todaySolved.toFloat() / streakInfo.dailyGoalTarget).coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(
        targetValue = progressFraction,
        animationSpec = tween(durationMillis = 800),
        label = "daily_progress"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
            .padding(16.dp)
            .testTag("daily_streak_card")
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // 1. Header with Animated Flame Emblem & Streak Count
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Flame icon container with fiery gradient
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(
                                        Color(0xFFFFF7ED),
                                        Color(0xFFFFEDD5)
                                    )
                                )
                            )
                            .border(
                                1.2.dp,
                                Color(0xFFFDBA74).copy(alpha = flameGlowAlpha),
                                RoundedCornerShape(14.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalFireDepartment,
                            contentDescription = "Daily streak flame",
                            tint = Color(0xFFEA580C),
                            modifier = Modifier
                                .size(28.dp)
                                .scale(flameScale)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "${streakInfo.currentStreak} Days",
                                fontSize = 19.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFFEA580C)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Streak Active",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                        Text(
                            text = if (isTodayAchieved) {
                                "🔥 Today's practice secured! Keep the momentum."
                            } else {
                                "Solve ${streakInfo.dailyGoalTarget - streakInfo.todaySolved} more MCQs to extend streak."
                            },
                            fontSize = 12.sp,
                            color = if (isTodayAchieved) StatusSuccess else TextSecondary,
                            fontWeight = if (isTodayAchieved) FontWeight.SemiBold else FontWeight.Normal
                        )
                    }
                }

                // Best Streak Trophy Pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFFEF3C7))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.EmojiEvents,
                            contentDescription = null,
                            tint = Color(0xFFD97706),
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Best: ${streakInfo.bestStreak}d",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFB45309)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. 7-Day Weekday Tracker Beads
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                streakInfo.days.forEach { day ->
                    DayStreakBead(item = day)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3. Daily Goal Progress Bar
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Daily Target: ${streakInfo.dailyGoalTarget} MCQs",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                    Text(
                        text = "${streakInfo.todaySolved} / ${streakInfo.dailyGoalTarget} Solved (${(progressFraction * 100).toInt()}%)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isTodayAchieved) StatusSuccess else Color(0xFFEA580C)
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                LinearProgressIndicator(
                    progress = { animatedProgress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = if (isTodayAchieved) StatusSuccess else Color(0xFFEA580C),
                    trackColor = Color(0xFFF1F5F9),
                    strokeCap = StrokeCap.Round
                )
            }

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(thickness = 0.8.dp, color = BorderLight)
            Spacer(modifier = Modifier.height(10.dp))

            // 4. Bottom Footer: Protection Shield & Action Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Security,
                        contentDescription = "Streak freeze shield",
                        tint = SubjectBlue,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${streakInfo.streakFreezeCount} Streak Freeze Active",
                        fontSize = 11.5.sp,
                        color = TextSecondary,
                        fontWeight = FontWeight.Medium
                    )
                }

                Button(
                    onClick = onPracticeClick,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isTodayAchieved) Color(0xFFF1F5F9) else Color(0xFFEA580C),
                        contentColor = if (isTodayAchieved) TextPrimary else Color.White
                    ),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier
                        .height(34.dp)
                        .testTag("practice_streak_button")
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (isTodayAchieved) Icons.Default.Check else Icons.Default.PlayArrow,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (isTodayAchieved) "Completed Today" else "Practice Today",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DayStreakBead(item: DayStreakItem) {
    val isCompleted = item.status == DayStreakStatus.COMPLETED || item.status == DayStreakStatus.TODAY_COMPLETED
    val isToday = item.status == DayStreakStatus.TODAY_COMPLETED || item.status == DayStreakStatus.TODAY_PENDING

    val circleBg = when {
        isCompleted -> Color(0xFFEA580C)
        item.status == DayStreakStatus.TODAY_PENDING -> Color(0xFFFFF7ED)
        else -> Color(0xFFF8FAFC)
    }

    val circleBorder = when {
        isCompleted -> Color(0xFFEA580C)
        isToday -> Color(0xFFF97316)
        else -> Color(0xFFE2E8F0)
    }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(
            text = item.dayLabel,
            fontSize = 10.5.sp,
            fontWeight = if (isToday) FontWeight.Bold else FontWeight.Medium,
            color = if (isToday) Color(0xFFEA580C) else TextSecondary
        )

        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(circleBg)
                .border(
                    width = if (isToday) 1.5.dp else 1.dp,
                    color = circleBorder,
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isCompleted) {
                Icon(
                    imageVector = Icons.Default.LocalFireDepartment,
                    contentDescription = "Completed",
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            } else if (item.status == DayStreakStatus.TODAY_PENDING) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEA580C))
                )
            } else {
                Text(
                    text = item.dayNumber,
                    fontSize = 11.sp,
                    color = TextMuted,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Text(
            text = if (isCompleted) "✓" else if (isToday) "Today" else item.dayNumber,
            fontSize = 9.sp,
            fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal,
            color = if (isCompleted) Color(0xFFEA580C) else if (isToday) Color(0xFFEA580C) else TextMuted
        )
    }
}
