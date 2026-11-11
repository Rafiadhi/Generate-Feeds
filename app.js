const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],el=k=>$(`[data-k="${k}"]`);
const SIZES=[['4:5','Feeds Instagram (4:5)'],['1:1','Feeds persegi / marketplace (1:1)'],['9:16','Story & Reels (9:16)'],['16:9','Dekorasi toko landscape (16:9)'],['9:16','Dekorasi toko portrait (9:16)'],['21:9','Banner lebar (21:9)'],['3:4','Poster (3:4)'],['4:3','Landscape (4:3)']];
// [label di kartu, deskripsi untuk prompt] — dipakai kalau sudut = "Variasi 9 sudut"
const POSES=[
 ['tampak depan','tampak depan lurus, simetris'],
 ['samping kiri','tampak samping kiri, profil sepatu terlihat penuh'],
 ['tiga perempat depan','sudut tiga perempat dari depan, angle klasik product shot'],
 ['tampak belakang','tampak belakang, area tumit terlihat jelas'],
 ['dari atas','dari atas (top view), tali dan lidah sepatu terlihat'],
 ['close-up sol','close-up sol dan midsole, tekstur terlihat tajam'],
 ['low angle hero shot','low angle hero shot, kamera rendah sehingga sepatu tampak gagah dan dramatis'],
 ['close-up ujung dan tali','close-up ujung sepatu dan tali, depth of field tipis'],
 ['diagonal','diletakkan diagonal secara dinamis (kalau lebih dari 1 pcs, tata berdampingan secara diagonal)']];
const RT=['1:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9','21:9'];
const val=r=>{const[a,b]=r.split(':');return a/b};
const near=x=>RT.reduce((a,b)=>Math.abs(Math.log(val(b)/x))<Math.abs(Math.log(val(a)/x))?b:a);
const S={},R={};let mk,target;

// ===== Pengaturan (disimpan di browser masing-masing, TIDAK ada key di kode) =====
// Migrasi pengaturan lama (versi YupiAI saja) supaya key lama tidak hilang
(()=>{const o=localStorage;if(!o.fp_pv&&o.gk){o.fp_key_yupi=o.gk;o.fp_model_yupi=o.gm||'';if(o.gp)o.fp_proxy=o.gp;o.fp_pv='yupi'}})();
const PV=()=>localStorage.fp_pv||'gemini',
 CF=(k,p=PV())=>localStorage[`fp_${k}_${p}`]||'',
 KEY=()=>CF('key'),MODEL=()=>CF('model'),
 RES=()=>localStorage.fp_res||'2K',THINK=()=>localStorage.fp_think!='0',
 ratio1=()=>SIZES[$('#size1').value][0];

// ===== Sudut sepatu =====
const ANG={kiri:'Samping, ujung sepatu menghadap kiri',kanan:'Samping, ujung sepatu menghadap kanan',var:'Variasi 9 sudut (seperti versi lama)',bebas:'Bebas (AI pilih angle terbaik)'};
const side=d=>`tampak samping murni (side profile 90 derajat), ujung sepatu menghadap ke sisi ${d} gambar. Kamera setinggi sepatu dan tegak lurus terhadap sisi sepatu: tidak miring, bukan sudut tiga perempat, bukan dari atas atau dari depan. Seluruh sepatu terlihat utuh dari ujung sampai tumit. Kalau lebih dari 1 pcs, semuanya tampak samping dan searah (satu sedikit di depan, satu di belakang, keduanya terlihat jelas)`;
const poseOf=(mode,i)=>mode=='kiri'?side('kiri'):mode=='kanan'?side('kanan'):mode=='var'?POSES[i][1]:'';

