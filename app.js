const D=window.DATA,$=s=>document.querySelector(s),K='ent303.v4';
let S={};try{S=JSON.parse(localStorage.getItem(K))||{}}catch(e){}
for(const k of['add','del','edit','known'])S[k]=S[k]||{};S.fs=S.fs||100;S.unit=D[S.unit]?S.unit:1;
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast('Bộ nhớ đầy, hãy xóa bớt ảnh')}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=x=>String(x.word||x.phrase||'').toLowerCase().trim();
const norm=s=>String(s).toLowerCase().replace(/’/g,"'").replace(/\s+/g,' ').trim().replace(/^(a|an|to|the) /,'');
const shuf=a=>[...a].sort(()=>Math.random()-.5);
let u=S.unit,tab='list',q='',fc={i:0,only:false},fcL=[],Q=null,edit=null,L={vocab:[],idioms:[]},dp=null;
const TABS=[['list','📚','Từ vựng'],['fc','🃏','Thẻ'],['gr','📖','Ngữ pháp'],['quiz','✍️','Quiz'],['add','➕','Thêm']];
// Dữ liệu = dữ liệu gốc (data.js) + phần bạn thêm/sửa/xóa (LocalStorage). Dữ liệu gốc luôn đủ.
const items=(n,k)=>{const del=S.del[n]||[],ed=S.edit[n]||{},nz=x=>({...x,word:x.word||x.phrase});
 return[...(D[n][k]||[]).filter(x=>!del.includes(key(x))).map(x=>({...nz(ed[key(x)]||x),_k:key(x),_b:1})),...((S.add[n]||{})[k]||[]).map(x=>({...nz(x),_k:key(x)}))]};
const clean=({_k,_b,...r})=>r;
function toast(m){const t=$('#toast');t.textContent=m;t.className='show';clearTimeout(t.t);t.t=setTimeout(()=>t.className='',2200)}
function speak(t){if(!window.speechSynthesis)return;speechSynthesis.cancel();const s=new SpeechSynthesisUtterance(String(t).replace(/\s*\/\s*/g,', '));s.lang='en-US';s.rate=.9;speechSynthesis.speak(s)}
const say=(i,k)=>speak(L[k][i].word);
function go(t){tab=t;Q=null;if(t!='add')edit=null;render();scrollTo(0,0)}
function render(){
 document.documentElement.style.fontSize=S.fs+'%';
 $('#nav').innerHTML=TABS.map(([k,i,t])=>`<button class="${tab==k?'on':''}" onclick="go('${k}')"><i>${i}</i><span>${t}</span></button>`).join('');
 const d=D[u];L.vocab=items(u,'vocab');L.idioms=items(u,'idioms');
 const v=L.vocab,kn=S.known[u]||{},n=v.filter(x=>kn[x._k]===1).length;
 $('#main').innerHTML=`<section class="hero"><small>${esc(d.badge)}</small><h1>${esc(d.title)}</h1><p>${esc(d.desc)}</p><div class="bar"><b style="width:${v.length?n/v.length*100:0}%"></b></div><em>${n}/${v.length} từ đã thuộc · ${L.idioms.length} expressions</em></section>`+({list:vList,fc:fcView,gr:grView,quiz:qView,add:addView}[tab])(v);
 $('#ans')?.focus()}
