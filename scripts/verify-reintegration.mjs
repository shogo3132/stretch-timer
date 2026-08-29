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
requireText('ux-v18.js','StretchUI.createAutoScroll','stretch reorder is not using unified auto-scroll');
requireText('ux-v113-daily-schedule.js','StretchUI.createAutoScroll','task reorder is not using unified auto-scroll');
requireText('ux-v130-integration.js','registerDataProvider','data provider registry is missing');
requireText('ux-v130-integration.js','aria-current','navigation accessibility state is missing');
if(sw.indexOf('<script src="./ux-v130-integration.js')>sw.indexOf('<script src="./ux-v22.js'))failures.push('integration layer must load before card modules');
if(fs.readFileSync(path.join(root,'ux-v106-tasks.js'),'utf8').includes("handle.className='task-drag-handle'"))failures.push('legacy task drag handle is still rendered');

if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`reintegration verification passed: ${new Set(files).size} UX assets`);
