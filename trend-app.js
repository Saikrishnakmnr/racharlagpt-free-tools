/* RacharlaGPT Trend — shared browser tools. No server required. */
(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const track=(name,params={})=>{if(typeof gtag==='function')gtag('event',name,params)};

  // ---------- Photo Studio ----------
  const canvas=$('#canvas'), fileInput=$('#retroFile');
  if(canvas && fileInput){
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    let img=null, style='90s', sourceFile=null;
    const names={
      '90s':'90s Camera','y2k':'Y2K Digital','disposable':'Disposable Flash','kodak':'Kodak Film','fuji':'Fuji Film','polaroid':'Polaroid Story','vhs':'VHS Tape','bw':'B&W Film','cinematic':'Cinematic Poster','cyber':'Cyber Neon','soft':'Soft Dream','matte':'Editorial Matte','sunset':'Golden Sunset','oldfilm':'Old Film','retroflash':'Retro Flash','pastel':'Pastel Pop'
    };
    const palettes={
      '90s':['#ff5b8d','#ffd36a','#10182f'],'y2k':['#00eaff','#ff2bd6','#8a5cff'],'disposable':['#ff7a18','#ffe600','#ff3f81'],'kodak':['#f3b21b','#c95f27','#5a3219'],'fuji':['#20d58b','#00a6ff','#183d55'],'polaroid':['#ff8c42','#ffe4c4','#8a5cff'],'vhs':['#ff2bd6','#7a5cff','#00eaff'],'bw':['#e9eef8','#78839f','#141827'],'cinematic':['#ff9a3c','#00b8c9','#090d20'],'cyber':['#00eaff','#ff2bd6','#6f38ff'],'soft':['#ffc9e8','#b9f5ff','#9d8cff'],'matte':['#e2bd8d','#8a9b86','#28324a'],'sunset':['#ff4d5a','#ffb11b','#703cff'],'oldfilm':['#d9bd83','#8a6a44','#33281d'],'retroflash':['#fff2c2','#ff5b4d','#2d3cff'],'pastel':['#ff9de1','#8df6ff','#ffe477']
    };
    const defaults={intensity:82,grain:24,vignette:22,leak:22};
    const val=k=>+($('#'+k)?.value||0);
    function sync(){['intensity','grain','vignette','leak'].forEach(k=>{const o=$('#'+k+'Out');if(o)o.textContent=val(k)+'%'})}
    function fitSize(i){
      const mode=$('#aspect')?.value||'original', w=i.naturalWidth,h=i.naturalHeight;
      if(mode==='original')return {w,h};
      const ratios={'4:5':4/5,'1:1':1,'9:16':9/16,'16:9':16/9}; const r=ratios[mode]||w/h;
      if(w/h>r) return {w:Math.round(h*r),h};
      return {w,h:Math.round(w/r)};
    }
    function roundedRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
    function drawBackdrop(w,h,p){
      const g=ctx.createRadialGradient(w*.5,h*.2,0,w*.5,h*.6,Math.max(w,h)*.8);g.addColorStop(0,p[1]);g.addColorStop(.45,p[2]);g.addColorStop(1,'#03040e');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      ctx.globalAlpha=.22;
      for(let i=0;i<7;i++){const x=(i/6)*w;const lg=ctx.createLinearGradient(x,0,x+w*.2,h);lg.addColorStop(0,'transparent');lg.addColorStop(.5,p[0]);lg.addColorStop(1,'transparent');ctx.fillStyle=lg;ctx.fillRect(0,0,w,h)}
      ctx.globalAlpha=1;
    }
    function drawPhotoCover(image,x,y,w,h){
      const ir=image.naturalWidth/image.naturalHeight, r=w/h;let sw=image.naturalWidth,sh=image.naturalHeight,sx=0,sy=0;
      if(ir>r){sw=Math.round(image.naturalHeight*r);sx=Math.round((image.naturalWidth-sw)/2)} else {sh=Math.round(image.naturalWidth/r);sy=Math.round((image.naturalHeight-sh)/2)}
      ctx.drawImage(image,sx,sy,sw,sh,x,y,w,h);
    }
    function pixelGrade(intensity,grain){
      const d=ctx.getImageData(0,0,canvas.width,canvas.height),a=d.data,I=intensity/100,G=grain/100;
      const p=palettes[style]||palettes['90s'];
      for(let i=0;i<a.length;i+=4){
        let r=a[i],g=a[i+1],b=a[i+2],v=(r+g+b)/3;
        const lift=(r+g+b)/3;
        switch(style){
          case '90s': r=r*1.08+8;g=g*.98+5;b=b*.9+2;break;
          case 'y2k': r=r*1.08+10;g=g*.98+2;b=b*1.12+12;break;
          case 'disposable': r=r*1.16+15;g=g*1.01+5;b=b*.84;break;
          case 'kodak': r=r*1.13+8;g=g*1.02+4;b=b*.83;break;
          case 'fuji': r=r*.97;g=g*1.08+4;b=b*1.07+8;break;
          case 'polaroid': r=r*1.06+17;g=g*1.01+10;b=b*.92+9;break;
          case 'vhs': r=r*1.05+8;g=g*.95+3;b=b*1.13+11;break;
          case 'bw': r=g=b=v;break;
          case 'cinematic': {r=r*1.12+2;g=g*1.00;b=b*.9;const m=(r+g+b)/3;r=(r-m)*1.15+m;g=(g-m)*1.08+m;b=(b-m)*1.08+m}break;
          case 'cyber': r=r*1.05+4;b=b*1.24+16;g=g*.88;break;
          case 'soft': r=r*.96+18;g=g*.98+15;b=b*1.01+18;break;
          case 'matte': r=r*.91+22;g=g*.92+21;b=b*.9+23;break;
          case 'sunset': r=r*1.18+10;g=g*1.03+4;b=b*.76;break;
          case 'oldfilm': r=r*1.03+6;g=g*.95+4;b=b*.78;break;
          case 'retroflash': r=r*1.18+15;g=g*1.08+9;b=b*.92+6;break;
          case 'pastel': r=r*.97+20;g=g*.99+18;b=b*1.02+22;break;
        }
        r=r*I+a[i]*(1-I);g=g*I+a[i+1]*(1-I);b=b*I+a[i+2]*(1-I);
        const noise=(Math.random()-.5)*38*G*(style==='oldfilm'?1.5:1);
        const contrast=1+(I*.12);r=(r-128)*contrast+128;g=(g-128)*contrast+128;b=(b-128)*contrast+128;
        a[i]=Math.max(0,Math.min(255,r+noise));a[i+1]=Math.max(0,Math.min(255,g+noise));a[i+2]=Math.max(0,Math.min(255,b+noise));
      }
      ctx.putImageData(d,0,0);
    }
    function overlayEffects(){
      const w=canvas.width,h=canvas.height,p=palettes[style],leak=val('leak')/100,vig=val('vignette')/100;
      if(leak){ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(w*.12,h*.12,0,w*.12,h*.12,Math.max(w,h)*.75);g.addColorStop(0,p[0]+ '99');g.addColorStop(.35,p[1]+'33');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.globalAlpha=.65*leak;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
      if(vig){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(0,'transparent');g.addColorStop(1,`rgba(0,0,0,${.72*vig})`);ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}
      ctx.globalAlpha=.28;
      if(['90s','disposable','retroflash'].includes(style)){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w*.12,h*.15,Math.min(w,h)*.13,0,Math.PI*2);ctx.fill()}
      if(['cyber','y2k','vhs'].includes(style)){for(let i=0;i<5;i++){ctx.fillStyle=p[i%3];ctx.globalAlpha=.11;ctx.fillRect(0,h*(.15+i*.16),w,Math.max(2,h*.008))}}
      ctx.globalAlpha=1;
      if(style==='oldfilm'){ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=Math.max(1,w/900);for(let i=0;i<70;i++){let x=Math.random()*w,y=Math.random()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(Math.random()-.5)*20,y+Math.random()*80);ctx.stroke()}}
      if(style==='vhs'){ctx.font=`bold ${Math.max(14,w/55)}px monospace`;ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillText('PLAY  REC',w*.05,h*.09);ctx.fillText('SP',w*.88,h*.09)}
      if(style==='y2k'){ctx.font=`900 ${Math.max(16,w/32)}px system-ui`;ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillText('2000',w*.06,h*.9)}
      if(style==='cinematic'){ctx.fillStyle='rgba(0,0,0,.86)';ctx.fillRect(0,0,w,h*.08);ctx.fillRect(0,h*.92,w,h*.08);ctx.font=`700 ${Math.max(13,w/60)}px system-ui`;ctx.fillStyle='white';ctx.fillText('RACHARLAGPT TREND • CINEMA',w*.05,h*.965)}
      if(style==='polaroid'){ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(12,w/45);ctx.strokeRect(ctx.lineWidth/2,ctx.lineWidth/2,w-ctx.lineWidth,h-ctx.lineWidth);ctx.font=`700 ${Math.max(16,w/38)}px system-ui`;ctx.fillStyle='#fff';ctx.fillText('RacharlaGPT Trend',w*.06,h*.95)}
      if(style==='disposable'){ctx.font=`700 ${Math.max(13,w/65)}px monospace`;ctx.fillStyle='#fff';ctx.fillText(new Date().toLocaleDateString('en-GB'),w*.06,h*.93)}
      if(style==='pastel'||style==='soft'){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.12;ctx.fillStyle=p[0];ctx.beginPath();ctx.arc(w*.82,h*.18,Math.min(w,h)*.3,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
    }
    function render(){
      if(!img)return;
      const s=fitSize(img), pad=($('#border')?.checked?Math.round(Math.min(s.w,s.h)*.06):0), outW=s.w+pad*2,outH=s.h+pad*2;
      canvas.width=Math.min(4096,outW);canvas.height=Math.min(4096,outH);
      const p=palettes[style];drawBackdrop(canvas.width,canvas.height,p);
      const x=pad,y=pad,w=canvas.width-pad*2,h=canvas.height-pad*2;
      // Poster treatment: blurred-looking background is made from a cover crop, then the original is placed over it.
      ctx.save();ctx.globalAlpha=.32;ctx.filter='blur(18px) saturate(1.35)';drawPhotoCover(img,0,0,canvas.width,canvas.height);ctx.restore();ctx.filter='none';
      roundedRect(ctx,x,y,w,h,Math.min(24,Math.min(w,h)*.03));ctx.save();ctx.clip();drawPhotoCover(img,x,y,w,h);ctx.restore();
      pixelGrade(val('intensity'),val('grain'));overlayEffects();
      if($('#stamp')?.checked){ctx.font=`900 ${Math.max(14,canvas.width/65)}px monospace`;ctx.fillStyle='rgba(255,230,0,.95)';ctx.shadowColor='#ff2bd6';ctx.shadowBlur=12;ctx.fillText(new Date().toLocaleDateString('en-GB').replaceAll('/','.'),canvas.width*.05,canvas.height*.9);ctx.shadowBlur=0}
      if(typeof gtag==='function')track('photo_style_preview',{style,style_name:names[style]});
    }
    function download(){
      if(!img){setResult('Choose a photo first.','bad');return}
      render();const fmt=$('#exportFormat')?.value||'image/jpeg', ext=fmt==='image/png'?'png':fmt==='image/webp'?'webp':'jpg';
      canvas.toBlob(blob=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`racharlagpt-trend-${style}.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);setResult(`✓ ${names[style]} trend photo exported as ${ext.toUpperCase()}.`);track('photo_download',{style,format:ext})},fmt,.94)
    }
    function setResult(t,type='ok'){const r=$('#result');if(r){r.innerHTML=`<div class="result ${type==='bad'?'bad':''}">${t}</div>`}}
    $$('[data-style]').forEach(b=>b.addEventListener('click',()=>{$$('[data-style]').forEach(x=>x.classList.remove('active'));b.classList.add('active');style=b.dataset.style;track('style_selected',{style,style_name:names[style]});if(img)render()}));
    fileInput.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){setResult('Please choose a JPG, PNG, WEBP or other browser-supported image.','bad');return}sourceFile=f;const u=URL.createObjectURL(f);img=new Image();img.onload=()=>{URL.revokeObjectURL(u);$('#sourceInfo').textContent=`${img.naturalWidth} × ${img.naturalHeight}px • ${f.name}`;$('#emptyPreview').style.display='none';render();track('photo_upload',{file_type:f.type})};img.src=u});
    ['intensity','grain','vignette','leak','aspect','border','stamp'].forEach(id=>{const e=$('#'+id);if(e)e.addEventListener('input',()=>{sync();if(img)render()})});
    $('#generateBtn')?.addEventListener('click',()=>{render();setResult(`✨ ${names[style]} trend look generated. Your original photo is kept on your device.`);track('photo_generate',{style})});
    $('#downloadBtn')?.addEventListener('click',download);
    $('#randomStyleBtn')?.addEventListener('click',()=>{const bs=$$('[data-style]');const b=bs[Math.floor(Math.random()*bs.length)];b.click();setResult(`🎲 Try this trend: ${names[style]}.`)});
    $('#resetBtn')?.addEventListener('click',()=>{Object.entries(defaults).forEach(([k,v])=>{if($('#'+k))$('#'+k).value=v});if($('#aspect'))$('#aspect').value='4:5';if($('#exportFormat'))$('#exportFormat').value='image/jpeg';if($('#stamp'))$('#stamp').checked=false;if($('#border'))$('#border').checked=true;const b=$('[data-style="90s"]');if(b)b.click();sync();if(img)render();setResult('Studio reset. Choose a style and generate again.')});
    sync();
  }

  // ---------- Image tools ----------
  const imageBox=$('#imageToolBox');
  if(imageBox){
    window.imageToolUI=function(mode){
      $$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
      imageBox.innerHTML=`<div class="tool-panel"><div><h2>${mode==='resize'?'Resize Image':mode==='compress'?'Compress Image':'Convert to PNG'}</h2><p>${mode==='resize'?'Set a maximum width and keep the original aspect ratio.':mode==='compress'?'Reduce JPEG/WebP file size with adjustable quality.':'Convert your image to a real PNG file in your browser.'}</p><label class="field">Choose image<input id="imgToolFile" class="file" type="file" accept="image/*"></label><div class="grid" style="margin-top:15px"><label class="field">Width (px)<input id="imgWidth" type="number" min="1" placeholder="e.g. 1200" value="1200"></label><label class="field">Format<select id="imgFormat"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option></select></label></div><label class="field">Quality <output id="imgQualityOut">90%</output><input id="imgQuality" type="range" min="20" max="100" value="90"></label><button id="processImage" type="button">Process & Download</button><div id="imageResult"></div></div><div class="card"><h3>What happens</h3><ul><li>Image stays in your browser.</li><li>Resize keeps the aspect ratio.</li><li>PNG conversion creates a new PNG file.</li><li>Compression can lower file size but may reduce quality.</li></ul></div></div>`;
      $('#imgQuality').addEventListener('input',e=>$('#imgQualityOut').textContent=e.target.value+'%');
      $('#processImage').addEventListener('click',()=>processImage(mode));
    };
    async function processImage(mode){
      const f=$('#imgToolFile')?.files?.[0];if(!f){$('#imageResult').innerHTML='<div class="result bad">Choose an image first.</div>';return}
      const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);let w=im.naturalWidth,h=im.naturalHeight,n=Math.max(1,+$('#imgWidth').value||w);if(mode==='resize'&&n!==w){h=Math.round(h*n/w);w=n}if(mode==='compress'){w=im.naturalWidth;h=im.naturalHeight}if(mode==='png'){w=im.naturalWidth;h=im.naturalHeight}
        const c=document.createElement('canvas');c.width=w;c.height=h;const cctx=c.getContext('2d');cctx.imageSmoothingEnabled=true;cctx.imageSmoothingQuality='high';cctx.drawImage(im,0,0,w,h);let fmt=mode==='png'?'image/png':$('#imgFormat').value;if(mode==='resize' && $('#imgFormat').value==='image/png')fmt='image/png';const q=+$('#imgQuality').value/100;c.toBlob(blob=>{if(!blob){$('#imageResult').innerHTML='<div class="result bad">This browser could not create the requested file.</div>';return}const ext=fmt==='image/png'?'png':fmt==='image/webp'?'webp':'jpg',url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`racharlagpt-${mode}.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);$('#imageResult').innerHTML=`<div class="result">✓ Done. ${w} × ${h}px • ${(blob.size/1024).toFixed(1)} KB • ${ext.toUpperCase()}</div>`;track('image_tool_used',{mode,format:ext})},fmt,fmt==='image/png'?undefined:q)
      };im.onerror=()=>$('#imageResult').innerHTML='<div class="result bad">Could not read this image.</div>';im.src=u;
    }
    window.imageToolUI('resize');
  }

  // ---------- Student tools ----------
  const studentBox=$('#studentToolBox');
  if(studentBox){
    window.studentUI=function(mode){
      $$('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
      let h='';
      if(mode==='percentage')h=`<h2>Percentage Calculator</h2><div class="grid"><label class="field">Obtained marks<input id="pA" type="number" min="0" step="any"></label><label class="field">Total marks<input id="pB" type="number" min="0.0001" step="any"></label></div><button type="button" onclick="calcPercentage()">Calculate</button>`;
      if(mode==='attendance')h=`<h2>Attendance Calculator</h2><div class="grid"><label class="field">Classes attended<input id="pA" type="number" min="0" step="1"></label><label class="field">Total classes<input id="pB" type="number" min="1" step="1"></label></div><button type="button" onclick="calcAttendance()">Calculate</button>`;
      if(mode==='cgpa')h=`<h2>CGPA → Percentage</h2><label class="field">CGPA<input id="pA" type="number" min="0" max="10" step=".01" placeholder="e.g. 8.5"></label><label class="field">Multiplier<input id="pB" type="number" min="0" step=".01" value="9.5"></label><p>Conversion rules vary by institution. Use your official rule when available.</p><button type="button" onclick="calcCgpa()">Convert</button>`;
      if(mode==='gpa')h=`<h2>GPA Average</h2><label class="field">GPA values<input id="pA" type="text" placeholder="8, 7.5, 9, 8.5"></label><button type="button" onclick="calcGpa()">Calculate</button>`;
      if(mode==='age')h=`<h2>Age Calculator</h2><label class="field">Date of birth<input id="dob" type="date"></label><button type="button" onclick="calcAge()">Calculate Age</button>`;
      if(mode==='interest')h=`<h2>Simple Interest</h2><div class="grid"><label class="field">Principal<input id="pA" type="number" min="0" step="any"></label><label class="field">Rate %<input id="pB" type="number" min="0" step="any"></label><label class="field">Time in years<input id="pC" type="number" min="0" step="any"></label></div><button type="button" onclick="calcInterest()">Calculate</button>`;
      studentBox.innerHTML=h+'<div id="studentResult"></div>';
    };
    const out=t=>{const r=$('#studentResult');if(r)r.innerHTML='<div class="result">'+t+'</div>'};
    window.calcPercentage=()=>{let a=+$('#pA').value,b=+$('#pB').value;if(!isFinite(a)||!isFinite(b)||b<=0)return out('Enter valid marks.');out((a/b*100).toFixed(2)+'%');track('student_calculator_used',{type:'percentage'})};
    window.calcAttendance=()=>{let a=+$('#pA').value,b=+$('#pB').value;if(!isFinite(a)||!isFinite(b)||b<=0||a<0||a>b)return out('Enter valid attendance values.');out((a/b*100).toFixed(2)+'% attendance');track('student_calculator_used',{type:'attendance'})};
    window.calcCgpa=()=>{let a=+$('#pA').value,b=+$('#pB').value;if(!isFinite(a)||!isFinite(b)||a<0||a>10||b<=0)return out('Enter a CGPA from 0 to 10 and a valid multiplier.');out((a*b).toFixed(2)+'% (using the selected multiplier)');track('student_calculator_used',{type:'cgpa'})};
    window.calcGpa=()=>{let v=$('#pA').value.split(',').map(x=>+x.trim()).filter(Number.isFinite);if(!v.length)return out('Enter GPA values separated by commas.');out((v.reduce((a,b)=>a+b,0)/v.length).toFixed(2));track('student_calculator_used',{type:'gpa'})};
    window.calcAge=()=>{const value=$('#dob')?.value;if(!value)return out('Select your date of birth.');const parts=value.split('-').map(Number);if(parts.length!==3||parts.some(n=>!Number.isInteger(n)))return out('Enter a valid date of birth.');const dob=new Date(parts[0],parts[1]-1,parts[2]);const now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(dob>today)return out('Date of birth cannot be in the future.');let y=today.getFullYear()-dob.getFullYear(),m=today.getMonth()-dob.getMonth(),d=today.getDate()-dob.getDate();if(d<0){m--;const prevMonthDays=new Date(today.getFullYear(),today.getMonth(),0).getDate();d+=prevMonthDays}if(m<0){y--;m+=12}out(`<strong>${y} years, ${m} months, ${d} days</strong><br><small>Born ${dob.toLocaleDateString()}</small>`);track('student_calculator_used',{type:'age'})};
    window.calcInterest=()=>{let p=+$('#pA').value,r=+$('#pB').value,t=+$('#pC').value;if(![p,r,t].every(Number.isFinite)||p<0||r<0||t<0)return out('Enter valid values.');const i=p*r*t/100;out(`Interest: ${i.toFixed(2)}<br>Amount: ${(p+i).toFixed(2)}`);track('student_calculator_used',{type:'interest'})};
    window.studentUI('percentage');
  }
})();
