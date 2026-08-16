package com.shogo.stretchtimer;

import android.app.AlertDialog;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class HomeActivity extends MainActivity {
    boolean settingsOpen=false;

    @Override Button btn(String s){
        Button b=super.btn(s);
        if(s!=null&&s.contains("削除")){
            b.setTextColor(Color.rgb(174,55,66));
            b.setBackground(bg(Color.rgb(252,236,239),15));
        }
        return b;
    }

    void createNewMenu(){
        Menu m=new Menu();m.id=id();m.name="メニュー"+(menus.size()+1);menus.add(m);save();showMenu(m);
    }

    @Override void showHome(){
        settingsOpen=false;
        currentMenu=null;currentItem=null;
        clear("ホーム",false);

        // App-wide action belongs in the app header.
        action.setVisibility(View.VISIBLE);
        action.setText("⚙");
        action.setTextSize(21);
        action.setMinWidth(dp(48));
        action.setPadding(dp(11),dp(6),dp(11),dp(6));
        action.setContentDescription("設定");
        action.setOnClickListener(v->showSettings());

        // Menu creation belongs next to the My Menu section heading.
        LinearLayout heading=row();
        TextView h=tv("マイメニュー",28);h.setTypeface(Typeface.DEFAULT_BOLD);
        heading.addView(h,new LinearLayout.LayoutParams(0,-2,1));
        Button plus=btn("＋");
        plus.setTextSize(23);plus.setMinHeight(dp(42));plus.setMinWidth(dp(46));plus.setPadding(dp(9),dp(4),dp(9),dp(4));
        plus.setContentDescription("メニューを追加");plus.setOnClickListener(v->createNewMenu());
        heading.addView(plus,new LinearLayout.LayoutParams(dp(48),dp(42)));
        add(heading);

        TextView sub=tv("メニューを選んで開始します。長押しして並び替えできます。",15);
        sub.setTextColor(Color.rgb(110,118,128));sub.setPadding(0,0,0,DropboxSync.isConnected(this)?dp(5):dp(18));add(sub);

        // Manual sync is a secondary action: visible but compact.
        if(DropboxSync.isConnected(this)){
            LinearLayout syncRow=row();
            TextView filler=tv("",1);syncRow.addView(filler,new LinearLayout.LayoutParams(0,1,1));
            Button sync=btn("↻ 同期");
            sync.setTextSize(12);sync.setMinHeight(dp(38));sync.setPadding(dp(11),dp(4),dp(11),dp(4));
            sync.setContentDescription("Dropboxと今すぐ同期");sync.setOnClickListener(v->syncNow(true));
            syncRow.addView(sync,new LinearLayout.LayoutParams(dp(88),dp(38)));
            addM(syncRow,0,14);
        }

        if(menus.isEmpty()){
            TextView e=tv("まだメニューがありません。\n「マイメニュー」横の「＋」から作成してください。",17);
            e.setTextColor(Color.rgb(110,118,128));e.setGravity(Gravity.CENTER);e.setPadding(0,dp(60),0,dp(60));add(e);
        }

        for(Menu m:menus){
            LinearLayout card=new LinearLayout(this);card.setOrientation(LinearLayout.VERTICAL);card.setPadding(dp(18),dp(18),dp(18),dp(18));card.setBackground(bg(Color.WHITE,20));
            LinearLayout top=row();TextView t=tv(m.name,21);t.setTypeface(Typeface.DEFAULT_BOLD);top.addView(t,new LinearLayout.LayoutParams(0,-2,1));
            Button ed=btn("設定");ed.setOnClickListener(v->showMenu(m));top.addView(ed,new LinearLayout.LayoutParams(dp(82),-2));card.addView(top);
            if(!m.desc.trim().isEmpty()){TextView d=tv(m.desc,14);d.setTextColor(Color.rgb(92,100,110));d.setMaxLines(2);d.setPadding(0,dp(2),0,dp(8));card.addView(d);}
            TextView meta=tv(m.items.size()+"項目  ・  休憩 "+m.rest+"秒",14);meta.setTextColor(Color.rgb(110,118,128));meta.setPadding(0,dp(2),0,dp(12));card.addView(meta);
            Button st=btn("▶  このメニューを開始");st.setTextSize(16);st.setTextColor(Color.WHITE);st.setBackground(bg(Color.rgb(39,174,139),16));st.setOnClickListener(v->startTimer(m));card.addView(st,new LinearLayout.LayoutParams(-1,dp(52)));
            enableMenuDrag(card,m);LinearLayout.LayoutParams cp=new LinearLayout.LayoutParams(-1,-2);cp.setMargins(0,0,0,dp(18));content.addView(card,cp);
        }
    }

    void showSettings(){
        settingsOpen=true;currentMenu=null;currentItem=null;
        clear("設定",true);action.setVisibility(View.GONE);

        TextView h=tv("設定",28);h.setTypeface(Typeface.DEFAULT_BOLD);h.setPadding(0,dp(2),0,dp(18));add(h);

        LinearLayout card=new LinearLayout(this);card.setOrientation(LinearLayout.VERTICAL);card.setPadding(dp(18),dp(18),dp(18),dp(18));card.setBackground(bg(Color.WHITE,20));
        TextView title=tv("Dropbox 同期",20);title.setTypeface(Typeface.DEFAULT_BOLD);card.addView(title);
        boolean connected=DropboxSync.isConnected(this);
        TextView status=tv(connected?"接続済み":"未接続",15);status.setTextColor(connected?Color.rgb(39,174,139):Color.rgb(110,118,128));status.setPadding(0,dp(2),0,dp(5));card.addView(status);
        TextView desc=tv(connected?"メニューや写真は変更後に自動同期されます。PC側で編集した直後などは「今すぐ同期」を使えます。":"Dropboxに接続すると、スマホとPCで同じメニュー・項目・写真を利用できます。",14);
        desc.setTextColor(Color.rgb(92,100,110));desc.setPadding(0,0,0,dp(12));card.addView(desc);

        if(connected){
            TextView last=tv("最終同期："+lastSyncText(),13);last.setTextColor(Color.rgb(120,128,138));last.setPadding(0,0,0,dp(12));card.addView(last);
            Button now=btn("↻  今すぐ同期");now.setTextColor(Color.WHITE);now.setBackground(bg(Color.rgb(39,174,139),15));now.setOnClickListener(v->syncNow(true));card.addView(now,new LinearLayout.LayoutParams(-1,dp(50)));
            Button off=btn("Dropbox連携を解除");off.setOnClickListener(v->new AlertDialog.Builder(this).setMessage("Dropboxとの接続を解除しますか？\n端末内のメニューや写真は残ります。").setPositiveButton("解除",(d,w)->{DropboxSync.disconnect(this);showSettings();}).setNegativeButton("キャンセル",null).show());
            LinearLayout.LayoutParams op=new LinearLayout.LayoutParams(-1,-2);op.setMargins(0,dp(12),0,0);card.addView(off,op);
        }else{
            Button connect=btn("Dropboxと接続");connect.setTextColor(Color.WHITE);connect.setBackground(bg(Color.rgb(39,174,139),15));connect.setOnClickListener(v->DropboxSync.startAuth(this));card.addView(connect,new LinearLayout.LayoutParams(-1,dp(50)));
        }
        add(card);

        TextView note=tv("同期は普段、自動で行われます。ホームの小さな「↻ 同期」は、手動で最新版を確認したいときだけ使えば大丈夫です。",13);
        note.setTextColor(Color.rgb(120,128,138));note.setPadding(dp(2),dp(14),dp(2),0);add(note);
    }

    String lastSyncText(){
        long t=DropboxSync.getLastSync(this);if(t<=0)return "まだありません";
        return new SimpleDateFormat("yyyy/MM/dd HH:mm", Locale.JAPAN).format(new Date(t));
    }

    @Override void goBack(){
        if(settingsOpen){settingsOpen=false;showHome();return;}
        super.goBack();
    }
}
