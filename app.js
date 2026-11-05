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
  const pages=[{id:'home',parent:null,title:"Ly's Notes",icon:'🩵',cover:'',blocks:[],favorite:true,source:SOURCE_ROOT}];
  for(const g of groups){
    pages.push({id:g.id,parent:'home',title:g.title,icon:g.icon,cover:'',blocks:[],favorite:false,source:''});
    for(const [title,icon,source] of g.items) pages.push({id:uid(),parent:g.id,title,icon,cover:'',blocks:[{id:uid(),type:'text',text:''}],favorite:false,source});
  }
  return {pages,updatedAt:new Date().toISOString()};
}
function loadData(){try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY));if(raw?.pages?.some(p=>p.id==='home')){const home=raw.pages.find(p=>p.id==='home');if(home.title==='Unihan')home.title="Ly's Notes";return raw}}catch{}return initialData()}
let data=loadData(),currentId=(location.hash.slice(1)||'home'),saveTimer,toastTimer,imageTarget='cover',imageBlockId=null,imageStepId=null;
let collapsedGroups;try{collapsedGroups=new Set(JSON.parse(localStorage.getItem('lys-notes-collapsed')||'[]'))}catch{collapsedGroups=new Set()}
let pendingDelete=null,colorTargetId=null,slashState=null,dragPayload=null;
const undoStack=[];
const slashCommands=[
  {key:'text',name:'Văn bản',icon:'T',hint:'Đoạn ghi chú thường',aliases:['text']},
  {key:'heading1',name:'Tiêu đề lớn',icon:'H₁',hint:'/h1',aliases:['h1','heading1']},
  {key:'heading2',name:'Tiêu đề nhỏ',icon:'H₂',hint:'/h2',aliases:['h2','heading2']},
  {key:'bullet',name:'Gạch đầu dòng',icon:'•',hint:'/bullet',aliases:['bullet','list']},
  {key:'todo',name:'Việc cần làm',icon:'☑',hint:'/todo',aliases:['todo']},
  {key:'quote',name:'Trích dẫn',icon:'❝',hint:'/quote',aliases:['quote']},
  {key:'image',name:'Chèn ảnh',icon:'▧',hint:'/photo',aliases:['photo','image']},
  {key:'columns',name:'Chia cột',icon:'▥',hint:'/columns',aliases:['columns','col']},
  {key:'table',name:'Bảng',icon:'▦',hint:'/table',aliases:['table','bang']},
  {key:'link',name:'Liên kết',icon:'🔗',hint:'/link',aliases:['link']},
  {key:'process',name:'Quy trình',icon:'↧',hint:'/Process',aliases:['process']}
];
if(!data.pages.some(p=>p.id===currentId))currentId='home';
const page=id=>data.pages.find(p=>p.id===id);
const children=id=>data.pages.filter(p=>p.parent===id);
function notify(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800)}
function rememberDeletion(){undoStack.push({data:structuredClone(data),currentId});if(undoStack.length>10)undoStack.shift()}
function undoDeletion(){const previous=undoStack.pop();if(!previous)return false;clearTimeout(saveTimer);data=previous.data;currentId=previous.currentId;location.hash=currentId;persist();render();notify('Đã hoàn tác thao tác xóa');return true}
function normalizeHex(value){const raw=String(value||'').trim();if(/^#[0-9a-f]{3}$/i.test(raw))return '#'+raw.slice(1).split('').map(c=>c+c).join('').toUpperCase();if(/^#[0-9a-f]{6}$/i.test(raw))return raw.toUpperCase();return null}
function pastel(hex){const color=normalizeHex(hex)||'#6498E7';const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));return '#'+rgb.map(n=>Math.round(n*.12+255*.88).toString(16).padStart(2,'0')).join('')}
function persist(){data.updatedAt=new Date().toISOString();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));$('saveStatus').textContent='Đã lưu'}catch{$('saveStatus').textContent='Bộ nhớ đầy';notify('Bộ nhớ trình duyệt đã đầy. Hãy dùng ảnh bìa nhỏ hơn.')}sync.markDirty()}
function changed(){ $('saveStatus').textContent='Đang lưu...';sync.markDirty();clearTimeout(saveTimer);saveTimer=setTimeout(persist,350)}
function navigate(id){if(!page(id))return;currentId=id;location.hash=id;render();window.scrollTo(0,0);$('sidebar').classList.remove('open');$('sidebarShade').classList.remove('show')}
function render(){const p=page(currentId)||page('home');renderNav();renderBreadcrumbs(p);$('favoriteButton').textContent=p.favorite?'★':'☆';$('favoriteButton').style.color=p.favorite?'#4b87d5':'';if(p.id==='home')renderHome(p);else renderEditor(p)}
function renderNav(){
  const item=(p,depth=0)=>`<a href="#${escapeHtml(p.id)}" data-page="${escapeHtml(p.id)}" class="nav-item ${currentId===p.id?'active':''} ${depth===1?'child':depth>1?'grandchild':''}"><span class="nav-icon">${escapeHtml(p.icon||'📄')}</span><span class="nav-title">${escapeHtml(p.title||'Chưa có tiêu đề')}</span></a>`;
  const branch=(id,depth=1,seen=new Set())=>children(id).filter(c=>!seen.has(c.id)).map(c=>item(c,depth)+branch(c.id,depth+1,new Set([...seen,c.id]))).join('');
  $('favoritesNav').innerHTML=data.pages.filter(p=>p.favorite).map(p=>item(p)).join('')||'<div class="group-empty">Chưa có trang yêu thích</div>';
  $('pageNav').innerHTML=children('home').map(g=>`<div class="nav-group"><div class="nav-group-head"><button class="nav-toggle" data-toggle-group="${escapeHtml(g.id)}" aria-label="${collapsedGroups.has(g.id)?'Mở':'Thu gọn'} ${escapeHtml(g.title)}" aria-expanded="${!collapsedGroups.has(g.id)}">${collapsedGroups.has(g.id)?'▸':'▾'}</button>${item(g)}</div><div class="nav-children" ${collapsedGroups.has(g.id)?'hidden':''}>${branch(g.id)}</div></div>`).join('');
  const status=sync.shortStatus();$('syncStatus').textContent=status;$('topSyncText').textContent=status.includes('Đã đồng bộ')?'Đã đồng bộ':status.includes('Chờ')?'Chờ đồng bộ':status.includes('Lỗi')?'Lỗi đồng bộ':'Đồng bộ';
  $('topSyncButton').classList.toggle('synced',status.includes('Đã đồng bộ'));
}
function renderBreadcrumbs(p){let chain=[],x=p;while(x&&chain.length<5){chain.unshift(x);x=page(x.parent)}$('breadcrumbs').innerHTML=chain.map((a,i)=>`${i?'<span class="crumb-sep">/</span>':''}<button class="crumb ${i===chain.length-1?'current':''}" data-page="${escapeHtml(a.id)}">${escapeHtml(a.icon)} ${escapeHtml(a.title)}</button>`).join('')}
function coverHtml(p){return `<div class="cover ${p.cover?'has-image':''}" ${p.cover?`style="background-image:url('${escapeHtml(p.cover)}')"`:''}><button class="cover-button" id="changeCover">${p.cover?'Thay ảnh bìa':'Thêm ảnh bìa'}</button></div>`}
function headerHtml(p){return `${coverHtml(p)}<div class="page-icon"><button id="changeIcon" title="Đổi biểu tượng">${escapeHtml(p.icon||'📄')}</button></div><h1 class="page-title" id="pageTitle" contenteditable="true" role="textbox" aria-label="Tiêu đề trang" spellcheck="true" data-placeholder="Chưa có tiêu đề">${escapeHtml(p.title)}</h1>`}
function renderHome(p){
  $('view').innerHTML=`${coverHtml(p)}<div class="page-shell">${headerHtml(p).replace(/^.*?<div class="page-icon">/s,'<div class="page-icon">')}<p class="dashboard-intro">Be happy for this moment. This moment is your life.</p><div class="dashboard-grid" id="dashboardGrid"></div></div>`;
  const grid=$('dashboardGrid');
  for(const g of children('home')){
    const original=groups.find(x=>x.id===g.id);const accent=normalizeHex(g.cardColor)||original?.color||'#6498e7',bg=g.cardColor?pastel(accent):(original?.bg||'#edf5ff');
    const card=document.createElement('section');card.className='group-card';card.style.setProperty('--card-bg',bg);card.style.setProperty('--card-accent',accent);
    card.innerHTML=`<div class="group-card-head"><span class="group-card-title">${escapeHtml(g.title)}</span><button class="card-color-button" data-color-group="${escapeHtml(g.id)}" title="Đổi màu nhóm">🎨 Màu</button></div><div class="group-card-list">${children(g.id).map(c=>`<button class="group-link" data-page="${escapeHtml(c.id)}"><span class="group-emoji">${escapeHtml(c.icon)}</span>${escapeHtml(c.title)}</button>`).join('')}<button class="group-add" data-add-child="${escapeHtml(g.id)}" title="Thêm mục trong ${escapeHtml(g.title)}">＋ <span>Thêm mục</span></button></div>`;
    grid.append(card);
  }
  const add=document.createElement('button');add.className='group-add-card';add.dataset.addGroup='true';add.innerHTML='<span class="group-add-icon">＋</span><span>Thêm nhóm mới</span>';grid.append(add);
}
function renderEditor(p){
  $('view').innerHTML=`${coverHtml(p)}<div class="page-shell editor-shell">${headerHtml(p).replace(/^.*?<div class="page-icon">/s,'<div class="page-icon">')}<span class="brand-pill">Ly's Notes</span><div class="editor-toolbar" aria-label="Công cụ ghi chú"><button data-insert="text">Văn bản</button><button data-insert="image">▧ Ảnh</button><button data-insert="columns">▥ Chia cột</button><button data-insert="table">▦ Bảng</button><button data-insert="link">🔗 Liên kết</button><button data-insert="process">↧ Process</button></div><div id="childPages"></div><div class="blocks" id="blocks"></div><button class="new-block" id="addBlock">＋ Nhấn để thêm nội dung</button><div class="page-footer-actions"><button data-add-child="${escapeHtml(p.id)}">＋ Trang con</button><button id="deletePageButton">Xóa trang này</button></div></div>`;
  renderChildPages(p);
  renderBlocks(p);
}
function renderChildPages(p){const target=$('childPages');if(!target)return;const list=children(p.id);target.innerHTML=list.length?`<section class="child-pages"><div class="child-pages-label">TRANG CON</div><div class="child-pages-grid">${list.map(c=>`<button class="child-page-card" data-page="${escapeHtml(c.id)}"><span class="child-page-icon">${escapeHtml(c.icon||'📄')}</span><span class="child-page-title">${escapeHtml(c.title||'Chưa có tiêu đề')}</span><span class="child-page-arrow">↗</span></button>`).join('')}</div></section>`:''}
function ensureColumns(b){if(!Array.isArray(b.columns)){b.columns=[{id:uid(),text:b.left||''},{id:uid(),text:b.right||''}]}return b.columns}
function ensureTable(b){if(!b.table||!Array.isArray(b.table.columns)||!Array.isArray(b.table.rows)){const cols=[{id:uid(),title:'Cột 1'},{id:uid(),title:'Cột 2'}];b.table={columns:cols,rows:[{id:uid(),cells:{[cols[0].id]:'',[cols[1].id]:''}},{id:uid(),cells:{[cols[0].id]:'',[cols[1].id]:''}}]}}return b.table}
function moveItem(items,id,direction){const from=items.findIndex(x=>x.id===id),to=from+direction;if(from<0||to<0||to>=items.length)return false;const [item]=items.splice(from,1);items.splice(to,0,item);return true}
function moveItemTo(items,id,targetId){const from=items.findIndex(x=>x.id===id),to=items.findIndex(x=>x.id===targetId);if(from<0||to<0||from===to)return false;const [item]=items.splice(from,1);items.splice(to,0,item);return true}
function columnsHtml(b,id){const columns=ensureColumns(b);return `<div class="columns-wrap"><div class="columns-block">${columns.map((c,i)=>`<div class="column-card" data-drop-kind="column" data-drop-id="${escapeHtml(c.id)}"><div class="column-toolbar"><button class="drag-handle" draggable="true" data-drag-kind="column" data-item-id="${escapeHtml(c.id)}" title="Kéo để đổi vị trí">⠿</button><span>Cột ${i+1}</span><button data-move-column="${escapeHtml(c.id)}" data-direction="-1" ${i===0?'disabled':''} title="Chuyển trái">←</button><button data-move-column="${escapeHtml(c.id)}" data-direction="1" ${i===columns.length-1?'disabled':''} title="Chuyển phải">→</button></div><div class="column-cell" contenteditable="true" data-field="column-text" data-column-id="${escapeHtml(c.id)}" data-placeholder="Nhập nội dung cột...">${escapeHtml(c.text||'')}</div></div>`).join('')}<button class="add-column" data-add-column="${id}" title="Thêm cột">＋<span>Thêm cột</span></button></div></div>`}
function tableHtml(b,id){const table=ensureTable(b);return `<div class="table-block"><div class="table-scroll"><table><thead><tr><th class="table-corner">#</th>${table.columns.map((col,i)=>`<th data-drop-kind="table-column" data-drop-id="${escapeHtml(col.id)}"><div class="table-col-head"><button class="drag-handle" draggable="true" data-drag-kind="table-column" data-item-id="${escapeHtml(col.id)}" title="Kéo đổi vị trí cột">⠿</button><div contenteditable="true" data-field="table-header" data-col-id="${escapeHtml(col.id)}" data-placeholder="Tên cột">${escapeHtml(col.title||'')}</div><button data-move-table-col="${escapeHtml(col.id)}" data-direction="-1" ${i===0?'disabled':''} title="Chuyển trái">←</button><button data-move-table-col="${escapeHtml(col.id)}" data-direction="1" ${i===table.columns.length-1?'disabled':''} title="Chuyển phải">→</button></div></th>`).join('')}<th class="table-add-col"><button data-table-add-col="${id}" title="Thêm cột">＋</button></th></tr></thead><tbody>${table.rows.map((row,i)=>`<tr data-drop-kind="table-row" data-drop-id="${escapeHtml(row.id)}"><th class="table-row-controls"><button class="drag-handle" draggable="true" data-drag-kind="table-row" data-item-id="${escapeHtml(row.id)}" title="Kéo đổi vị trí hàng">⠿</button><span>${i+1}</span><button data-move-table-row="${escapeHtml(row.id)}" data-direction="-1" ${i===0?'disabled':''} title="Chuyển lên">↑</button><button data-move-table-row="${escapeHtml(row.id)}" data-direction="1" ${i===table.rows.length-1?'disabled':''} title="Chuyển xuống">↓</button></th>${table.columns.map(col=>`<td><div contenteditable="true" data-field="table-cell" data-row-id="${escapeHtml(row.id)}" data-col-id="${escapeHtml(col.id)}" data-placeholder="Nhập nội dung...">${escapeHtml(row.cells?.[col.id]||'')}</div></td>`).join('')}<td class="table-spacer"></td></tr>`).join('')}</tbody></table></div><button class="table-add-row" data-table-add-row="${id}">＋ Thêm hàng</button></div>`}
function blockHtml(b){
  const id=escapeHtml(b.id),type=b.type||'text';
  const tools=`<div class="block-tools"><button class="block-tool" data-add-before="${id}" title="Thêm khối">＋</button><button class="block-tool" data-block-menu="${id}" title="Đổi kiểu hoặc xóa">⋮</button></div>`;
  let body;
  if(type==='image')body=`<div class="image-block"><button class="image-drop ${b.src?'filled':''}" data-image-block="${id}" title="Chọn ảnh">${b.src?`<img src="${escapeHtml(b.src)}" alt="${escapeHtml(b.caption||'Ảnh ghi chú')}">`:'＋ Chọn ảnh minh họa'}</button><div class="image-caption" contenteditable="true" data-field="caption" data-placeholder="Chú thích ảnh...">${escapeHtml(b.caption||'')}</div></div>`;
  else if(type==='columns')body=columnsHtml(b,id);
  else if(type==='table')body=tableHtml(b,id);
  else if(type==='link')body=`<div class="link-block"><span>🔗</span><div class="link-fields"><div class="link-title" contenteditable="true" data-field="text" data-placeholder="Tên liên kết...">${escapeHtml(b.text||'')}</div><input class="link-url" data-field="url" value="${escapeHtml(b.url||'')}" placeholder="https://example.com" aria-label="Địa chỉ liên kết"></div>${/^https?:\/\//i.test(b.url||'')?`<a href="${escapeHtml(b.url)}" target="_blank" rel="noopener noreferrer" title="Mở liên kết">↗</a>`:''}</div>`;
  else if(type==='process')body=`<div class="process-block"><div class="process-heading">QUY TRÌNH</div>${(b.steps||[]).map((s,i)=>`<div class="process-step" data-step-id="${escapeHtml(s.id)}"><div class="process-note" contenteditable="true" data-field="step-text" data-placeholder="Ghi chú bước ${i+1}...">${escapeHtml(s.text||'')}</div><div class="process-arrow" aria-label="Bước ${i+1}"><span>${i+1}</span></div><div class="process-visual"><button class="process-image ${s.image?'filled':''}" data-process-image="${escapeHtml(s.id)}" title="Chọn ảnh cho bước ${i+1}">${s.image?`<img src="${escapeHtml(s.image)}" alt="Minh họa bước ${i+1}">`:'＋ Ảnh minh họa'}</button><button class="remove-step" data-remove-step="${escapeHtml(s.id)}" aria-label="Xóa bước ${i+1}">×</button></div></div>`).join('')}<button class="process-add" data-add-step="${id}" title="Thêm bước">＋ <span>Thêm bước</span></button></div>`;
  else body=`<div class="block ${escapeHtml(type)} ${b.done?'done':''}" contenteditable="true" role="textbox" aria-label="Nội dung ghi chú" spellcheck="true" data-placeholder="Viết gì đó hoặc gõ / để chọn lệnh...">${escapeHtml(b.text)}</div>`;
  return `<div class="block-row" data-block-id="${id}">${tools}${body}</div>`;
}
function renderBlocks(p){const container=$('blocks');if(container)container.innerHTML=(p.blocks||[]).map(blockHtml).join('')}
function createPage(parent='home',title='Chưa có tiêu đề'){const p={id:uid(),parent,title,icon:parent==='home'?'🗂️':'📄',cover:'',blocks:[{id:uid(),type:'text',text:''}],favorite:false,source:''};data.pages.push(p);persist();navigate(p.id);$('pageTitle')?.focus();document.execCommand?.('selectAll')}
function newBlock(type='text'){const b={id:uid(),type,text:''};if(type==='process')b.steps=[{id:uid(),text:'',image:''}];if(type==='columns')b.columns=[{id:uid(),text:''},{id:uid(),text:''}];if(type==='table')ensureTable(b);if(type==='link')b.url='';return b}
function createBlock(p,index,type='text'){const b=newBlock(type);p.blocks.splice(index,0,b);changed();renderBlocks(p);document.querySelector(`[data-block-id="${b.id}"] [contenteditable]`)?.focus();if(type==='image'){imageTarget='block';imageBlockId=b.id;$('imagePicker').click()}}
function blockFromElement(el){const p=page(currentId),id=el.closest('.block-row')?.dataset.blockId;return {p,b:p?.blocks?.find(x=>x.id===id),index:p?.blocks?.findIndex(x=>x.id===id)}}
function clearSlashMenu(){document.querySelectorAll('.slash-menu').forEach(el=>el.remove());slashState=null}
function showSlashMenu(el){
  clearSlashMenu();const text=el.textContent.trim();if(!text.startsWith('/')||text.includes('\n')||text.length>28)return;
  const query=text.slice(1).toLowerCase(),options=slashCommands.filter(c=>!query||c.aliases.some(a=>a.includes(query))||c.name.toLowerCase().includes(query));
  const row=el.closest('.block-row');if(!row)return;
  const menu=document.createElement('div');menu.className='slash-menu';menu.innerHTML=`<div class="slash-menu-title">CHỌN KHỐI NỘI DUNG</div>${options.length?options.map((c,i)=>`<button class="slash-option ${i===0?'selected':''}" data-slash-type="${c.key}" data-slash-block="${escapeHtml(row.dataset.blockId)}"><span class="slash-option-icon">${c.icon}</span><span><strong>${c.name}</strong><small>${c.hint}</small></span></button>`).join(''):'<div class="slash-empty">Không tìm thấy lệnh</div>'}`;
  row.append(menu);slashState={blockId:row.dataset.blockId,options,index:0};
}
function selectSlash(type,blockId){const p=page(currentId),index=p.blocks.findIndex(b=>b.id===blockId);if(index<0)return;const b=newBlock(type);b.id=blockId;p.blocks[index]=b;clearSlashMenu();changed();renderBlocks(p);document.querySelector(`[data-block-id="${blockId}"] [contenteditable]`)?.focus();if(type==='image'){imageTarget='block';imageBlockId=blockId;$('imagePicker').click()}}
function openBlockContext(blockId){document.querySelectorAll('.block-context-menu').forEach(el=>el.remove());const row=document.querySelector(`[data-block-id="${blockId}"]`);if(!row)return;const menu=document.createElement('div');menu.className='block-context-menu';menu.innerHTML=`<button data-block-convert="${escapeHtml(blockId)}">⇄ Đổi kiểu khối</button><button class="delete-option" data-block-delete="${escapeHtml(blockId)}">🗑 Xóa khối</button>`;row.append(menu)}
function requestDelete(kind,id,stepId){const p=page(currentId);if(kind==='page'&&p.id==='home'){notify('Không thể xóa trang chủ');return}pendingDelete={kind,id,stepId,pageId:currentId};$('deleteMessage').textContent=kind==='page'?`Xóa trang “${p.title}” và mọi trang con?`:kind==='step'?'Xóa bước này khỏi quy trình?':'Xóa khối nội dung này?';$('deleteDialog').showModal()}
function executeDelete(){if(!pendingDelete)return;const {kind,id,stepId,pageId}=pendingDelete;pendingDelete=null;rememberDeletion();const p=page(pageId);
  if(kind==='page'){const remove=new Set([p.id]);let size;do{size=remove.size;for(const x of data.pages)if(remove.has(x.parent))remove.add(x.id)}while(size!==remove.size);data.pages=data.pages.filter(x=>!remove.has(x.id));persist();navigate(p.parent||'home')}
  else if(kind==='block'){p.blocks=p.blocks.filter(b=>b.id!==id);persist();renderBlocks(p)}
  else if(kind==='step'){const b=p.blocks.find(x=>x.id===id);if(b?.steps?.length>1)b.steps=b.steps.filter(s=>s.id!==stepId);else p.blocks=p.blocks.filter(x=>x.id!==id);persist();renderBlocks(p)}
  notify('Đã xóa · Nhấn Ctrl+Z để hoàn tác');
}
function openColor(groupId){const g=page(groupId);if(!g)return;colorTargetId=groupId;const original=groups.find(x=>x.id===groupId);const value=normalizeHex(g.cardColor)||original?.color?.toUpperCase()||'#6498E7';$('cardColorPicker').value=value;$('cardColorHex').value=value;previewColor();$('colorDialog').showModal()}
function previewColor(){const hex=normalizeHex($('cardColorHex').value);$('cardColorHex').classList.toggle('invalid',!hex);if(hex){$('cardColorPreview').style.background=pastel(hex);$('cardColorPreview').style.color=hex;$('cardColorPreview').textContent=page(colorTargetId)?.title||'Xem trước màu nhóm'}}
document.addEventListener('click',e=>{
  const slash=e.target.closest('[data-slash-type]');if(slash){selectSlash(slash.dataset.slashType,slash.dataset.slashBlock);return}
  const blockDelete=e.target.closest('[data-block-delete]');if(blockDelete){requestDelete('block',blockDelete.dataset.blockDelete);return}
  const convert=e.target.closest('[data-block-convert]');if(convert){const p=page(currentId),index=p.blocks.findIndex(b=>b.id===convert.dataset.blockConvert);const type=prompt('Chọn kiểu: text, heading1, heading2, bullet, quote, todo, image, columns, table, link, process',p.blocks[index]?.type||'text');if(['text','heading1','heading2','bullet','quote','todo','image','columns','table','link','process'].includes(type)){p.blocks[index]={...newBlock(type),id:convert.dataset.blockConvert};changed();renderBlocks(p);if(type==='image'){imageTarget='block';imageBlockId=convert.dataset.blockConvert;$('imagePicker').click()}}return}
  const toggle=e.target.closest('[data-toggle-group]');if(toggle){const id=toggle.dataset.toggleGroup;if(collapsedGroups.has(id))collapsedGroups.delete(id);else collapsedGroups.add(id);localStorage.setItem('lys-notes-collapsed',JSON.stringify([...collapsedGroups]));renderNav();return}
  const color=e.target.closest('[data-color-group]');if(color){openColor(color.dataset.colorGroup);return}
  const addColumn=e.target.closest('[data-add-column]');if(addColumn){const {p,b}=blockFromElement(addColumn);const c={id:uid(),text:''};ensureColumns(b).push(c);changed();renderBlocks(p);document.querySelector(`[data-column-id="${c.id}"]`)?.focus();return}
  const moveColumn=e.target.closest('[data-move-column]');if(moveColumn){const {p,b}=blockFromElement(moveColumn);if(moveItem(ensureColumns(b),moveColumn.dataset.moveColumn,Number(moveColumn.dataset.direction))){changed();renderBlocks(p)}return}
  const addTableCol=e.target.closest('[data-table-add-col]');if(addTableCol){const {p,b}=blockFromElement(addTableCol),table=ensureTable(b),col={id:uid(),title:`Cột ${table.columns.length+1}`};table.columns.push(col);for(const row of table.rows)row.cells[col.id]='';changed();renderBlocks(p);document.querySelector(`[data-col-id="${col.id}"][data-field="table-header"]`)?.focus();return}
  const addTableRow=e.target.closest('[data-table-add-row]');if(addTableRow){const {p,b}=blockFromElement(addTableRow),table=ensureTable(b),row={id:uid(),cells:{}};for(const col of table.columns)row.cells[col.id]='';table.rows.push(row);changed();renderBlocks(p);document.querySelector(`[data-row-id="${row.id}"][data-field="table-cell"]`)?.focus();return}
  const moveTableCol=e.target.closest('[data-move-table-col]');if(moveTableCol){const {p,b}=blockFromElement(moveTableCol);if(moveItem(ensureTable(b).columns,moveTableCol.dataset.moveTableCol,Number(moveTableCol.dataset.direction))){changed();renderBlocks(p)}return}
  const moveTableRow=e.target.closest('[data-move-table-row]');if(moveTableRow){const {p,b}=blockFromElement(moveTableRow);if(moveItem(ensureTable(b).rows,moveTableRow.dataset.moveTableRow,Number(moveTableRow.dataset.direction))){changed();renderBlocks(p)}return}
  const link=e.target.closest('[data-page]');if(link){e.preventDefault();navigate(link.dataset.page);return}
  if(e.target.closest('[data-add-group]')){createPage('home','Nhóm mới');return}
  const child=e.target.closest('[data-add-child]');if(child){createPage(child.dataset.addChild);return}
  if(e.target.closest('#homeButton'))navigate('home');
  if(e.target.closest('#newPageButton'))createPage(currentId==='home'?'home':currentId);
  if(e.target.closest('#searchButton'))openSearch();
  if(e.target.closest('#settingsButton')||e.target.closest('#topSyncButton'))openSettings();
  if(e.target.closest('#openSidebar')){$('sidebar').classList.add('open');$('sidebarShade').classList.add('show')}
  if(e.target.closest('#closeSidebar')||e.target.id==='sidebarShade'){$('sidebar').classList.remove('open');$('sidebarShade').classList.remove('show')}
  if(e.target.closest('#favoriteButton')){const p=page(currentId);p.favorite=!p.favorite;persist();renderNav();$('favoriteButton').textContent=p.favorite?'★':'☆';$('favoriteButton').style.color=p.favorite?'#4b87d5':''}
  if(e.target.closest('#deletePageButton')){requestDelete('page',currentId);return}
  if(e.target.closest('#changeCover')){imageTarget='cover';$('imagePicker').click()}
  if(e.target.closest('#changeIcon')){const icon=prompt('Nhập emoji cho trang:',page(currentId).icon);if(icon?.trim()){page(currentId).icon=icon.trim().slice(0,4);changed();render()}}
  if(e.target.closest('#addBlock')){const p=page(currentId);createBlock(p,p.blocks.length)}
  const insert=e.target.closest('[data-insert]');if(insert){const p=page(currentId);createBlock(p,p.blocks.length,insert.dataset.insert);return}
  const imageButton=e.target.closest('[data-image-block]');if(imageButton){imageTarget='block';imageBlockId=imageButton.dataset.imageBlock;$('imagePicker').click();return}
  const processImage=e.target.closest('[data-process-image]');if(processImage){imageTarget='process';imageStepId=processImage.dataset.processImage;imageBlockId=processImage.closest('[data-block-id]').dataset.blockId;$('imagePicker').click();return}
  const addStep=e.target.closest('[data-add-step]');if(addStep){const b=page(currentId).blocks.find(x=>x.id===addStep.dataset.addStep);b.steps??=[];b.steps.push({id:uid(),text:'',image:''});changed();renderBlocks(page(currentId));document.querySelector(`[data-step-id="${b.steps.at(-1).id}"] .process-note`)?.focus();return}
  const removeStep=e.target.closest('[data-remove-step]');if(removeStep){requestDelete('step',removeStep.closest('[data-block-id]').dataset.blockId,removeStep.dataset.removeStep);return}
  if(e.target.closest('[data-add-before]')){const p=page(currentId),i=p.blocks.findIndex(b=>b.id===e.target.closest('[data-add-before]').dataset.addBefore);createBlock(p,i)}
  if(e.target.closest('[data-block-menu]')){openBlockContext(e.target.closest('[data-block-menu]').dataset.blockMenu);return}
  if(e.target.closest('[data-close]'))$(e.target.closest('[data-close]').dataset.close).close();
});
document.addEventListener('dragstart',e=>{const handle=e.target.closest('[data-drag-kind]');if(!handle)return;dragPayload={kind:handle.dataset.dragKind,itemId:handle.dataset.itemId,blockId:handle.closest('[data-block-id]')?.dataset.blockId};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragPayload.itemId)});
document.addEventListener('dragover',e=>{const target=e.target.closest('[data-drop-kind]');if(dragPayload&&target?.dataset.dropKind===dragPayload.kind&&target.closest('[data-block-id]')?.dataset.blockId===dragPayload.blockId){e.preventDefault();e.dataTransfer.dropEffect='move'}});
document.addEventListener('drop',e=>{const target=e.target.closest('[data-drop-kind]');if(!dragPayload||!target||target.dataset.dropKind!==dragPayload.kind||target.closest('[data-block-id]')?.dataset.blockId!==dragPayload.blockId)return;e.preventDefault();const p=page(currentId),b=p.blocks.find(x=>x.id===dragPayload.blockId);const items=dragPayload.kind==='column'?ensureColumns(b):dragPayload.kind==='table-column'?ensureTable(b).columns:ensureTable(b).rows;if(moveItemTo(items,dragPayload.itemId,target.dataset.dropId)){changed();renderBlocks(p)}dragPayload=null});
document.addEventListener('dragend',()=>{dragPayload=null});
document.addEventListener('input',e=>{
  if(e.target.id==='pageTitle'){page(currentId).title=e.target.textContent.trim()||'Chưa có tiêu đề';changed();renderNav();renderBreadcrumbs(page(currentId));return}
  const field=e.target.dataset?.field;
  if(field){const {b}=blockFromElement(e.target);if(!b)return;if(field==='step-text'){const step=b.steps.find(s=>s.id===e.target.closest('[data-step-id]').dataset.stepId);if(step)step.text=e.target.textContent}
    else if(field==='column-text'){const col=ensureColumns(b).find(c=>c.id===e.target.dataset.columnId);if(col)col.text=e.target.textContent}
    else if(field==='table-header'){const col=ensureTable(b).columns.find(c=>c.id===e.target.dataset.colId);if(col)col.title=e.target.textContent}
    else if(field==='table-cell'){const row=ensureTable(b).rows.find(r=>r.id===e.target.dataset.rowId);if(row)row.cells[e.target.dataset.colId]=e.target.textContent}
    else if(field==='url')b.url=e.target.value;else b[field]=e.target.textContent;changed();return}
  if(e.target.classList?.contains('block')){const {b}=blockFromElement(e.target);if(b){b.text=e.target.textContent;changed();if(b.text.trim().startsWith('/'))showSlashMenu(e.target);else clearSlashMenu()}}
});
document.addEventListener('change',e=>{if(e.target.classList?.contains('link-url'))renderBlocks(page(currentId))});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!e.shiftKey&&undoStack.length&&!document.activeElement?.isContentEditable&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();undoDeletion();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}
  if(e.key==='Escape'&&$('sidebar').classList.contains('open')){$('sidebar').classList.remove('open');$('sidebarShade').classList.remove('show')}
  if(slashState&&e.target.classList?.contains('block')&&e.target.closest('[data-block-id]')?.dataset.blockId===slashState.blockId){
    if(e.key==='Escape'){e.preventDefault();clearSlashMenu();return}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(slashState.options.length){slashState.index=(slashState.index+(e.key==='ArrowDown'?1:-1)+slashState.options.length)%slashState.options.length;document.querySelectorAll('.slash-option').forEach((option,i)=>option.classList.toggle('selected',i===slashState.index))}return}
    if(e.key==='Enter'&&!e.shiftKey&&slashState.options.length){e.preventDefault();selectSlash(slashState.options[slashState.index].key,slashState.blockId);return}
  }
  if(!e.target.classList?.contains('block'))return;
  const {p,b,index}=blockFromElement(e.target);if(!b)return;
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();createBlock(p,index+1,b.type==='bullet'||b.type==='todo'?b.type:'text')}
  if(e.key==='Backspace'&&!e.target.textContent){e.preventDefault();requestDelete('block',b.id);return}
  if(e.key===' '&&e.target.textContent.startsWith('/')){const command=e.target.textContent.trim().slice(1).toLowerCase();const match=slashCommands.find(c=>c.aliases.includes(command));if(match){e.preventDefault();selectSlash(match.key,b.id);return}}
  if(e.key===' '&&e.target.textContent===''&&b.type==='todo'){e.preventDefault();b.done=!b.done;changed();renderBlocks(p);document.querySelectorAll('.block')[index]?.focus()}
});
function exportData(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='unihan-notes-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('imagePicker').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const bitmap=await createImageBitmap(file);const canvas=document.createElement('canvas');const scale=Math.min(1,1000/bitmap.width,700/bitmap.height);canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const src=canvas.toDataURL('image/jpeg',0.7);if(imageTarget==='cover'){page(currentId).cover=src;render()}else if(imageTarget==='block'){const b=page(currentId).blocks.find(x=>x.id===imageBlockId);if(b){b.src=src;renderBlocks(page(currentId))}}else if(imageTarget==='process'){const b=page(currentId).blocks.find(x=>x.id===imageBlockId),step=b?.steps?.find(s=>s.id===imageStepId);if(step){step.image=src;renderBlocks(page(currentId))}}changed();notify('Đã thêm ảnh')}catch{notify('Không đọc được ảnh này')}e.target.value=''});
function openSearch(){$('searchDialog').showModal();$('searchInput').value='';renderSearch('');$('searchInput').focus()}
function renderSearch(q){const term=q.trim().toLocaleLowerCase('vi');const result=data.pages.filter(p=>!term||p.title.toLocaleLowerCase('vi').includes(term)).slice(0,30);$('searchResults').innerHTML=result.length?result.map(p=>`<button class="search-result" data-search-id="${escapeHtml(p.id)}"><span>${escapeHtml(p.icon)}</span><span>${escapeHtml(p.title)}<small>${escapeHtml(page(p.parent)?.title||'Trang chủ')}</small></span></button>`).join(''):'<div class="search-empty">Không tìm thấy trang nào</div>'}
$('searchInput').addEventListener('input',e=>renderSearch(e.target.value));$('searchResults').addEventListener('click',e=>{const id=e.target.closest('[data-search-id]')?.dataset.searchId;if(id){$('searchDialog').close();navigate(id)}});
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(page(id)&&id!==currentId){currentId=id;render()}});

