package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "weekly_modules")
data class WeeklyModuleEntity(
    @PrimaryKey
    val id: String,
    val weekNumber: Int,
    val title: String,
    val mcqCount: Int,
    val subjectId: String,
    val isCompleted: Boolean = false
)

data class WeeklyModule(
    val id: String,
    val weekNumber: Int,
    val title: String,
    val mcqCount: Int,
    val subjectId: String,
    val isCompleted: Boolean
)

fun WeeklyModuleEntity.toDomain() = WeeklyModule(
    id = id,
    weekNumber = weekNumber,
    title = title,
    mcqCount = mcqCount,
    subjectId = subjectId,
    isCompleted = isCompleted
)
