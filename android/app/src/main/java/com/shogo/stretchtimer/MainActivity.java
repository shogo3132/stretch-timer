package com.shogo.stretchtimer;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.app.PendingIntent;
import android.app.PictureInPictureParams;
import android.app.RemoteAction;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.ContentValues;
import android.content.IntentFilter;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.drawable.Icon;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Rational;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.SafeBrowsingResponse;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.dropbox.core.DbxRequestConfig;
import com.dropbox.core.android.Auth;
import com.dropbox.core.oauth.DbxCredential;

import org.json.JSONObject;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://shogo3132.github.io/stretch-timer/";
    private static final String DROPBOX_APP_KEY = "yf8bmab58g823cb";
    private static final int FILE_CHOOSER_REQUEST = 501;
    private static final String ACTION_PIP_TOGGLE = "com.shogo.stretchtimer.PIP_TOGGLE";

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraOutputUri;
    private boolean nativeDropboxPending = false;
    private boolean timerActive = false;
    private boolean timerCompleted = false;
    private boolean timerPaused = false;
    private boolean suppressPipOnce = false;
    private boolean pipModeSeen = false;

    private final BroadcastReceiver pipActionReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent != null && ACTION_PIP_TOGGLE.equals(intent.getAction())) runPipAction("toggle");
        }
    };

    private final class TimerBridge {
        @JavascriptInterface
        public void updateTimerState(String raw) {
            try {
                JSONObject value = new JSONObject(raw == null ? "{}" : raw);
                boolean active = value.optBoolean("active", false);
                boolean completed = value.optBoolean("completed", false);
                boolean paused = value.optBoolean("paused", false);
                runOnUiThread(() -> {
                    timerActive = active;
                    timerCompleted = completed;
                    timerPaused = paused;
                    updatePictureInPictureParams();
                });
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.rgb(247, 248, 250));
        getWindow().setNavigationBarColor(Color.rgb(247, 248, 250));
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        );

        FrameLayout shell = new FrameLayout(this);
        shell.setBackgroundColor(Color.rgb(247, 248, 250));
        shell.setOnApplyWindowInsetsListener((v, insets) -> {
            android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout()
            );
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
        });

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(247, 248, 250));
        webView.addJavascriptInterface(new TimerBridge(), "StretchTimerNative");
        shell.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        setContentView(shell);
        shell.requestApplyInsets();

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
        settings.setUserAgentString(settings.getUserAgentString() + " StretchTimerApp/0.12.16");

        IntentFilter pipFilter = new IntentFilter(ACTION_PIP_TOGGLE);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(pipActionReceiver, pipFilter, Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(pipActionReceiver, pipFilter);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();
                String path = uri.getPath() == null ? "" : uri.getPath();

                if ((host.equals("www.dropbox.com") || host.equals("dropbox.com"))
                        && path.startsWith("/oauth2/authorize")) {
                    startDropboxBrowserAuth();
                    return true;
                }

                if (isYouTubeHost(host)) {
                    openYouTube(uri);
                    return true;
                }

                if (host.equals("shogo3132.github.io") || host.equals("www.dropbox.com") || host.equals("dropbox.com")) {
                    return false;
                }
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
                cameraOutputUri = null;

                boolean wantsImage = acceptsImages(params);
                boolean wantsVideo = acceptsVideos(params);

                Intent contentIntent;
                if (wantsImage) {
                    try {
                        contentIntent = params.createIntent();
                    } catch (Exception e) {
                        contentIntent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                        contentIntent.addCategory(Intent.CATEGORY_OPENABLE);
                        contentIntent.setType("image/*");
                    }
                } else if (wantsVideo) {
                    contentIntent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    contentIntent.addCategory(Intent.CATEGORY_OPENABLE);
                    contentIntent.setType("video/*");
                    contentIntent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"video/mp4", "video/webm"});
                } else {
                    contentIntent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    contentIntent.addCategory(Intent.CATEGORY_OPENABLE);
                    contentIntent.setType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                }

                Intent cameraIntent = null;
                if (wantsImage) {
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
                }

                Intent chooser = new Intent(Intent.ACTION_CHOOSER);
                chooser.putExtra(Intent.EXTRA_INTENT, contentIntent);
                if (cameraIntent != null) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cameraIntent});
                chooser.putExtra(Intent.EXTRA_TITLE, wantsImage ? "写真を選択" : wantsVideo ? "動画を選択" : "Excelファイルを選択");
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

    private boolean acceptsImages(WebChromeClient.FileChooserParams params) {
        try {
            String[] acceptTypes = params == null ? null : params.getAcceptTypes();
            if (acceptTypes == null) return false;
            for (String acceptType : acceptTypes) {
                if (acceptType == null) continue;
                String value = acceptType.toLowerCase();
                if (value.contains("image/") || value.contains(".jpg") || value.contains(".jpeg")
                        || value.contains(".png") || value.contains(".webp") || value.contains(".gif")) {
                    return true;
                }
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    private boolean acceptsVideos(WebChromeClient.FileChooserParams params) {
        try {
            String[] acceptTypes = params == null ? null : params.getAcceptTypes();
            if (acceptTypes == null) return false;
            for (String acceptType : acceptTypes) {
                if (acceptType == null) continue;
                String value = acceptType.toLowerCase();
                if (value.contains("video/") || value.contains(".mp4") || value.contains(".webm")) return true;
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    private PictureInPictureParams buildPictureInPictureParams() {
        PictureInPictureParams.Builder builder = new PictureInPictureParams.Builder()
                .setAspectRatio(new Rational(16, 9));
        List<RemoteAction> actions = new ArrayList<>();
        if (timerActive && !timerCompleted) {
            Intent toggleIntent = new Intent(ACTION_PIP_TOGGLE).setPackage(getPackageName());
            PendingIntent pending = PendingIntent.getBroadcast(
                    this,
                    700,
                    toggleIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            int iconId = timerPaused ? android.R.drawable.ic_media_play : android.R.drawable.ic_media_pause;
            String label = timerPaused ? "再開" : "一時停止";
            actions.add(new RemoteAction(Icon.createWithResource(this, iconId), label, label, pending));
        }
        builder.setActions(actions);
        if (Build.VERSION.SDK_INT >= 31) {
            builder.setAutoEnterEnabled(timerActive && !suppressPipOnce);
            builder.setSeamlessResizeEnabled(false);
        }
        return builder.build();
    }

    private void updatePictureInPictureParams() {
        if (Build.VERSION.SDK_INT < 26) return;
        try { setPictureInPictureParams(buildPictureInPictureParams()); } catch (Exception ignored) {}
    }

    private void runPipAction(String action) {
        if (webView == null) return;
        String safeAction = JSONObject.quote(action == null ? "" : action);
        webView.evaluateJavascript(
                "if(typeof window.__stretchTimerPipActionV96==='function'){window.__stretchTimerPipActionV96(" + safeAction + ");}",
                null
        );
    }

    private void notifyWebPictureInPictureMode(boolean enabled) {
        if (webView == null) return;
        webView.evaluateJavascript(
                "if(typeof window.__stretchTimerSetPipModeV96==='function'){window.__stretchTimerSetPipModeV96(" + enabled + ");}",
                null
        );
    }

    private boolean isYouTubeHost(String host) {
        return host.equals("youtu.be") || host.equals("youtube.com") || host.endsWith(".youtube.com")
                || host.equals("youtube-nocookie.com") || host.endsWith(".youtube-nocookie.com");
    }

    private void openYouTube(Uri uri) {
        suppressPipOnce = true;
        updatePictureInPictureParams();
        Intent appIntent = new Intent(Intent.ACTION_VIEW, uri);
        appIntent.setPackage("com.google.android.youtube");
        try {
            startActivity(appIntent);
            return;
        } catch (ActivityNotFoundException ignored) {
        }
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception e) {
            Toast.makeText(this, "参考動画を開けませんでした", Toast.LENGTH_LONG).show();
        }
    }

    private void startDropboxBrowserAuth() {
        try {
            nativeDropboxPending = true;
            Auth.startOAuth2PKCE(
                    this,
                    DROPBOX_APP_KEY,
                    DbxRequestConfig.newBuilder("stretch-timer/0.12.16").build(),
                    Arrays.asList("files.metadata.read", "files.content.read", "files.content.write")
            );
        } catch (Exception e) {
            nativeDropboxPending = false;
            Toast.makeText(this, "Dropboxログインを開けませんでした", Toast.LENGTH_LONG).show();
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
                    + "if(typeof renderSettings==='function'){renderSettings();}"
                    + "if(typeof syncNow==='function'){setTimeout(function(){syncNow(false);},300);}";
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

    private void performSystemBackFallback() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }

        webView.evaluateJavascript(
                "(function(){var b=document.getElementById('backBtn');"
                        + "if(b&&getComputedStyle(b).display!=='none'){b.click();return true;}"
                        + "return false;})()",
                result -> {
                    if (!"true".equals(result)) performSystemBackFallback();
                }
        );
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
        if (!isInPictureInPictureMode()) {
            suppressPipOnce = false;
            pipModeSeen = false;
            notifyWebPictureInPictureMode(false);
            updatePictureInPictureParams();
        }
        if (!nativeDropboxPending) return;
        try {
            DbxCredential credential = Auth.getDbxCredential();
            if (credential != null) {
                nativeDropboxPending = false;
                deliverDropboxCredential(credential);
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (Build.VERSION.SDK_INT >= 26 && Build.VERSION.SDK_INT < 31 && timerActive && !suppressPipOnce) {
            try { enterPictureInPictureMode(buildPictureInPictureParams()); } catch (Exception ignored) {}
        }
    }

    @Override
    public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
        if (isInPictureInPictureMode) pipModeSeen = true;
        notifyWebPictureInPictureMode(isInPictureInPictureMode);
    }

    @Override
    protected void onPause() {
        if (webView != null && !timerActive && !isInPictureInPictureMode()) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onStop() {
        if (pipModeSeen && timerActive && !timerPaused && !isInPictureInPictureMode()) runPipAction("toggle");
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        try { unregisterReceiver(pipActionReceiver); } catch (Exception ignored) {}
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
