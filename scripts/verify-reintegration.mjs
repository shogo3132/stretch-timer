import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const files=[...sw.matchAll(/'\.\/(ux-[^'?]+\.js)(?:\?v=\d+)?'/g)].map(x=>x[1]);
const failures=[];
const requireText=(file,text,label)=>{if(!fs.readFileSync(path.join(root,file),'utf8').includes(text))failures.push(label)};

for(const file of [...new Set(files),'sw.js']){
  if(!fs.existsSync(path.join(root,file))){failures.push(`missing asset: ${file}`);continue}
  const checked=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});
  if(checked.status!==0)failures.push(`syntax: ${file}\n${checked.stderr}`);
}

if(files.length!==new Set(files).size)failures.push('duplicate UX asset in Service Worker');
requireText('sw.js','ux-v130-integration.js','integration layer is not loaded');
requireText('ux-v106-tasks.js','StretchUI.bindSwipe','tasks are not using unified swipe');
requireText('ux-v110-recipes.js','StretchUI.bindSwipe','recipes are not using unified swipe');
requireText('ux-v130-integration.js','registerDataProvider','data provider registry is missing');
requireText('ux-v130-integration.js','registerScreenHook','screen lifecycle registry is missing');
requireText('ux-v130-integration.js','registerSettingsSection','settings section registry is missing');
requireText('ux-v130-integration.js','registerBackHandler','back route registry is missing');
for(const [file,key] of [['ux-v79-item-editor-core.js','menus'],['ux-v88-focus-variants.js','focus'],['ux-v106-tasks.js','tasks'],['ux-v110-recipes.js','recipes'],['ux-v113-daily-schedule.js','task-schedule'],['ux-v109-item-media.js','item-media']]){
  requireText(file,`key:'${key}'`,`${key} data is not registered with the common sync registry`);
}
for(const file of files){
  if(file==='ux-v130-integration.js')continue;
  const source=fs.readFileSync(path.join(root,file),'utf8');
  if(/syncPayload\s*=\s*function/.test(source))failures.push(`legacy sync payload wrapper: ${file}`);
  if(/applyRemote\s*=\s*function/.test(source))failures.push(`legacy remote apply wrapper: ${file}`);
}
for(const file of ['ux-v106-tasks.js','ux-v110-recipes.js','ux-v113-daily-schedule.js','ux-v118-diagnostics.js']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  if(/show\s*=\s*function/.test(source))failures.push(`legacy show wrapper: ${file}`);
}
requireText('ux-v130-integration.js','registerReorder','unified reorder controller is missing');
requireText('ux-v130-integration.js','aria-current','navigation accessibility state is missing');
requireText('ux-v130-integration.js','.reorder-before>.unified-swipe-action','reorder targets do not suppress hidden swipe actions');
requireText('ux-v130-integration.js','.task-title-text{-webkit-user-select:none','task long-press still allows text selection');
if(sw.indexOf('<script src="./ux-v130-integration.js')>sw.indexOf('<script src="./ux-v22.js'))failures.push('integration layer must load before card modules');
if(fs.readFileSync(path.join(root,'ux-v106-tasks.js'),'utf8').includes("handle.className='task-drag-handle'"))failures.push('legacy task drag handle is still rendered');
requireText('ux-v18.js',"key:'routine-cards'",'routine cards are not registered with unified reorder');
requireText('ux-v18.js',"key:'item-cards'",'item cards are not registered with unified reorder');
requireText('ux-v113-daily-schedule.js',"key:'task-cards'",'task cards are not registered with unified reorder');
if(sw.includes('ux-v46-desktop-dnd.js'))failures.push('legacy desktop drag is still loaded');
if(fs.readFileSync(path.join(root,'ux-v18.js'),'utf8').includes("addEventListener('touchmove'"))failures.push('legacy stretch touch reorder is still present');
if(fs.readFileSync(path.join(root,'ux-v113-daily-schedule.js'),'utf8').includes('createTaskGhost'))failures.push('legacy task reorder is still present');
const indexSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(indexSource.includes('function wireReorder('))failures.push('legacy base reorder controller is still present');
if(indexSource.includes("show('home','ストレッチ',{label:'⚙'"))failures.push('duplicate header settings action is still present');

if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`reintegration verification passed: ${new Set(files).size} UX assets`);