// ===== Prompt bawaan. Kode otomatis: {ratio} {jumlah} {pose} =====
const P1=`Kamu adalah fotografer produk profesional. Buat SATU foto produk sepatu yang realistis, tajam, kualitas HD, cahaya dramatis, rasio {ratio}.

GAMBAR 1 adalah foto referensi. GAMBAR 2 adalah foto sepatu produk yang harus ditampilkan.

Yang harus dilakukan:
1. Tiru GAMBAR 1 seutuhnya: latar, properti, alas atau permukaan, pencahayaan, arah dan kekerasan bayangan, komposisi, jarak kamera, tone, dan warna. Hasil harus terlihat seperti foto dari sesi pemotretan yang sama.
2. Ganti produk yang tampil di GAMBAR 1 dengan sepatu dari GAMBAR 2. Produk asli di GAMBAR 1 harus hilang sepenuhnya, jangan sisakan bagiannya.
3. Sudut dan posisi sepatu: {pose}.
4. Jumlah sepatu yang tampil: {jumlah}.

Sepatu harus sama persis dengan GAMBAR 2:
- Bentuk, siluet, proporsi, sol, jahitan, tali, lidah, bahan, dan tekstur tidak boleh berubah.
- Warna tidak boleh berubah dan tidak boleh terpengaruh warna latar atau cahaya.
- Logo dan tulisan pada sepatu tetap sama. Jangan menambah, mengarang, atau mengubah detail.
- Kalau sudut yang diminta berbeda dari GAMBAR 2, putar sepatu secara realistis tanpa mengubah desainnya.

Bersihkan:
- Hapus semua logo, teks, harga, dan watermark dari GAMBAR 1, kecuali logo yang menempel pada sepatu.

Hasil akhir hanya gambar, tanpa teks, tanpa watermark, tanpa bingkai.`;
const P2=`Kamu adalah fotografer produk profesional. Buat SATU foto produk sepatu yang realistis, tajam, kualitas HD, cahaya dramatis, rasio {ratio}.

GAMBAR 1 adalah foto referensi. GAMBAR 2 adalah foto sepatu produk yang harus ditampilkan. GAMBAR 3 adalah frame twibon.

Yang harus dilakukan:
1. Tiru GAMBAR 1 seutuhnya: latar, properti, alas atau permukaan, pencahayaan, arah dan kekerasan bayangan, komposisi, jarak kamera, tone, dan warna. Hasil harus terlihat seperti foto dari sesi pemotretan yang sama.
2. Ganti produk yang tampil di GAMBAR 1 dengan sepatu dari GAMBAR 2. Produk asli di GAMBAR 1 harus hilang sepenuhnya, jangan sisakan bagiannya.
3. Sudut dan posisi sepatu: {pose}.
4. Jumlah sepatu yang tampil: {jumlah}.
5. Frame twibon (GAMBAR 3) akan ditempel di atas hasil nanti. Atur komposisi supaya sepatu terlihat penuh dan tidak tertutup grafis frame. Jangan gambar frame twibon, teks, atau watermark di hasil.

Sepatu harus sama persis dengan GAMBAR 2:
- Bentuk, siluet, proporsi, sol, jahitan, tali, lidah, bahan, dan tekstur tidak boleh berubah.
- Warna tidak boleh berubah dan tidak boleh terpengaruh warna latar atau cahaya.
- Logo dan tulisan pada sepatu tetap sama. Jangan menambah, mengarang, atau mengubah detail.
- Kalau sudut yang diminta berbeda dari GAMBAR 2, putar sepatu secara realistis tanpa mengubah desainnya.

Bersihkan:
- Hapus semua logo, teks, harga, dan watermark dari GAMBAR 1, kecuali logo yang menempel pada sepatu.

Hasil akhir hanya gambar, tanpa teks, tanpa watermark, tanpa bingkai.`;
const DEF={'#pr1':P1,'#pr2':P2};
const QTY={a:'sama persis seperti jumlah sepatu pada GAMBAR 2 (1 atau 2 pcs untuk tiap warna)',1:'1 pcs sepatu saja',2:'2 pcs sepatu dengan warna yang sama'};
function makePrompt(box,ratio,qty,pose){
 let t=$(box).value.trim()||DEF[box];
 if(pose&&!t.includes('{pose}'))t+='\nSudut dan posisi sepatu: {pose}.';
 return t.replaceAll('{ratio}',ratio).replaceAll('{jumlah}',QTY[qty]).replaceAll('{pose}',pose||'ubah angle dan pose, pilih yang paling bagus')}

