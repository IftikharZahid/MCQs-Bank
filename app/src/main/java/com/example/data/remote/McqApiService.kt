package com.example.data.remote

import okhttp3.MultipartBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

interface McqApiService {

    @GET("status")
    suspend fun getStatus(): Response<ResponseBody>

    @GET("subjects")
    suspend fun getSubjects(): Response<ResponseBody>

    @GET("subjects/{id}")
    suspend fun getSubjectWithQuestions(
        @Path("id") subjectId: String
    ): Response<ResponseBody>

    @GET("questions")
    suspend fun getQuestions(
        @Query("subjectId") subjectId: String? = null,
        @Query("limit") limit: Int? = 500
    ): Response<ResponseBody>

    @Multipart
    @POST("upload")
    suspend fun uploadMcqFile(
        @Part file: MultipartBody.Part
    ): Response<ResponseBody>
}
