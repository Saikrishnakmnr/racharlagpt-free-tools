/* RacharlaGPT Trend — browser-only free AI attempt counter. No sign-in required. */
(function(){
  const KEY='rgt_free_ai_credits_v1';
  const LIMIT=3;
  const WINDOW=24*60*60*1000;
  const $=s=>document.querySelector(s);
  const track=(n,p={})=>{if(typeof gtag==='function')gtag('event',n,p)};
  function read(){
    try{
      const x=JSON.parse(localStorage.getItem(KEY)||'null');
      if(!x || !Number.isFinite(x.used) || !Number.isFinite(x.startedAt)) return {used:0,startedAt:Date.now()};
      if(Date.now()-x.startedAt>=WINDOW) return {used:0,startedAt:Date.now()};
      return x;
    }catch{return {used:0,startedAt:Date.now()}}
  }
  function save(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}}
  function remaining(){const x=read();return Math.max(0,LIMIT-x.used)}
  function resetAt(){const x=read();return x.startedAt+WINDOW}
  function fmt(ms){const s=Math.max(0,Math.ceil(ms/1000));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h+'h '+String(m).padStart(2,'0')+'m'}
  function render(){
    const n=remaining(), els=document.querySelectorAll('[data-free-credits]');
    els.forEach(el=>{
      el.textContent=n>0?`${n} / ${LIMIT} free AI attempts remaining`:'0 / '+LIMIT+' free AI attempts remaining';
      el.classList.toggle('credits-empty',n===0);
    });
    const note=$('#creditNote');
    if(note){
      note.textContent=n>0?`No sign-in required • Your browser allowance resets in ${fmt(resetAt()-Date.now())}.`:`Your free AI attempts are used. Come back after ${fmt(resetAt()-Date.now())} for a new allowance.`;
    }
    const btn=$('#generateAiBtn');
    if(btn){ if(n===0){btn.disabled=true;btn.textContent='⏳ Free limit reached';} else if(!btn.dataset.generating){btn.disabled=false;btn.textContent='✨ Generate AI Trend Photo';} }
    const bar=$('#creditBar');if(bar)bar.style.width=(n/LIMIT*100)+'%';
  }
  window.RGT_CREDITS={
    canUse(){return remaining()>0},
    consume(){const x=read();if(x.used>=LIMIT){render();return false}x.used++;save(x);render();track('free_ai_credit_used',{remaining:Math.max(0,LIMIT-x.used)});return true},
    remaining,
    render
  };
  document.addEventListener('DOMContentLoaded',()=>{render();setInterval(render,30000)});
})();
