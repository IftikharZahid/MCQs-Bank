package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = AccentYellow,
    onPrimary = Color(0xFF1E1E1E),
    primaryContainer = BrandNavyLight,
    onPrimaryContainer = Color.White,
    secondary = BrandNavyDark,
    onSecondary = Color.White,
    background = Color(0xFF0A0F1D),
    surface = Color(0xFF111827),
    onBackground = Color(0xFFF3F4F6),
    onSurface = Color(0xFFF3F4F6),
    outline = Color(0xFF374151)
)

private val LightColorScheme = lightColorScheme(
    primary = BrandNavyDark,
    onPrimary = Color.White,
    primaryContainer = AccentYellowLight,
    onPrimaryContainer = Color(0xFF78350F),
    secondary = AccentYellow,
    onSecondary = Color(0xFF1E1E1E),
    background = BackgroundSlate,
    surface = SurfaceWhite,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    outline = BorderLight
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit,
) {
    // Dedicated crisp professional academic white theme matching the requirements
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
