const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],el=k=>$(`[data-k="${k}"]`);
const SIZES=[['4:5','Feeds Instagram (4:5)'],['1:1','Feeds persegi / marketplace (1:1)'],['9:16','Story & Reels (9:16)'],['16:9','Dekorasi toko landscape (16:9)'],['9:16','Dekorasi toko portrait (9:16)'],['21:9','Banner lebar (21:9)'],['3:4','Poster (3:4)'],['4:3','Landscape (4:3)']];
// Semua pose = tampak samping (side profile). Arah hadap kiri/kanan diacak otomatis (lihat rollDir).
// Variasinya hanya di sudut kamera dan jarak, tetap tampak samping.
const POSES=[
 'tampak samping lurus (side profile), seluruh sepatu terlihat penuh',
 'tampak samping dari low angle, kamera rendah sehingga sepatu tampak gagah dan dramatis',
 'tampak samping dengan kamera sedikit dari atas (high angle), bentuk bagian atas sepatu terlihat jelas',
 'tampak samping dari jarak sedikit lebih jauh (wide shot), sepatu tidak terlalu besar di frame dan suasana latar lebih terlihat',
 'close-up tampak samping pada sol dan midsole, tekstur terlihat tajam',
 'close-up tampak samping pada area tumit dan bagian belakang sepatu, detail jahitan terlihat tajam',
 'close-up tampak samping pada area tali dan lidah sepatu, depth of field tipis',
 'tampak samping hero shot, sepatu sedikit miring naik seolah sedang melangkah, dramatis',
 'tampak samping diletakkan diagonal secara dinamis di dalam frame'];
