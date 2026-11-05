import { createSync } from './sync.js';
const SOURCE_ROOT = 'https://app.notion.com/p/Unihan-105ae29a6c8c80909fd2dfbd546a419b';
const groups = [
  { id:'life',title:'My life',icon:'🌷',color:'#e890b4',bg:'#fff0f6',items:[
    ['Danh ngôn','🌸','https://app.notion.com/p/Danh-ng-n-1e0ae29a6c8c819f82d8d1b23d9c4d1e'],['Useful webs/apps','🧭','https://app.notion.com/p/Useful-webs-apps-1e0ae29a6c8c8128970ee89c9e97c711'],['Tip','💡','https://app.notion.com/p/Tip-1e0ae29a6c8c81b8b8fdd8bcc6dff44f'],['Book','📖','https://app.notion.com/p/Book-1e0ae29a6c8c81fc8e3ff2137b361295'],['Idea','✨','https://app.notion.com/p/Idea-1e0ae29a6c8c81829e71ff4c8da0d899']]},
  {id:'ielts',title:'Ielts',icon:'🩵',color:'#6498e7',bg:'#edf5ff',items:[
    ['Grammar','📘','https://app.notion.com/p/Grammar-1e0ae29a6c8c8161b39ffabf8b0af0d0'],['Lộ trình','🗺️','https://app.notion.com/p/L-tr-nh-1e0ae29a6c8c8143a361d5a200a11e64'],['Part 6','📝','https://app.notion.com/p/Part-6-1e0ae29a6c8c810b9ef4d9a2f8a13d39'],['Speaking','🎙️','https://app.notion.com/p/Speaking-1e0ae29a6c8c810c9757c549e1f1c2de'],['Reading','📄','https://app.notion.com/p/Reading-1e0ae29a6c8c819187d1c0308e07e372'],['Writing','✍️','https://app.notion.com/p/Writing-1e0ae29a6c8c8115b9a0f3616d0c36f7'],['Documents','🗂️','https://app.notion.com/p/Documents-1e0ae29a6c8c818aaa73cdec5bbd5afe']]},
  {id:'content',title:'Content',icon:'🎨',color:'#a178cc',bg:'#f6efff',items:[
    ['Content','📝','https://app.notion.com/p/Content-1e0ae29a6c8c81a6aaf3d5a6f382deed'],['Design','🎨','https://app.notion.com/p/Design-1e0ae29a6c8c81fbb32de649ccdfb155'],['Thuật ngữ Marketing','📊','https://app.notion.com/p/Thu-t-ng-Marketing-1e0ae29a6c8c8176858ece37269887e5'],['Job','💼','https://app.notion.com/p/Job-1e0ae29a6c8c81cd81c6f49bfd65a814'],['Edit video','🎬','https://app.notion.com/p/Edit-video-1e0ae29a6c8c819e8069facaae3bfecf']]},
  {id:'handmade',title:'Handmade',icon:'🧶',color:'#76ad81',bg:'#edf8f0',items:[
    ['DIY','🍀','https://app.notion.com/p/DIY-1e0ae29a6c8c81989847c75e2f43b40c'],['Papercraft','🌿','https://app.notion.com/p/1e0ae29a6c8c81928212dcc56cab9e64'],['Sticker','🌼','https://app.notion.com/p/Sticker-1e0ae29a6c8c811199aef77d6ab624fa'],['Crochet','🧵','https://app.notion.com/p/Crochet-1e0ae29a6c8c812fb410cf5a57045cde']]},
  {id:'cooking',title:'Cooking',icon:'🍰',color:'#e6a66f',bg:'#fff2e6',items:[
    ['Cake','🧁','https://app.notion.com/p/Cake-1e0ae29a6c8c81229e4dc637099ce0fc'],['Snack','🍪','https://app.notion.com/p/Snack-1e0ae29a6c8c816ca599f5be5b0296ca'],['Food','🥘','https://app.notion.com/p/Food-1e0ae29a6c8c81c281a5c3c83097584e']]},
  {id:'beautiful',title:'Beautiful',icon:'🌼',color:'#d4ad4f',bg:'#fff9e9',items:[
    ['Hair','💇','https://app.notion.com/p/Hair-1e0ae29a6c8c81239824ffc9bf6ef89c'],['Face','🪞','https://app.notion.com/p/Face-1e0ae29a6c8c81ea9670f6fd9753a19a'],['Chân','🦶','https://app.notion.com/p/Ch-n-1e0ae29a6c8c815587e0f95676c34c79'],['Take photo','📷','https://app.notion.com/p/Take-photo-1e0ae29a6c8c817cb0ccc34e9dbf9e39'],['Tập thể dục','🏃','https://app.notion.com/p/T-p-th-d-c-1e0ae29a6c8c81d6a743f8ad6fbec972']]}];

