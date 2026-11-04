/* Study Hub V3.5.1 — explicit progress publication and download.
   Drive files are immutable. A parent graph identifies the current revision;
   concurrent publications create visible branches, never a silent last-writer overwrite.
   Old V3.2 full-dataset snapshots are untouched and never automatically merged here. */
(() => {
'use strict';
const SCOPE='https://www.googleapis.com/auth/drive.appdata openid email';
const CLIENT_KEY='nsh-v32-oauth-client-id',DEVICE_KEY='nsh-v32-device-id',META_PREFIX='nsh-v351-progress-meta:',PREFIX='nsh-v351-progress-';
const $=id=>document.getElementById(id),clone=x=>JSON.parse(JSON.stringify(x));
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const stable=x=>Array.isArray(x)?'['+x.map(stable).join(',')+']':object(x)?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}':JSON.stringify(x);
const same=(a,b)=>stable(a)===stable(b);
let device=localStorage.getItem(DEVICE_KEY);if(!device){device=crypto.randomUUID();localStorage.setItem(DEVICE_KEY,device)}
const defaultName=/iPad|Tablet/i.test(navigator.userAgent)?'Tablet':/iPhone|Android.*Mobile/i.test(navigator.userAgent)?'Phone':'Computer';
let token='',expiry=0,account='',email='',meta={},busy=false,epoch=0,pending=null,cloud=null,tokenClient=null;
const settingsKeys=['freeReview','quizReview','quizPractice','dailyTarget','dailyQuizTarget','favorites'];
function progressOf(data=state){const settings={};for(const key of settingsKeys)if(Object.hasOwn(data.settings||{},key))settings[key]=clone(data.settings[key]);return {progress:clone(data.progress||{}),quizHistory:clone(data.quizHistory||{}),dailyLog:clone(data.dailyLog||{}),settings}}
function validateProgress(x){
 if(!object(x)||!object(x.progress)||!object(x.quizHistory)||!object(x.dailyLog)||!object(x.settings))throw Error('Invalid progress file. Nothing was changed.');
 if(Object.keys(x).some(k=>!['progress','quizHistory','dailyLog','settings'].includes(k))||Object.keys(x.settings).some(k=>!settingsKeys.includes(k)))throw Error('This file includes unsupported data. Nothing was changed.');
 for(const kind of ['progress','quizHistory'])if(Object.values(x[kind]).some(v=>!object(v)))throw Error('Invalid learning record.');
 for(const ids of Object.values(x.dailyLog))if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'))throw Error('Invalid daily completion log.');
 for(const key of ['dailyTarget','dailyQuizTarget'])if(Object.hasOwn(x.settings,key)&&(!Number.isInteger(x.settings[key])||x.settings[key]<1||x.settings[key]>500))throw Error('Invalid practice target.');
 if(Object.hasOwn(x.settings,'favorites')&&(!Array.isArray(x.settings.favorites)||x.settings.favorites.some(id=>typeof id!=='string')))throw Error('Invalid favorites.');
 for(const key of ['freeReview','quizReview'])if(Object.hasOwn(x.settings,key)){
  const d=x.settings[key];if(!object(d)||!object(d.views)||!object(d.sessions)||Object.values(d.views).some(t=>typeof t!=='number'||!Number.isFinite(t)||t<0))throw Error('Invalid continuation data.');
  for(const s of Object.values(d.sessions))if(!object(s)||!object(s.filter)||!['subject','course','unit','chapter'].every(k=>typeof s.filter[k]==='string')||!Number.isFinite(s.updatedAt))throw Error('Invalid saved session.');
 }
 if(Object.hasOwn(x.settings,'quizPractice')){
  const q=x.settings.quizPractice;if(!object(q)||!object(q.events))throw Error('Invalid quiz practice events.');
  for(const [id,e] of Object.entries(q.events))if(!object(e)||e.id!==id||typeof e.questionId!=='string'||typeof e.correct!=='boolean'||!Number.isFinite(e.at)||e.at<0||typeof e.day!=='string'||!['legacy','daily','regular'].includes(e.mode))throw Error('Invalid quiz attempt.');
 }
 return clone(x);
}
async function digest(value){const bytes=new TextEncoder().encode(stable(value));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('')}
function connected(){return !!account&&!!token&&Date.now()<expiry-60000}
function notify(s){$('syncStatus').textContent=s}
function persistMeta(){localStorage.setItem(META_PREFIX+account,JSON.stringify(meta))}
function dirty(){return !meta.baseline||!same(progressOf(),meta.baseline)}
function hasProgress(p){return Object.keys(p.progress).length||Object.keys(p.quizHistory).length||Object.keys(p.dailyLog).length||['freeReview','quizReview','quizPractice'].some(k=>['views','events','sessions'].some(field=>Object.keys(p.settings[k]?.[field]||{}).length))}
function setButtons(){
 $('syncConnect').disabled=busy;$('syncConnect').textContent=connected()?`Connected: ${email}`:'Connect Google Drive';
 for(const id of ['syncUpload','syncDownload','syncCheck'])$(id).disabled=busy||!connected();
 $('syncDisconnect').disabled=busy||!token;$('syncConfirmDownload').disabled=busy||!connected()||!pending||pending.dirty&&!$('syncReplaceAck').checked;
 $('syncUseBranch').disabled=busy||!connected()||!cloud||cloud.heads.length<2;
 $('syncLocalState').textContent=meta.baseline?(dirty()?'This device has progress not uploaded to the current cloud version.':'This device matches its last uploaded or downloaded progress.'):'This device has not joined the new progress flow yet.';
}
function ensureDeviceState(){let saved;try{saved=JSON.parse(localStorage.getItem(KEY))}catch{throw Error('Device storage could not be read. Export a backup before continuing.')}if(!saved||!same(saved,clone(state)))throw Error('Another tab or a storage error changed this device’s saved data. Export a backup of this page before reloading.');}
function operationEpoch(){ensureDeviceState();if(!connected())throw Error('Reconnect Google Drive to continue.');if(!navigator.onLine)throw Error('Offline. Your study records remain on this device.');return epoch}
function unchangedSession(e){ensureDeviceState();if(e!==epoch||!connected())throw Error('Google connection changed. Retry the operation.');}
async function api(url,options={}){if(!connected())throw Error('Google connection expired. Reconnect to continue.');const response=await fetch(url,{...options,headers:{...options.headers,Authorization:'Bearer '+token}});if(!response.ok){let detail='';try{detail=(await response.json()).error?.message||''}catch{}throw Error(`Drive ${response.status}: ${detail||response.statusText}`)}return response}
function graphHeads(files){
 const map=new Map(files.map(f=>[f.id,f]));if(map.size!==files.length)throw Error('Duplicate cloud revision.');
 const parents=new Map(),referenced=new Set();
 for(const f of files){const props=f.appProperties||{};if(props.kind!=='progress351'||props.schema!=='351'||!/^[a-f0-9]{64}$/.test(props.digest||''))throw Error('Unrecognized progress revision. Nothing was replaced.');
  const ps=Object.keys(props).filter(k=>/^parent\d+$/.test(k)).sort((a,b)=>Number(a.slice(6))-Number(b.slice(6))).map(k=>props[k]);
  if(ps.length>20||new Set(ps).size!==ps.length||ps.some(id=>!map.has(id)||id===f.id))throw Error('Cloud history is incomplete. No progress was replaced.');parents.set(f.id,ps);ps.forEach(id=>referenced.add(id));
 }
 const indegree=new Map(files.map(f=>[f.id,parents.get(f.id).length])),children=new Map(files.map(f=>[f.id,[]]));
 for(const [child,ps] of parents)for(const parent of ps)children.get(parent).push(child);
 const queue=files.filter(f=>indegree.get(f.id)===0).map(f=>f.id);let visited=0;
 for(let i=0;i<queue.length;i++){const id=queue[i];visited++;for(const child of children.get(id)){indegree.set(child,indegree.get(child)-1);if(indegree.get(child)===0)queue.push(child)}}
 if(visited!==files.length)throw Error('Invalid cloud revision cycle.');
 return files.filter(f=>!referenced.has(f.id)).sort((a,b)=>a.id.localeCompare(b.id));
}
async function listFiles(){const files=[];let page='';const tokens=new Set();do{const params=new URLSearchParams({spaces:'appDataFolder',q:`trashed = false and name contains '${PREFIX}'`,fields:'nextPageToken,incompleteSearch,files(id,name,createdTime,appProperties)',pageSize:'1000'});if(page)params.set('pageToken',page);const j=await (await api('https://www.googleapis.com/drive/v3/files?'+params)).json();if(j.incompleteSearch||!Array.isArray(j.files))throw Error('Drive did not return complete history. Retry later.');files.push(...j.files.filter(f=>f.name?.startsWith(PREFIX)));page=j.nextPageToken||'';if(page&&tokens.has(page))throw Error('Drive pagination repeated.');tokens.add(page)}while(page);return files}
async function readRevision(file){const p=await (await api('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(file.id)+'?alt=media')).json();if(p.schema!==351||p.kind!=='study-hub-progress'||p.account!==account||typeof p.device!=='string'||typeof p.deviceName!=='string'||!Number.isFinite(Date.parse(p.createdAt))||!Array.isArray(p.parents)||p.parents.some(x=>typeof x!=='string'))throw Error('Invalid cloud progress revision.');const expected=Object.keys(file.appProperties).filter(k=>/^parent\d+$/.test(k)).map(k=>file.appProperties[k]).sort();if(!same([...p.parents].sort(),expected))throw Error('Cloud revision metadata does not match.');validateProgress(p.data);const signed={schema:p.schema,kind:p.kind,account:p.account,device:p.device,deviceName:p.deviceName,createdAt:p.createdAt,parents:p.parents,data:p.data};if(await digest(signed)!==file.appProperties.digest)throw Error('Cloud progress checksum failed. Nothing was changed.');return {file,payload:p}}
function cloudSignature(c){return c.heads.map(h=>h.file.id+':'+h.file.appProperties.digest).sort().join('|')}
async function readCloud(){const files=await listFiles(),heads=graphHeads(files);const entries=[];for(const f of heads)entries.push(await readRevision(f));return {heads:entries,files}}
function formatTime(h){return new Date(h.file.createdTime||h.payload.createdAt).toLocaleString()}
function counts(data){return `${Object.keys(data.progress).length} card progress records · ${Object.keys(data.quizHistory).length} quiz histories`}
function showCloud(c){
 cloud=c;$('syncBranches').classList.toggle('hidden',c.heads.length<2);$('syncBranchChoice').replaceChildren();
 if(!c.heads.length)$('syncCloudState').textContent='No V3.5.1 cloud progress yet. On your most up-to-date device (your phone), choose Upload progress first. Old cloud backups remain untouched.';
 else if(c.heads.length===1){const h=c.heads[0];$('syncCloudState').textContent=`Cloud updated: ${formatTime(h)} · From ${h.payload.deviceName} · ${counts(h.payload.data)}`}
 else{$('syncCloudState').textContent='Two or more devices uploaded at the same time. All versions are retained. Choose the progress version to use before downloading.';for(const h of c.heads){const o=document.createElement('option');o.value=h.file.id;o.textContent=`${h.payload.deviceName} · ${formatTime(h)} · ${counts(h.payload.data)}`;$('syncBranchChoice').append(o)}}
 setButtons();
}
function clearPending(){pending=null;$('syncDownloadPreview').classList.add('hidden');$('syncReplaceAck').checked=false;setButtons()}
async function run(action){if(busy)return;let e;try{e=operationEpoch()}catch(err){notify(err.message);return}busy=true;setButtons();try{await action(e)}catch(err){notify(err.message)}finally{busy=false;setButtons()}}
async function checkCloud(){return run(async e=>{const c=await readCloud();unchangedSession(e);showCloud(c);notify('Cloud status checked. No progress was uploaded or downloaded.');})}
async function openRecoveryDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open('study-hub-recovery-v351',1);request.onupgradeneeded=()=>{request.result.createObjectStore('copies',{keyPath:'id'});request.result.createObjectStore('summaries',{keyPath:'id'})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Cannot create a recovery copy. No progress was replaced.'));request.onblocked=()=>reject(Error('Recovery storage is busy. Close other Study Hub tabs and retry.'))})}
async function checkpoint(reason){const db=await openRecoveryDB();const copy={id:crypto.randomUUID(),at:new Date().toISOString(),account,reason,data:{backupVersion:3,exportedAt:new Date().toISOString(),...clone(state)}};await new Promise((resolve,reject)=>{const tx=db.transaction(['copies','summaries'],'readwrite');tx.objectStore('copies').add(copy);tx.objectStore('summaries').add({id:copy.id,at:copy.at,account:copy.account,reason:copy.reason});tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error('Recovery storage is unavailable or full. No progress was replaced.'))}).finally(()=>db.close());await listRecoveries();return copy.id}
async function listRecoveries(){try{const db=await openRecoveryDB();const copies=await new Promise((resolve,reject)=>{const tx=db.transaction('summaries','readonly'),r=tx.objectStore('summaries').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();const selected=$('syncRecoveryChoice').value;$('syncRecoveryChoice').replaceChildren();for(const c of copies.sort((a,b)=>b.at.localeCompare(a.at))){const o=document.createElement('option');o.value=c.id;o.textContent=`${new Date(c.at).toLocaleString()} · ${c.reason}`;$('syncRecoveryChoice').append(o)}if(copies.some(c=>c.id===selected))$('syncRecoveryChoice').value=selected;$('syncExportRecovery').disabled=!copies.length;}catch{$('syncExportRecovery').disabled=true}}
async function exportRecovery(){try{const db=await openRecoveryDB();const c=await new Promise((resolve,reject)=>{const r=db.transaction('copies','readonly').objectStore('copies').get($('syncRecoveryChoice').value);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();if(c)download('study-hub-recovery-'+c.at.replace(/[:.]/g,'-')+'.json',c.data)}catch{notify('Unable to export the recovery copy.')}}
async function createRevision(data,parents){
 if(parents.length>20)throw Error('Too many concurrent versions. Export backups before continuing.');
 const payload={schema:351,kind:'study-hub-progress',account,device,deviceName:($('syncDeviceName').value||defaultName).trim().slice(0,60)||defaultName,createdAt:new Date().toISOString(),parents:[...parents].sort(),data:validateProgress(data)};
 const checksum=await digest(payload),props={kind:'progress351',schema:'351',digest:checksum};payload.parents.forEach((parent,i)=>props['parent'+i]=parent);
 const name=PREFIX+crypto.randomUUID()+'.json',boundary='nsh_'+crypto.randomUUID().replace(/-/g,'');
 const metadata={name,mimeType:'application/json',parents:['appDataFolder'],appProperties:props};
 const body=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(payload)}\r\n--${boundary}--\r\n`;
 return (await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,appProperties',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body})).json();
}
async function uploadProgress(){clearPending();return run(async e=>{
 const data=validateProgress(progressOf()),c=await readCloud();unchangedSession(e);showCloud(c);
 if(c.heads.length>1)throw Error('Choose the current cloud version first. No version was overwritten.');
 const head=c.heads[0];
 if(head&&meta.head!==head.file.id){if(same(data,head.payload.data)){meta={head:head.file.id,baseline:data};persistMeta();notify('This device already matches cloud progress.');return}throw Error('Cloud progress is newer than this device’s last download. Download progress before uploading. Your local records are unchanged.');}
 if(head&&same(data,head.payload.data)){meta={head:head.file.id,baseline:data};persistMeta();notify('Cloud progress is already up to date.');return}
 if(!head&&!confirm('Start the new cloud progress flow with THIS device? Use the phone with your most complete progress. Old backups and all word banks will remain unchanged.'))return;
 await checkpoint(head?'Before upload':'Before first upload');unchangedSession(e);
 const currentCloud=await readCloud();unchangedSession(e);if(cloudSignature(currentCloud)!==cloudSignature(c))throw Error('Cloud changed before upload. Check and download the current progress.');if(!same(progressOf(),data))throw Error('You studied during upload preparation. Retry to include the latest progress.');
 const created=await createRevision(data,head?[head.file.id]:[]);unchangedSession(e);
 const after=await readCloud();unchangedSession(e);showCloud(after);
 if(after.heads.length!==1||after.heads[0].file.id!==created.id)throw Error('Concurrent upload detected. Every version is retained; choose the current version below.');
 meta={head:created.id,baseline:data};persistMeta();notify(same(progressOf(),data)?'Progress uploaded. Other devices can now choose Download progress.':'Progress uploaded. Newer study activity on this device still needs another upload.');
 })}
async function applyProgress(data,e){
 validateProgress(data);unchangedSession(e);
 const next=clone(state);next.progress=clone(data.progress);next.quizHistory=clone(data.quizHistory);next.dailyLog=clone(data.dailyLog);next.settings||={};
 for(const key of settingsKeys){if(Object.hasOwn(data.settings,key))Object.defineProperty(next.settings,key,{value:clone(data.settings[key]),enumerable:true,writable:true,configurable:true});else delete next.settings[key]}
 next.settings.dailyTarget||=20;next.settings.favorites||=[];
 try{localStorage.setItem(KEY,JSON.stringify(next))}catch{throw Error('Device storage is full. Cloud progress was not applied.');}
 state=next;dailyActive=false;dailyQueue=[];dailyUndo=null;if(typeof stopDailyQuiz==='function')stopDailyQuiz();freeReviewHeldId=quizHeldId=null;cardPos=quizPos=0;flipped=translation=false;
 // Restore visible continuation only when the user next opens its page.
 window.dispatchEvent(new Event('studyhub:changed'));render();
}
async function downloadProgress(){clearPending();return run(async e=>{
 const local=progressOf(),c=await readCloud();unchangedSession(e);showCloud(c);if(!c.heads.length)throw Error('No cloud progress yet. Upload first from your most up-to-date phone.');if(c.heads.length!==1)throw Error('Choose one cloud progress version below before downloading.');
 const h=c.heads[0];if(!same(local,progressOf()))throw Error('Local progress changed while checking. Retry download.');
 if(same(local,h.payload.data)){meta={head:h.file.id,baseline:clone(local)};persistMeta();notify('This device already matches current cloud progress.');return}
 const isDirty=meta.baseline?!same(local,meta.baseline):!!hasProgress(local);
 pending={head:h.file.id,signature:cloudSignature(c),local:clone(local),data:clone(h.payload.data),dirty:isDirty};
 const cardIds=new Set(state.cards.map(x=>x.id)),questionIds=new Set(state.questions.map(x=>x.id));const absent=Object.keys(h.payload.data.progress).filter(id=>!cardIds.has(id)).length+Object.keys(h.payload.data.quizHistory).filter(id=>!questionIds.has(id)).length;
 $('syncPreviewText').textContent=`From ${h.payload.deviceName} · ${formatTime(h)} · ${counts(h.payload.data)}. ${absent?absent+' progress records refer to content absent on this device; those records will be retained. ':''}Word banks, explanations, IPA and question content stay unchanged. A full recovery copy will be saved before applying.`;
 $('syncReplaceWarning').classList.toggle('hidden',!isDirty);$('syncReplaceAck').checked=false;$('syncDownloadPreview').classList.remove('hidden');notify(isDirty?'This device has progress that is not in its last cloud baseline. Review before replacing it.':'Cloud progress is ready. Confirm download below.');
 })}
async function confirmDownload(){if(!pending||pending.dirty&&!$('syncReplaceAck').checked)return;return run(async e=>{
 const p=pending;if(!same(progressOf(),p.local)){clearPending();throw Error('You studied after the preview. Download again to review the latest local progress.');}
 const c=await readCloud();unchangedSession(e);showCloud(c);if(cloudSignature(c)!==p.signature){clearPending();throw Error('Cloud changed after the preview. Download again.');}
 await checkpoint('Before cloud download');unchangedSession(e);if(!same(progressOf(),p.local))throw Error('Local progress changed while saving recovery. Download again.');
 await applyProgress(p.data,e);meta={head:p.head,baseline:progressOf()};persistMeta();clearPending();notify('Cloud progress downloaded. Word banks and question content were preserved.');
 })}
async function useBranch(){return run(async e=>{const previous=cloud;if(!previous||previous.heads.length<2)return;const selected=previous.heads.find(h=>h.file.id===$('syncBranchChoice').value);if(!selected)return;if(!confirm('Make the selected progress version current for all devices? Other cloud versions remain available for recovery. Local progress is not replaced.'))return;const now=await readCloud();unchangedSession(e);if(cloudSignature(now)!==cloudSignature(previous)){showCloud(now);throw Error('Cloud changed. Review the choices again.');}await createRevision(selected.payload.data,now.heads.map(h=>h.file.id));unchangedSession(e);const after=await readCloud();unchangedSession(e);showCloud(after);clearPending();notify(after.heads.length===1?'Cloud version selected. Choose Download progress to apply it to this device.':'Another upload happened concurrently. Review the retained versions again.');})}
async function loadGIS(){if(window.google?.accounts?.oauth2)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=resolve;s.onerror=()=>reject(Error('Unable to load Google sign-in.'));document.head.append(s)})}
async function connect(){if(busy)return;const clientId=$('syncClientId').value.trim();if(!/^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)){notify('Enter a valid Google OAuth Web Client ID.');return}localStorage.setItem(CLIENT_KEY,clientId);busy=true;setButtons();notify('Opening Google sign-in…');try{await loadGIS();tokenClient=google.accounts.oauth2.initTokenClient({client_id:clientId,scope:SCOPE,callback:async response=>{
 if(response.error){busy=false;notify('Google authorization failed: '+response.error);setButtons();return}epoch++;const e=epoch;token=response.access_token;expiry=Date.now()+(response.expires_in||3600)*1000;account='';cloud=null;pending=null;$('syncDownloadPreview').classList.add('hidden');
 try{const r=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+token}});if(!r.ok)throw Error('Unable to verify Google account.');const user=await r.json();if(e!==epoch)return;if(!user.sub)throw Error('Google account identity is unavailable.');account=user.sub;email=user.email||'Google account';try{meta=JSON.parse(localStorage.getItem(META_PREFIX+account)||'{}')}catch{meta={}}busy=false;setButtons();notify('Connected. Checking cloud status only…');await checkCloud();}catch(err){busy=false;token='';account='';notify(err.message);setButtons()}
 },error_callback:()=>{busy=false;notify('Google sign-in was closed or could not open.');setButtons()}});tokenClient.requestAccessToken({prompt:'select_account'});}catch(err){busy=false;notify(err.message);setButtons()}}
function disconnect(){if(busy)return;epoch++;token='';expiry=0;account='';email='';meta={};cloud=null;clearPending();$('syncBranches').classList.add('hidden');$('syncCloudState').textContent='Not connected.';notify('Disconnected. Local study records are preserved.');setButtons()}
function init(){
 $('syncClientId').value=localStorage.getItem(CLIENT_KEY)||'';$('syncDeviceName').value=localStorage.getItem('nsh-v351-device-name')||defaultName;$('syncDeviceName').onchange=()=>localStorage.setItem('nsh-v351-device-name',$('syncDeviceName').value.trim().slice(0,60));
 $('syncConnect').onclick=connect;$('syncDisconnect').onclick=disconnect;$('syncCheck').onclick=checkCloud;$('syncUpload').onclick=uploadProgress;$('syncDownload').onclick=downloadProgress;$('syncConfirmDownload').onclick=confirmDownload;$('syncCancelDownload').onclick=clearPending;$('syncReplaceAck').onchange=setButtons;$('syncUseBranch').onclick=useBranch;$('syncExportRecovery').onclick=exportRecovery;
 window.addEventListener('studyhub:changed',()=>{if(pending&&!same(progressOf(),pending.local))clearPending();setButtons()});
 notify('Manual progress sync. Connect, then choose Upload progress or Download progress. Nothing transfers automatically.');setButtons();listRecoveries();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.__nshSyncTest={progressOf,validateProgress,graphHeads,same,digest};
})();