const DIR=[],flip=d=>d=='kiri'?'kanan':'kiri';
// Arah diacak tapi seimbang (4 vs 5), jadi pasti ada yang hadap kiri dan kanan
function rollDir(){
 const a=[...Array(9).keys()].map(i=>i<4?'kiri':'kanan');
 if(Math.random()<.5)a.forEach((d,i)=>a[i]=flip(d));
 for(let i=8;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
 DIR.splice(0,9,...a);showDir()}
const showDir=()=>$$('.pose').forEach((p,i)=>p.textContent='samping '+DIR[i]);
const poseText=i=>`${POSES[i]}. Ujung sepatu (bagian depan) menghadap ke sisi ${DIR[i].toUpperCase()} gambar. Wajib tampak samping murni, bukan dari depan dan bukan dari belakang`;
const RT=['1:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9','21:9'];
const val=r=>{const[a,b]=r.split(':');return a/b};
const near=x=>RT.reduce((a,b)=>Math.abs(Math.log(val(b)/x))<Math.abs(Math.log(val(a)/x))?b:a);
const S={},R={};let mk,target;
const KEY=()=>localStorage.gk||'',MODEL=()=>localStorage.gm||'',ratio1=()=>SIZES[$('#size1').value][0];

// Prompt bawaan. Kode otomatis: {ratio} {jumlah} {pose}
const P1=`Buat foto produk dengan cahaya dramatis, rasio {ratio}, kualitas HD dan realistis.
GAMBAR 1 adalah foto referensi. GAMBAR 2 adalah foto sepatu produk.
Tiru GAMBAR 1 sebagai foto produk: pakai lokasi, properti, latar, permukaan, pencahayaan, mood, tone, dan warna latar yang sama seperti GAMBAR 1.
Ganti sepatu di GAMBAR 1 dengan sepatu dari GAMBAR 2. Sepatu asli dari GAMBAR 1 tidak boleh muncul di hasil.
Dari GAMBAR 2 ambil HANYA sepatunya. Latar, meja, dinding, bar hitam, teks, dan tampilan layar HP di GAMBAR 2 tidak boleh ikut.
Jangan ubah bentuk sepatu, jangan ubah bentuk logo pada sepatu, dan jangan ubah warnanya.
Hapus semua logo lain, kecuali logo yang ada pada sepatu.
Ubah angle dan pose sepatu tetapi tetap bagus: {pose}.
Jumlah produk yang tampil untuk warna ini: {jumlah}.
Hasil akhir hanya gambar, tanpa teks dan tanpa watermark.`;
const P2=`Buat foto produk dengan cahaya dramatis, rasio {ratio}, kualitas HD dan realistis.
GAMBAR 1 adalah foto referensi. GAMBAR 2 adalah foto sepatu produk. GAMBAR 3 adalah frame twibon.
Tiru GAMBAR 1 sebagai foto produk: pakai lokasi, properti, latar, permukaan, pencahayaan, mood, tone, dan warna latar yang sama seperti GAMBAR 1.
Ganti sepatu di GAMBAR 1 dengan sepatu dari GAMBAR 2. Sepatu asli dari GAMBAR 1 tidak boleh muncul di hasil.
Dari GAMBAR 2 ambil HANYA sepatunya. Latar, meja, dinding, bar hitam, teks, dan tampilan layar HP di GAMBAR 2 tidak boleh ikut.
Jangan ubah bentuk sepatu, jangan ubah bentuk logo pada sepatu, dan jangan ubah warnanya.
Hapus semua logo lain, kecuali logo yang ada pada sepatu.
Ubah angle dan pose sepatu tetapi tetap bagus.
Jumlah produk yang tampil: {jumlah}.
Frame twibon (GAMBAR 3) akan ditempel di atas hasil nanti: atur komposisi supaya sepatu terlihat penuh dan tidak tertutup grafis frame. Jangan gambar frame, teks, atau watermark di hasil.`;
const DEF={'#pr1':P1,'#pr2':P2};
const QTY={a:'ikuti GAMBAR 2. ATURAN: kalau GAMBAR 2 menampilkan 2 sepatu dengan model dan warna yang sama (sepasang), tampilkan HANYA 1 pcs sepatu di hasil, jangan tampilkan 2. Kalau GAMBAR 2 menampilkan 2 sepatu dengan model atau warna berbeda, tampilkan keduanya',1:'1 pcs sepatu saja',2:'2 pcs sepatu dengan warna yang sama'};
function makePrompt(box,ratio,qty,pose){
 let t=$(box).value.trim()||DEF[box];
 if(pose&&!t.includes('{pose}'))t+='\nPose/angle foto ini: {pose}.';
 return t.replaceAll('{ratio}',ratio).replaceAll('{jumlah}',QTY[qty]).replaceAll('{pose}',pose||'ubah angle dan pose, pilih yang paling bagus')}

// UI
$('#size1').innerHTML=SIZES.map((s,i)=>`<option value="${i}">${s[1]}</option>`).join('');
$$('.qty').forEach(s=>s.innerHTML='<option value="a">Otomatis (sepasang yang sama jadi 1 pcs)</option><option value="1">1 pcs</option><option value="2">2 pcs</option>');
$('#grid').innerHTML=[...Array(9).keys()].map(i=>`<div class="drop" data-k="s${i}"><span>Foto sepatu ${i+1}</span><i class="pose"></i></div>`).join('');
rollDir();
$('#size1').onchange=()=>$('#grid').style.setProperty('--ar',ratio1().replace(':','/'));
$$('nav button').forEach(b=>b.onclick=()=>{if(b.classList.contains('on'))return;$$('nav button').forEach(x=>x.classList.toggle('on',x==b));const c=$('.view.on');c.classList.add('out');setTimeout(()=>{c.classList.remove('on','out');$('#'+b.dataset.v).classList.add('on')},220)});
// Kolom prompt (tersimpan di browser)
Object.entries(DEF).forEach(([s,d])=>{const t=$(s),key=t.id+'_v2';t.value=localStorage[key]||d;t.oninput=()=>{localStorage[key]=t.value}});
$$('[data-reset]').forEach(b=>b.onclick=()=>{const s=b.dataset.reset,t=$(s);t.value=DEF[s];delete localStorage[t.id+'_v2']});

// Gambar
const load=f=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(f)});
// JPEG tidak mengenal transparan: latar diisi putih supaya sepatu PNG tanpa latar tidak jadi hitam
const part=(img,max,type='image/jpeg')=>{const r=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas'),x=c.getContext('2d');c.width=Math.round(img.naturalWidth*r);c.height=Math.round(img.naturalHeight*r);if(type=='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}x.drawImage(img,0,0,c.width,c.height);return c.toDataURL(type,.92)};
const toPng=d=>new Promise(ok=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d').drawImage(i,0,0);c.toBlob(ok,'image/png')};i.src=`data:${d.mimeType};base64,${d.data}`});
const paint=(k,u)=>{const d=el(k);d.style.backgroundImage=`url(${u})`;d.classList.add('has');d.classList.remove('pop');void d.offsetWidth;d.classList.add('pop')};
// Buang bar hitam di tepi foto (screenshot HP / letterbox, termasuk jam, tombol X, dan nomor foto di dalamnya) supaya tidak ikut terbaca AI
async function trim(img){
 const w=img.naturalWidth,h=img.naturalHeight,s=Math.min(1,1600/Math.max(w,h)),sw=Math.round(w*s),sh=Math.round(h*s),c=document.createElement('canvas');
 c.width=sw;c.height=sh;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,sw,sh);
 const d=x.getImageData(0,0,sw,sh).data,lit=(X,y)=>{const i=(y*sw+X)*4;return d[i+3]<200||d[i]+d[i+1]+d[i+2]>60};
 const row=y=>{let n=0;for(let X=0;X<sw;X++)n+=lit(X,y);return n>sw*.2};
 let t=0,b=sh-1;while(t<b&&!row(t))t++;while(b>t&&!row(b))b--;
 const col=X=>{let n=0;for(let y=t;y<=b;y++)n+=lit(X,y);return n>(b-t+1)*.2};
 let l=0,r=sw-1;while(l<r&&!col(l))l++;while(r>l&&!col(r))r--;
 if(!(t||l||b<sh-1||r<sw-1)||(r-l+1)*(b-t+1)<sw*sh*.15)return img;
 const g=Math.ceil(2/s),X0=Math.round(l/s)+(l?g:0),Y0=Math.round(t/s)+(t?g:0),X1=Math.round((r+1)/s)-(r<sw-1?g:0),Y1=Math.round((b+1)/s)-(b<sh-1?g:0),cw=Math.min(w,X1)-X0,ch=Math.min(h,Y1)-Y0,o=document.createElement('canvas');
 o.width=cw;o.height=ch;o.getContext('2d').drawImage(img,X0,Y0,cw,ch,0,0,cw,ch);
 return load(await new Promise(ok=>o.toBlob(ok,'image/png')))}
