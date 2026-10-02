package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "subjects")
data class SubjectEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val degreeCourse: String,
    val totalMcqs: Int,
    val totalModules: Int,
    val progressPercent: Int,
    val iconType: String, // "code", "database", "cpu", "cube", "graph", "gear", "terminal", "robot"
    val colorHex: Long,
    val category: String, // "Core CS", "Systems", "Programming", "AI & Data"
    val orderIndex: Int
)

data class Subject(
    val id: String,
    val title: String,
    val degreeCourse: String,
    val totalMcqs: Int,
    val totalModules: Int,
    val progressPercent: Int,
    val iconType: String,
    val colorHex: Long,
    val category: String,
    val orderIndex: Int
)

fun SubjectEntity.toDomain() = Subject(
    id = id,
    title = title,
    degreeCourse = degreeCourse,
    totalMcqs = totalMcqs,
    totalModules = totalModules,
    progressPercent = progressPercent,
    iconType = iconType,
    colorHex = colorHex,
    category = category,
    orderIndex = orderIndex
)
