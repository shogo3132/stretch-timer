package com.shogo.stretchtimer;

import android.app.*;
import android.os.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.*;
import android.graphics.drawable.*;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.net.Uri;
import android.provider.MediaStore;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.util.*;

public class MainActivity extends Activity {
    static class Item { String id,name,desc,photo=""; int seconds=30; }
    static class Menu { String id,name; int rest=10; ArrayList<Item> items=new ArrayList<>(); }

    static class CircularTimerView extends View {
        Paint track=new Paint(1), progress=new Paint(1), text=new Paint(1), sub=new Paint(1);
        float fraction=0f; String seconds="0", label="";
        CircularTimerView(Context c){ super(c); track.setStyle(Paint.Style.STROKE); track.setStrokeCap(Paint.Cap.ROUND); track.setColor(Color.rgb(55,62,74)); progress.setStyle(Paint.Style.STROKE); progress.setStrokeCap(Paint.Cap.ROUND); progress.setColor(Color.rgb(87,220,187)); text.setTextAlign(Paint.Align.CENTER); text.setColor(Color.WHITE); text.setTypeface(Typeface.create(Typeface.DEFAULT,Typeface.BOLD)); sub.setTextAlign(Paint.Align.CENTER); sub.setColor(Color.rgb(172,181,195)); }
        void setState(long remain,long total,String l){ fraction=total<=0?0f:Math.max(0f,Math.min(1f,1f-(float)remain/(float)total)); seconds=""+(int)Math.ceil(remain/1000.0); label=l; invalidate(); }
        @Override protected void onDraw(Canvas c){ super.onDraw(c); float w=getWidth(),h=getHeight(),cx=w/2f,cy=h/2f; float sw=Math.max(14f,w*.045f),r=Math.min(w,h)*.37f; track.setStrokeWidth(sw);progress.setStrokeWidth(sw); RectF oval=new RectF(cx-r,cy-r,cx+r,cy+r); c.drawArc(oval,-90,360,false,track); c.drawArc(oval,-90,360*fraction,false,progress); text.setTextSize(w*.22f); sub.setTextSize(w*.055f); c.drawText(seconds,cx,cy+w*.065f,text); c.drawText(label,cx,cy+w*.18f,sub); }
    }

    ArrayList<Menu> menus=new ArrayList<>(); Menu currentMenu; Item currentItem;
    LinearLayout root,content; ScrollView scroll; TextView barTitle; Button back,action;
    CountDownTimer timer; boolean paused=false,restPhase=false; long remainingMs,totalPhaseMs; int timerIndex=0,lastBeep=-1;
    Uri pendingCameraUri; ToneGenerator tone;
    final int PICK_IMAGE=10, TAKE_PHOTO=11, REQ_CAMERA=12;

    @Override public void onCreate(Bundle b){ super.onCreate(b); tone=new ToneGenerator(AudioManager.STREAM_MUSIC,70); load(); buildShell(); showHome(); }
    @Override protected void onDestroy(){ stopTimer(); if(tone!=null)tone.release(); super.onDestroy(); }
    String id(){ return UUID.randomUUID().toString(); }
    int dp(int n){ return (int)(n*getResources().getDisplayMetrics().density+.5f); }
    TextView tv(String s,int sp){ TextView v=new TextView(this); v.setText(s); v.setTextSize(sp); v.setTextColor(Color.rgb(27,31,36)); v.setPadding(0,dp(8),0,dp(8)); return v; }
    Button btn(String s){ Button b=new Button(this); b.setText(s); b.setTextAllCaps(false); b.setTextSize(14); b.setMinHeight(dp(44)); b.setBackground(bg(Color.rgb(234,238,242),14)); return b; }
    EditText field(String s){ EditText e=new EditText(this); e.setHint(s); e.setTextSize(18); e.setPadding(dp(14),dp(12),dp(14),dp(12)); e.setBackground(bg(Color.WHITE,14)); return e; }
    LinearLayout row(){ LinearLayout l=new LinearLayout(this); l.setOrientation(LinearLayout.HORIZONTAL); return l; }
    void add(View v){ content.addView(v,new LinearLayout.LayoutParams(-1,-2)); }
    GradientDrawable bg(int color,float radius){ GradientDrawable g=new GradientDrawable();g.setColor(color);g.setCornerRadius(dp((int)radius));return g; }

