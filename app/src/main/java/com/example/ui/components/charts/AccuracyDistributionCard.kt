package com.example.ui.components.charts

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.BorderLight
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun AccuracyDistributionCard(
    accuracyPercentage: Int,
    totalSolved: Int,
    subjectTitle: String? = null,
    modifier: Modifier = Modifier
) {
    // Breakdown calculations
    val correctCount = (totalSolved * (accuracyPercentage / 100f)).toInt()
    val incorrectCount = totalSolved - correctCount
    val targetGoal = 75

    val animatedAccuracy by animateFloatAsState(
        targetValue = accuracyPercentage.toFloat(),
        animationSpec = tween(durationMillis = 900),
        label = "radial_accuracy"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
            .padding(18.dp)
            .testTag("accuracy_distribution_card")
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Header
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
                            .background(Color(0xFFF3E8FF)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.PieChart,
                            contentDescription = null,
                            tint = Color(0xFF7C3AED),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = if (subjectTitle != null) "$subjectTitle Mastery" else "Accuracy & Readiness Distribution",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Recharts-style multi-metric distribution",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                }

                // Readiness Badge
                val isTargetAchieved = accuracyPercentage >= targetGoal
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isTargetAchieved) Color(0xFFDCFCE7) else Color(0xFFFEF3C7))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (isTargetAchieved) "Target Reached" else "Passing Goal: $targetGoal%",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isTargetAchieved) StatusSuccess else Color(0xFFB45309)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Donut Chart & Detailed Metrics Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                // Radial Donut Chart
                Box(
                    modifier = Modifier.size(120.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(modifier = Modifier.size(120.dp)) {
                        val strokeWidth = 12.dp.toPx()
                        val diameter = size.minDimension - strokeWidth
                        val arcSize = Size(diameter, diameter)
                        val topLeft = Offset(strokeWidth / 2, strokeWidth / 2)

                        // 1. Background Track Arc (Empty / Remaining)
                        drawArc(
                            color = Color(0xFFF1F5F9),
                            startAngle = 0f,
                            sweepAngle = 360f,
                            useCenter = false,
                            topLeft = topLeft,
                            size = arcSize,
                            style = Stroke(width = strokeWidth)
                        )

                        // 2. Incorrect Answers Arc
                        val incorrectSweep = (360f * (100f - animatedAccuracy) / 100f)
                        drawArc(
                            color = Color(0xFFFECACA),
                            startAngle = -90f + (360f * animatedAccuracy / 100f),
                            sweepAngle = incorrectSweep,
                            useCenter = false,
                            topLeft = topLeft,
                            size = arcSize,
                            style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                        )

                        // 3. Correct Accuracy Arc
                        val correctSweep = (360f * animatedAccuracy / 100f)
                        drawArc(
                            color = if (accuracyPercentage >= 75) StatusSuccess else SubjectBlue,
                            startAngle = -90f,
                            sweepAngle = correctSweep,
                            useCenter = false,
                            topLeft = topLeft,
                            size = arcSize,
                            style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                        )
                    }

                    // Inside Donut Text
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "$accuracyPercentage%",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = TextPrimary
                        )
                        Text(
                            text = "Accuracy",
                            fontSize = 10.sp,
                            color = TextSecondary,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                // Legend & Stat Items
                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.padding(start = 12.dp)
                ) {
                    DistributionLegendRow(
                        color = if (accuracyPercentage >= 75) StatusSuccess else SubjectBlue,
                        label = "Correct Solved",
                        value = "$correctCount MCQs",
                        percent = "$accuracyPercentage%"
                    )
                    DistributionLegendRow(
                        color = Color(0xFFEF4444),
                        label = "Incorrect",
                        value = "$incorrectCount MCQs",
                        percent = "${100 - accuracyPercentage}%"
                    )
                    DistributionLegendRow(
                        color = Color(0xFF64748B),
                        label = "Avg Solving Speed",
                        value = "38s / Question",
                        percent = "Optimal"
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            HorizontalDivider(thickness = 0.8.dp, color = BorderLight)
            Spacer(modifier = Modifier.height(12.dp))

            // Bottom Performance Insight Note
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.TrendingUp,
                    contentDescription = null,
                    tint = StatusSuccess,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (accuracyPercentage >= 75) {
                        "Excellent retention rate. Maintaining >75% puts you in the top 10% percentile."
                    } else {
                        "Focus on reviewing flagged explanations to reach the 75% target benchmark."
                    },
                    fontSize = 11.5.sp,
                    color = Color(0xFF334155),
                    lineHeight = 16.sp
                )
            }
        }
    }
}

@Composable
private fun DistributionLegendRow(
    color: Color,
    label: String,
    value: String,
    percent: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(color)
        )
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = label,
                    fontSize = 11.sp,
                    color = TextSecondary,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = percent,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }
            Text(
                text = value,
                fontSize = 10.sp,
                color = TextMuted
            )
        }
    }
}