async function setImg(k,f){if(!f||!f.type.startsWith('image/'))return;let i=await load(f);if(k!='tw')try{i=await trim(i)}catch{}S[k]=i;delete R[k];paint(k,i.src);el(k).classList.remove('res','err');if(k=='tw')$('#out').style.aspectRatio=i.naturalWidth+'/'+i.naturalHeight;ready()}
function ready(){const n=[...Array(9).keys()].filter(i=>S['s'+i]).length;$('#go1').disabled=!S.rf||!n;$('#go1').textContent=n?`Generate ${n} foto`:'Generate';$('#go2').disabled=!(S.tw&&S.rf2&&S.sh2)}

// YupiAI
const API=()=>(localStorage.gp||'https://gateway.yupi.ai.id').replace(/\/+$/,'')+'/v1';
async function gem(parts,ratio){
 const body={model:MODEL(),prompt:parts[0].text,n:1,aspect_ratio:ratio,resolution:'2K',output_format:'png',input_references:parts.slice(1).map(u=>({type:'image_url',image_url:{url:u}}))};
 for(let t=0;t<4;t++){
  const r=await fetch(API()+'/images',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+KEY()},body:JSON.stringify(body)}),j=await r.json().catch(()=>({})),e=j.error||{};
  if(r.ok){const d=j.data?.[0];if(!d?.b64_json){if(t<3)continue;throw Error('Model tidak mengembalikan gambar. Coba generate ulang.')}const b=await toPng({mimeType:d.media_type||'image/png',data:d.b64_json});b.low=!body.resolution;return b}
  if(['unsupported_parameter','invalid_parameter'].includes(e.code)&&['resolution','output_format'].includes(e.param)){delete body[e.param];continue}
  throw Error((e.message||'Gagal ('+r.status+')').replace(/\s*Error ID:.*$/,''))}
 throw Error('Parameter ditolak model. Coba model lain.')}
async function job(k){
 const d=el(k),m=$(k=='out'?'#m2':'#m1');d.classList.add('load');d.classList.remove('err');m.textContent='';
 try{let b;
  if(k=='out'){const tw=S.tw,rt=near(tw.naturalWidth/tw.naturalHeight),g=await gem([{text:makePrompt('#pr2',rt,$('#qty2').value)},part(S.rf2,1536),part(S.sh2,2048),part(tw,1024,'image/png')],rt);
   const bg=await load(g),w=tw.naturalWidth,h=tw.naturalHeight,W=w>=h?2048:Math.round(2048*w/h),H=w>=h?Math.round(2048*h/w):2048,c=document.createElement('canvas');c.width=W;c.height=H;
   const x=c.getContext('2d'),s=Math.max(W/bg.naturalWidth,H/bg.naturalHeight);
   x.drawImage(bg,(W-bg.naturalWidth*s)/2,(H-bg.naturalHeight*s)/2,bg.naturalWidth*s,bg.naturalHeight*s);x.drawImage(tw,0,0,W,H);
   b=await new Promise(r=>c.toBlob(r,'image/png'))}
  else b=await gem([{text:makePrompt('#pr1',ratio1(),$('#qty1').value,poseText(+k.slice(1)))},part(S.rf,1536),part(S[k],2048)],ratio1());
  R[k]=b;paint(k,URL.createObjectURL(b));d.classList.add('res');if(b.low)m.textContent='Model ini tidak mendukung 2K, hasil memakai ukuran bawaan model.'
 }catch(e){d.classList.add('err');m.textContent=/fetch/i.test(e.message)?'Tidak tersambung ke YupiAI. Kemungkinan diblokir browser (CORS): isi alamat proxy di Pengaturan.':e.message}
 d.classList.remove('load')}
