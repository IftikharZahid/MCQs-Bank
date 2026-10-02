package com.example.ui.components.charts

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AccentYellow
import com.example.ui.theme.BorderLight
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

data class DayActivity(
    val day: String,
    val solvedCount: Int,
    val target: Int = 20,
    val isToday: Boolean = false
)

@Composable
fun WeeklyActivityChart(
    modifier: Modifier = Modifier
) {
    val weekData = listOf(
        DayActivity("Mon", 24),
        DayActivity("Tue", 35),
        DayActivity("Wed", 18),
        DayActivity("Thu", 42),
        DayActivity("Fri", 30, isToday = true),
        DayActivity("Sat", 15),
        DayActivity("Sun", 28)
    )

    val maxVal = 50f

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
            .padding(18.dp)
            .testTag("weekly_activity_chart_card")
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFFFEF3C7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CalendarMonth,
                            contentDescription = null,
                            tint = Color(0xFFD97706),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column {
                        Text(
                            text = "Weekly Study Velocity",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Daily Target: 20 MCQs",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFDCFCE7))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "192 Solved",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF15803D)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Bar Chart Columns
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.Bottom
            ) {
                weekData.forEach { item ->
                    val barHeightFraction = (item.solvedCount / maxVal).coerceIn(0.1f, 1f)
                    val isGoalMet = item.solvedCount >= item.target

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = "${item.solvedCount}",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (item.isToday) SubjectBlue else TextSecondary
                        )
                        Spacer(modifier = Modifier.height(4.dp))

                        Box(
                            modifier = Modifier
                                .width(22.dp)
                                .fillMaxHeight(barHeightFraction)
                                .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
                                .background(
                                    when {
                                        item.isToday -> SubjectBlue
                                        isGoalMet -> Color(0xFF10B981)
                                        else -> Color(0xFFCBD5E1)
                                    }
                                )
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = item.day,
                            fontSize = 11.sp,
                            fontWeight = if (item.isToday) FontWeight.Bold else FontWeight.Medium,
                            color = if (item.isToday) SubjectBlue else TextMuted
                        )
                    }
                }
            }
        }
    }
}
