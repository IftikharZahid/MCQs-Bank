package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("MCQs Bank", appName)
  }

  @Test
  fun `verify assets has mongodb_mcqs json`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val stream = context.assets.open("mongodb_mcqs.json")
    val content = stream.bufferedReader().use { it.readText() }
    val jsonObject = org.json.JSONObject(content)
    assertEquals(178, jsonObject.getInt("totalQuestions"))
  }
}
