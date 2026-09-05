# ProGuard / R8 rules for AudioFACTORY Capacitor Android Application

# Keep Capacitor Core and Bridge classes
-keep class com.getcapacitor.** { *; }
-keep class com.audiofactory.app.** { *; }

# Google Play Billing Library
-keep class com.android.billingclient.api.** { *; }
-keep interface com.android.billingclient.api.** { *; }

# Keep JavaScript Interface annotations
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Apache Commons / Cordova fallback if used
-dontwarn org.apache.commons.**
-dontwarn com.google.android.gms.**
