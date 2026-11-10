const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],el=k=>$(`[data-k="${k}"]`);
const SIZES=[['4:5','Feeds Instagram (4:5)'],['1:1','Feeds persegi / marketplace (1:1)'],['9:16','Story & Reels (9:16)'],['16:9','Dekorasi toko landscape (16:9)'],['9:16','Dekorasi toko portrait (9:16)'],['21:9','Banner lebar (21:9)'],['3:4','Poster (3:4)'],['4:3','Landscape (4:3)']];
// [label di kartu, deskripsi untuk prompt]
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
const KEY=()=>localStorage.gk||'',MODEL=()=>localStorage.gm||'',ratio1=()=>SIZES[$('#size1').value][0];

// Prompt bawaan. Kode otomatis: {ratio} {jumlah} {pose}
const P1=`Buat foto produk dengan cahaya dramatis, rasio {ratio}, kualitas HD dan realistis.
GAMBAR 1 adalah foto referensi. GAMBAR 2 adalah foto sepatu produk.
Buat foto produk seperti GAMBAR 1 dengan produk sepatu dari GAMBAR 2.
Hapus semua logo, teks, dan watermark kecuali logo yang ada pada sepatu.
Jangan ubah bentuk sepatu, jangan ubah bentuk logo pada sepatu, dan jangan ubah warnanya.
Mood, tone, dan warna latar harus sama seperti GAMBAR 1.
Ubah angle dan pose sepatu tetapi tetap bagus: {pose}.
Jumlah produk yang tampil untuk warna ini: {jumlah}.
Hasil akhir hanya gambar, tanpa teks dan tanpa watermark.`;
const P2=`Buat foto produk dengan cahaya dramatis, rasio {ratio}, kualitas HD dan realistis.
GAMBAR 1 adalah foto referensi. GAMBAR 2 adalah foto sepatu produk. GAMBAR 3 adalah frame twibon.
Buat foto produk seperti GAMBAR 1 dengan produk sepatu dari GAMBAR 2.
Hapus semua logo, teks, dan watermark kecuali logo yang ada pada sepatu.
Jangan ubah bentuk sepatu, jangan ubah bentuk logo pada sepatu, dan jangan ubah warnanya.
Mood, tone, dan warna latar harus sama seperti GAMBAR 1.
Ubah angle dan pose sepatu tetapi tetap bagus.
Jumlah produk yang tampil: {jumlah}.
Frame twibon (GAMBAR 3) akan ditempel di atas hasil nanti: atur komposisi supaya sepatu terlihat penuh dan tidak tertutup grafis frame. Jangan gambar frame, teks, atau watermark di hasil.`;
const DEF={'#pr1':P1,'#pr2':P2};
const QTY={a:'sama persis seperti jumlah sepatu pada GAMBAR 2 (1 atau 2 pcs untuk tiap warna)',1:'1 pcs sepatu saja',2:'2 pcs sepatu dengan warna yang sama'};
function makePrompt(box,ratio,qty,pose){
 let t=$(box).value.trim()||DEF[box];
 if(pose&&!t.includes('{pose}'))t+='\nPose/angle foto ini: {pose}.';
 return t.replaceAll('{ratio}',ratio).replaceAll('{jumlah}',QTY[qty]).replaceAll('{pose}',pose||'ubah angle dan pose, pilih yang paling bagus')}