const cards=()=>{const r=L.vocab.map((x,i)=>[x,i]).filter(([x])=>!q||JSON.stringify(x).toLowerCase().includes(q));return r.length?r.map(([x,i])=>card(x,i,'vocab')).join(''):'<p class="empty">Không có từ nào.</p>'};
const card=(x,i,k)=>`<article class="card" onclick="detail('${k}',${i})"><div class="tx"><h3>${esc(x.word)} <span class="pos">${esc(x.pos||'')}</span></h3>${x.phonetic?`<small>${esc(x.phonetic)}</small>`:''}<p>${esc(x.def)}</p></div>${x.image?`<img src="${esc(x.image)}" alt="">`:''}<div class="act"><button onclick="event.stopPropagation();say(${i},'${k}')" aria-label="Nghe">🔊</button><button onclick="event.stopPropagation();menu('${k}',${i})" aria-label="Menu">⋮</button></div></article>`;
function vList(){return `<input class="search" type="search" placeholder="🔍 Tìm từ, nghĩa, collocation..." value="${esc(q)}" oninput="q=this.value.toLowerCase();$('#grid').innerHTML=cards()"><div class="grid" id="grid">${cards()}</div>`+(L.idioms.length?`<h2 class="sh">💬 Idioms & Expressions</h2><div class="grid">${L.idioms.map((x,i)=>card(x,i,'idioms')).join('')}</div>`:'')}
function show(h){const m=$('#modal');m.innerHTML=`<div class="sheet" onclick="event.stopPropagation()">${h}<button class="x" onclick="hide()" aria-label="Đóng">✕</button></div>`;m.hidden=false}
const hide=()=>$('#modal').hidden=true;
const sec=(t,h)=>h?`<h4>${t}</h4>${h}`:'';
function detail(k,i){const x=L[k][i],ul=a=>a&&a.length?'<ul>'+a.map(c=>`<li>${typeof c=='string'?esc(c):esc(c.en)+(c.vi?' — '+esc(c.vi):'')}</li>`).join('')+'</ul>':'',
 wf=(x.wordFamily||[]).map(w=>`<li>${esc(w.word)} <i>(${esc(w.pos)})</i>${w.def?' — '+esc(w.def):''}</li>`).join(''),p=t=>t&&`<p>${esc(t)}</p>`;
 show(`<h2>${esc(x.word)} <button class="mini" onclick="say(${i},'${k}')">🔊</button></h2><p class="ipa">${esc(x.phonetic||'')}${x.stress?' · '+esc(x.stress):''}</p><p class="vi">${esc(x.def)}</p>`+sec('Nghĩa tiếng Anh',p(x.en))+sec('Cách dùng',p(x.usage))+sec('Collocations',ul(x.collocations))+sec('Word family',wf&&`<ul>${wf}</ul>`)+sec('Lỗi thường gặp',p(x.mistake))+sec('Ví dụ',p(x.example))+sec('Ghi chú',p(x.note)))}
function menu(k,i){show(`<h3>${esc(L[k][i].word)}</h3><button class="btn big" onclick="startEdit('${k}',${i})">✏️ Sửa</button><button class="btn big red" onclick="del('${k}',${i})">🗑 Xóa</button>`)}
function del(k,i){const x=L[k][i];if(!confirm(`Xóa "${x.word}"?`))return;if(x._b)(S.del[u]=S.del[u]||[]).push(x._k);else S.add[u][k]=S.add[u][k].filter(y=>key(y)!=x._k);save();hide();render();toast('Đã xóa')}
function startEdit(k,i){edit={k,i};hide();tab='add';render();scrollTo(0,0)}
const F=[['word','Từ / cụm từ *'],['pos','Loại từ (noun, verb, adj...)'],['phonetic','IPA'],['def','Nghĩa tiếng Việt *'],['en','Nghĩa tiếng Anh'],['collocations','Collocations (mỗi dòng 1 cụm)'],['example','Ví dụ'],['mistake','Lỗi thường gặp'],['note','Ghi chú']];
const val=(x,f)=>f=='collocations'?(x.collocations||[]).map(c=>c.en||c).join('\n'):x[f]||'';
function addView(){const x=edit?L[edit.k][edit.i]:{};return `<form class="form" onsubmit="return saveWord(event)"><h2>${edit?'✏️ Sửa từ':'➕ Thêm từ vào '+esc(D[u].badge)}</h2>`+F.map(([f,l])=>`<label>${l}${f=='collocations'?`<textarea name="${f}" rows="3">${esc(val(x,f))}</textarea>`:`<input name="${f}" value="${esc(val(x,f))}">`}</label>`).join('')+(edit?'':'<label class="chk"><input type="checkbox" name="idiom"> Là expression / idiom</label>')+`<div class="row"><button class="btn red">${edit?'Lưu thay đổi':'Thêm từ'}</button>${edit?'<button type="button" class="btn" onclick="go(\'list\')">Hủy</button>':''}</div></form>`}
function saveWord(e){e.preventDefault();const f=new FormData(e.target),o={};F.forEach(([k])=>o[k]=(f.get(k)||'').trim());
 if(!o.word||!o.def){toast('Cần nhập Từ và Nghĩa tiếng Việt');return false}
 o.collocations=o.collocations?o.collocations.split('\n').map(s=>s.trim()).filter(Boolean).map(en=>({en,vi:''})):[];o.phrase=o.word;o.pos=o.pos||'noun';
 if(edit){const x=L[edit.k][edit.i],n={...clean(x),...o};if(x._b)(S.edit[u]=S.edit[u]||{})[x._k]=n;else S.add[u][edit.k]=S.add[u][edit.k].map(y=>key(y)==x._k?n:y)}
 else{const k=f.get('idiom')?'idioms':'vocab';S.add[u]=S.add[u]||{};(S.add[u][k]=S.add[u][k]||[]).push(o)}
 save();edit=null;tab='list';render();toast('Đã lưu!');return false}
