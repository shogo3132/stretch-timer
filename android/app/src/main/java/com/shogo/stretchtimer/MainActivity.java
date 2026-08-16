package com.shogo.stretchtimer;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.provider.MediaStore;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.io.*;
import java.util.*;

public class MainActivity extends Activity {
    static class Item { String id,name,desc,photo=""; int seconds=30; }
    static class Menu { String id,name; int rest=10; ArrayList<Item> items=new ArrayList<>(); }
    ArrayList<Menu> menus=new ArrayList<>(); Menu currentMenu; Item currentItem;
    LinearLayout root,content; TextView barTitle; Button back,action; CountDownTimer timer; boolean paused=false; long remainingMs; int timerIndex=0; boolean restPhase=false;
    final int PICK_IMAGE=10, TAKE_PHOTO=11;

    @Override public void onCreate(Bundle b){ super.onCreate(b); load(); buildShell(); showHome(); }
    String id(){ return UUID.randomUUID().toString(); }
    TextView tv(String s,int sp){ TextView v=new TextView(this); v.setText(s); v.setTextSize(sp); v.setTextColor(Color.rgb(30,30,30)); v.setPadding(0,10,0,10); return v; }
    Button btn(String s){ Button b=new Button(this); b.setText(s); return b; }
    EditText field(String s){ EditText e=new EditText(this); e.setHint(s); e.setTextSize(18); return e; }
    LinearLayout row(){ LinearLayout l=new LinearLayout(this); l.setOrientation(LinearLayout.HORIZONTAL); return l; }
    void add(View v){ content.addView(v,new LinearLayout.LayoutParams(-1,-2)); }
    void buildShell(){
        root=new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(Color.WHITE);
        root.setOnApplyWindowInsetsListener((v,in)->{ android.graphics.Insets x=in.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout()); v.setPadding(x.left,x.top,x.right,x.bottom); return in; });
        LinearLayout bar=row(); bar.setGravity(Gravity.CENTER_VERTICAL); bar.setPadding(12,8,12,8);
        back=btn("←"); back.setOnClickListener(v->goBack()); bar.addView(back,new LinearLayout.LayoutParams(-2,-2));
        barTitle=tv("ストレッチ",22); LinearLayout.LayoutParams tp=new LinearLayout.LayoutParams(0,-2,1); bar.addView(barTitle,tp);
        action=btn("＋ メニュー"); bar.addView(action,new LinearLayout.LayoutParams(-2,-2)); root.addView(bar,new LinearLayout.LayoutParams(-1,-2));
        ScrollView sc=new ScrollView(this); content=new LinearLayout(this); content.setOrientation(LinearLayout.VERTICAL); content.setPadding(20,12,20,30); sc.addView(content); root.addView(sc,new LinearLayout.LayoutParams(-1,0,1)); setContentView(root);
    }
    void clear(String title, boolean showBack){ barTitle.setText(title); back.setVisibility(showBack?View.VISIBLE:View.GONE); content.removeAllViews(); }
    void showHome(){ clear("ストレッチ",false); action.setVisibility(View.VISIBLE); action.setText("＋ メニュー"); action.setOnClickListener(v->{ Menu m=new Menu();m.id=id();m.name="メニュー"+(menus.size()+1);menus.add(m);save();showMenu(m);});
        if(menus.isEmpty()) add(tv("メニューがありません。右上の「＋ メニュー」から作成できます。",18));
        for(Menu m:menus){ LinearLayout card=new LinearLayout(this);card.setOrientation(LinearLayout.VERTICAL);card.setPadding(16,16,16,16); TextView t=tv(m.name,22);card.addView(t);card.addView(tv(m.items.size()+"項目 ・ レスト "+m.rest+"秒",15)); LinearLayout r=row();Button st=btn("▶ 開始"),ed=btn("編集");st.setOnClickListener(v->startTimer(m));ed.setOnClickListener(v->showMenu(m));r.addView(st,new LinearLayout.LayoutParams(0,-2,1));r.addView(ed,new LinearLayout.LayoutParams(0,-2,1));card.addView(r);add(card); }
    }
    void showMenu(Menu m){ currentMenu=m; clear("メニュー編集",true); action.setVisibility(View.GONE);
        EditText name=field("メニュー名");name.setText(m.name);name.setOnFocusChangeListener((v,f)->{if(!f){m.name=name.getText().toString();save();}});add(tv("メニュー名",14));add(name);
        EditText rest=field("レスト秒数");rest.setInputType(2);rest.setText(""+m.rest);rest.setOnFocusChangeListener((v,f)->{if(!f){try{m.rest=Integer.parseInt(rest.getText().toString());}catch(Exception e){}save();}});add(tv("項目間のレスト秒数",14));add(rest);
        LinearLayout r=row();Button ai=btn("＋ 項目追加"),st=btn("▶ 開始");ai.setOnClickListener(v->{Item x=new Item();x.id=id();x.name="項目"+(m.items.size()+1);m.items.add(x);save();showItem(x);});st.setOnClickListener(v->startTimer(m));r.addView(ai,new LinearLayout.LayoutParams(0,-2,1));r.addView(st,new LinearLayout.LayoutParams(0,-2,1));add(r);
        for(int i=0;i<m.items.size();i++){Item x=m.items.get(i); LinearLayout ir=row();ir.setGravity(Gravity.CENTER_VERTICAL); ImageView im=new ImageView(this);im.setLayoutParams(new LinearLayout.LayoutParams(100,100));im.setScaleType(ImageView.ScaleType.CENTER_CROP);setImage(im,x.photo);ir.addView(im);TextView tx=tv((i+1)+". "+x.name+"\n"+x.seconds+"秒",18);ir.addView(tx,new LinearLayout.LayoutParams(0,-2,1));Button e=btn("編集");e.setOnClickListener(v->showItem(x));ir.addView(e);add(ir);}
        Button del=btn("このメニューを削除");del.setOnClickListener(v->new AlertDialog.Builder(this).setMessage("削除しますか？").setPositiveButton("削除",(d,w)->{menus.remove(m);save();showHome();}).setNegativeButton("キャンセル",null).show());add(del);
    }
    void showItem(Item x){ currentItem=x; clear("項目編集",true); action.setVisibility(View.GONE);
        EditText n=field("項目名");n.setText(x.name);add(tv("項目名",14));add(n); EditText sec=field("秒数");sec.setInputType(2);sec.setText(""+x.seconds);add(tv("秒数",14));add(sec); EditText desc=field("説明");desc.setMinLines(3);desc.setText(x.desc);add(tv("説明",14));add(desc);
        ImageView preview=new ImageView(this);preview.setAdjustViewBounds(true);preview.setMinimumHeight(300);setImage(preview,x.photo);add(preview);
        LinearLayout pr=row();Button pic=btn("写真から選ぶ"),cam=btn("カメラで撮る");pic.setOnClickListener(v->{persistFields(n,sec,desc);Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("image/*");i.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(i,PICK_IMAGE);});cam.setOnClickListener(v->{persistFields(n,sec,desc);startActivityForResult(new Intent(MediaStore.ACTION_IMAGE_CAPTURE),TAKE_PHOTO);});pr.addView(pic,new LinearLayout.LayoutParams(0,-2,1));pr.addView(cam,new LinearLayout.LayoutParams(0,-2,1));add(pr);
        LinearLayout rr=row();Button dup=btn("複製"),del=btn("削除");dup.setOnClickListener(v->{persistFields(n,sec,desc);Item c=new Item();c.id=id();c.name=x.name+" コピー";c.seconds=x.seconds;c.desc=x.desc;c.photo=x.photo;int p=currentMenu.items.indexOf(x);currentMenu.items.add(p+1,c);save();showItem(c);});del.setOnClickListener(v->{currentMenu.items.remove(x);save();showMenu(currentMenu);});rr.addView(dup,new LinearLayout.LayoutParams(0,-2,1));rr.addView(del,new LinearLayout.LayoutParams(0,-2,1));add(rr);
        LinearLayout mv=row();Button up=btn("↑ 上へ"),dn=btn("↓ 下へ");up.setOnClickListener(v->{persistFields(n,sec,desc);moveItem(-1);});dn.setOnClickListener(v->{persistFields(n,sec,desc);moveItem(1);});mv.addView(up,new LinearLayout.LayoutParams(0,-2,1));mv.addView(dn,new LinearLayout.LayoutParams(0,-2,1));add(mv);
        n.setOnFocusChangeListener((v,f)->{if(!f)persistFields(n,sec,desc);});sec.setOnFocusChangeListener((v,f)->{if(!f)persistFields(n,sec,desc);});desc.setOnFocusChangeListener((v,f)->{if(!f)persistFields(n,sec,desc);});
    }
    void persistFields(EditText n,EditText s,EditText d){ if(currentItem==null)return;currentItem.name=n.getText().toString();currentItem.desc=d.getText().toString();try{currentItem.seconds=Math.max(1,Integer.parseInt(s.getText().toString()));}catch(Exception e){}save(); }
    void moveItem(int d){int p=currentMenu.items.indexOf(currentItem),q=p+d;if(q<0||q>=currentMenu.items.size())return;Collections.swap(currentMenu.items,p,q);save();showItem(currentItem);}
    void setImage(ImageView v,String p){try{if(p!=null&&!p.isEmpty())v.setImageURI(Uri.parse(p));else{v.setImageDrawable(new ColorDrawable(Color.LTGRAY));}}catch(Exception e){v.setImageDrawable(new ColorDrawable(Color.LTGRAY));}}
    @Override protected void onActivityResult(int req,int res,Intent data){super.onActivityResult(req,res,data);if(res!=RESULT_OK||currentItem==null)return;try{if(req==PICK_IMAGE&&data!=null){Uri u=data.getData();getContentResolver().takePersistableUriPermission(u,Intent.FLAG_GRANT_READ_URI_PERMISSION);currentItem.photo=u.toString();save();showItem(currentItem);}else if(req==TAKE_PHOTO&&data!=null){Bitmap b=(Bitmap)data.getExtras().get("data");File f=new File(getFilesDir(),"photo_"+System.currentTimeMillis()+".jpg");FileOutputStream o=new FileOutputStream(f);b.compress(Bitmap.CompressFormat.JPEG,90,o);o.close();currentItem.photo=Uri.fromFile(f).toString();save();showItem(currentItem);}}catch(Exception e){Toast.makeText(this,"写真を保存できませんでした",Toast.LENGTH_SHORT).show();}}
    void startTimer(Menu m){if(m.items.isEmpty()){Toast.makeText(this,"項目を追加してください",Toast.LENGTH_SHORT).show();return;}currentMenu=m;timerIndex=0;restPhase=false;remainingMs=m.items.get(0).seconds*1000L;paused=false;showTimer();runTimer();}
    void showTimer(){clear(currentMenu.name,true);action.setVisibility(View.GONE);Item x=currentMenu.items.get(timerIndex);if(restPhase){TextView r=tv("REST",36);r.setGravity(Gravity.CENTER);add(r);TextView tm=tv(""+(remainingMs/1000),64);tm.setGravity(Gravity.CENTER);tm.setTag("time");add(tm);add(tv("次："+(timerIndex+1<currentMenu.items.size()?currentMenu.items.get(timerIndex+1).name:""),18));}else{ImageView im=new ImageView(this);im.setAdjustViewBounds(true);im.setMinimumHeight(420);setImage(im,x.photo);add(im);TextView n=tv(x.name,30);n.setGravity(Gravity.CENTER);add(n);TextView tm=tv(""+(remainingMs/1000),64);tm.setGravity(Gravity.CENTER);tm.setTag("time");add(tm);add(tv((timerIndex+1)+" / "+currentMenu.items.size(),16));add(tv(x.desc.isEmpty()?"説明なし":x.desc,18));}
        LinearLayout r=row();Button prev=btn("← 前"),pause=btn(paused?"再開":"一時停止"),next=btn("次 →");prev.setOnClickListener(v->{stopTimer();timerIndex=Math.max(0,timerIndex-1);restPhase=false;remainingMs=currentMenu.items.get(timerIndex).seconds*1000L;showTimer();runTimer();});pause.setOnClickListener(v->{paused=!paused;if(paused){if(timer!=null)timer.cancel();showTimer();}else{showTimer();runTimer();}});next.setOnClickListener(v->{stopTimer();advance(true);});r.addView(prev,new LinearLayout.LayoutParams(0,-2,1));r.addView(pause,new LinearLayout.LayoutParams(0,-2,1));r.addView(next,new LinearLayout.LayoutParams(0,-2,1));add(r);
    }
    void runTimer(){timer=new CountDownTimer(remainingMs,250){public void onTick(long ms){remainingMs=ms;TextView t=content.findViewWithTag("time");if(t!=null)t.setText(""+(int)Math.ceil(ms/1000.0));}public void onFinish(){remainingMs=0;advance(false);}};timer.start();}
    void advance(boolean skip){if(!restPhase&&!skip&&currentMenu.rest>0&&timerIndex<currentMenu.items.size()-1){restPhase=true;remainingMs=currentMenu.rest*1000L;showTimer();runTimer();return;}timerIndex++;if(timerIndex>=currentMenu.items.size()){stopTimer();clear("完了",true);action.setVisibility(View.GONE);TextView t=tv("完了",42);t.setGravity(Gravity.CENTER);add(t);Button b=btn("メニューへ戻る");b.setOnClickListener(v->showMenu(currentMenu));add(b);return;}restPhase=false;remainingMs=currentMenu.items.get(timerIndex).seconds*1000L;showTimer();runTimer();}
    void stopTimer(){if(timer!=null)timer.cancel();timer=null;}
    void goBack(){stopTimer();if(currentItem!=null){Item ci=currentItem;currentItem=null;showMenu(currentMenu);}else if(currentMenu!=null){currentMenu=null;showHome();}else showHome();}
    @Override public void onBackPressed(){goBack();}
    void save(){try{JSONArray a=new JSONArray();for(Menu m:menus){JSONObject mo=new JSONObject();mo.put("id",m.id);mo.put("name",m.name);mo.put("rest",m.rest);JSONArray ia=new JSONArray();for(Item x:m.items){JSONObject io=new JSONObject();io.put("id",x.id);io.put("name",x.name);io.put("seconds",x.seconds);io.put("desc",x.desc);io.put("photo",x.photo);ia.put(io);}mo.put("items",ia);a.put(mo);}getSharedPreferences("data",0).edit().putString("menus",a.toString()).apply();}catch(Exception e){}}
    void load(){try{String s=getSharedPreferences("data",0).getString("menus","[]");JSONArray a=new JSONArray(s);for(int i=0;i<a.length();i++){JSONObject mo=a.getJSONObject(i);Menu m=new Menu();m.id=mo.optString("id",id());m.name=mo.optString("name","メニュー");m.rest=mo.optInt("rest",10);JSONArray ia=mo.optJSONArray("items");if(ia!=null)for(int j=0;j<ia.length();j++){JSONObject io=ia.getJSONObject(j);Item x=new Item();x.id=io.optString("id",id());x.name=io.optString("name","項目");x.seconds=io.optInt("seconds",30);x.desc=io.optString("desc","");x.photo=io.optString("photo","");m.items.add(x);}menus.add(m);}}catch(Exception e){}}
}