// UI
$('#size1').innerHTML=SIZES.map((s,i)=>`<option value="${i}">${s[1]}</option>`).join('');
$$('.qty').forEach(s=>s.innerHTML='<option value="a">Sesuai foto sepatu (otomatis 1 atau 2 pcs)</option><option value="1">1 pcs</option><option value="2">2 pcs</option>');
$('#grid').innerHTML=[...Array(9).keys()].map(i=>`<div class="drop" data-k="s${i}"><span>Foto sepatu ${i+1}</span><i class="pose"></i></div>`).join('');
$$('.pose').forEach((p,i)=>p.textContent=POSES[i][0]);
$('#size1').onchange=()=>$('#grid').style.setProperty('--ar',ratio1().replace(':','/'));
$$('nav button').forEach(b=>b.onclick=()=>{if(b.classList.contains('on'))return;$$('nav button').forEach(x=>x.classList.toggle('on',x==b));const c=$('.view.on');c.classList.add('out');setTimeout(()=>{c.classList.remove('on','out');$('#'+b.dataset.v).classList.add('on')},220)});
// Kolom prompt (tersimpan di browser)
Object.entries(DEF).forEach(([s,d])=>{const t=$(s);t.value=localStorage[t.id]||d;t.oninput=()=>{localStorage[t.id]=t.value}});
$$('[data-reset]').forEach(b=>b.onclick=()=>{const s=b.dataset.reset,t=$(s);t.value=DEF[s];delete localStorage[t.id]});

// Gambar
const load=f=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(f)});
// JPEG tidak mengenal transparan: latar diisi putih supaya sepatu PNG tanpa latar tidak jadi hitam
const part=(img,max,type='image/jpeg')=>{const r=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas'),x=c.getContext('2d');c.width=Math.round(img.naturalWidth*r);c.height=Math.round(img.naturalHeight*r);if(type=='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height)}x.drawImage(img,0,0,c.width,c.height);return c.toDataURL(type,.92)};
const toPng=d=>new Promise(ok=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d').drawImage(i,0,0);c.toBlob(ok,'image/png')};i.src=`data:${d.mimeType};base64,${d.data}`});
const paint=(k,u)=>{const d=el(k);d.style.backgroundImage=`url(${u})`;d.classList.add('has');d.classList.remove('pop');void d.offsetWidth;d.classList.add('pop')};
async function setImg(k,f){if(!f||!f.type.startsWith('image/'))return;const i=await load(f);S[k]=i;delete R[k];paint(k,i.src);el(k).classList.remove('res','err');if(k=='tw')$('#out').style.aspectRatio=i.naturalWidth+'/'+i.naturalHeight;ready()}
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
  else b=await gem([{text:makePrompt('#pr1',ratio1(),$('#qty1').value,POSES[+k.slice(1)][1])},part(S.rf,1536),part(S[k],2048)],ratio1());
  R[k]=b;paint(k,URL.createObjectURL(b));d.classList.add('res');if(b.low)m.textContent='Model ini tidak mendukung 2K, hasil memakai ukuran bawaan model.'
 }catch(e){d.classList.add('err');m.textContent=/fetch/i.test(e.message)?'Tidak tersambung ke YupiAI. Kemungkinan diblokir browser (CORS): isi alamat proxy di Pengaturan.':e.message}
 d.classList.remove('load')}
const pool=async(ks,n=3)=>{const q=[...ks];await Promise.all(Array(n).fill().map(async()=>{while(q.length)await job(q.shift())}))};
const needKey=()=>(!KEY()||!MODEL())&&($('#dlg').showModal(),1);
$('#go1').onclick=async()=>{if(needKey())return;$('#go1').disabled=true;await pool([...Array(9).keys()].map(i=>'s'+i).filter(k=>S[k]));ready()};
$('#go2').onclick=async()=>{if(needKey())return;$('#go2').disabled=true;await job('out');ready()};

// Upload, klik kanan, drag & drop
const inp=Object.assign(document.createElement('input'),{type:'file',accept:'image/*'}),mn=$('#menu');
inp.onchange=()=>{setImg(target,inp.files[0]);inp.value=''};
function menu(e,k){mk=k;$('[data-a=ch]').hidden=k=='out';mn.style.display='block';mn.style.left=Math.max(8,Math.min(e.clientX,innerWidth-mn.offsetWidth-8))+'px';mn.style.top=Math.max(8,Math.min(e.clientY,innerHeight-mn.offsetHeight-8))+'px'}
mn.onclick=e=>{const a=e.target.dataset.a;if(a=='dl'){const l=document.createElement('a');l.href=URL.createObjectURL(R[mk]);l.download=`foto-produk-${mk}.png`;l.click()}if(a=='re'&&!needKey())job(mk);if(a=='ch'){target=mk;inp.click()}};
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
