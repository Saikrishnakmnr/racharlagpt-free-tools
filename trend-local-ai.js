/* RacharlaGPT Trend — keyless local browser AI
 * Uses @aislamov/diffusers.js + a WebGPU-compatible Stable Diffusion model.
 * No API key, account, or image upload to an AI API is required.
 * The model is downloaded to the visitor's browser and runs on the device GPU.
 */
(function(){
  'use strict';
  const MODEL='aislamov/stable-diffusion-2-1-base-onnx';
  const LIB='https://cdn.jsdelivr.net/npm/@aislamov/diffusers.js@0.9.3/+esm';
  let pipe=null, loading=null, captioner=null, captionLoading=null;
  const $=s=>document.querySelector(s);
  const status=(msg,error=false)=>{const e=$('#localAiStatus');if(e){e.textContent=msg;e.classList.toggle('error',!!error);e.classList.toggle('success',!error)}};
  const track=(name,p={})=>{try{if(typeof gtag==='function')gtag('event',name,p)}catch(_){}};
  function supported(){return !!(navigator.gpu);}

  async function getCaptioner(){
    if(captioner)return captioner;
    if(captionLoading)return captionLoading;
    captionLoading=(async()=>{
      status('Reading your reference locally to understand the scene…');
      const mod=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm');
      if(!mod.pipeline)throw new Error('The local vision engine could not be loaded.');
      captioner=await mod.pipeline('image-to-text','Xenova/vit-gpt2-image-captioning',{device:supported()?'webgpu':'wasm'});
      return captioner;
    })();
    try{return await captionLoading}finally{captionLoading=null}
  }
  async function getPipe(){
    if(pipe)return pipe;
    if(loading)return loading;
    if(!supported())throw new Error('WebGPU is not available in this browser/device. Try a recent Chrome or Edge browser on a compatible GPU.');
    loading=(async()=>{
      status('Loading the local AI engine… The first download can be very large. Keep this tab open.');
      const mod=await import(LIB);
      if(!mod.DiffusionPipeline)throw new Error('The local AI engine could not be loaded.');
      const p=await mod.DiffusionPipeline.fromPretrained(MODEL);
      pipe=p; status('✓ Local AI engine ready. Your image generation stays on this device.');
      track('local_ai_model_loaded',{model:MODEL});
      return p;
    })();
    try{return await loading}finally{loading=null}
  }
  function promptFor(style,custom){
    const styles={
      '90s':'authentic 1990s street-style social portrait, disposable camera flash, college street or retro cafe, era-appropriate fashion, analog film grain, candid photography',
      'y2k':'early-2000s Y2K social portrait, glossy mall or arcade setting, chrome details, compact-camera flash, playful fashion, early digital photography',
      'disposable':'candid disposable-camera party portrait, direct flash, night street or house party, imperfect framing, analog grain, realistic skin',
      'kodak':'warm nostalgic Kodak-style film portrait, outdoor cafe or golden-hour street, natural skin tones, subtle film grain, authentic photography',
      'polaroid':'nostalgic instant-film lifestyle portrait, road trip cafe or garden, candid composition, soft instant-camera lighting',
      'vhs':'1990s VHS music-video portrait, practical lights, analog video texture, candid movement, retro styling',
      'cinematic':'cinematic social portrait, dramatic believable movie environment, atmospheric depth, realistic lighting, polished wardrobe',
      'neon':'premium neon-night portrait, futuristic city street, wet pavement reflections, neon signs, rim lighting, fashionable styling',
      'bollywood':'original retro Indian cinema-inspired portrait, richly designed Indian environment, period-inspired styling, dramatic practical lighting, social-ready photography',
      'street':'modern urban street-style portrait, contemporary fashion, editorial lighting, realistic shadows, creator-photo aesthetic',
      'soft':'dreamy soft editorial portrait, romantic garden or cafe, natural light, pastel atmosphere, premium fashion photography',
      'editorial':'high-end fashion editorial portrait, sophisticated architecture or studio, directional lighting, magazine composition'
    };
    return 'Create a photorealistic social-media portrait inspired by the uploaded reference photo. '+(styles[style]||styles['90s'])+'. Preserve the broad subject characteristics and composition cues described by the reference, but create a NEW original image. '+(custom||'')+' No text, logos or watermarks.';
  }
  async function imageToDataURL(img){
    const c=document.createElement('canvas');const max=512;const scale=Math.min(1,max/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));c.width=Math.max(64,Math.round((img.naturalWidth||img.width)*scale));c.height=Math.max(64,Math.round((img.naturalHeight||img.height)*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.82);
  }
  async function generate(){
    const file=$('#aiPhoto')?.files?.[0],style=$('#aiStyle')?.value,custom=$('#aiPrompt')?.value.trim();
    if(!file){status('Upload a reference photo first.',true);return}
    if(window.RGT_CREDITS && !window.RGT_CREDITS.canUse()){status('Your free local-AI allowance is over. Come back after the reset.',true);return}
    const btn=$('#generateLocalAiBtn');if(btn){btn.disabled=true;btn.textContent='🧠 Preparing AI…'}
    try{
      const img=$('#aiSourcePreview');if(!img?.src)throw new Error('Reference photo preview is not ready.');
      const cap=await getCaptioner();
      const captions=await cap(img.src,{max_new_tokens:32});
      const description=Array.isArray(captions)?(captions[0]?.generated_text||''):String(captions?.generated_text||'');
      const p=await getPipe();
      status('AI is generating a new trend image on your device…');
      const fullPrompt=promptFor(style,custom)+' Reference description: '+description+'. Keep the subject category, approximate framing and key visual cues from this description, but create a new original social photo.';
      const result=await p.run({prompt:fullPrompt,numInferenceSteps:8});
      const tensor=result?.[0];if(!tensor||!tensor.toImageData)throw new Error('The local model returned no image.');
      const data=await tensor.toImageData({tensorLayout:'NCWH',format:'RGB'});
      const w=data.width||512,h=data.height||512;
      const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');const imageData=ctx.createImageData(w,h);imageData.data.set(data.data);ctx.putImageData(imageData,0,0);
      const src=c.toDataURL('image/png');const out=$('#aiOutput');out.src=src;out.hidden=false;
      const dl=$('#aiDownload');dl.hidden=false;dl.onclick=()=>{const a=document.createElement('a');a.href=src;a.download='racharlagpt-trend-local-ai-'+(style||'trend')+'.png';a.click()};
      if(window.RGT_CREDITS)window.RGT_CREDITS.consume();
      status('✓ AI image created locally. Your reference photo and AI generation stayed in the browser.');track('local_ai_photo_generated',{style,model:MODEL});
    }catch(e){console.error(e);status(e?.message||'Local AI generation failed. Try a compatible WebGPU browser.',true);track('local_ai_photo_error',{style})}
    finally{if(btn){btn.disabled=false;btn.textContent='🧠 Generate Local AI Trend Photo'}}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const note=$('#localAiSupport');if(note)note.textContent=supported()?'✓ WebGPU detected — local AI is available to try.':'⚠ WebGPU not detected — use a recent Chrome/Edge browser with compatible GPU.';
    $('#generateLocalAiBtn')?.addEventListener('click',generate);
    $('#aiPhoto')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const u=URL.createObjectURL(f),img=$('#aiSourcePreview');img.src=u;img.hidden=false;img.onload=()=>URL.revokeObjectURL(u);status('Reference photo ready. Choose a trend and start local AI.');});
  });
})();
