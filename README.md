# Android WebView

Проект предназначен для открытия в AndroidIDE или Android Studio.

1. Скопируйте актуальную версию HTML/CSS/JS в WebView assets:
   `powershell -ExecutionPolicy Bypass -File .\sync-assets.ps1`
2. Откройте папку `android` в AndroidIDE.
3. Дождитесь синхронизации Gradle и соберите APK через **Build APK**.
4. Установите APK на устройство.

Приложение использует `WebViewAssetLoader`, локальные assets и сохранение браузера. JavaScript, доступ к файлам и содержимому отключены; разрешён только локальный набор ресурсов и HTTPS для Google Fonts.