    void buildShell(){
        root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(Color.rgb(247,248,250));
        root.setOnApplyWindowInsetsListener((v,in)->{ android.graphics.Insets x=in.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout()); v.setPadding(x.left,x.top,x.right,x.bottom); return in; });
        LinearLayout bar=row(); bar.setGravity(Gravity.CENTER_VERTICAL); bar.setPadding(dp(8),dp(6),dp(8),dp(6)); bar.setBackgroundColor(Color.WHITE);
        back=btn("←"); back.setOnClickListener(v->goBack()); bar.addView(back,new LinearLayout.LayoutParams(dp(62),-2));
        barTitle=tv("ストレッチ",22); barTitle.setTypeface(Typeface.DEFAULT_BOLD); LinearLayout.LayoutParams tp=new LinearLayout.LayoutParams(0,-2,1); bar.addView(barTitle,tp);
        action=btn("＋ メニュー"); bar.addView(action,new LinearLayout.LayoutParams(-2,-2)); root.addView(bar,new LinearLayout.LayoutParams(-1,-2));
        scroll=new ScrollView(this); content=new LinearLayout(this); content.setOrientation(LinearLayout.VERTICAL); content.setPadding(dp(18),dp(14),dp(18),dp(30)); scroll.addView(content); root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1)); setContentView(root);
    }
    void clear(String title,boolean showBack){ getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON); root.setBackgroundColor(Color.rgb(247,248,250));scroll.setBackgroundColor(Color.TRANSPARENT);barTitle.setText(title);barTitle.setTextColor(Color.rgb(27,31,36));back.setVisibility(showBack?View.VISIBLE:View.GONE);content.removeAllViews();content.setPadding(dp(18),dp(14),dp(18),dp(30)); }

    void showHome(){
        currentMenu=null;currentItem=null;clear("ホーム",false);action.setVisibility(View.VISIBLE);action.setText("＋ メニュー");
        action.setOnClickListener(v->{Menu m=new Menu();m.id=id();m.name="メニュー"+(menus.size()+1);menus.add(m);save();showMenu(m);});
        TextView intro=tv("マイメニュー",28);intro.setTypeface(Typeface.DEFAULT_BOLD);add(intro);
        TextView sub=tv("メニューを選んで開始します。",15);sub.setTextColor(Color.rgb(110,118,128));sub.setPadding(0,0,0,dp(18));add(sub);
        if(menus.isEmpty()){TextView empty=tv("まだメニューがありません。\n右上の「＋ メニュー」から作成してください。",17);empty.setTextColor(Color.rgb(110,118,128));empty.setGravity(Gravity.CENTER);empty.setPadding(0,dp(70),0,dp(70));add(empty);}
        for(Menu m:menus){
            LinearLayout card=new LinearLayout(this);card.setOrientation(LinearLayout.VERTICAL);card.setPadding(dp(18),dp(16),dp(18),dp(16));card.setBackground(bg(Color.WHITE,20));
            LinearLayout top=row();top.setGravity(Gravity.CENTER_VERTICAL);
            TextView t=tv(m.name,21);t.setTypeface(Typeface.DEFAULT_BOLD);top.addView(t,new LinearLayout.LayoutParams(0,-2,1));
            Button ed=btn("設定");ed.setOnClickListener(v->showMenu(m));top.addView(ed,new LinearLayout.LayoutParams(dp(78),-2));card.addView(top);
            TextView meta=tv(m.items.size()+"項目  ・  休憩 "+m.rest+"秒",14);meta.setTextColor(Color.rgb(110,118,128));meta.setPadding(0,0,0,dp(8));card.addView(meta);
            Button st=btn("▶  このメニューを開始");st.setTextSize(16);st.setTextColor(Color.WHITE);st.setBackground(bg(Color.rgb(39,174,139),16));st.setOnClickListener(v->startTimer(m));LinearLayout.LayoutParams sp=new LinearLayout.LayoutParams(-1,-2);sp.setMargins(0,dp(10),0,0);card.addView(st,sp);
            LinearLayout.LayoutParams cp=new LinearLayout.LayoutParams(-1,-2);cp.setMargins(0,0,0,dp(16));content.addView(card,cp);
        }
    }

    void showMenu(Menu m){ currentMenu=m;currentItem=null;clear("メニュー設定",true);action.setVisibility(View.GONE);
        TextView h=tv("メニュー",26);h.setTypeface(Typeface.DEFAULT_BOLD);add(h);
        add(tv("メニュー名",14));EditText name=field("例：朝の運動");name.setText(m.name);add(name);
        add(tv("項目間の休憩時間（秒）",14));EditText rest=field("例：10");rest.setInputType(2);rest.setText(""+m.rest);add(rest);
        Runnable saveMenu=()->{m.name=name.getText().toString().trim().isEmpty()?"名称未設定":name.getText().toString().trim();try{m.rest=Math.max(0,Integer.parseInt(rest.getText().toString()));}catch(Exception e){}save();};name.setOnFocusChangeListener((v,f)->{if(!f)saveMenu.run();});rest.setOnFocusChangeListener((v,f)->{if(!f)saveMenu.run();});
        LinearLayout r=row();Button ai=btn("＋ 項目追加"),st=btn("▶ このメニューを開始");ai.setOnClickListener(v->{saveMenu.run();Item x=new Item();x.id=id();x.name="新しい項目";m.items.add(x);save();showItem(x);});st.setTextColor(Color.WHITE);st.setBackground(bg(Color.rgb(39,174,139),14));st.setOnClickListener(v->{saveMenu.run();startTimer(m);});r.addView(ai,new LinearLayout.LayoutParams(0,-2,1));r.addView(st,new LinearLayout.LayoutParams(0,-2,1));add(r);
        TextView ih=tv("項目",22);ih.setTypeface(Typeface.DEFAULT_BOLD);ih.setPadding(0,dp(22),0,dp(8));add(ih);
        if(m.items.isEmpty())add(tv("項目がありません。例：屈伸、アキレス腱伸ばし など",16));
        for(int i=0;i<m.items.size();i++){Item x=m.items.get(i);LinearLayout ir=row();ir.setGravity(Gravity.CENTER_VERTICAL);ir.setPadding(dp(10),dp(8),dp(6),dp(8));ir.setBackground(bg(Color.WHITE,14));ImageView im=new ImageView(this);im.setScaleType(ImageView.ScaleType.CENTER_CROP);setImage(im,x.photo);ir.addView(im,new LinearLayout.LayoutParams(dp(76),dp(76)));TextView tx=tv((i+1)+".  "+x.name+"\n     "+x.seconds+"秒",17);ir.addView(tx,new LinearLayout.LayoutParams(0,-2,1));Button e=btn("編集");e.setOnClickListener(v->showItem(x));ir.addView(e);LinearLayout.LayoutParams ip=new LinearLayout.LayoutParams(-1,-2);ip.setMargins(0,0,0,dp(8));content.addView(ir,ip);}
        Button del=btn("このメニューを削除");del.setOnClickListener(v->new AlertDialog.Builder(this).setMessage("このメニューを削除しますか？").setPositiveButton("削除",(d,w)->{menus.remove(m);save();showHome();}).setNegativeButton("キャンセル",null).show());add(del);
    }

    void showItem(Item x){ currentItem=x;clear("項目設定",true);action.setVisibility(View.GONE);
        add(tv("項目名",14));EditText n=field("例：屈伸");n.setText(x.name);add(n);add(tv("運動時間（秒）",14));EditText sec=field("30");sec.setInputType(2);sec.setText(""+x.seconds);add(sec);add(tv("説明・メモ",14));EditText desc=field("フォームや注意点など");desc.setMinLines(3);desc.setText(x.desc);add(desc);
        TextView ph=tv("写真",14);ph.setPadding(0,dp(18),0,dp(4));add(ph);ImageView preview=new ImageView(this);preview.setScaleType(ImageView.ScaleType.CENTER_CROP);preview.setAdjustViewBounds(false);setImage(preview,x.photo);addViewFixed(preview,dp(230));
        Runnable persist=()->persistFields(n,sec,desc);
        LinearLayout pr=row();Button pic=btn("スマホ内から選ぶ"),cam=btn("カメラで撮影");pic.setOnClickListener(v->{persist.run();Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("image/*");i.addCategory(Intent.CATEGORY_OPENABLE);i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);startActivityForResult(i,PICK_IMAGE);});cam.setOnClickListener(v->{persist.run();if(Build.VERSION.SDK_INT>=23&&checkSelfPermission(android.Manifest.permission.CAMERA)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{android.Manifest.permission.CAMERA},REQ_CAMERA);else launchCamera();});pr.addView(pic,new LinearLayout.LayoutParams(0,-2,1));pr.addView(cam,new LinearLayout.LayoutParams(0,-2,1));add(pr);
        LinearLayout mv=row();Button up=btn("↑ 上へ"),dn=btn("↓ 下へ");up.setOnClickListener(v->{persist.run();moveItem(-1);});dn.setOnClickListener(v->{persist.run();moveItem(1);});mv.addView(up,new LinearLayout.LayoutParams(0,-2,1));mv.addView(dn,new LinearLayout.LayoutParams(0,-2,1));add(mv);
        LinearLayout rr=row();Button dup=btn("複製"),del=btn("削除");dup.setOnClickListener(v->{persist.run();Item c=new Item();c.id=id();c.name=x.name+" コピー";c.seconds=x.seconds;c.desc=x.desc;c.photo=x.photo;currentMenu.items.add(currentMenu.items.indexOf(x)+1,c);save();showItem(c);});del.setOnClickListener(v->{currentMenu.items.remove(x);save();showMenu(currentMenu);});rr.addView(dup,new LinearLayout.LayoutParams(0,-2,1));rr.addView(del,new LinearLayout.LayoutParams(0,-2,1));add(rr);
        n.setOnFocusChangeListener((v,f)->{if(!f)persist.run();});sec.setOnFocusChangeListener((v,f)->{if(!f)persist.run();});desc.setOnFocusChangeListener((v,f)->{if(!f)persist.run();});
    }
    void addViewFixed(View v,int h){content.addView(v,new LinearLayout.LayoutParams(-1,h));}
    void persistFields(EditText n,EditText s,EditText d){if(currentItem==null)return;currentItem.name=n.getText().toString().trim().isEmpty()?"名称未設定":n.getText().toString().trim();currentItem.desc=d.getText().toString();try{currentItem.seconds=Math.max(1,Integer.parseInt(s.getText().toString()));}catch(Exception e){}save();}
    void moveItem(int d){int p=currentMenu.items.indexOf(currentItem),q=p+d;if(q<0||q>=currentMenu.items.size())return;Collections.swap(currentMenu.items,p,q);save();showItem(currentItem);}
    void setImage(ImageView v,String p){try{if(p!=null&&!p.isEmpty())v.setImageURI(Uri.parse(p));else v.setImageDrawable(new ColorDrawable(Color.rgb(225,228,232)));}catch(Exception e){v.setImageDrawable(new ColorDrawable(Color.rgb(225,228,232)));}}

    void launchCamera(){try{ContentValues cv=new ContentValues();cv.put(MediaStore.Images.Media.DISPLAY_NAME,"stretch_"+System.currentTimeMillis()+".jpg");cv.put(MediaStore.Images.Media.MIME_TYPE,"image/jpeg");pendingCameraUri=getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,cv);if(pendingCameraUri==null)throw new Exception();Intent i=new Intent(MediaStore.ACTION_IMAGE_CAPTURE);i.putExtra(MediaStore.EXTRA_OUTPUT,pendingCameraUri);i.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION|Intent.FLAG_GRANT_READ_URI_PERMISSION);startActivityForResult(i,TAKE_PHOTO);}catch(Exception e){Toast.makeText(this,"カメラを起動できませんでした",Toast.LENGTH_LONG).show();}}
    @Override public void onRequestPermissionsResult(int request,String[] perms,int[] results){super.onRequestPermissionsResult(request,perms,results);if(request==REQ_CAMERA&&results.length>0&&results[0]==PackageManager.PERMISSION_GRANTED)launchCamera();else if(request==REQ_CAMERA)Toast.makeText(this,"カメラの許可が必要です",Toast.LENGTH_LONG).show();}
    @Override protected void onActivityResult(int req,int res,Intent data){super.onActivityResult(req,res,data);if(currentItem==null)return;try{if(req==PICK_IMAGE&&res==RESULT_OK&&data!=null){Uri u=data.getData();int flags=data.getFlags()&Intent.FLAG_GRANT_READ_URI_PERMISSION;if(u!=null){try{getContentResolver().takePersistableUriPermission(u,flags);}catch(Exception ignored){}currentItem.photo=u.toString();save();showItem(currentItem);}}else if(req==TAKE_PHOTO){if(res==RESULT_OK&&pendingCameraUri!=null){currentItem.photo=pendingCameraUri.toString();save();pendingCameraUri=null;showItem(currentItem);}else if(pendingCameraUri!=null){getContentResolver().delete(pendingCameraUri,null,null);pendingCameraUri=null;}}}catch(Exception e){Toast.makeText(this,"写真を保存できませんでした",Toast.LENGTH_LONG).show();}}

    void startTimer(Menu m){if(m.items.isEmpty()){Toast.makeText(this,"このメニューには項目がありません",Toast.LENGTH_SHORT).show();return;}currentMenu=m;currentItem=null;timerIndex=0;restPhase=false;paused=false;remainingMs=m.items.get(0).seconds*1000L;totalPhaseMs=remainingMs;showTimer();runTimer();}
    void showTimer(){getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);root.setBackgroundColor(Color.rgb(17,22,30));scroll.setBackgroundColor(Color.rgb(17,22,30));barTitle.setText(currentMenu.name);barTitle.setTextColor(Color.WHITE);back.setVisibility(View.VISIBLE);action.setVisibility(View.GONE);content.removeAllViews();content.setPadding(dp(22),dp(12),dp(22),dp(28));Item x=currentMenu.items.get(timerIndex);
        TextView step=tv(restPhase?"REST":"EXERCISE",13);step.setTextColor(restPhase?Color.rgb(255,191,87):Color.rgb(87,220,187));step.setGravity(Gravity.CENTER);step.setTypeface(Typeface.DEFAULT_BOLD);add(step);
        TextView name=tv(restPhase?"休憩":x.name,28);name.setTextColor(Color.WHITE);name.setGravity(Gravity.CENTER);name.setTypeface(Typeface.DEFAULT_BOLD);add(name);
        if(!restPhase&&!x.photo.isEmpty()){ImageView im=new ImageView(this);im.setScaleType(ImageView.ScaleType.CENTER_CROP);setImage(im,x.photo);LinearLayout.LayoutParams ip=new LinearLayout.LayoutParams(-1,dp(210));ip.setMargins(0,dp(8),0,dp(12));content.addView(im,ip);}
        CircularTimerView circle=new CircularTimerView(this);circle.setTag("circle");circle.setState(remainingMs,totalPhaseMs,restPhase?"休憩":"秒");addViewFixed(circle,dp(300));
        TextView count=tv((timerIndex+1)+" / "+currentMenu.items.size(),15);count.setTextColor(Color.rgb(154,164,179));count.setGravity(Gravity.CENTER);add(count);
        if(restPhase){TextView next=tv("次："+(timerIndex+1<currentMenu.items.size()?currentMenu.items.get(timerIndex+1).name:"完了"),18);next.setTextColor(Color.WHITE);next.setGravity(Gravity.CENTER);add(next);}else if(!x.desc.isEmpty()){TextView d=tv(x.desc,17);d.setTextColor(Color.rgb(212,218,226));d.setGravity(Gravity.CENTER);d.setPadding(dp(8),dp(8),dp(8),dp(18));add(d);}
        LinearLayout r=row();Button prev=btn("← 前へ"),pause=btn(paused?"▶ 再開":"Ⅱ 一時停止"),next=btn("次へ →");prev.setOnClickListener(v->{stopTimer();timerIndex=Math.max(0,timerIndex-1);restPhase=false;paused=false;remainingMs=currentMenu.items.get(timerIndex).seconds*1000L;totalPhaseMs=remainingMs;showTimer();runTimer();});pause.setOnClickListener(v->{if(paused){paused=false;showTimer();runTimer();}else{paused=true;if(timer!=null)timer.cancel();showTimer();}});next.setOnClickListener(v->{stopTimer();paused=false;advance(true);});r.addView(prev,new LinearLayout.LayoutParams(0,-2,1));r.addView(pause,new LinearLayout.LayoutParams(0,-2,1));r.addView(next,new LinearLayout.LayoutParams(0,-2,1));add(r);
    }
    void runTimer(){lastBeep=-1;timer=new CountDownTimer(remainingMs,100){public void onTick(long ms){remainingMs=ms;CircularTimerView c=content.findViewWithTag("circle");if(c!=null)c.setState(ms,totalPhaseMs,restPhase?"休憩":"秒");int sec=(int)Math.ceil(ms/1000.0);if(sec<=3&&sec>0&&sec!=lastBeep){lastBeep=sec;tone.startTone(ToneGenerator.TONE_PROP_BEEP,90);}}public void onFinish(){remainingMs=0;tone.startTone(ToneGenerator.TONE_PROP_ACK,140);advance(false);}};timer.start();}
    void advance(boolean skip){if(!restPhase&&!skip&&currentMenu.rest>0&&timerIndex<currentMenu.items.size()-1){restPhase=true;remainingMs=currentMenu.rest*1000L;totalPhaseMs=remainingMs;showTimer();runTimer();return;}timerIndex++;if(timerIndex>=currentMenu.items.size()){showComplete();return;}restPhase=false;remainingMs=currentMenu.items.get(timerIndex).seconds*1000L;totalPhaseMs=remainingMs;showTimer();runTimer();}
    void showComplete(){stopTimer();getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);root.setBackgroundColor(Color.rgb(17,22,30));scroll.setBackgroundColor(Color.rgb(17,22,30));barTitle.setText("完了");barTitle.setTextColor(Color.WHITE);content.removeAllViews();action.setVisibility(View.GONE);TextView mark=tv("✓",72);mark.setTextColor(Color.rgb(87,220,187));mark.setGravity(Gravity.CENTER);mark.setPadding(0,dp(70),0,0);add(mark);TextView t=tv("おつかれさまでした",30);t.setTextColor(Color.WHITE);t.setTypeface(Typeface.DEFAULT_BOLD);t.setGravity(Gravity.CENTER);add(t);TextView s=tv(currentMenu.name+" を完了しました",17);s.setTextColor(Color.rgb(172,181,195));s.setGravity(Gravity.CENTER);add(s);Button b=btn("メニューへ戻る");b.setOnClickListener(v->showMenu(currentMenu));LinearLayout.LayoutParams bp=new LinearLayout.LayoutParams(-1,-2);bp.setMargins(0,dp(32),0,0);content.addView(b,bp);}
    void stopTimer(){if(timer!=null)timer.cancel();timer=null;}
    void goBack(){stopTimer();getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);if(currentItem!=null){currentItem=null;showMenu(currentMenu);}else if(currentMenu!=null){currentMenu=null;showHome();}else showHome();}
    @Override public void onBackPressed(){goBack();}

    void save(){try{JSONArray a=new JSONArray();for(Menu m:menus){JSONObject mo=new JSONObject();mo.put("id",m.id);mo.put("name",m.name);mo.put("rest",m.rest);JSONArray ia=new JSONArray();for(Item x:m.items){JSONObject io=new JSONObject();io.put("id",x.id);io.put("name",x.name);io.put("seconds",x.seconds);io.put("desc",x.desc);io.put("photo",x.photo);ia.put(io);}mo.put("items",ia);a.put(mo);}getSharedPreferences("data",0).edit().putString("menus",a.toString()).apply();}catch(Exception ignored){}}
    void load(){try{String s=getSharedPreferences("data",0).getString("menus","[]");JSONArray a=new JSONArray(s);for(int i=0;i<a.length();i++){JSONObject mo=a.getJSONObject(i);Menu m=new Menu();m.id=mo.optString("id",id());m.name=mo.optString("name","メニュー");m.rest=mo.optInt("rest",10);JSONArray ia=mo.optJSONArray("items");if(ia!=null)for(int j=0;j<ia.length();j++){JSONObject io=ia.getJSONObject(j);Item x=new Item();x.id=io.optString("id",id());x.name=io.optString("name","項目");x.seconds=io.optInt("seconds",30);x.desc=io.optString("desc","");x.photo=io.optString("photo","");m.items.add(x);}menus.add(m);}}catch(Exception ignored){}}
}