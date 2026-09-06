package com.audiofactory.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    companion object {
        const val PRODUCTION_URL = "https://audiofactory.vercel.app"
        const val ALLOWED_HOST = "audiofactory.vercel.app"
        const val REQUEST_RECORD_AUDIO_PERMISSION = 200
    }

    private lateinit var rootLayout: FrameLayout
    private lateinit var webView: WebView
    private lateinit var splashLayout: LinearLayout
    private lateinit var errorLayout: LinearLayout

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingPermissionRequest: PermissionRequest? = null

    // Register modern file picker launcher
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val results = if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val dataString = result.data?.dataString
            val clipData = result.data?.clipData
            if (clipData != null) {
                Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
            } else if (dataString != null) {
                arrayOf(Uri.parse(dataString))
            } else null
        } else null

        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
    }

    override fun onCreate(savedInstanceState) {
        super.onCreate(savedInstanceState)

        // Strict environment validation: Release builds must ALWAYS load Vercel production URL
        if (!BuildConfig.DEBUG) {
            require(PRODUCTION_URL.startsWith("https://")) { "Production URL must use SSL (HTTPS)" }
        }

        // Configure edge-to-edge / status bar styling
        window.statusBarColor = Color.parseColor("#0A0A0A")
        window.navigationBarColor = Color.parseColor("#0A0A0A")

        // Build UI programmatically for robust dependency-free execution
        setupViews()

        // Configure Back Button Behavior to navigate web history
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Restore saved WebView state if available
        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(PRODUCTION_URL)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupViews() {
        rootLayout = FrameLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0D1117"))
        }

        // 1. Initialize WebView
        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            visibility = View.INVISIBLE // Hide until first content paints successfully
        }

        // Enable modern web settings required for AudioFACTORY
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            
            // Append explicit AudioFACTORY app identifier to User Agent string
            userAgentString = "$userAgentString AudioFACTORYAndroid/1.0"
        }

        // Configure cookies
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        // WebChromeClient for File Uploads, Microphone, Dialogs & Progress
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback
                val intent = fileChooserParams.createIntent()
                try {
                    filePickerLauncher.launch(intent)
                } catch (e: Exception) {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = null
                    return false
                }
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                val resources = request.resources
                val hasMicrophone = resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)
                if (hasMicrophone) {
                    val origin = request.origin.toString()
                    if (origin.startsWith(PRODUCTION_URL) || origin.contains(ALLOWED_HOST)) {
                        // Check Android microphone permission
                        if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                            request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
                        } else {
                            pendingPermissionRequest = request
                            ActivityCompat.requestPermissions(
                                this@MainActivity,
                                arrayOf(Manifest.permission.RECORD_AUDIO),
                                REQUEST_RECORD_AUDIO_PERMISSION
                            )
                        }
                    } else {
                        request.deny()
                    }
                } else {
                    request.deny()
                }
            }

            // Standard console and js dialog handling
            override fun onJsAlert(view: WebView, url: String, message: String, result: JsResult): Boolean {
                Toast.makeText(applicationContext, message, Toast.LENGTH_LONG).show()
                result.confirm()
                return true
            }
        }

        // WebViewClient for navigation rules and loading states
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                return handleNavigationRules(url)
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                return handleNavigationRules(url)
            }

            private fun handleNavigationRules(url: String): Boolean {
                // Stay inside the WebView for AudioFACTORY domains
                if (url.startsWith(PRODUCTION_URL) || url.contains(ALLOWED_HOST)) {
                    return false
                }

                // External URLs like oauth providers, payment gateways must open in system browser
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    return true
                } catch (e: Exception) {
                    Log.e("AudioFACTORY", "Failed to launch external browser for URL: $url", e)
                    return false
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                // Dismiss splash only once we successfully connect and render the live app
                if (webView.visibility != View.VISIBLE) {
                    webView.visibility = View.VISIBLE
                    splashLayout.visibility = View.GONE
                }
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) {
                    showErrorState()
                }
            }
        }

        // Configure DownloadListener for generated audio downloads
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
            if (url.startsWith("http")) {
                try {
                    val request = DownloadManager.Request(Uri.parse(url)).apply {
                        setMimeType(mimetype)
                        addRequestHeader("User-Agent", userAgent)
                        setDescription("Downloading audio from AudioFACTORY...")
                        val fileName = URLUtil.guessFileName(url, contentDisposition, mimetype)
                        setTitle(fileName)
                        setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                        setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
                    }
                    val dm = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
                    dm.enqueue(request)
                    Toast.makeText(applicationContext, "Download started...", Toast.LENGTH_SHORT).show()
                } catch (e: Exception) {
                    Toast.makeText(applicationContext, "Download failed: ${e.message}", Toast.LENGTH_LONG).show()
                }
            } else {
                Toast.makeText(applicationContext, "Downloading non-HTTP resources is not supported natively.", Toast.LENGTH_LONG).show()
            }
        }

        // 2. Initialize Lightweight Native Splash/Loading Screen
        splashLayout = LinearLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0D1117"))
        }

        val logoText = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(16)
            }
            text = "AudioFACTORY"
            setTextColor(Color.parseColor("#F59E0B")) // Premium Amber Accent
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 36f)
            typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
            letterSpacing = 0.05f
        }

        val loaderProgress = ProgressBar(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                dpToPx(48),
                dpToPx(48)
            ).apply {
                bottomMargin = dpToPx(16)
            }
            // Stylize progress loader using the amber brand color
            indeterminateDrawable?.setColorFilter(Color.parseColor("#F59E0B"), android.graphics.PorterDuff.Mode.SRC_IN)
        }

        val loadingLabel = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            text = "CONNECTING TO STUDIO..."
            setTextColor(Color.parseColor("#8B949E"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f)
            typeface = Typeface.MONOSPACE
            letterSpacing = 0.1f
        }

        splashLayout.addView(logoText)
        splashLayout.addView(loaderProgress)
        splashLayout.addView(loadingLabel)

        // 3. Initialize Error/Offline Screen
        errorLayout = LinearLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0D1117"))
            visibility = View.GONE
        }

        val errorHeader = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(8)
            }
            text = "CONNECTION_LOST"
            setTextColor(Color.parseColor("#EF4444")) // Red warning alert
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
            typeface = Typeface.MONOSPACE
            letterSpacing = 0.05f
        }

        val errorBody = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                dpToPx(280),
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(24)
            }
            text = "AudioFACTORY couldn't connect to Vercel production server. Please check your network connectivity."
            setTextColor(Color.parseColor("#8B949E"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            gravity = Gravity.CENTER
            lineHeight = dpToPx(18)
        }

        val buttonContainer = LinearLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            orientation = LinearLayout.HORIZONTAL
        }

        val retryButton = Button(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                rightMargin = dpToPx(12)
            }
            text = "RETRY"
            setTextColor(Color.BLACK)
            setBackgroundColor(Color.parseColor("#F59E0B")) // Premium Amber Button
            typeface = Typeface.MONOSPACE
            setOnClickListener {
                hideErrorState()
                webView.reload()
            }
        }

        val browserButton = Button(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            text = "BROWSER"
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#21262D"))
            typeface = Typeface.MONOSPACE
            setOnClickListener {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(PRODUCTION_URL))
                    startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(applicationContext, "Cannot open browser", Toast.LENGTH_SHORT).show()
                }
            }
        }

        buttonContainer.addView(retryButton)
        buttonContainer.addView(browserButton)

        errorLayout.addView(errorHeader)
        errorLayout.addView(errorBody)
        errorLayout.addView(buttonContainer)

        // Assemble programmatically structured layers in root FrameLayout
        rootLayout.addView(webView)
        rootLayout.addView(splashLayout)
        rootLayout.addView(errorLayout)

        setContentView(rootLayout)
    }

    private fun showErrorState() {
        webView.visibility = View.INVISIBLE
        splashLayout.visibility = View.GONE
        errorLayout.visibility = View.VISIBLE
    }

    private fun hideErrorState() {
        errorLayout.visibility = View.GONE
        splashLayout.visibility = View.VISIBLE
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_RECORD_AUDIO_PERMISSION) {
            val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
            if (granted) {
                pendingPermissionRequest?.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
            } else {
                pendingPermissionRequest?.deny()
                Toast.makeText(applicationContext, "Microphone access is required for audio recording.", Toast.LENGTH_LONG).show()
            }
            pendingPermissionRequest = null
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onDestroy() {
        rootLayout.removeAllViews()
        webView.destroy()
        super.onDestroy()
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            resources.displayMetrics
        ).toInt()
    }
}