const STORAGE_KEY='unihan-notes-v1';
const $=id=>document.getElementById(id);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID();
function initialData(){
  const pages=[{id:'home',parent:null,title:'Unihan',icon:'🩵',cover:'',blocks:[],favorite:true,source:SOURCE_ROOT}];
  for(const g of groups){
    pages.push({id:g.id,parent:'home',title:g.title,icon:g.icon,cover:'',blocks:[],favorite:false,source:''});
    for(const [title,icon,source] of g.items) pages.push({id:uid(),parent:g.id,title,icon,cover:'',blocks:[{id:uid(),type:'text',text:''}],favorite:false,source});
  }
  return {pages,updatedAt:new Date().toISOString()};
}
function loadData(){try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY));if(raw?.pages?.some(p=>p.id==='home'))return raw}catch{}return initialData()}
let data=loadData(),currentId=(location.hash.slice(1)||'home'),saveTimer,toastTimer,imageTarget='cover';
if(!data.pages.some(p=>p.id===currentId))currentId='home';
const page=id=>data.pages.find(p=>p.id===id);
const children=id=>data.pages.filter(p=>p.parent===id);
function notify(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800)}
function persist(){data.updatedAt=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));$('saveStatus').textContent='Đã lưu'}catch{$('saveStatus').textContent='Bộ nhớ đầy';notify('Bộ nhớ trình duyệt đã đầy. Hãy dùng ảnh bìa nhỏ hơn.')}sync.markDirty()}
function changed(){ $('saveStatus').textContent='Đang lưu...';sync.markDirty();clearTimeout(saveTimer);saveTimer=setTimeout(persist,350)}
function navigate(id){if(!page(id))return;currentId=id;location.hash=id;render();window.scrollTo(0,0);$('sidebar').classList.remove('open');$('sidebarShade').classList.remove('show')}
function render(){const p=page(currentId)||page('home');renderNav();renderBreadcrumbs(p);$('favoriteButton').textContent=p.favorite?'★':'☆';$('favoriteButton').style.color=p.favorite?'#4b87d5':'';if(p.id==='home')renderHome(p);else renderEditor(p)}
function renderNav(){
  const item=(p,depth=0)=>`<a href="#${escapeHtml(p.id)}" data-page="${escapeHtml(p.id)}" class="nav-item ${currentId===p.id?'active':''} ${depth===1?'child':depth>1?'grandchild':''}"><span class="nav-icon">${escapeHtml(p.icon||'📄')}</span><span class="nav-title">${escapeHtml(p.title||'Chưa có tiêu đề')}</span></a>`;
  $('favoritesNav').innerHTML=data.pages.filter(p=>p.favorite).map(p=>item(p)).join('')||'<div class="group-empty">Chưa có trang yêu thích</div>';
  $('pageNav').innerHTML=children('home').map(g=>item(g)+children(g.id).map(c=>item(c,1)).join('')).join('');
  $('syncStatus').textContent=sync.shortStatus();
}
function renderBreadcrumbs(p){let chain=[],x=p;while(x&&chain.length<5){chain.unshift(x);x=page(x.parent)}$('breadcrumbs').innerHTML=chain.map((a,i)=>`${i?'<span class="crumb-sep">/</span>':''}<button class="crumb ${i===chain.length-1?'current':''}" data-page="${escapeHtml(a.id)}">${escapeHtml(a.icon)} ${escapeHtml(a.title)}</button>`).join('')}
function coverHtml(p){return `<div class="cover ${p.cover?'has-image':''}" ${p.cover?`style="background-image:url('${escapeHtml(p.cover)}')"`:''}><button class="cover-button" id="changeCover">${p.cover?'Thay ảnh bìa':'Thêm ảnh bìa'}</button></div>`}
function headerHtml(p){return `${coverHtml(p)}<div class="page-icon"><button id="changeIcon" title="Đổi biểu tượng">${escapeHtml(p.icon||'📄')}</button></div><h1 class="page-title" id="pageTitle" contenteditable="true" role="textbox" aria-label="Tiêu đề trang" spellcheck="true" data-placeholder="Chưa có tiêu đề">${escapeHtml(p.title)}</h1>`}
function renderHome(p){
  $('view').innerHTML=`${coverHtml(p)}<div class="page-shell">${headerHtml(p).replace(/^.*?<div class="page-icon">/s,'<div class="page-icon">')}<p class="dashboard-intro">Be happy for this moment. This moment is your life.</p><div class="dashboard-grid" id="dashboardGrid"></div></div>`;
  const grid=$('dashboardGrid');
  for(const g of children('home')){
    const original=groups.find(x=>x.id===g.id);const bg=original?.bg||'#edf5ff',accent=original?.color||'#6498e7';
    const card=document.createElement('section');card.className='group-card';card.style.setProperty('--card-bg',bg);card.style.setProperty('--card-accent',accent);
    card.innerHTML=`<div class="group-card-head"><span class="group-card-title">${escapeHtml(g.title)}</span></div><div class="group-card-list">${children(g.id).map(c=>`<button class="group-link" data-page="${escapeHtml(c.id)}"><span class="group-emoji">${escapeHtml(c.icon)}</span>${escapeHtml(c.title)}</button>`).join('')||'<div class="group-empty">Chưa có trang nào</div>'}</div>`;
    grid.append(card);
  }
}
function renderEditor(p){
  $('view').innerHTML=`${coverHtml(p)}<div class="page-shell editor-shell">${headerHtml(p).replace(/^.*?<div class="page-icon">/s,'<div class="page-icon">')}${p.source?`<a class="source-link" href="${escapeHtml(p.source)}" target="_blank" rel="noopener noreferrer">↗ Xem trang Notion gốc</a>`:''}<div class="blocks" id="blocks"></div><button class="new-block" id="addBlock">＋ Nhấn để thêm nội dung</button></div>`;
  renderBlocks(p);
}
function renderBlocks(p){const container=$('blocks');if(!container)return;container.innerHTML=(p.blocks||[]).map(b=>`<div class="block-row" data-block-id="${escapeHtml(b.id)}"><div class="block-tools"><button class="block-tool" data-add-before="${escapeHtml(b.id)}" title="Thêm khối">＋</button><button class="block-tool" data-block-menu="${escapeHtml(b.id)}" title="Đổi kiểu khối">⋮</button></div><div class="block ${escapeHtml(b.type||'text')} ${b.done?'done':''}" contenteditable="true" role="textbox" aria-label="Nội dung ghi chú" spellcheck="true" data-placeholder="Viết gì đó, hoặc gõ /h1, /h2, /bullet, /todo...">${escapeHtml(b.text)}</div></div>`).join('')}
function createPage(parent='home'){const p={id:uid(),parent,title:'Chưa có tiêu đề',icon:'📄',cover:'',blocks:[{id:uid(),type:'text',text:''}],favorite:false,source:''};data.pages.push(p);persist();navigate(p.id);$('pageTitle')?.focus();document.execCommand?.('selectAll')}
function createBlock(p,index,type='text'){const b={id:uid(),type,text:''};p.blocks.splice(index,0,b);changed();renderBlocks(p);document.querySelector(`[data-block-id="${b.id}"] .block`)?.focus()}
function blockFromElement(el){const p=page(currentId),id=el.closest('.block-row')?.dataset.blockId;return {p,b:p?.blocks?.find(x=>x.id===id),index:p?.blocks?.findIndex(x=>x.id===id)}}
document.addEventListener('click',e=>{
  const link=e.target.closest('[data-page]');if(link){e.preventDefault();navigate(link.dataset.page);return}
  if(e.target.closest('#homeButton'))navigate('home');
  if(e.target.closest('#newPageButton'))createPage(currentId==='home'?'home':currentId);
  if(e.target.closest('#searchButton'))openSearch();
  if(e.target.closest('#settingsButton'))openSettings();
  if(e.target.closest('#openSidebar')){$('sidebar').classList.add('open');$('sidebarShade').classList.add('show')}
  if(e.target.closest('#closeSidebar')||e.target.id==='sidebarShade'){$('sidebar').classList.remove('open');$('sidebarShade').classList.remove('show')}
  if(e.target.closest('#favoriteButton')){const p=page(currentId);p.favorite=!p.favorite;persist();renderNav();$('favoriteButton').textContent=p.favorite?'★':'☆';$('favoriteButton').style.color=p.favorite?'#4b87d5':''}
  if(e.target.closest('#moreButton')){const action=prompt('Trang: nhập "new" để tạo trang con, "delete" để xóa trang hiện tại, hoặc "export" để tải bản sao JSON.');if(action==='new')createPage(currentId);if(action==='delete')deletePage();if(action==='export')exportData()}
  if(e.target.closest('#changeCover')){imageTarget='cover';$('imagePicker').click()}
  if(e.target.closest('#changeIcon')){const icon=prompt('Nhập emoji cho trang:',page(currentId).icon);if(icon?.trim()){page(currentId).icon=icon.trim().slice(0,4);changed();render()}}
  if(e.target.closest('#addBlock')){const p=page(currentId);createBlock(p,p.blocks.length)}
  if(e.target.closest('[data-add-before]')){const p=page(currentId),i=p.blocks.findIndex(b=>b.id===e.target.closest('[data-add-before]').dataset.addBefore);createBlock(p,i)}
  if(e.target.closest('[data-block-menu]')){const p=page(currentId),b=p.blocks.find(x=>x.id===e.target.closest('[data-block-menu]').dataset.blockMenu);const type=prompt('Kiểu khối: text, heading1, heading2, bullet, quote, todo. Nhập delete để xóa.',b.type);if(type==='delete'){p.blocks=p.blocks.filter(x=>x.id!==b.id);changed();renderBlocks(p)}else if(['text','heading1','heading2','bullet','quote','todo'].includes(type)){b.type=type;changed();renderBlocks(p)}}
  if(e.target.closest('[data-close]'))$(e.target.closest('[data-close]').dataset.close).close();
});
document.addEventListener('input',e=>{if(e.target.id==='pageTitle'){page(currentId).title=e.target.textContent.trim()||'Chưa có tiêu đề';changed();renderNav();renderBreadcrumbs(page(currentId))}if(e.target.classList?.contains('block')){const {b}=blockFromElement(e.target);if(b){b.text=e.target.textContent;changed()}}});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}
  if(e.key==='Escape'&&$('sidebar').classList.contains('open')){$('sidebar').classList.remove('open');$('sidebarShade').classList.remove('show')}
  if(!e.target.classList?.contains('block'))return;
  const {p,b,index}=blockFromElement(e.target);if(!b)return;
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();createBlock(p,index+1,b.type==='bullet'||b.type==='todo'?b.type:'text')}
  if(e.key==='Backspace'&&!e.target.textContent&&p.blocks.length>1){e.preventDefault();p.blocks.splice(index,1);changed();renderBlocks(p);document.querySelectorAll('.block')[Math.max(0,index-1)]?.focus()}
  if(e.key===' '&&e.target.textContent.startsWith('/')){const map={'/h1':'heading1','/h2':'heading2','/bullet':'bullet','/quote':'quote','/todo':'todo'};const type=map[e.target.textContent.trim()];if(type){e.preventDefault();b.type=type;b.text='';changed();renderBlocks(p);document.querySelectorAll('.block')[index]?.focus()}}
  if(e.key===' '&&e.target.textContent===''&&b.type==='todo'){e.preventDefault();b.done=!b.done;changed();renderBlocks(p);document.querySelectorAll('.block')[index]?.focus()}
});
function deletePage(){const p=page(currentId);if(p.id==='home'){notify('Không thể xóa trang chủ');return}if(!confirm(`Xóa "${p.title}" và các trang con?`))return;const remove=new Set([p.id]);let size;do{size=remove.size;for(const x of data.pages)if(remove.has(x.parent))remove.add(x.id)}while(size!==remove.size);data.pages=data.pages.filter(x=>!remove.has(x.id));persist();navigate(p.parent||'home')}
function exportData(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='unihan-notes-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('imagePicker').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const scale=Math.min(1,1600/bitmap.width,900/bitmap.height);canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();page(currentId).cover=canvas.toDataURL('image/jpeg',0.78);changed();render();notify('Đã thêm ảnh bìa')}catch{notify('Không đọc được ảnh này')}e.target.value=''});
function openSearch(){$('searchDialog').showModal();$('searchInput').value='';renderSearch('');$('searchInput').focus()}
function renderSearch(q){const term=q.trim().toLocaleLowerCase('vi');const result=data.pages.filter(p=>!term||p.title.toLocaleLowerCase('vi').includes(term)).slice(0,30);$('searchResults').innerHTML=result.length?result.map(p=>`<button class="search-result" data-search-id="${escapeHtml(p.id)}"><span>${escapeHtml(p.icon)}</span><span>${escapeHtml(p.title)}<small>${escapeHtml(page(p.parent)?.title||'Trang chủ')}</small></span></button>`).join(''):'<div class="search-empty">Không tìm thấy trang nào</div>'}
$('searchInput').addEventListener('input',e=>renderSearch(e.target.value));$('searchResults').addEventListener('click',e=>{const id=e.target.closest('[data-search-id]')?.dataset.searchId;if(id){$('searchDialog').close();navigate(id)}});
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(page(id)&&id!==currentId){currentId=id;render()}});

function openSettings(){$('settingsDialog').showModal();sync.render()}
const sync=createSync({getData:()=>data,hasLocalData:()=>!!localStorage.getItem(STORAGE_KEY),applyRemote:remote=>{clearTimeout(saveTimer);data=remote;localStorage.setItem(STORAGE_KEY,JSON.stringify(data));if(!page(currentId))currentId='home';render()},notify,onStatus:()=>{if($('pageNav').children.length)renderNav()}});
$('connectGist').addEventListener('click',()=>sync.connect($('gistToken').value));
$('syncNow').addEventListener('click',()=>sync.run(true));
$('disconnectGist').addEventListener('click',()=>sync.disconnect());
$('chooseRemote').addEventListener('click',()=>sync.chooseRemote());
$('chooseLocal').addEventListener('click',()=>sync.chooseLocal());
$('backupButton').addEventListener('click',exportData);
render();sync.init();