function fcView(v){const l=fc.only?v.filter(x=>(S.known[u]||{})[x._k]!==1):v;
 if(!l.length)return `<p class="empty">${v.length?'🎉 Bạn đã thuộc hết unit này!':'Unit này chưa có từ.'}<br><button class="btn" onclick="fc.only=false;render()">Học lại tất cả</button></p>`;
 fc.i%=l.length;fcL=l;const x=l[fc.i];
 return `<div class="fcbar"><b>${fc.i+1} / ${l.length}</b><label><input type="checkbox" ${fc.only?'checked':''} onchange="fc.only=this.checked;fc.i=0;render()"> Chỉ từ chưa thuộc</label></div><div class="flip" onclick="this.classList.toggle('on')"><div class="face f"><small>${esc(x.pos||'')}</small><h2>${esc(x.word)}</h2><p>${esc(x.phonetic||'')}</p><em>Bấm hoặc phím Space để lật</em></div><div class="face b"><h2>${esc(x.def)}</h2><p>${esc(x.example||x.en||'')}</p></div></div><div class="row"><button class="btn" onclick="speak(fcL[fc.i].word)">🔊 Nghe</button><button class="btn red" onclick="mark(0)">Chưa thuộc</button><button class="btn green" onclick="mark(1)">Đã thuộc</button></div>`}
function mark(v){if(tab!='fc'||!fcL[fc.i])return;(S.known[u]=S.known[u]||{})[fcL[fc.i]._k]=v;save();if(!(fc.only&&v))fc.i++;render()}
const grView=()=>{const g=D[u].grammar||[];return g.length?g.map(x=>`<article class="gram"><h3>${x.title}</h3><p>${x.detail||''}</p>${x.formula?`<pre>${x.formula}</pre>`:''}${(x.examples||[]).length?'<ul>'+x.examples.map(e=>`<li>${e}</li>`).join('')+'</ul>':''}${(x.rules||[]).map(r=>`<p class="rule">${r}</p>`).join('')}</article>`).join(''):'<p class="empty">Unit này chưa có phần ngữ pháp.</p>'};
function startQ(mode,from){const v=L.vocab,pool=[...new Set(Object.keys(D).flatMap(n=>items(n,'vocab').map(x=>x.def)))];
 let it=from||shuf(v).slice(0,20);
 if(!from&&mode=='mc')it=shuf([...it,...(D[u].grammarQuestions||[]).map(g=>({gq:1,q:g.q,def:g.options[g.ans],opts:g.options,word:g.q}))]);
 if(mode=='mc')it=it.map(x=>x.opts?x:{...x,opts:shuf([x.def,...shuf(pool.filter(d=>d!=x.def)).slice(0,3)])});else it=it.filter(x=>!x.gq);
 if(!it.length)return toast('Unit này chưa có từ để ôn');Q={mode,items:it,i:0,score:0,wrong:[],done:0};render()}