// ===== UI =====
$('#size1').innerHTML=SIZES.map((s,i)=>`<option value="${i}">${s[1]}</option>`).join('');
$$('.qty').forEach(s=>s.innerHTML='<option value="a">Sesuai foto sepatu (otomatis 1 atau 2 pcs)</option><option value="1">1 pcs</option><option value="2">2 pcs</option>');
$('#ang1').innerHTML=['kiri','kanan','var'].map(k=>`<option value="${k}">${ANG[k]}</option>`).join('');
$('#ang2').innerHTML=['kiri','kanan','bebas'].map(k=>`<option value="${k}">${ANG[k]}</option>`).join('');
$('#grid').innerHTML=[...Array(9).keys()].map(i=>`<div class="drop" data-k="s${i}"><span>Foto sepatu ${i+1}</span><i class="pose"></i></div>`).join('');
const chip=()=>{const m=$('#ang1').value;$$('.pose').forEach((p,i)=>p.textContent=m=='var'?POSES[i][0]:'tampak samping')};
$('#ang1').onchange=chip;chip();
$('#size1').onchange=()=>$('#grid').style.setProperty('--ar',ratio1().replace(':','/'));
$$('nav button').forEach(b=>b.onclick=()=>{if(b.classList.contains('on'))return;$$('nav button').forEach(x=>x.classList.toggle('on',x==b));const c=$('.view.on');c.classList.add('out');setTimeout(()=>{c.classList.remove('on','out');$('#'+b.dataset.v).classList.add('on')},220)});
// Kolom prompt (tersimpan di browser). Nama penyimpanan baru (_v2) supaya prompt lama tidak menimpa prompt baru ini.
Object.entries(DEF).forEach(([s,d])=>{const t=$(s),k='fp_'+t.id+'_v2';t.value=localStorage[k]||d;t.oninput=()=>{localStorage[k]=t.value}});
$$('[data-reset]').forEach(b=>b.onclick=()=>{const s=b.dataset.reset,t=$(s);t.value=DEF[s];delete localStorage['fp_'+t.id+'_v2']});

