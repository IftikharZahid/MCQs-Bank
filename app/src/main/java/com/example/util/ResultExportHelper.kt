package com.example.util

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.CancellationSignal
import android.os.Environment
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintDocumentInfo
import android.print.PrintManager
import android.provider.MediaStore
import android.widget.Toast
import com.example.ui.viewmodel.TestResultSummary
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object ResultExportHelper {

    /**
     * Generates a high-resolution, professional academic scorecard/certificate bitmap.
     */
    fun generateProfessionalResultBitmap(
        context: Context,
        summary: TestResultSummary
    ): Bitmap {
        val width = 1080
        val height = 1680
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // 1. Base Background
        canvas.drawColor(Color.parseColor("#F8FAFC"))

        // 2. Outer Certificate Border
        val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 6f
            color = Color.parseColor("#CBD5E1")
        }
        val innerBorderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            color = Color.parseColor("#E2E8F0")
        }
        canvas.drawRoundRect(RectF(32f, 32f, width - 32f, height - 32f), 28f, 28f, borderPaint)
        canvas.drawRoundRect(RectF(44f, 44f, width - 44f, height - 44f), 20f, 20f, innerBorderPaint)

        // 3. Top Banner Card (Royal Navy)
        val headerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#0F172A")
        }
        canvas.drawRoundRect(RectF(60f, 60f, width - 60f, 280f), 24f, 24f, headerPaint)

        // Gold Accent Bar in Header
        val goldPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#F59E0B")
        }
        canvas.drawRoundRect(RectF(60f, 60f, width - 60f, 74f), 24f, 24f, goldPaint)

        // Header Title
        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG)
        textPaint.textAlign = Paint.Align.CENTER

        textPaint.color = Color.parseColor("#F59E0B")
        textPaint.textSize = 24f
        textPaint.isFakeBoldText = true
        canvas.drawText("OFFICIAL ASSESSMENT SCORECARD", width / 2f, 125f, textPaint)

        textPaint.color = Color.WHITE
        textPaint.textSize = 42f
        textPaint.isFakeBoldText = true
        canvas.drawText("MCQs Bank Examination", width / 2f, 185f, textPaint)

        textPaint.color = Color.parseColor("#94A3B8")
        textPaint.textSize = 22f
        textPaint.isFakeBoldText = false
        val dateFormat = SimpleDateFormat("MMMM dd, yyyy  •  hh:mm a", Locale.getDefault())
        val dateStr = "Issued on: " + dateFormat.format(Date())
        canvas.drawText(dateStr, width / 2f, 235f, textPaint)

        // 4. Subject & Topic Section Card
        val cardPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.WHITE
        }
        val cardBorderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            color = Color.parseColor("#E2E8F0")
        }
        val subjectRect = RectF(60f, 310f, width - 60f, 470f)
        canvas.drawRoundRect(subjectRect, 20f, 20f, cardPaint)
        canvas.drawRoundRect(subjectRect, 20f, 20f, cardBorderPaint)

        textPaint.textAlign = Paint.Align.LEFT
        textPaint.color = Color.parseColor("#64748B")
        textPaint.textSize = 20f
        textPaint.isFakeBoldText = true
        canvas.drawText("COURSE & SYLLABUS", 90f, 355f, textPaint)

        textPaint.color = Color.parseColor("#0F172A")
        textPaint.textSize = 34f
        textPaint.isFakeBoldText = true
        val truncatedTitle = if (summary.subjectTitle.length > 36) summary.subjectTitle.take(34) + "..." else summary.subjectTitle
        canvas.drawText(truncatedTitle, 90f, 405f, textPaint)

        textPaint.color = Color.parseColor("#475569")
        textPaint.textSize = 22f
        textPaint.isFakeBoldText = false
        val truncatedTopic = if (summary.topic.length > 48) summary.topic.take(46) + "..." else summary.topic
        canvas.drawText(truncatedTopic, 90f, 445f, textPaint)

        // 5. Overall Score Showcase Card
        val scoreRect = RectF(60f, 500f, width - 60f, 850f)
        canvas.drawRoundRect(scoreRect, 24f, 24f, cardPaint)
        canvas.drawRoundRect(scoreRect, 24f, 24f, cardBorderPaint)

        textPaint.textAlign = Paint.Align.CENTER
        textPaint.color = Color.parseColor("#64748B")
        textPaint.textSize = 22f
        textPaint.isFakeBoldText = true
        canvas.drawText("PERFORMANCE RESULT", width / 2f, 555f, textPaint)

        // Score percentage
        val scoreColorHex = when {
            summary.scorePercentage >= 75 -> "#16A34A"
            summary.scorePercentage >= 60 -> "#D97706"
            else -> "#DC2626"
        }
        textPaint.color = Color.parseColor(scoreColorHex)
        textPaint.textSize = 110f
        textPaint.isFakeBoldText = true
        canvas.drawText("${summary.scorePercentage}%", width / 2f, 680f, textPaint)

        // Grade label
        val grade = when {
            summary.scorePercentage >= 90 -> "Distinction - Grade A+"
            summary.scorePercentage >= 80 -> "Excellent - Grade A"
            summary.scorePercentage >= 70 -> "Good - Grade B"
            summary.scorePercentage >= 60 -> "Satisfactory - Grade C"
            else -> "Needs Revision - Grade F"
        }
        textPaint.textSize = 30f
        textPaint.isFakeBoldText = true
        canvas.drawText(grade, width / 2f, 740f, textPaint)

        // Progress bar inside score card
        val barBgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.parseColor("#E2E8F0")
        }
        val barFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.parseColor(scoreColorHex)
        }
        val barRect = RectF(120f, 780f, width - 120f, 805f)
        canvas.drawRoundRect(barRect, 12f, 12f, barBgPaint)

        val progressWidth = ((width - 240f) * (summary.scorePercentage / 100f)).coerceAtLeast(16f)
        val fillRect = RectF(120f, 780f, 120f + progressWidth, 805f)
        canvas.drawRoundRect(fillRect, 12f, 12f, barFillPaint)

        // 6. Metrics Grid (4 Stat Boxes)
        val statBoxesTop = 880f
        val boxWidth = 460f
        val boxHeight = 170f

        val mins = summary.durationSeconds / 60
        val secs = summary.durationSeconds % 60
        val durationStr = "${mins}m ${secs}s"

        // Correct Answers Box (Left 1)
        val box1 = RectF(60f, statBoxesTop, 60f + boxWidth, statBoxesTop + boxHeight)
        drawStatCard(canvas, box1, "CORRECT ANSWERS", "${summary.correctCount} / ${summary.totalQuestions}", "#16A34A", "#F0FDF4")

        // Wrong Answers Box (Right 1)
        val box2 = RectF(width - 60f - boxWidth, statBoxesTop, width - 60f, statBoxesTop + boxHeight)
        drawStatCard(canvas, box2, "WRONG ANSWERS", "${summary.wrongCount}", "#DC2626", "#FEF2F2")

        // Skipped Answers Box (Left 2)
        val box3 = RectF(60f, statBoxesTop + boxHeight + 20f, 60f + boxWidth, statBoxesTop + (boxHeight * 2) + 20f)
        drawStatCard(canvas, box3, "SKIPPED QUESTIONS", "${summary.skippedCount}", "#64748B", "#F8FAFC")

        // Time Taken Box (Right 2)
        val box4 = RectF(width - 60f - boxWidth, statBoxesTop + boxHeight + 20f, width - 60f, statBoxesTop + (boxHeight * 2) + 20f)
        drawStatCard(canvas, box4, "TIME ELAPSED", durationStr, "#2563EB", "#EFF6FF")

        // 7. Academic Summary & Verification Box
        val summaryBoxTop = statBoxesTop + (boxHeight * 2) + 50f
        val summaryRect = RectF(60f, summaryBoxTop, width - 60f, summaryBoxTop + 180f)
        canvas.drawRoundRect(summaryRect, 20f, 20f, cardPaint)
        canvas.drawRoundRect(summaryRect, 20f, 20f, cardBorderPaint)

        textPaint.textAlign = Paint.Align.LEFT
        textPaint.color = Color.parseColor("#0F172A")
        textPaint.textSize = 24f
        textPaint.isFakeBoldText = true
        canvas.drawText("ACADEMIC PERFORMANCE ASSESSMENT", 90f, summaryBoxTop + 50f, textPaint)

        textPaint.color = Color.parseColor("#475569")
        textPaint.textSize = 20f
        textPaint.isFakeBoldText = false
        val remarks = when {
            summary.scorePercentage >= 80 -> "Outstanding grasp of curriculum objectives. High competency verified."
            summary.scorePercentage >= 60 -> "Satisfactory conceptual understanding. Review incorrect items to strengthen."
            else -> "Needs revision. Recommended to re-attempt after reviewing syllabus chapters."
        }
        canvas.drawText(remarks, 90f, summaryBoxTop + 90f, textPaint)

        textPaint.color = Color.parseColor("#94A3B8")
        textPaint.textSize = 18f
        canvas.drawText("Verified & logged in local SQLite Room Database engine.", 90f, summaryBoxTop + 130f, textPaint)

        // 8. Footer (Seal & Verification)
        val footerY = height - 100f
        val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            color = Color.parseColor("#CBD5E1")
        }
        canvas.drawLine(80f, footerY, width - 80f, footerY, linePaint)

        textPaint.textAlign = Paint.Align.CENTER
        textPaint.color = Color.parseColor("#64748B")
        textPaint.textSize = 20f
        textPaint.isFakeBoldText = true
        canvas.drawText("MCQs Bank  •  Academic Assessment & Self-Evaluation Portal", width / 2f, footerY + 40f, textPaint)

        return bitmap
    }

    private fun drawStatCard(
        canvas: Canvas,
        rect: RectF,
        title: String,
        value: String,
        accentColorHex: String,
        bgColorHex: String
    ) {
        val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.parseColor(bgColorHex)
        }
        val borderPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2f
            color = Color.parseColor("#E2E8F0")
        }
        canvas.drawRoundRect(rect, 16f, 16f, bgPaint)
        canvas.drawRoundRect(rect, 16f, 16f, borderPaint)

        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG)
        textPaint.textAlign = Paint.Align.CENTER

        textPaint.color = Color.parseColor("#64748B")
        textPaint.textSize = 18f
        textPaint.isFakeBoldText = true
        canvas.drawText(title, rect.centerX(), rect.top + 55f, textPaint)

        textPaint.color = Color.parseColor(accentColorHex)
        textPaint.textSize = 42f
        textPaint.isFakeBoldText = true
        canvas.drawText(value, rect.centerX(), rect.top + 120f, textPaint)
    }

    /**
     * Saves the scorecard bitmap as a PNG image directly into the device's Gallery (Pictures/MCQsBank).
     */
    fun saveResultToGallery(
        context: Context,
        bitmap: Bitmap,
        subjectTitle: String
    ): Uri? {
        val cleanSubject = subjectTitle.replace(Regex("[^a-zA-Z0-9]"), "_").take(20)
        val filename = "MCQ_Scorecard_${cleanSubject}_${System.currentTimeMillis()}.png"

        return try {
            val contentValues = ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME, filename)
                put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/MCQsBank")
                    put(MediaStore.Images.Media.IS_PENDING, 1)
                }
            }

            val uri = context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
            if (uri != null) {
                context.contentResolver.openOutputStream(uri)?.use { outputStream ->
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    contentValues.clear()
                    contentValues.put(MediaStore.Images.Media.IS_PENDING, 0)
                    context.contentResolver.update(uri, contentValues, null, null)
                }

                Toast.makeText(context, "Scorecard saved as PNG in Gallery!", Toast.LENGTH_LONG).show()
                uri
            } else {
                Toast.makeText(context, "Failed to create image in Gallery", Toast.LENGTH_SHORT).show()
                null
            }
        } catch (e: Exception) {
            Toast.makeText(context, "Error saving scorecard: ${e.message}", Toast.LENGTH_SHORT).show()
            null
        }
    }

    /**
     * Launches the Android Native Print Dialog to print or export as PDF.
     */
    fun printResultReport(
        context: Context,
        bitmap: Bitmap,
        subjectTitle: String
    ) {
        val printManager = context.getSystemService(Context.PRINT_SERVICE) as? PrintManager
        if (printManager == null) {
            Toast.makeText(context, "Printing not supported on this device", Toast.LENGTH_SHORT).show()
            return
        }

        val jobName = "MCQ_Assessment_${subjectTitle.replace(" ", "_")}"
        val printAdapter = object : PrintDocumentAdapter() {
            override fun onLayout(
                oldAttributes: PrintAttributes?,
                newAttributes: PrintAttributes?,
                cancellationSignal: CancellationSignal?,
                callback: LayoutResultCallback?,
                extras: Bundle?
            ) {
                if (cancellationSignal?.isCanceled == true) {
                    callback?.onLayoutCancelled()
                    return
                }
                val info = PrintDocumentInfo.Builder("$jobName.pdf")
                    .setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT)
                    .setPageCount(1)
                    .build()
                callback?.onLayoutFinished(info, true)
            }

            override fun onWrite(
                pages: Array<out PageRange>?,
                destination: ParcelFileDescriptor?,
                cancellationSignal: CancellationSignal?,
                callback: WriteResultCallback?
            ) {
                if (destination == null) {
                    callback?.onWriteFailed("No file descriptor provided")
                    return
                }
                val pdfDocument = PdfDocument()
                try {
                    val pageInfo = PdfDocument.PageInfo.Builder(bitmap.width, bitmap.height, 1).create()
                    val page = pdfDocument.startPage(pageInfo)
                    page.canvas.drawBitmap(bitmap, 0f, 0f, null)
                    pdfDocument.finishPage(page)

                    FileOutputStream(destination.fileDescriptor).use { output ->
                        pdfDocument.writeTo(output)
                    }
                    callback?.onWriteFinished(arrayOf(PageRange.ALL_PAGES))
                } catch (e: Exception) {
                    callback?.onWriteFailed(e.message)
                } finally {
                    pdfDocument.close()
                }
            }
        }

        printManager.print(jobName, printAdapter, PrintAttributes.Builder().build())
    }
}