const pool=async(ks,n=3)=>{const q=[...ks];await Promise.all(Array(n).fill().map(async()=>{while(q.length)await job(q.shift())}))};
const needKey=()=>(!KEY()||!MODEL())&&($('#dlg').showModal(),1);
$('#go1').onclick=async()=>{if(needKey())return;$('#go1').disabled=true;rollDir();await pool([...Array(9).keys()].map(i=>'s'+i).filter(k=>S[k]));ready()};
$('#go2').onclick=async()=>{if(needKey())return;$('#go2').disabled=true;await job('out');ready()};

// Upload, klik kanan, drag & drop
const inp=Object.assign(document.createElement('input'),{type:'file',accept:'image/*'}),mn=$('#menu');
inp.onchange=()=>{setImg(target,inp.files[0]);inp.value=''};
function menu(e,k){mk=k;$('[data-a=ch]').hidden=k=='out';mn.style.display='block';mn.style.left=Math.max(8,Math.min(e.clientX,innerWidth-mn.offsetWidth-8))+'px';mn.style.top=Math.max(8,Math.min(e.clientY,innerHeight-mn.offsetHeight-8))+'px'}
mn.onclick=e=>{const a=e.target.dataset.a;if(a=='dl'){const l=document.createElement('a');l.href=URL.createObjectURL(R[mk]);l.download=`foto-produk-${mk}.png`;l.click()}if(a=='re'&&!needKey()){if(/^s\d$/.test(mk)){const i=+mk[1];DIR[i]=flip(DIR[i]);showDir()}job(mk)}if(a=='ch'){target=mk;inp.click()}};
document.addEventListener('click',e=>{mn.style.display='none';const d=e.target.closest('.drop');if(!d)return;const k=d.dataset.k;if(R[k])return menu(e,k);if(k=='out')return;target=k;inp.click()});
document.addEventListener('contextmenu',e=>{const d=e.target.closest('.drop');if(d&&R[d.dataset.k]){e.preventDefault();menu(e,d.dataset.k)}});
document.addEventListener('dragover',e=>e.preventDefault());
document.addEventListener('drop',e=>{e.preventDefault();const d=e.target.closest('.drop');if(d&&d.dataset.k!='out')setImg(d.dataset.k,e.dataTransfer.files[0])});

// Pengaturan (API key disimpan di browser masing-masing)
async function loadModels(){const k=$('#k').value.trim(),b=$('#ld');localStorage.gp=$('#p').value.trim();if(!k)return;b.textContent='Memuat...';
 try{const r=await fetch(API()+'/images/models',{headers:{Authorization:'Bearer '+k}}),j=await r.json();if(!r.ok)throw Error();
  const l=(j.data||j.models||j).filter(m=>m&&(m.id||m.model)),ed=l.filter(m=>JSON.stringify(m).includes('image_editing')),ids=(ed.length?ed:l).map(m=>m.id||m.model);
  $('#ml').innerHTML=ids.map(i=>`<option value="${i}">`).join('');if(!$('#m').value)$('#m').value=ids.find(i=>/nano-banana-2|gemini-3\.1-flash-image/i.test(i))||ids.find(i=>/gemini|banana/i.test(i))||ids[0]||'';b.textContent='Muat model'}
 catch{b.textContent='Gagal, isi manual'}}
$('#ld').onclick=loadModels;
$('#cfg').onclick=()=>{$('#p').value=localStorage.gp||'';$('#k').value=KEY();$('#m').value=MODEL();$('#dlg').showModal();loadModels()};
$('#sv').onclick=()=>{localStorage.gk=$('#k').value.trim();localStorage.gm=$('#m').value.trim();localStorage.gp=$('#p').value.trim();$('#dlg').close()};
if(!KEY())$('#cfg').click();
ready();
