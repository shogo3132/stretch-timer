package com.shogo.stretchtimer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ScheduledNotificationBootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        ScheduledNotificationStore.restore(context);
    }
}