function qView(){if(!Q)return `<div class="qstart"><h2>Chọn kiểu ôn tập</h2><button class="btn big" onclick="startQ('mc')">🔘 Trắc nghiệm (chọn nghĩa đúng)</button><button class="btn big" onclick="startQ('type')">⌨️ Gõ từ tiếng Anh</button></div>`;
 if(Q.i>=Q.items.length){const p=Math.round(Q.score/Q.items.length*100);return `<div class="qbox center"><h2>${Q.score} / ${Q.items.length}</h2><p>${p>=80?'🎉 Tuyệt vời!':p>=50?'👍 Khá tốt, ôn thêm chút nhé':'💪 Cố gắng lên, ôn lại nhé'}</p>${Q.wrong.length?`<h4>Cần ôn lại</h4><ul class="left">${Q.wrong.map(w=>`<li><b>${esc(w.gq?w.q:w.word)}</b> — ${esc(w.def)}</li>`).join('')}</ul><button class="btn big red" onclick="startQ(Q.mode,Q.wrong)">Làm lại câu sai</button>`:''}<button class="btn big" onclick="startQ(Q.mode)">Làm bài mới</button><button class="btn big" onclick="Q=null;render()">Đổi kiểu</button></div>`}
 const x=Q.items[Q.i];let b=`<div class="qh"><span>Câu ${Q.i+1}/${Q.items.length}</span><span>✅ ${Q.score}</span></div><div class="qbox">`;
 if(Q.mode=='mc')b+=`<h3>${x.gq?esc(x.q):'Nghĩa của “'+esc(x.word)+'” là gì?'}</h3>`+x.opts.map((o,j)=>`<button class="opt ${Q.done?(o==x.def?'ok':j==Q.sel?'no':''):''}" ${Q.done?'disabled':''} onclick="pick(${j})">${esc(o)}</button>`).join('');
 else b+=`<h3>${esc(x.def)}</h3><form class="row" onsubmit="return check(event)"><input id="ans" autocomplete="off" placeholder="Gõ từ tiếng Anh…" ${Q.done?'disabled':''} value="${Q.done?esc(Q.val):''}"><button class="btn red" ${Q.done?'hidden':''}>Kiểm tra</button></form>${Q.done?`<p class="${Q.ok?'okt':'not'}">${Q.ok?'Đúng rồi!':'Đáp án: '+esc(x.word)}</p>`:''}`;
 return b+'</div>'+(Q.done?'<button class="btn big red" onclick="Q.i++;Q.done=0;render()">Tiếp →</button>':'')}
