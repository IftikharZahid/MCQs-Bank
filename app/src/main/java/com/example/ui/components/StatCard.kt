package com.example.ui.components

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.BorderLight
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary

@Composable
fun StatsGrid(
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        StatCard(
            value = "05",
            label = "Books",
            icon = Icons.AutoMirrored.Filled.MenuBook,
            iconColor = Color(0xFF2563EB),
            iconBg = Color(0xFFEFF6FF),
            testTag = "stat_card_subjects",
            modifier = Modifier.weight(1f)
        )

        StatCard(
            value = "158",
            label = "MCQs",
            icon = Icons.Default.Help,
            iconColor = Color(0xFF059669),
            iconBg = Color(0xFFECFDF5),
            testTag = "stat_card_total_mcqs",
            modifier = Modifier.weight(1.05f)
        )

        StatCard(
            value = "25+",
            label = "Tests",
            icon = Icons.Default.Assignment,
            iconColor = Color(0xFF7C3AED),
            iconBg = Color(0xFFF5F3FF),
            testTag = "stat_card_practice_tests",
            modifier = Modifier.weight(1f)
        )

        StatCard(
            value = "78%",
            label = "Avg. Score",
            icon = Icons.Default.EmojiEvents,
            iconColor = Color(0xFFD97706),
            iconBg = Color(0xFFFFFBEB),
            testTag = "stat_card_avg_score",
            modifier = Modifier.weight(1.05f)
        )
    }
}

@Composable
fun StatCard(
    value: String,
    label: String,
    icon: ImageVector,
    iconColor: Color,
    iconBg: Color,
    testTag: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White)
            .border(1.dp, BorderLight, RoundedCornerShape(12.dp))
            .testTag(testTag)
            .padding(horizontal = 4.dp, vertical = 7.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(26.dp)
                    .clip(RoundedCornerShape(7.dp))
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = label,
                    tint = iconColor,
                    modifier = Modifier.size(14.dp)
                )
            }

            Spacer(modifier = Modifier.height(3.dp))

            Text(
                text = value,
                fontSize = 12.5.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                maxLines = 1
            )
            Text(
                text = label,
                fontSize = 9.5.sp,
                fontWeight = FontWeight.Medium,
                color = TextSecondary,
                maxLines = 1
            )
        }
    }
}
