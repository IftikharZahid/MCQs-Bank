package com.example.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.widthIn
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

data class ScreenSizeInfo(
    val maxWidth: Dp,
    val maxHeight: Dp,
    val isCompact: Boolean,
    val isMedium: Boolean,
    val isExpanded: Boolean,
    val gridColumns: Int
)

@Composable
fun ResponsiveScaffold(
    modifier: Modifier = Modifier,
    maxContentWidth: Dp = 840.dp,
    content: @Composable (ScreenSizeInfo) -> Unit
) {
    BoxWithConstraints(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.TopCenter
    ) {
        val width = maxWidth
        val height = maxHeight

        val isCompact = width < 600.dp
        val isMedium = width in 600.dp..840.dp
        val isExpanded = width > 840.dp

        val gridColumns = when {
            isExpanded -> 3
            isMedium -> 2
            else -> 1
        }

        val screenSizeInfo = ScreenSizeInfo(
            maxWidth = width,
            maxHeight = height,
            isCompact = isCompact,
            isMedium = isMedium,
            isExpanded = isExpanded,
            gridColumns = gridColumns
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .widthIn(max = if (isCompact) width else maxContentWidth),
            contentAlignment = Alignment.TopCenter
        ) {
            content(screenSizeInfo)
        }
    }
}
