const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],el=k=>$(`[data-k="${k}"]`);
const SIZES=[['4:5','Feeds Instagram (4:5)'],['1:1','Feeds persegi / marketplace (1:1)'],['9:16','Story & Reels (9:16)'],['16:9','Dekorasi toko landscape (16:9)'],['9:16','Dekorasi toko portrait (9:16)'],['21:9','Banner lebar (21:9)'],['3:4','Poster (3:4)'],['4:3','Landscape (4:3)']];
const POSES=['tampak depan','samping kiri','tiga perempat depan','tampak belakang','dari atas','close-up sol','low angle hero shot','close-up ujung dan tali','sepasang diagonal'];
const RT=['1:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9','21:9'];
const val=r=>{const[a,b]=r.split(':');return a/b};
const near=x=>RT.reduce((a,b)=>Math.abs(Math.log(val(b)/x))<Math.abs(Math.log(val(a)/x))?b:a);
const S={},R={};let mk,target;
const KEY=()=>localStorage.gk||'',MODEL=()=>localStorage.gm||'',ratio1=()=>SIZES[$('#size1').value][0];

// UI
$('#size1').innerHTML=SIZES.map((s,i)=>`<option value="${i}">${s[1]}</option>`).join('');
$('#grid').innerHTML=[...Array(9).keys()].map(i=>`<div class="drop" data-k="s${i}"><span>Foto sepatu ${i+1}</span><i class="pose"></i></div>`).join('');
$$('.pose').forEach((p,i)=>p.textContent=POSES[i]);
$('#size1').onchange=()=>$('#grid').style.setProperty('--ar',ratio1().replace(':','/'));
$$('nav button').forEach(b=>b.onclick=()=>{if(b.classList.contains('on'))return;$$('nav button').forEach(x=>x.classList.toggle('on',x==b));const c=$('.view.on');c.classList.add('out');setTimeout(()=>{c.classList.remove('on','out');$('#'+b.dataset.v).classList.add('on')},220)});

// Gambar
const load=f=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(f)});
const part=(img,max,type='image/jpeg')=>{const r=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=img.naturalWidth*r;c.height=img.naturalHeight*r;c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL(type,.9)};
const toPng=d=>new Promise(ok=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d').drawImage(i,0,0);c.toBlob(ok,'image/png')};i.src=`data:${d.mimeType};base64,${d.data}`});
const paint=(k,u)=>{const d=el(k);d.style.backgroundImage=`url(${u})`;d.classList.add('has');d.classList.remove('pop');void d.offsetWidth;d.classList.add('pop')};
async function setImg(k,f){if(!f||!f.type.startsWith('image/'))return;const i=await load(f);S[k]=i;delete R[k];paint(k,i.src);el(k).classList.remove('res','err');if(k=='tw')$('#out').style.aspectRatio=i.naturalWidth+'/'+i.naturalHeight;ready()}
function ready(){const n=[...Array(9).keys()].filter(i=>S['s'+i]).length;$('#go1').disabled=!S.rf||!n;$('#go1').textContent=n?`Generate ${n} foto`:'Generate';$('#go2').disabled=!(S.tw&&S.rf2&&S.sh2)}

// YupiAI
const API=()=>(localStorage.gp||'https://gateway.yupi.ai.id').replace(/\/+$/,'')+'/v1';
async function gem(parts,ratio){
 const body={model:MODEL(),prompt:parts[0].text,n:1,aspect_ratio:ratio,resolution:'2K',output_format:'png',input_references:parts.slice(1).map(u=>({type:'image_url',image_url:{url:u}}))};
 for(let t=0;t<3;t++){
  const r=await fetch(API()+'/images',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+KEY()},body:JSON.stringify(body)}),j=await r.json().catch(()=>({})),e=j.error||{};
  if(r.ok){const d=j.data?.[0];if(!d?.b64_json)throw Error('Model tidak mengembalikan gambar. Coba generate ulang.');const b=await toPng({mimeType:d.media_type||'image/png',data:d.b64_json});b.low=!body.resolution;return b}
  if(['unsupported_parameter','invalid_parameter'].includes(e.code)&&['resolution','output_format'].includes(e.param)){delete body[e.param];continue}
  throw Error((e.message||'Gagal ('+r.status+')').replace(/\s*Error ID:.*$/,''))}
 throw Error('Parameter ditolak model. Coba model lain.')}
const BASE='Create a professional e-commerce product photo. Image 1 is the style reference: copy its location, background, lighting, color tone and mood. Image 2 is the exact shoe: keep its shape, color, material, logo and details unchanged. ';
async function job(k){
 const d=el(k),m=$(k=='out'?'#m2':'#m1');d.classList.add('load');d.classList.remove('err');m.textContent='';
 try{let b;
  if(k=='out'){const tw=S.tw,g=await gem([{text:BASE+'Image 3 is a twibbon frame that will be overlaid later: compose the shot so the shoe stays fully visible and is not covered by the frame graphics. Output only the photo, without the frame, text or watermark.'},part(S.rf2,1536),part(S.sh2,1536),part(tw,1024,'image/png')],near(tw.naturalWidth/tw.naturalHeight));
   const bg=await load(g),w=tw.naturalWidth,h=tw.naturalHeight,W=w>=h?2048:Math.round(2048*w/h),H=w>=h?Math.round(2048*h/w):2048,c=document.createElement('canvas');c.width=W;c.height=H;
   const x=c.getContext('2d'),s=Math.max(W/bg.naturalWidth,H/bg.naturalHeight);
   x.drawImage(bg,(W-bg.naturalWidth*s)/2,(H-bg.naturalHeight*s)/2,bg.naturalWidth*s,bg.naturalHeight*s);x.drawImage(tw,0,0,W,H);
   b=await new Promise(r=>c.toBlob(r,'image/png'))}
  else b=await gem([{text:BASE+`Pose/angle (in Indonesian): ${POSES[+k.slice(1)]}. Output only the final image, no text, no watermark.`},part(S.rf,1536),part(S[k],1536)],ratio1());
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
