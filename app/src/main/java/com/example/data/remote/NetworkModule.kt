package com.example.data.remote

import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

object NetworkModule {
    private const val TAG = "NetworkModule"

    // Default base URL for Android Emulator connecting to local Node.js server
    const val DEFAULT_EMULATOR_BASE_URL = "http://10.0.2.2:3000/api/"

    @Volatile
    private var currentBaseUrl: String = DEFAULT_EMULATOR_BASE_URL

    @Volatile
    private var cachedApiService: McqApiService? = null

    val baseUrl: String
        get() = currentBaseUrl

    fun updateBaseUrl(newUrl: String) {
        val formatted = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        if (currentBaseUrl != formatted) {
            currentBaseUrl = formatted
            cachedApiService = null
            Log.d(TAG, "Base URL updated to: $currentBaseUrl")
        }
    }

    private val okHttpClient: OkHttpClient by lazy {
        val loggingInterceptor = HttpLoggingInterceptor { message ->
            Log.d("MCQ_API", message)
        }.apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }

        OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    val apiService: McqApiService
        get() {
            return cachedApiService ?: synchronized(this) {
                cachedApiService ?: Retrofit.Builder()
                    .baseUrl(currentBaseUrl)
                    .client(okHttpClient)
                    .build()
                    .create(McqApiService::class.java)
                    .also { cachedApiService = it }
            }
        }
}
