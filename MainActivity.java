package com.ciferki.simgenerator;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import android.app.Activity;
import androidx.webkit.WebViewAssetLoader;

public final class MainActivity extends Activity {
  private WebView webView;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    webView = new WebView(this);
    WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
        .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
        .build();
    webView.setWebViewClient(new WebViewClient() {
      @Override
      public android.webkit.WebResourceResponse shouldInterceptRequest(
          WebView view, android.webkit.WebResourceRequest request) {
        return assetLoader.shouldInterceptRequest(request.getUrl());
      }
    });

    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(false);
    settings.setAllowContentAccess(false);
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    setContentView(webView);
    webView.loadUrl("https://appassets.androidplatform.net/assets/game.html");
  }

  @Override
  public void onBackPressed() {
    if (webView != null && webView.canGoBack()) {
      webView.goBack();
      return;
    }
    super.onBackPressed();
  }
}