// ===== Gambar =====
const load=f=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(f)});
// JPEG tidak mengenal transparan: latar diisi putih supaya sepatu PNG tanpa latar tidak jadi hitam
const part=(img,max,type='image/jpeg')=>{const r=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas'),x=c.getContext('2d');c.width=Math.round(img.naturalWidth*r);c.height=Math.round(img.naturalHeight*r);if(type=='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}x.drawImage(img,0,0,c.width,c.height);return c.toDataURL(type,.92)};
const toPng=d=>new Promise(ok=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d').drawImage(i,0,0);c.toBlob(ok,'image/png')};i.src=`data:${d.mimeType};base64,${d.data}`});
const paint=(k,u)=>{const d=el(k);d.style.backgroundImage=`url(${u})`;d.classList.add('has');d.classList.remove('pop');void d.offsetWidth;d.classList.add('pop')};
async function setImg(k,f){if(!f||!f.type.startsWith('image/'))return;const i=await load(f);S[k]=i;delete R[k];paint(k,i.src);el(k).classList.remove('res','err');if(k=='tw')$('#out').style.aspectRatio=i.naturalWidth+'/'+i.naturalHeight;ready()}
function ready(){const n=[...Array(9).keys()].filter(i=>S['s'+i]).length;$('#go1').disabled=!S.rf||!n;$('#go1').textContent=n?`Generate ${n} foto`:'Generate';$('#go2').disabled=!(S.tw&&S.rf2&&S.sh2)}

// ===== Klien AI =====
// <<GEMINI-START>>
const GEM='https://generativelanguage.googleapis.com/v1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const splitUrl=u=>{const m=/^data:([^;]+);base64,(.*)$/.exec(u);return{mime_type:m[1],data:m[2]}};
const waitMs=(e,t)=>{const d=(e.details||[]).find(x=>x.retryDelay),s=d?parseFloat(d.retryDelay):0;return Math.min(60,Math.max(s||0,5*(t+1)))*1000};
function gemErr(s,m){
 if(s==429&&/limit:\s*0|free.?tier|billing/i.test(m))return 'Key Gemini ini masih paket gratis. Model gambar Gemini tidak termasuk paket gratis: aktifkan billing di Google AI Studio, atau pindah ke YupiAI di Pengaturan.';
 if(s==429&&/PerDay|per day/i.test(m))return 'Kuota harian Gemini habis. Coba lagi besok atau naikkan kuota di Google AI Studio.';
 if(s==400&&/API key/i.test(m))return 'API key Gemini tidak valid. Cek lagi di Pengaturan.';
 if(s==403)return 'Key ditolak (403). Cek billing, pembatasan domain key, dan apakah Gemini API aktif. '+m;
 if(s==404)return 'Model tidak ditemukan. Buka Pengaturan, klik "Muat model", lalu pilih model gambar.';
 if(s==429)return 'Limit per menit Gemini terlampaui. Tunggu sebentar lalu generate ulang.';
 return m||'Gagal ('+s+')'}
async function gemini(prompt,imgs,ratio){
 const model=MODEL(),parts=[{text:prompt}];
 // tiap gambar diberi label teks tepat sebelumnya supaya "GAMBAR 1/2/3" di prompt jelas merujuk ke mana
 imgs.forEach(x=>{parts.push({text:x.l});parts.push({inline_data:splitUrl(x.u)})});
 let fmt='rf',size=/lite/i.test(model)?'1K':RES(),think=THINK(),retried=false;
 for(let t=0;t<8;t++){
  const gc={responseModalities:['IMAGE']},o={aspectRatio:ratio};
  if(size)o.imageSize=size;
  if(fmt=='rf')gc.responseFormat={image:o};else gc.imageConfig=o;
  if(think)gc.thinkingConfig={thinkingLevel:'High',includeThoughts:false};
  const r=await fetch(`${GEM}/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':KEY()},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:gc})}),
   j=await r.json().catch(()=>({})),e=j.error||{},m=e.message||'';
  if(r.ok){
   const c=j.candidates?.[0],ps=c?.content?.parts||[],px=p=>p.inlineData||p.inline_data,
    pic=ps.filter(p=>!p.thought).map(px).filter(Boolean).pop()||ps.map(px).filter(Boolean).pop();
   if(!pic?.data){
    const why=j.promptFeedback?.blockReason||c?.finishReason,tx=ps.filter(p=>p.text&&!p.thought).map(p=>p.text).join(' ').trim();
    if((!why||why=='STOP'||why=='OTHER')&&!retried){retried=true;continue}
    throw Error('Gemini tidak mengembalikan gambar'+(why?` (${why})`:'')+(tx?': '+tx.slice(0,160):'')+'. Coba generate ulang, atau ubah prompt/foto.')}
   const b=await toPng({mimeType:pic.mimeType||pic.mime_type||'image/png',data:pic.data});b.low=!size;return b}
  if(r.status==400){
   if(think&&/thinking/i.test(m)){think=false;continue}
   if(size&&/image.?size/i.test(m)){size=null;continue}
   if(fmt=='rf'&&/responseFormat|response_format|unknown name|invalid json/i.test(m)){fmt='ic';continue}}
  if([429,500,503].includes(r.status)&&!/limit:\s*0|PerDay|per day|billing|free.?tier/i.test(m)){await sleep(waitMs(e,t));continue}
  throw Error(gemErr(r.status,m))}
 throw Error('Gemini sedang sibuk. Coba generate ulang sebentar lagi.')}
// <<GEMINI-END>>

const yupiBase=(p=localStorage.fp_proxy)=>(p||'https://gateway.yupi.ai.id').replace(/\/+$/,'')+'/v1';
async function yupi(prompt,imgs,ratio){
 const body={model:MODEL(),prompt,n:1,aspect_ratio:ratio,resolution:'2K',output_format:'png',input_references:imgs.map(x=>({type:'image_url',image_url:{url:x.u}}))};
 for(let t=0;t<4;t++){
  const r=await fetch(yupiBase()+'/images',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+KEY()},body:JSON.stringify(body)}),j=await r.json().catch(()=>({})),e=j.error||{};
  if(r.ok){const d=j.data?.[0];if(!d?.b64_json){if(t<3)continue;throw Error('Model tidak mengembalikan gambar. Coba generate ulang.')}const b=await toPng({mimeType:d.media_type||'image/png',data:d.b64_json});b.low=!body.resolution;return b}
  if(['unsupported_parameter','invalid_parameter'].includes(e.code)&&['resolution','output_format'].includes(e.param)){delete body[e.param];continue}
  throw Error((e.message||'Gagal ('+r.status+')').replace(/\s*Error ID:.*$/,''))}
 throw Error('Parameter ditolak model. Coba model lain.')}
const gem=(p,i,r)=>PV()=='gemini'?gemini(p,i,r):yupi(p,i,r);

async function job(k){
 const d=el(k),m=$(k=='out'?'#m2':'#m1');d.classList.add('load');d.classList.remove('err');m.textContent='';
 try{let b;
  if(k=='out'){const tw=S.tw,rt=near(tw.naturalWidth/tw.naturalHeight),
   g=await gem(makePrompt('#pr2',rt,$('#qty2').value,poseOf($('#ang2').value)),[{l:'GAMBAR 1 (foto referensi):',u:part(S.rf2,1536)},{l:'GAMBAR 2 (foto sepatu produk):',u:part(S.sh2,2048)},{l:'GAMBAR 3 (frame twibon, hanya untuk mengatur komposisi):',u:part(tw,1024,'image/png')}],rt);
   const bg=await load(g),w=tw.naturalWidth,h=tw.naturalHeight,W=w>=h?2048:Math.round(2048*w/h),H=w>=h?Math.round(2048*h/w):2048,c=document.createElement('canvas');c.width=W;c.height=H;
   const x=c.getContext('2d'),s=Math.max(W/bg.naturalWidth,H/bg.naturalHeight);
   x.drawImage(bg,(W-bg.naturalWidth*s)/2,(H-bg.naturalHeight*s)/2,bg.naturalWidth*s,bg.naturalHeight*s);x.drawImage(tw,0,0,W,H);
   b=await new Promise(r=>c.toBlob(r,'image/png'))}
  else b=await gem(makePrompt('#pr1',ratio1(),$('#qty1').value,poseOf($('#ang1').value,+k.slice(1))),[{l:'GAMBAR 1 (foto referensi):',u:part(S.rf,1536)},{l:'GAMBAR 2 (foto sepatu produk):',u:part(S[k],2048)}],ratio1());
  R[k]=b;paint(k,URL.createObjectURL(b));d.classList.add('res');if(b.low)m.textContent='Model ini tidak mendukung pilihan resolusi, hasil memakai ukuran bawaan model.'
 }catch(e){d.classList.add('err');m.textContent=/fetch/i.test(e.message)?(PV()=='gemini'?'Tidak tersambung ke Gemini. Cek internet dan API key di Pengaturan.':'Tidak tersambung ke YupiAI. Kemungkinan diblokir browser (CORS): isi alamat proxy di Pengaturan.'):e.message}
 d.classList.remove('load')}
// Gemini berbayar punya limit per menit, jadi paralel dibatasi 2 (YupiAI tetap 3)
const pool=async(ks,n=PV()=='gemini'?2:3)=>{const q=[...ks];await Promise.all(Array(n).fill().map(async()=>{while(q.length)await job(q.shift())}))};
const needKey=()=>(!KEY()||!MODEL())&&($('#dlg').showModal(),1);
$('#go1').onclick=async()=>{if(needKey())return;$('#go1').disabled=true;await pool([...Array(9).keys()].map(i=>'s'+i).filter(k=>S[k]));ready()};
$('#go2').onclick=async()=>{if(needKey())return;$('#go2').disabled=true;await job('out');ready()};

// ===== Upload, klik kanan, drag & drop =====
const inp=Object.assign(document.createElement('input'),{type:'file',accept:'image/*'}),mn=$('#menu');
inp.onchange=()=>{setImg(target,inp.files[0]);inp.value=''};
function menu(e,k){mk=k;$('[data-a=ch]').hidden=k=='out';mn.style.display='block';mn.style.left=Math.max(8,Math.min(e.clientX,innerWidth-mn.offsetWidth-8))+'px';mn.style.top=Math.max(8,Math.min(e.clientY,innerHeight-mn.offsetHeight-8))+'px'}
mn.onclick=e=>{const a=e.target.dataset.a;if(a=='dl'){const l=document.createElement('a');l.href=URL.createObjectURL(R[mk]);l.download=`foto-produk-${mk}.png`;l.click()}if(a=='re'&&!needKey())job(mk);if(a=='ch'){target=mk;inp.click()}};
document.addEventListener('click',e=>{mn.style.display='none';const d=e.target.closest('.drop');if(!d)return;const k=d.dataset.k;if(R[k])return menu(e,k);if(k=='out')return;target=k;inp.click()});
document.addEventListener('contextmenu',e=>{const d=e.target.closest('.drop');if(d&&R[d.dataset.k]){e.preventDefault();menu(e,d.dataset.k)}});
document.addEventListener('dragover',e=>e.preventDefault());
document.addEventListener('drop',e=>{e.preventDefault();const d=e.target.closest('.drop');if(d&&d.dataset.k!='out')setImg(d.dataset.k,e.dataTransfer.files[0])});

// ===== Dialog pengaturan =====
const GEMMODELS=['gemini-nano-banana-2.1','gemini-3.1-flash-image','gemini-3-pro-image','gemini-3.1-flash-lite-image'];
const HINT={gemini:'Ambil API key di aistudio.google.com/apikey. Penting: model gambar Gemini tidak ada di paket gratis, jadi project key harus sudah memakai billing. Key hanya disimpan di browser ini, jadi tiap pengguna mengisi key sendiri.',yupi:'Ambil API key (diawali yupi_ai_) di dash.yupi.ai.id. Key hanya disimpan di browser ini, jadi tiap pengguna mengisi key sendiri.'};
const setList=ids=>$('#ml').innerHTML=ids.map(i=>`<option value="${i}">`).join('');
function fill(pv){
 $('#pv').value=pv;$('#k').value=CF('key',pv);$('#m').value=CF('model',pv)||(pv=='gemini'?GEMMODELS[0]:'');
 $('#p').value=localStorage.fp_proxy||'';$('#rs').value=RES();$('#th').checked=THINK();
 $('#gx').hidden=pv!='gemini';$('#px').hidden=pv!='yupi';
 $('#k').placeholder=pv=='gemini'?'AIza...':'yupi_ai_...';$('#hint').textContent=HINT[pv];setList(pv=='gemini'?GEMMODELS:[])}
async function loadModels(){const k=$('#k').value.trim(),b=$('#ld'),pv=$('#pv').value;if(!k)return;b.textContent='Memuat...';
 try{let ids;
  if(pv=='gemini'){
   const r=await fetch(GEM+'/models?pageSize=1000',{headers:{'x-goog-api-key':k}}),j=await r.json();if(!r.ok)throw Error();
   ids=(j.models||[]).filter(m=>/image|banana/i.test(m.name)&&(!m.supportedGenerationMethods||m.supportedGenerationMethods.includes('generateContent'))).map(m=>m.name.replace(/^models\//,''));
   if(!ids.length)ids=GEMMODELS;
   if(!$('#m').value)$('#m').value=ids.find(i=>/nano-banana-2\.1/.test(i))||ids.find(i=>/3\.1-flash-image/.test(i))||ids[0]}
  else{
   const r=await fetch(yupiBase($('#p').value.trim())+'/images/models',{headers:{Authorization:'Bearer '+k}}),j=await r.json();if(!r.ok)throw Error();
   const l=(j.data||j.models||j).filter(m=>m&&(m.id||m.model)),ed=l.filter(m=>JSON.stringify(m).includes('image_editing'));ids=(ed.length?ed:l).map(m=>m.id||m.model);
   if(!$('#m').value)$('#m').value=ids.find(i=>/nano-banana-2|gemini-3\.1-flash-image/i.test(i))||ids.find(i=>/gemini|banana/i.test(i))||ids[0]||''}
  setList(ids);b.textContent='Muat model'}
 catch{b.textContent='Gagal, isi manual'}}
$('#ld').onclick=loadModels;
$('#pv').onchange=()=>{fill($('#pv').value);loadModels()};
$('#cfg').onclick=()=>{fill(PV());$('#dlg').showModal();loadModels()};
$('#sv').onclick=()=>{const pv=$('#pv').value,k=$('#k').value.trim();
 if((pv=='gemini'&&/^yupi_ai_/.test(k))||(pv=='yupi'&&/^AIza/.test(k))){$('#hint').textContent='Key ini bukan untuk layanan yang dipilih. Cek lagi pilihan "Layanan" di atas.';return}
 localStorage.fp_pv=pv;localStorage['fp_key_'+pv]=k;localStorage['fp_model_'+pv]=$('#m').value.trim();localStorage.fp_proxy=$('#p').value.trim();localStorage.fp_res=$('#rs').value;localStorage.fp_think=$('#th').checked?'1':'0';$('#dlg').close()};
if(!KEY())$('#cfg').click();
ready();
