const KEY='unihan-notes-gist-sync-v1';
const DESCRIPTION='Unihan-Notes-sync';
const FILENAME='unihan-notes-data.json';
const $=id=>document.getElementById(id);
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return {}}}
function save(st){localStorage.setItem(KEY,JSON.stringify(st))}
function dateLabel(ms){return ms?new Date(ms).toLocaleString('vi-VN'):''}
function deviceLabel(){const ua=navigator.userAgent;if(/iPhone/.test(ua))return'iPhone';if(/iPad/.test(ua))return'iPad';if(/Android/.test(ua))return'Android';if(/Windows/.test(ua))return'Windows';if(/Mac/.test(ua))return'Mac';return'thiết bị khác'}
async function github(path,token,options={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
    const response=await fetch('https://api.github.com'+path,{method:options.method||'GET',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json',...(options.body?{'Content-Type':'application/json'}:{})},body:options.body?JSON.stringify(options.body):undefined,signal:controller.signal,cache:'no-store'});
    if(!response.ok){const error=new Error('HTTP '+response.status);error.status=response.status;throw error}
    return response.json();
  }finally{clearTimeout(timer)}
}
async function readGist(id,token){
  const gist=await github('/gists/'+id,token),file=gist.files?.[FILENAME];
  if(!file)throw new Error('missing-data');
  let content=file.content;
  if(file.truncated){const url=new URL(file.raw_url);if(url.protocol!=='https:'||!url.hostname.endsWith('githubusercontent.com'))throw new Error('invalid-data');const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error('missing-data');content=await response.text()}
  let payload;try{payload=JSON.parse(content)}catch{throw new Error('invalid-data')}
  if(payload?.app!=='unihan-notes'||!Number.isInteger(payload.rev)||payload.rev<1||!Array.isArray(payload.document?.pages)||!payload.document.pages.some(p=>p.id==='home'))throw new Error('invalid-data');
  return payload;
}
export function createSync({getData,hasLocalData,applyRemote,notify,onStatus}){
  let st=load(),busy=false,timer=null,lastRun=0,writeVersion=0,pendingRemote=null,errorText='';
  const enabled=()=>!!(st.token&&st.gistId);
  function shortStatus(){if(!enabled())return'Đang lưu trên thiết bị này';if(st.needChoice||pendingRemote)return'Cần chọn bản ghi chú';if(busy)return'Đang đồng bộ...';if(st.dirty)return'Chờ đồng bộ';if(errorText)return'Lỗi đồng bộ';return'Đã đồng bộ'+(st.lastSyncAt?' · '+dateLabel(st.lastSyncAt):'')}
  function render(){
    $('syncConnectPanel').hidden=enabled();$('syncActivePanel').hidden=!enabled();$('syncChoicePanel').hidden=!(st.needChoice||pendingRemote);
    $('syncDetail').textContent=(st.login?'GitHub: '+st.login+'. ':'')+shortStatus()+(errorText?' — '+errorText:'');
    onStatus();
  }
  function schedule(ms=4000){clearTimeout(timer);timer=setTimeout(()=>run(false),ms)}
  function markDirty(){if(!enabled())return;writeVersion++;st.dirty=true;st.dirtyAt=Date.now();save(st);render();schedule()}
  function fail(error){
    st.retryCount=Math.min((st.retryCount||0)+1,6);st.retryAt=Date.now()+Math.min(300000,5000*2**st.retryCount);save(st);
    if(error.status===401){st.authFailed=true;save(st);errorText='Mã truy cập hết hạn hoặc không hợp lệ. Hãy ngắt kết nối rồi tạo mã mới.'}
    else if(error.status===403||error.status===429)errorText='GitHub tạm từ chối yêu cầu. Ứng dụng sẽ thử lại.';
    else if(error.status===422)errorText='Dữ liệu quá lớn để đưa lên Gist. Hãy dùng ảnh bìa nhỏ hơn.';
    else if(error.message==='invalid-data'||error.message==='missing-data')errorText='Dữ liệu Gist không hợp lệ. Bản trên máy vẫn được giữ.';
    else errorText='Chưa kết nối được. Ghi chú vẫn được giữ trên máy và sẽ thử lại.';
    render();
  }
  function apply(payload){applyRemote(payload.document);st.baseRev=payload.rev;st.dirty=false;st.dirtyAt=0;st.needChoice=false;st.lastSyncAt=Date.now();pendingRemote=null;errorText='';save(st);render()}
  async function push(baseRev){
    const sentVersion=writeVersion,document=structuredClone(getData());
    const payload={app:'unihan-notes',rev:baseRev+1,updatedAt:new Date().toISOString(),device:deviceLabel(),document};
    await github('/gists/'+st.gistId,st.token,{method:'PATCH',body:{files:{[FILENAME]:{content:JSON.stringify(payload)}}}});
    st.baseRev=payload.rev;st.dirty=sentVersion!==writeVersion;st.lastSyncAt=Date.now();st.retryCount=0;st.retryAt=0;errorText='';save(st);render();if(st.dirty)schedule(1200);
  }
  async function run(manual=false){
    if(!enabled()||busy||st.needChoice)return;
    if(navigator.onLine===false){errorText='Đang ngoại tuyến. Ghi chú vẫn nằm trên máy.';render();return}
    if(!manual&&((st.authFailed)||(st.retryAt&&Date.now()<st.retryAt)))return;
    busy=true;lastRun=Date.now();render();const before=writeVersion;
    try{
      const remote=await readGist(st.gistId,st.token);
      if(remote.rev>Number(st.baseRev||0)){
        if(st.dirty||before!==writeVersion){pendingRemote=remote;st.needChoice=true;save(st);errorText='Hai thiết bị đã thay đổi ghi chú. Hãy chọn bản chính.';if(!$('settingsDialog').open)$('settingsDialog').showModal();render();return}
        if(document.activeElement?.isContentEditable){schedule(3000);return}
        apply(remote);notify('Đã cập nhật ghi chú từ GitHub');
      }else if(st.dirty){await push(remote.rev)}
      else{st.lastSyncAt=Date.now();st.retryCount=0;st.retryAt=0;errorText='';save(st);render();if(manual)notify('Đã đồng bộ')}
    }catch(error){fail(error)}finally{busy=false;render()}
  }
  async function connect(rawToken){
    const token=rawToken.trim();if(!token){notify('Hãy dán mã truy cập GitHub');return}
    const button=$('connectGist');button.disabled=true;button.textContent='Đang kết nối...';
    try{
      const user=await github('/user',token);
      let found=null;
      for(let n=1;n<=5&&!found;n++){const list=await github('/gists?per_page=100&page='+n,token);found=list.find(g=>g.description===DESCRIPTION&&g.files?.[FILENAME]);if(list.length<100)break}
      const localAlreadyUsed=hasLocalData();
      if(found){
        const remote=await readGist(found.id,token);
        st={token,gistId:found.id,login:user.login,baseRev:0,dirty:localAlreadyUsed,needChoice:localAlreadyUsed};save(st);
        if(localAlreadyUsed){pendingRemote=remote;errorText='Chọn bản chính để kết nối';render();notify('Hãy chọn bản ghi chú muốn giữ')}
        else{apply(remote);notify('Đã kết nối và tải ghi chú từ GitHub')}
      }else{
        const payload={app:'unihan-notes',rev:1,updatedAt:new Date().toISOString(),device:deviceLabel(),document:structuredClone(getData())};
        const gist=await github('/gists',token,{method:'POST',body:{description:DESCRIPTION,public:false,files:{[FILENAME]:{content:JSON.stringify(payload)}}}});
        st={token,gistId:gist.id,login:user.login,baseRev:1,dirty:false,lastSyncAt:Date.now()};save(st);errorText='';render();notify('Đã kết nối GitHub Gist');
      }
      $('gistToken').value='';
    }catch(error){if(error.status===401)notify('Mã truy cập không hợp lệ hoặc đã hết hạn');else if(error.status===403)notify('Mã chưa có quyền gist hoặc GitHub tạm từ chối');else notify('Không kết nối được GitHub. Hãy thử lại.');errorText='Chưa kết nối được';render()}
    finally{button.disabled=false;button.textContent='Kết nối'}
  }
  async function chooseRemote(){if(!enabled())return;try{const remote=await readGist(st.gistId,st.token);apply(remote);notify('Đã dùng bản trên GitHub')}catch(error){fail(error)}}
  async function chooseLocal(){if(!enabled())return;busy=true;render();try{const remote=await readGist(st.gistId,st.token);await push(remote.rev);st.needChoice=false;pendingRemote=null;save(st);errorText='';notify('Đã đưa bản trên máy này lên GitHub')}catch(error){fail(error)}finally{busy=false;render()}}
  function disconnect(){if(!confirm('Ngắt kết nối GitHub trên thiết bị này? Ghi chú trên máy và Gist vẫn được giữ.'))return;clearTimeout(timer);st={};save(st);pendingRemote=null;errorText='';render();notify('Đã ngắt kết nối')}
  function init(){render();if(enabled())schedule(800);const check=()=>{if(Date.now()-lastRun>10000)run(false)};window.addEventListener('focus',check);window.addEventListener('online',()=>{st.retryAt=0;save(st);run(false)});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check();else if(st.dirty)run(false)});setInterval(()=>{if(document.visibilityState==='visible')check()},30000)}
  return{init,render,markDirty,shortStatus,run,connect,chooseRemote,chooseLocal,disconnect};
}