function pick(j){const x=Q.items[Q.i];Q.sel=j;Q.done=1;x.opts[j]==x.def?Q.score++:Q.wrong.push(x);render()}
function check(e){e.preventDefault();const x=Q.items[Q.i],c=norm(x.word);Q.val=$('#ans').value;Q.ok=[c,...c.split('/').map(norm)].includes(norm(Q.val));Q.done=1;Q.ok?Q.score++:Q.wrong.push(x);render();return false}
function tools(){show(`<h2>⚙️ Cài đặt & dữ liệu</h2><p>Cỡ chữ: <button class="btn" onclick="fs(-10)">A−</button> <b>${S.fs}%</b> <button class="btn" onclick="fs(10)">A+</button></p>${dp?'<button class="btn big green" onclick="dp.prompt()">📲 Cài app lên thiết bị</button>':''}<p class="note">Từ bạn thêm/sửa và tiến độ học lưu trong trình duyệt của thiết bị này. Sao lưu để chuyển sang máy khác.</p><button class="btn big" onclick="exp()">⬇️ Tải file sao lưu</button><label class="btn big up">⬆️ Khôi phục từ file<input type="file" hidden accept=".json,.txt" onchange="imp(this.files[0])"></label><p class="note">Hoặc dán dữ liệu từ bản cũ (chạy <code>copy(JSON.stringify(localStorage))</code> ở Console của bản cũ):</p><textarea id="paste" rows="3"></textarea><button class="btn big" onclick="importAny($('#paste').value)">Nhập dữ liệu</button>`)}
function fs(d){S.fs=Math.min(150,Math.max(80,S.fs+d));save();render();tools()}
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='ent303-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click()}
function imp(f){if(!f)return;const r=new FileReader();r.onload=()=>importAny(r.result);r.readAsText(f)}
function importAny(t){try{let o=JSON.parse(t);if(typeof o=='string')o=JSON.parse(o);
 if(o.ENT303_USER_UNITS_DATA||o.ENT303_LEARNED_SET)return fromOld(o);
 if(o.add&&o.known){for(const k of['add','del','edit','known'])Object.assign(S[k],o[k]);save();render();hide();return toast('Đã khôi phục dữ liệu')}throw 0}catch(e){toast('Dữ liệu không đúng định dạng')}}
function fromOld(o){const P=s=>{try{return JSON.parse(s)||{}}catch(e){return{}}},U=P(o.ENT303_USER_UNITS_DATA);let n=0;
 for(const k in U){if(!D[k])continue;for(const kind of['vocab','idioms']){const base=new Map((D[k][kind]||[]).map(x=>[key(x),JSON.stringify(x)]));
  (U[k][kind]||[]).forEach(x=>{const kk=key(x);if(!kk)return;if(!base.has(kk)){S.add[k]=S.add[k]||{};(S.add[k][kind]=S.add[k][kind]||[]).push(x);n++}else if(base.get(kk)!=JSON.stringify(x)){(S.edit[k]=S.edit[k]||{})[kk]=x;n++}})}}
 const mk=(a,v)=>(Array.isArray(a)?a:[]).forEach(w=>{for(const k in D)for(const x of D[k].vocab||[])if(x.word==w)(S.known[k]=S.known[k]||{})[key(x)]=v});
 mk(P2(o.ENT303_LEARNED_SET),1);mk(P2(o.ENT303_UNLEARNED_SET),0);S.migrated=1;save();render();toast(`Đã nhập ${n} mục từ bản cũ`)}
const P2=s=>{try{return JSON.parse(s)}catch(e){return[]}};
$('#unit').innerHTML=Object.keys(D).map(n=>`<option value="${n}">Unit ${n}: ${esc(D[n].title)}</option>`).join('');$('#unit').value=u;
$('#unit').onchange=e=>{u=+e.target.value;S.unit=u;save();fc.i=0;Q=null;edit=null;q='';render()};
$('#tools').onclick=tools;$('#modal').onclick=hide;
addEventListener('keydown',e=>{if(e.key=='Escape')hide();if(tab!='fc'||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||!$('#modal').hidden)return;if(e.key==' '){e.preventDefault();$('.flip')?.classList.toggle('on')}if(e.key=='ArrowRight')mark(1);if(e.key=='ArrowLeft')mark(0)});
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});
render();
// Tự nhập dữ liệu bản cũ nếu cùng trình duyệt còn lưu (vd. mở file .html cũ trên máy này)
if(!S.migrated&&localStorage.getItem('ENT303_USER_UNITS_DATA')){const o={};Object.keys(localStorage).filter(k=>k.startsWith('ENT303_')).forEach(k=>o[k]=localStorage.getItem(k));fromOld(o)}
if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