function openSettings(){$('settingsDialog').showModal();sync.render()}
const sync=createSync({getData:()=>data,hasLocalData:()=>!!localStorage.getItem(STORAGE_KEY),applyRemote:remote=>{clearTimeout(saveTimer);undoStack.length=0;clearSlashMenu();data=remote;const home=data.pages.find(p=>p.id==='home');if(home?.title==='Unihan')home.title="Ly's Notes";localStorage.setItem(STORAGE_KEY,JSON.stringify(data));if(!page(currentId))currentId='home';render()},notify,onStatus:()=>{if($('pageNav').children.length)renderNav()}});
$('connectGist').addEventListener('click',()=>sync.connect($('gistToken').value));
$('syncNow').addEventListener('click',()=>sync.run(true));
$('disconnectGist').addEventListener('click',()=>sync.disconnect());
$('chooseRemote').addEventListener('click',()=>sync.chooseRemote());
$('chooseLocal').addEventListener('click',()=>sync.chooseLocal());
$('backupButton').addEventListener('click',exportData);
$('confirmDelete').addEventListener('click',()=>{executeDelete();$('deleteDialog').close()});
$('deleteDialog').addEventListener('close',()=>{pendingDelete=null});
$('cardColorPicker').addEventListener('input',e=>{$('cardColorHex').value=e.target.value.toUpperCase();previewColor()});
$('cardColorHex').addEventListener('input',e=>{const hex=normalizeHex(e.target.value);if(hex)$('cardColorPicker').value=hex;previewColor()});
$('saveCardColor').addEventListener('click',()=>{const hex=normalizeHex($('cardColorHex').value);if(!hex){notify('Nhập mã màu dạng #RRGGBB');return}const g=page(colorTargetId);if(g){g.cardColor=hex;persist();renderHome(page('home'))}$('colorDialog').close();notify('Đã lưu màu nhóm')});
render();sync.init();
