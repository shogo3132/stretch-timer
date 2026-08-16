package com.shogo.stretchtimer;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.ContentValues;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.CookieManager;
import android.webkit.SafeBrowsingResponse;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.dropbox.core.oauth.DbxCredential;

import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://shogo3132.github.io/stretch-timer/";
    private static final int FILE_CHOOSER_REQUEST = 501;

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraOutputUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.setStatusBarColor(Color.rgb(247, 248, 250));
        window.setNavigationBarColor(Color.rgb(247, 248, 250));
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.setSystemBarsAppearance(
                        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
                );
            }
        }

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(247, 248, 250));
        webView.setOnApplyWindowInsetsListener((v, insets) -> {
            android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsets.CONSUMED;
        });
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
                String path = uri.getPath() == null ? "" : uri.getPath();

                if ((host.equals("www.dropbox.com") || host.equals("dropbox.com")) && path.startsWith("/oauth2/authorize")) {
                    DropboxSync.startAuth(MainActivity.this);
                    return true;
                }

                if (host.equals("shogo3132.github.io")) return false;

                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {}
                return true;
            }

            @Override
            public void onSafeBrowsingHit(WebView view, WebResourceRequest request, int threatType, SafeBrowsingResponse callback) {
                callback.backToSafety(true);
                Toast.makeText(MainActivity.this, "安全でないページへの移動を停止しました", Toast.LENGTH_LONG).show();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;

                Intent contentIntent;
                try {
                    contentIntent = params.createIntent();
                } catch (Exception e) {
                    contentIntent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    contentIntent.addCategory(Intent.CATEGORY_OPENABLE);
                    contentIntent.setType("image/*");
                }

                Intent cameraIntent = null;
                try {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Images.Media.DISPLAY_NAME, "stretch_" + System.currentTimeMillis() + ".jpg");
                    values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                    cameraOutputUri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                    if (cameraOutputUri != null) {
                        cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraOutputUri);
                        cameraIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    }
                } catch (Exception ignored) {
                    cameraOutputUri = null;
                }

                Intent chooser = new Intent(Intent.ACTION_CHOOSER);
                chooser.putExtra(Intent.EXTRA_INTENT, contentIntent);
                if (cameraIntent != null) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});
                chooser.putExtra(Intent.EXTRA_TITLE, "写真を選択");
                try {
                    startActivityForResult(chooser, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
            }
        });

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_URL);
        }
    }

    private void deliverDropboxCredential(DbxCredential credential) {
        if (credential == null || webView == null) return;
        try {
            JSONObject auth = new JSONObject();
            if (credential.getAccessToken() != null) auth.put("access_token", credential.getAccessToken());
            if (credential.getRefreshToken() != null) auth.put("refresh_token", credential.getRefreshToken());
            if (credential.getExpiresAt() != null) auth.put("expires_at", credential.getExpiresAt());
            String json = JSONObject.quote(auth.toString());
            String js = "localStorage.setItem('stretchTimer.dropboxAuth'," + json + ");"
                    + "sessionStorage.removeItem('dbx_verifier');sessionStorage.removeItem('dbx_state');"
                    + "if(typeof renderSettings==='function'){renderSettings();}else if(typeof renderHome==='function'){renderHome();}";
            webView.evaluateJavascript(js, null);
            Toast.makeText(this, "Dropboxに接続しました", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Toast.makeText(this, "Dropbox接続情報の保存に失敗しました", Toast.LENGTH_LONG).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST || fileCallback == null) return;

        Uri[] result = null;
        if (resultCode == RESULT_OK) {
            if (data != null && data.getData() != null) {
                result = new Uri[]{data.getData()};
                if (cameraOutputUri != null) {
                    try { getContentResolver().delete(cameraOutputUri, null, null); } catch (Exception ignored) {}
                }
            } else if (cameraOutputUri != null) {
                result = new Uri[]{cameraOutputUri};
            }
        } else if (cameraOutputUri != null) {
            try { getContentResolver().delete(cameraOutputUri, null, null); } catch (Exception ignored) {}
        }

        fileCallback.onReceiveValue(result);
        fileCallback = null;
        cameraOutputUri = null;
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
        DbxCredential credential = DropboxSync.captureAuthResult(this);
        if (credential != null) deliverDropboxCredential(credential);
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
