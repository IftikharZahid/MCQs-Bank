package com.example.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForwardIos
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.TrackChanges
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.repository.SyncStatus
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.ui.theme.AccentYellow
import com.example.ui.theme.BackgroundSlate
import com.example.ui.theme.BorderLight
import com.example.ui.theme.SubjectBlue
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.viewmodel.McqViewModel

@Composable
fun MoreScreen(
    viewModel: McqViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var dailyReminder by remember { mutableStateOf(true) }
    var offlineSync by remember { mutableStateOf(true) }
    var showDeveloperDialog by remember { mutableStateOf(false) }
    var showUrlDialog by remember { mutableStateOf(false) }
    var tempUrl by remember { mutableStateOf(viewModel.apiBaseUrl) }

    val syncStatus by viewModel.syncStatus.collectAsStateWithLifecycle()
    val isSyncing by viewModel.isSyncing.collectAsStateWithLifecycle()

    val whatsappUrl = "https://wa.me/923007971374?text=Assalam-o-Alaikum%20Iftikhar%20Zahid,%20I%20am%20contacting%20you%20regarding%20the%20MCQs%20Bank%20App."
    val facebookUrl = "https://fb.com/IftikharXahid"
    val githubUrl = "https://github.com/IftikharZahid/"

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundSlate)
            .testTag("more_screen_list"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Academic Objectives Card
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White)
                    .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    MoreOptionItem(
                        icon = Icons.Default.TrackChanges,
                        iconColor = SubjectBlue,
                        iconBg = Color(0xFFEFF6FF),
                        title = "Daily Study Target",
                        subtitle = "Target: 20 MCQs daily (Streak: 4 Days)",
                        onClick = {
                            Toast.makeText(context, "Daily Target: 20 MCQs active. Streak: 4 Days!", Toast.LENGTH_SHORT).show()
                        }
                    )

                    HorizontalDivider(
                        thickness = 1.dp,
                        color = BorderLight,
                        modifier = Modifier.padding(vertical = 12.dp)
                    )

                    MoreOptionItem(
                        icon = Icons.Default.MilitaryTech,
                        iconColor = Color(0xFF059669),
                        iconBg = Color(0xFFECFDF5),
                        title = "Academic Syllabus Standards",
                        subtitle = "HEC / ABET Computer Science Curriculum",
                        onClick = {
                            Toast.makeText(context, "Aligned with standard university computer science curriculum.", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }

        // Preferences & Cache Section
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White)
                    .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Preferences & Cache",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    // Daily Practice Reminders Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFF1F5F9)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.NotificationsActive,
                                    contentDescription = null,
                                    tint = TextPrimary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Daily Practice Reminders",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Prompt at 08:00 PM",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }
                        }

                        Switch(
                            checked = dailyReminder,
                            onCheckedChange = { dailyReminder = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = SubjectBlue
                            )
                        )
                    }

                    HorizontalDivider(
                        thickness = 1.dp,
                        color = BorderLight,
                        modifier = Modifier.padding(vertical = 12.dp)
                    )

                    // Offline Question Bank Toggle
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFFECFDF5)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Storage,
                                    contentDescription = null,
                                    tint = Color(0xFF059669),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Offline Question Bank",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Verified MCQs persistently stored",
                                    fontSize = 12.sp,
                                    color = TextSecondary
                                )
                            }
                        }

                        Switch(
                            checked = offlineSync,
                            onCheckedChange = { offlineSync = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = Color(0xFF10B981)
                            )
                        )
                    }

                    HorizontalDivider(
                        thickness = 1.dp,
                        color = BorderLight,
                        modifier = Modifier.padding(vertical = 12.dp)
                    )

                    // MongoDB Atlas / Node.js API Connection Settings
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFFEFF6FF)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Sync,
                                        contentDescription = null,
                                        tint = SubjectBlue,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = "MongoDB API Server",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = viewModel.apiBaseUrl,
                                        fontSize = 11.5.sp,
                                        color = TextSecondary,
                                        maxLines = 1
                                    )
                                }
                            }

                            IconButton(
                                onClick = {
                                    tempUrl = viewModel.apiBaseUrl
                                    showUrlDialog = true
                                },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Edit,
                                    contentDescription = "Edit API URL",
                                    tint = SubjectBlue,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Sync action button with status
                        Button(
                            onClick = { viewModel.syncWithBackend() },
                            enabled = !isSyncing,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(40.dp)
                                .testTag("sync_mongodb_button"),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SubjectBlue,
                                disabledContainerColor = SubjectBlue.copy(alpha = 0.5f)
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Sync,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (isSyncing) "Syncing with MongoDB..." else "Sync Now with MongoDB",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        // Last sync status message
                        Text(
                            text = when (val s = syncStatus) {
                                is SyncStatus.Syncing -> "Communicating with REST API..."
                                is SyncStatus.Success -> s.message
                                is SyncStatus.Error -> s.message
                                else -> "Ready to synchronize with remote database"
                            },
                            fontSize = 11.sp,
                            color = when (syncStatus) {
                                is SyncStatus.Success -> Color(0xFF059669)
                                is SyncStatus.Error -> Color(0xFFD97706)
                                else -> TextSecondary
                            },
                            modifier = Modifier.padding(top = 6.dp)
                        )
                    }
                }
            }
        }

        // Developer Profile & Social Connect Section
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White)
                    .border(1.dp, BorderLight, RoundedCornerShape(20.dp))
                    .padding(18.dp)
                    .testTag("about_developer_card")
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    // Clickable Developer Header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { showDeveloperDialog = true }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(SubjectBlue.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Code,
                                contentDescription = null,
                                tint = SubjectBlue,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "MCQs Question Bank v1.0",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Developed by Iftikhar Zahid",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = SubjectBlue
                            )
                            Text(
                                text = "Tap to view developer details",
                                fontSize = 11.5.sp,
                                color = TextSecondary
                            )
                        }

                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForwardIos,
                            contentDescription = null,
                            tint = Color(0xFF94A3B8),
                            modifier = Modifier.size(14.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(thickness = 0.8.dp, color = BorderLight)
                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Connect & Follow Developer",
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextSecondary
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // 3 Professional Social Buttons (WhatsApp, Facebook, GitHub)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // 1. WhatsApp Button
                        SocialMediaButton(
                            label = "WhatsApp",
                            iconResId = R.drawable.ic_whatsapp,
                            accentColor = Color(0xFF25D366),
                            bgColor = Color(0xFFE8F8F0),
                            borderColor = Color(0xFFA7F3D0),
                            modifier = Modifier.weight(1f),
                            onClick = {
                                openExternalUrl(context, whatsappUrl)
                            }
                        )

                        // 2. Facebook Button
                        SocialMediaButton(
                            label = "Facebook",
                            iconResId = R.drawable.ic_facebook,
                            accentColor = Color(0xFF1877F2),
                            bgColor = Color(0xFFEFF6FF),
                            borderColor = Color(0xFFBFDBFE),
                            modifier = Modifier.weight(1f),
                            onClick = {
                                openExternalUrl(context, facebookUrl)
                            }
                        )

                        // 3. GitHub Button
                        SocialMediaButton(
                            label = "GitHub",
                            iconResId = R.drawable.ic_github,
                            accentColor = Color(0xFF24292E),
                            bgColor = Color(0xFFF1F5F9),
                            borderColor = Color(0xFFCBD5E1),
                            modifier = Modifier.weight(1f),
                            onClick = {
                                openExternalUrl(context, githubUrl)
                            }
                        )
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
    }

    // Professional Light-Themed Developer Profile Dialog
    if (showDeveloperDialog) {
        AlertDialog(
            onDismissRequest = { showDeveloperDialog = false },
            containerColor = Color.White,
            textContentColor = TextPrimary,
            titleContentColor = TextPrimary,
            shape = RoundedCornerShape(24.dp),
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(SubjectBlue.copy(alpha = 0.12f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = SubjectBlue,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "About Developer",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )
                        Text(
                            text = "MCQs Question Bank",
                            fontSize = 11.5.sp,
                            color = TextSecondary
                        )
                    }
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp)
                ) {
                    // Developer Name & Designation
                    Text(
                        text = "Iftikhar Zahid",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Software Engineer & Academic Lecturer",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = SubjectBlue
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Dedicated to creating high-performance educational applications, academic quiz engines, and modern mobile learning architectures.",
                        fontSize = 12.sp,
                        color = Color(0xFF475569),
                        lineHeight = 17.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showDeveloperDialog = false },
                    colors = ButtonDefaults.buttonColors(containerColor = SubjectBlue),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Close", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = {
                        showDeveloperDialog = false
                    },
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Close Details", color = TextSecondary, fontWeight = FontWeight.SemiBold)
                }
            }
        )
    }

    // MongoDB Server URL Configuration Dialog
    if (showUrlDialog) {
        AlertDialog(
            onDismissRequest = { showUrlDialog = false },
            containerColor = Color.White,
            titleContentColor = TextPrimary,
            shape = RoundedCornerShape(24.dp),
            title = {
                Text(
                    text = "MongoDB API Base URL",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Enter your Node.js REST API base URL. Use 10.0.2.2 for Android Studio Emulator, or your computer's Wi-Fi IP (e.g. 192.168.x.x) for physical Android devices.",
                        fontSize = 12.5.sp,
                        color = Color(0xFF475569),
                        lineHeight = 17.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = tempUrl,
                        onValueChange = { tempUrl = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        label = { Text("API Base URL") },
                        placeholder = { Text("http://10.0.2.2:3000/api/") }
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    TextButton(
                        onClick = {
                            tempUrl = "http://10.0.2.2:3000/api/"
                        }
                    ) {
                        Text("Reset to Emulator Default (10.0.2.2)", fontSize = 11.5.sp)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.updateApiBaseUrl(tempUrl.trim())
                        showUrlDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SubjectBlue),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Save & Sync", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showUrlDialog = false },
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Cancel", color = TextSecondary)
                }
            }
        )
    }
}

@Composable
fun SocialMediaButton(
    label: String,
    iconResId: Int,
    accentColor: Color,
    bgColor: Color,
    borderColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 8.dp)
            .testTag("social_button_${label.lowercase()}"),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                painter = painterResource(id = iconResId),
                contentDescription = label,
                tint = accentColor,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = label,
                fontSize = 11.5.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }
    }
}

@Composable
fun MoreOptionItem(
    icon: ImageVector,
    iconColor: Color,
    iconBg: Color,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(iconBg),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(20.dp))
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
            Text(text = subtitle, fontSize = 12.sp, color = TextSecondary)
        }

        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForwardIos,
            contentDescription = null,
            tint = Color(0xFF94A3B8),
            modifier = Modifier.size(14.dp)
        )
    }
}

fun openExternalUrl(context: Context, url: String) {
    try {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    } catch (e: Exception) {
        Toast.makeText(context, "Unable to open link: ${e.message}", Toast.LENGTH_SHORT).show()
    }
}
