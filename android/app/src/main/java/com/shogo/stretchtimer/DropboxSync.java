package com.shogo.stretchtimer;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;

import com.dropbox.core.DbxRequestConfig;
import com.dropbox.core.android.Auth;
import com.dropbox.core.oauth.DbxCredential;
import com.dropbox.core.v2.DbxClientV2;
import com.dropbox.core.v2.files.DownloadErrorException;
import com.dropbox.core.v2.files.WriteMode;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

final class DropboxSync {
    static final String APP_KEY = "yf8bmab58g823cb";
    static final String REMOTE_PATH = "/data.json";
    private static final String PREF = "dropbox_sync";
    private static final String K_ACCESS = "access";
    private static final String K_REFRESH = "refresh";
    private static final String K_EXPIRES = "expires";
    private static final String K_AUTH_PENDING = "auth_pending";
    private static final String K_LAST_SYNC = "last_sync";

    private DropboxSync() {}

    static DbxRequestConfig config() {
        return DbxRequestConfig.newBuilder("stretch-timer/0.8").build();
    }

    static void startAuth(Activity activity) {
        activity.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().putBoolean(K_AUTH_PENDING, true).apply();
        Auth.startOAuth2PKCE(
                activity,
                APP_KEY,
                config(),
                Arrays.asList("files.metadata.read", "files.content.read", "files.content.write")
        );
    }

    static boolean captureAuthResult(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        if (!p.getBoolean(K_AUTH_PENDING, false)) return false;
        DbxCredential c = Auth.getDbxCredential();
        if (c == null) return false;
        p.edit()
                .putBoolean(K_AUTH_PENDING, false)
                .putString(K_ACCESS, c.getAccessToken() == null ? "" : c.getAccessToken())
                .putString(K_REFRESH, c.getRefreshToken() == null ? "" : c.getRefreshToken())
                .putLong(K_EXPIRES, c.getExpiresAt() == null ? 0L : c.getExpiresAt())
                .apply();
        return true;
    }

    static boolean isConnected(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        return !p.getString(K_ACCESS, "").isEmpty() || !p.getString(K_REFRESH, "").isEmpty();
    }

    static void disconnect(Context context) {
        context.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().clear().apply();
    }

    static long getLastSync(Context context) {
        return context.getSharedPreferences(PREF, Context.MODE_PRIVATE).getLong(K_LAST_SYNC, 0L);
    }

    static void setLastSync(Context context, long t) {
        context.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().putLong(K_LAST_SYNC, t).apply();
    }

    static DbxClientV2 client(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        String access = p.getString(K_ACCESS, "");
        String refresh = p.getString(K_REFRESH, "");
        long expires = p.getLong(K_EXPIRES, 0L);
        DbxCredential credential;
        if (!refresh.isEmpty()) {
            credential = new DbxCredential(access, expires > 0 ? expires : null, refresh, APP_KEY);
        } else {
            credential = new DbxCredential(access);
        }
        return new DbxClientV2(config(), credential);
    }

    static String download(Context context) throws Exception {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            client(context).files().download(REMOTE_PATH).download(out);
            return out.toString(StandardCharsets.UTF_8.name());
        } catch (DownloadErrorException e) {
            if (e.errorValue != null && e.errorValue.isPath() && e.errorValue.getPathValue().isNotFound()) return null;
            throw e;
        }
    }

    static void upload(Context context, String json) throws Exception {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ByteArrayInputStream in = new ByteArrayInputStream(bytes);
        client(context).files().uploadBuilder(REMOTE_PATH)
                .withMode(WriteMode.OVERWRITE)
                .withAutorename(false)
                .withMute(true)
                .uploadAndFinish(in);
    }
}
