package com.example.ui.components.charts

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.TestAttempt
import com.example.ui.theme.BorderLight
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class ChartPoint(
    val index: Int,
    val score: Int,
    val label: String,
    val fullDate: String,
    val subjectTitle: String,
    val totalQuestions: Int,
    val correctCount: Int
)

@Composable
fun AccuracyOverTimeChart(
    attempts: List<TestAttempt>,
    modifier: Modifier = Modifier
) {
    var selectedFilter by remember { mutableStateOf("All") }
    var selectedPoint by remember { mutableStateOf<ChartPoint?>(null) }

    val dateFormat = remember { SimpleDateFormat("dd MMM", Locale.getDefault()) }
    val fullDateFormat = remember { SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault()) }

    // Sort chronologically (oldest to newest for trend)
    val chronologicalAttempts = remember(attempts, selectedFilter) {
        val sorted = attempts.sortedBy { it.timestamp }
        when (selectedFilter) {
            "7D" -> sorted.takeLast(7)
            "30D" -> sorted.takeLast(15)
            else -> sorted
        }
    }

    val chartPoints = remember(chronologicalAttempts) {
        if (chronologicalAttempts.isEmpty()) {
            listOf(
                ChartPoint(0, 65, "Test 1", "01 Sep", "Programming", 20, 13),
                ChartPoint(1, 70, "Test 2", "05 Sep", "Automata", 25, 17),
                ChartPoint(2, 68, "Test 3", "10 Sep", "Architecture", 30, 20),
                ChartPoint(3, 76, "Test 4", "15 Sep", "Database", 20, 15),
                ChartPoint(4, 82, "Test 5", "20 Sep", "OOP", 30, 25),
                ChartPoint(5, 78, "Test 6", "25 Sep", "CS Core", 25, 19),
                ChartPoint(6, 88, "Test 7", "28 Sep", "Automata", 30, 26),
                ChartPoint(7, 92, "Test 8", "02 Oct", "Programming", 40, 37)
            )
        } else {
            chronologicalAttempts.mapIndexed { idx, it ->
                ChartPoint(
                    index = idx,
                    score = it.scorePercentage,
                    label = dateFormat.format(Date(it.timestamp)),
                    fullDate = fullDateFormat.format(Date(it.timestamp)),
                    subjectTitle = it.subjectTitle,
                    totalQuestions = it.totalQuestions,
                    correctCount = it.correctCount
                )
            }
        }
    }

    // Default select latest point
    if (selectedPoint == null && chartPoints.isNotEmpty()) {
        selectedPoint = chartPoints.last()
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
            .padding(18.dp)
            .testTag("accuracy_over_time_chart_card")
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Header: Title & Time Filters
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
                            .background(Color(0xFFEFF6FF)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShowChart,
                            contentDescription = null,
                            tint = SubjectBlue,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Accuracy Over Time",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.TrendingUp,
                                contentDescription = null,
                                tint = StatusSuccess,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(3.dp))
                            Text(
                                text = "+14% accuracy gain",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = StatusSuccess
                            )
                        }
                    }
                }

                // Range Selector Pills
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFF1F5F9))
                        .padding(2.dp)
                ) {
                    listOf("7D", "30D", "All").forEach { filter ->
                        val isSelected = selectedFilter == filter
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (isSelected) Color.White else Color.Transparent)
                                .clickable { selectedFilter = filter }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = filter,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) SubjectBlue else TextSecondary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Tooltip Card for Selected Point (Recharts-style tooltip)
            selectedPoint?.let { pt ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFFF8FAFC))
                        .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(10.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = pt.subjectTitle,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "${pt.fullDate}  •  ${pt.correctCount}/${pt.totalQuestions} Correct",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(SubjectBlue.copy(alpha = 0.15f))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "${pt.score}%",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                                color = SubjectBlue
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Native Smooth Canvas Chart Area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .pointerInput(chartPoints) {
                            detectTapGestures { offset ->
                                val count = chartPoints.size
                                if (count > 0) {
                                    val paddingLeft = 32.dp.toPx()
                                    val paddingRight = 16.dp.toPx()
                                    val usableWidth = size.width - paddingLeft - paddingRight
                                    val stepX = usableWidth / (count - 1).coerceAtLeast(1)

                                    var closestIndex = 0
                                    var closestDist = Float.MAX_VALUE

                                    for (i in chartPoints.indices) {
                                        val pointX = paddingLeft + (i * stepX)
                                        val dist = kotlin.math.abs(offset.x - pointX)
                                        if (dist < closestDist) {
                                            closestDist = dist
                                            closestIndex = i
                                        }
                                    }
                                    selectedPoint = chartPoints[closestIndex]
                                }
                            }
                        }
                ) {
                    val width = size.width
                    val height = size.height

                    val paddingLeft = 32.dp.toPx()
                    val paddingRight = 16.dp.toPx()
                    val paddingTop = 14.dp.toPx()
                    val paddingBottom = 24.dp.toPx()

                    val chartWidth = width - paddingLeft - paddingRight
                    val chartHeight = height - paddingTop - paddingBottom

                    // Horizontal Grid Lines (0%, 25%, 50%, 75%, 100%)
                    val dashedEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f), 0f)
                    val gridSteps = listOf(0, 25, 50, 75, 100)

                    for (gridVal in gridSteps) {
                        val y = paddingTop + chartHeight - ((gridVal / 100f) * chartHeight)
                        drawLine(
                            color = Color(0xFFE2E8F0),
                            start = Offset(paddingLeft, y),
                            end = Offset(width - paddingRight, y),
                            strokeWidth = 1.dp.toPx(),
                            pathEffect = dashedEffect
                        )
                    }

                    if (chartPoints.size < 2) return@Canvas

                    val stepX = chartWidth / (chartPoints.size - 1)
                    val points = chartPoints.mapIndexed { idx, pt ->
                        val x = paddingLeft + (idx * stepX)
                        val y = paddingTop + chartHeight - ((pt.score / 100f) * chartHeight)
                        Offset(x, y)
                    }

                    // 1. Draw Gradient Fill Area Under Curve
                    val fillPath = Path().apply {
                        moveTo(points.first().x, paddingTop + chartHeight)
                        lineTo(points.first().x, points.first().y)

                        for (i in 0 until points.size - 1) {
                            val p0 = points[i]
                            val p1 = points[i + 1]
                            val controlPoint1 = Offset(p0.x + (p1.x - p0.x) / 2f, p0.y)
                            val controlPoint2 = Offset(p0.x + (p1.x - p0.x) / 2f, p1.y)
                            cubicTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, p1.x, p1.y)
                        }

                        lineTo(points.last().x, paddingTop + chartHeight)
                        close()
                    }

                    drawPath(
                        path = fillPath,
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                SubjectBlue.copy(alpha = 0.35f),
                                SubjectBlue.copy(alpha = 0.02f)
                            ),
                            startY = paddingTop,
                            endY = paddingTop + chartHeight
                        )
                    )

                    // 2. Draw Smooth Spline Stroke Line
                    val strokePath = Path().apply {
                        moveTo(points.first().x, points.first().y)
                        for (i in 0 until points.size - 1) {
                            val p0 = points[i]
                            val p1 = points[i + 1]
                            val controlPoint1 = Offset(p0.x + (p1.x - p0.x) / 2f, p0.y)
                            val controlPoint2 = Offset(p0.x + (p1.x - p0.x) / 2f, p1.y)
                            cubicTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, p1.x, p1.y)
                        }
                    }

                    drawPath(
                        path = strokePath,
                        color = SubjectBlue,
                        style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
                    )

                    // 3. Draw Point Markers
                    points.forEachIndexed { idx, pt ->
                        val isSelected = selectedPoint?.index == idx

                        if (isSelected) {
                            // Selected Outer Glowing Ring
                            drawCircle(
                                color = SubjectBlue.copy(alpha = 0.25f),
                                radius = 10.dp.toPx(),
                                center = pt
                            )
                            drawCircle(
                                color = SubjectBlue,
                                radius = 6.dp.toPx(),
                                center = pt
                            )
                            drawCircle(
                                color = Color.White,
                                radius = 3.dp.toPx(),
                                center = pt
                            )
                        } else {
                            drawCircle(
                                color = Color.White,
                                radius = 4.dp.toPx(),
                                center = pt
                            )
                            drawCircle(
                                color = SubjectBlue,
                                radius = 4.dp.toPx(),
                                center = pt,
                                style = Stroke(width = 2.dp.toPx())
                            )
                        }
                    }
                }
            }

            // X-Axis Date Labels Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 32.dp, end = 16.dp, top = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                if (chartPoints.isNotEmpty()) {
                    Text(
                        text = chartPoints.first().label,
                        fontSize = 10.sp,
                        color = TextMuted,
                        fontWeight = FontWeight.Medium
                    )
                    if (chartPoints.size > 2) {
                        Text(
                            text = chartPoints[chartPoints.size / 2].label,
                            fontSize = 10.sp,
                            color = TextMuted,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Text(
                        text = chartPoints.last().label,
                        fontSize = 10.sp,
                        color = TextMuted,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}
