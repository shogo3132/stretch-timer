package com.shogo.stretchtimer;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.content.pm.PackageManager;

public class ScheduledNotificationReceiver extends BroadcastReceiver {
    private static final String CHANNEL_ID = "stretch_schedule";

    @Override public void onReceive(Context context, Intent intent) {
        if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        createChannel(context);
        String title = intent.getStringExtra("title");
        if (title == null || title.length() == 0) title = "予定の時間です";
        String body = intent.getStringExtra("body");
        if (body == null || body.length() == 0) body = "Stretch Timerの予定です";
        Intent open = new Intent(context, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content = PendingIntent.getActivity(context, 901, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification.Builder notification = new android.app.Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(com.shogo.stretchtimer.R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(android.app.Notification.PRIORITY_HIGH)
                .setCategory(android.app.Notification.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .setContentIntent(content);
        ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE)).notify(intent.getAction().hashCode(), notification.build());
    }

    private void createChannel(Context context) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "予定の通知", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("タイムテーブルの開始時刻をお知らせします");
        ((NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE)).createNotificationChannel(channel);
    }
}
