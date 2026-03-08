// Basic site JS: theme toggle, audio playlist, lightbox, preloader, years
document.addEventListener('DOMContentLoaded', ()=>{

  // Year placeholders
  document.querySelectorAll('#year, #year2, #year3, #year4, #year5').forEach(el=>{
    if(el) el.textContent = new Date().getFullYear();
  });

  // Theme toggle (shared)
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  applyTheme(saved);
  document.querySelectorAll('#theme-toggle, #theme-toggle-2, #theme-toggle-3').forEach(btn=>{
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  });

  // Audio playlist
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-src]');
    if(!btn) return;
    const audio = document.getElementById('audio');
    const src = btn.getAttribute('data-src');
    if(!audio) return;
    if(audio.src && audio.src.endsWith(src) && !audio.paused){
      audio.pause();
    } else {
      audio.src = src;
      audio.play().catch(()=>{});
    }
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  document.querySelectorAll('.thumb, .project-card img').forEach(img=>{
    img && img.addEventListener('click', ()=>{
      const full = img.dataset.full || img.src;
      lbImg.src = full;
      lbCaption.textContent = img.alt || '';
      lightbox.classList.add('visible');
    });
  });
  const lbClose = document.getElementById('lb-close');
  lbClose && lbClose.addEventListener('click', ()=> {
    lightbox.classList.remove('visible');
    lbImg.src = '';
  });

  // Project filters
  document.querySelectorAll('.filter button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.filter button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.getAttribute('data-filter');
      document.querySelectorAll('.project-card').forEach(card=>{
        if(f === 'all' || card.dataset.type === f) card.style.display = '';
        else card.style.display = 'none';
      });
    });
  });

  // Preloader logic (cool preloader with particles)
  (function(){
    const preloader = document.getElementById('preloader');
    const svg = document.getElementById('preloader-svg');
    const skipBtn = document.getElementById('preloader-skip');
    const canvas = document.getElementById('preloader-canvas');
    const SHOW_ONCE_KEY = 'preloader_shown_v2';
    const showOnce = true;
    const MAX_WAIT = 4200;
    if(!preloader || !svg) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced){
      finish();
      if(showOnce) localStorage.setItem(SHOW_ONCE_KEY, '1');
      return;
    }
    if(showOnce && localStorage.getItem(SHOW_ONCE_KEY) === '1'){
      finish();
      return;
    }

    requestAnimationFrame(()=> {
      setTimeout(()=> svg.classList.add('draw'), 80);
      setTimeout(()=> svg.classList.add('show-name'), 1100);
      setTimeout(()=> particleBurst(), 1250);
    });

    function particleBurst(){
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      resizeCanvas();
      const particles = [];
      const centerX = canvas.width * 0.5;
      const centerY = canvas.height * 0.45;
      const colors = ['#00f0ff','#7b61ff','#00ffd1','#9be7ff'];
      for(let i=0;i<28;i++){
        const angle = Math.random()*Math.PI*2;
        const speed = 2 + Math.random()*4;
        particles.push({
          x:centerX, y:centerY,
          vx: Math.cos(angle)*speed,
          vy: Math.sin(angle)*speed - 1.2,
          life: 60 + Math.random()*30,
          size: 2 + Math.random()*3,
          color: colors[Math.floor(Math.random()*colors.length)]
        });
      }
      let frame = 0;
      function step(){
        frame++;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p=>{
          p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
          const alpha = Math.max(0, p.life/90);
          ctx.fillStyle = p.color; ctx.globalAlpha = alpha;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        for(let i=particles.length-1;i>=0;i--) if(particles[i].life<=0) particles.splice(i,1);
        if(particles.length>0 && frame<240) requestAnimationFrame(step);
        else ctx.clearRect(0,0,canvas.width,canvas.height);
      }
      step();
    }
    function resizeCanvas(){
      if(!canvas) return;
      const rect = preloader.getBoundingClientRect();
      canvas.width = Math.max(600, Math.floor(rect.width));
      canvas.height = Math.max(300, Math.floor(rect.height));
    }
    window.addEventListener('resize', resizeCanvas);

    let done = false;
    function finish(){
      if(done) return;
      done = true;
      preloader.classList.add('hidden');
      setTimeout(()=> preloader.remove(), 700);
      if(showOnce) localStorage.setItem(SHOW_ONCE_KEY, '1');
    }
    window.addEventListener('load', ()=> setTimeout(finish, 420));
    const fallback = setTimeout(finish, MAX_WAIT);
    skipBtn && skipBtn.addEventListener('click', finish);
    preloader.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); });
    svg.addEventListener('click', finish);
  })();

});
