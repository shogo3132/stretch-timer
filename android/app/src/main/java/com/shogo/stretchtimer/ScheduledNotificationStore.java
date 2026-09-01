package com.shogo.stretchtimer;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/** Stores the WebView's upcoming timetable notifications and restores them after restart. */
public final class ScheduledNotificationStore {
    private static final String PREFS = "scheduled_notifications";
    private static final String KEY_ITEMS = "items";

    private ScheduledNotificationStore() {}

    public static void sync(Context context, JSONArray incoming) {
        cancelStored(context);
        JSONArray kept = new JSONArray();
        long now = System.currentTimeMillis();
        for (int i = 0; i < incoming.length(); i++) {
            JSONObject item = incoming.optJSONObject(i);
            if (item == null) continue;
            long at = item.optLong("at", 0);
            String id = item.optString("id", "");
            if (at <= now || id.length() == 0) continue;
            kept.put(item);
            schedule(context, item);
        }
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY_ITEMS, kept.toString()).apply();
    }

    public static void restore(Context context) {
        String raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_ITEMS, "[]");
        try { sync(context, new JSONArray(raw)); } catch (Exception ignored) { sync(context, new JSONArray()); }
    }

    private static void cancelStored(Context context) {
        String raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_ITEMS, "[]");
        try {
            JSONArray items = new JSONArray(raw);
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.optJSONObject(i);
                if (item != null) {
                    PendingIntent pending = pending(context, item, PendingIntent.FLAG_NO_CREATE);
                    if (pending != null) alarm(context).cancel(pending);
                }
            }
        } catch (Exception ignored) {}
    }

    private static void schedule(Context context, JSONObject item) {
        long at = item.optLong("at", 0);
        PendingIntent pending = pending(context, item, PendingIntent.FLAG_UPDATE_CURRENT);
        AlarmManager manager = alarm(context);
        if (Build.VERSION.SDK_INT >= 31 && manager.canScheduleExactAlarms()) {
            manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending);
        } else if (Build.VERSION.SDK_INT >= 23) {
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pending);
        } else {
            manager.set(AlarmManager.RTC_WAKEUP, at, pending);
        }
    }

    private static AlarmManager alarm(Context context) {
        return (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    }

    private static PendingIntent pending(Context context, JSONObject item, int behavior) {
        String id = item.optString("id", "");
        Intent intent = new Intent(context, ScheduledNotificationReceiver.class);
        intent.setAction("com.shogo.stretchtimer.SCHEDULED_NOTIFICATION." + id);
        intent.putExtra("title", item.optString("title", "予定の時間です"));
        intent.putExtra("body", item.optString("body", "Stretch Timerの予定です"));
        return PendingIntent.getBroadcast(context, id.hashCode(), intent, behavior | PendingIntent.FLAG_IMMUTABLE);
    }
}
