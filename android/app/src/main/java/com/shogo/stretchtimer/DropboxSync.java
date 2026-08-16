package com.shogo.stretchtimer;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;

import com.dropbox.core.DbxRequestConfig;
import com.dropbox.core.android.Auth;
import com.dropbox.core.oauth.DbxCredential;

import java.util.Arrays;

final class DropboxSync {
    static final String APP_KEY = "yf8bmab58g823cb";
    private static final String PREF = "dropbox_native_auth";
    private static final String K_PENDING = "pending";

    private DropboxSync() {}

    static DbxRequestConfig config() {
        return DbxRequestConfig.newBuilder("stretch-timer/0.12.3").build();
    }

    static void startAuth(Activity activity) {
        activity.getSharedPreferences(PREF, Context.MODE_PRIVATE)
                .edit().putBoolean(K_PENDING, true).apply();
        try {
            Auth.startOAuth2PKCE(
                    activity,
                    APP_KEY,
                    config(),
                    Arrays.asList("files.metadata.read", "files.content.read", "files.content.write")
            );
        } catch (Exception e) {
            clearPending(activity);
            throw e;
        }
    }

    static DbxCredential captureAuthResult(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREF, Context.MODE_PRIVATE);
        if (!p.getBoolean(K_PENDING, false)) return null;
        try {
            DbxCredential credential = Auth.getDbxCredential();
            if (credential == null) return null;
            p.edit().putBoolean(K_PENDING, false).apply();
            return credential;
        } catch (Exception e) {
            p.edit().putBoolean(K_PENDING, false).apply();
            return null;
        }
    }

    static void clearPending(Context context) {
        context.getSharedPreferences(PREF, Context.MODE_PRIVATE)
                .edit().putBoolean(K_PENDING, false).apply();
    }
}
