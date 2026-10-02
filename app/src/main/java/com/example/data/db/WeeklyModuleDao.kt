package com.example.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.WeeklyModuleEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WeeklyModuleDao {
    @Query("SELECT * FROM weekly_modules ORDER BY weekNumber ASC")
    fun getAllModules(): Flow<List<WeeklyModuleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertModules(modules: List<WeeklyModuleEntity>)

    @Update
    suspend fun updateModule(module: WeeklyModuleEntity)

    @Query("DELETE FROM weekly_modules")
    suspend fun deleteAll()
}
