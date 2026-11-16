const introTimelineStart = performance.now();


// Polvo de hada: partículas luminosas que explotan al acercarse la mariposa.
(() => {
  const canvas = document.querySelector('.magic-particles');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, particles = [], raf = 0;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  resize(); window.addEventListener('resize', resize, {passive:true});
  const rand = (a,b) => a + Math.random()*(b-a);
  const center = () => ({x:w*.5,y:h*.49});
  function burst() {
    const c=center();
    const total = Math.min(190, Math.max(115, Math.round(w*h/4300)));
    for(let i=0;i<total;i++){
      const angle=rand(0,Math.PI*2), speed=rand(35,Math.min(w,h)*.62);
      particles.push({x:c.x,y:c.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        life:rand(1.05,2.5),age:0,size:rand(.7,2.5),tw:rand(0,Math.PI*2),gold:Math.random()>.35});
    }
    // Estrellas grandes y destellos de cuatro puntas.
    for(let i=0;i<22;i++){
      const angle=rand(0,Math.PI*2), speed=rand(25,Math.min(w,h)*.48);
      particles.push({x:c.x,y:c.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        life:rand(.9,1.8),age:0,size:rand(2.2,4.2),tw:rand(0,6),star:true});
    }
  }
  let start=performance.now(), burstDone=false, last=start;
  function frame(now){
    const dt=Math.min(.04,(now-last)/1000); last=now;
    const elapsed=(now-start)/1000;
    if(elapsed>6.15 && !burstDone){burst();burstDone=true;}
    ctx.clearRect(0,0,w,h);
    // Pequeñas motas que titilan antes del gran destello.
    if(elapsed<8.4){
      for(let i=0;i<18;i++){
        const x=(i*97.3 + elapsed*13)%w, y=(i*151.7 + Math.sin(elapsed*1.2+i)*25 + h*.12)%h;
        const a=.18+.32*(.5+.5*Math.sin(elapsed*3+i));
        ctx.globalAlpha=a; ctx.fillStyle='#fff4cf';
        ctx.shadowBlur=9;ctx.shadowColor='#e9bb62';
        ctx.beginPath();ctx.arc(x,y,1.1,0,Math.PI*2);ctx.fill();
      }
    }
    particles=particles.filter(p=>p.age<p.life);
    for(const p of particles){
      p.age+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
      p.vx*=.985;p.vy*=.985;p.vy-=5*dt;
      const fade=Math.sin(Math.PI*Math.min(1,p.age/p.life));
      const twinkle=.45+.55*Math.sin(p.tw+p.age*18);
      ctx.globalAlpha=Math.max(0,fade*twinkle);
      ctx.fillStyle=p.gold?'#f4cc72':'#fff9dc';
      ctx.shadowBlur=p.star?20:12;ctx.shadowColor=p.gold?'#f2bd54':'#fff6cf';
      if(p.star){
        const r=p.size*(.6+.4*twinkle);
        ctx.beginPath();ctx.moveTo(p.x,p.y-r*2.8);ctx.lineTo(p.x+r*.42,p.y-r*.42);
        ctx.lineTo(p.x+r*2.8,p.y);ctx.lineTo(p.x+r*.42,p.y+r*.42);
        ctx.lineTo(p.x,p.y+r*2.8);ctx.lineTo(p.x-r*.42,p.y+r*.42);
        ctx.lineTo(p.x-r*2.8,p.y);ctx.lineTo(p.x-r*.42,p.y-r*.42);ctx.closePath();ctx.fill();
      } else {
        ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;
    if(elapsed<10 || particles.length){raf=requestAnimationFrame(frame);}
  }
  raf=requestAnimationFrame(frame);
})();


// Apertura del sobre
const intro = document.getElementById('intro');
const invitation = document.getElementById('invitation');
const openButton = document.getElementById('openInvitation');
document.body.style.overflow = 'hidden';

// Audio local: los tres archivos se colocan en assets/audio/ con estos nombres.
// El navegador exige un toque del usuario antes de permitir reproducir audio.
const audioPath = 'assets/audio/';
const chimesAudio = new Audio(audioPath + 'mariposas-chimes.mp3');
const whooshAudio = new Audio(audioPath + 'destello-whoosh.mp3');
const invitationMusic = new Audio(audioPath + 'cree-y-atrevete.mp3');
chimesAudio.preload = 'auto';
whooshAudio.preload = 'auto';
invitationMusic.preload = 'auto';
invitationMusic.loop = true;
invitationMusic.volume = 0.38;
chimesAudio.volume = 0.55;
whooshAudio.volume = 0.82;
let introAudioUnlocked = false;
let introAudioTimer = null;
let whooshStopTimer = null;

function playSafely(audio) {
  audio.currentTime = 0;
  const result = audio.play();
  if (result && typeof result.catch === 'function') result.catch(() => {});
}

const audioHint = document.getElementById('enableIntroAudio');
if (audioHint) {
  audioHint.addEventListener('click', () => {
    if (introAudioUnlocked) return;
    introAudioUnlocked = true;
    audioHint.classList.add('audio-hint-hidden');
    const elapsed = (performance.now() - introTimelineStart) / 1000;
    const flashAt = 6.12;
    const envelopeAt = 8.1;
    if (elapsed < flashAt) {
      playSafely(chimesAudio);
      introAudioTimer = window.setTimeout(() => {
        chimesAudio.pause();
        chimesAudio.currentTime = 0;
        playSafely(whooshAudio);
        whooshStopTimer = window.setTimeout(() => {
          whooshAudio.pause();
          whooshAudio.currentTime = 0;
        }, Math.max(0, (envelopeAt - flashAt) * 1000));
      }, Math.max(0, (flashAt - elapsed) * 1000));
    } else if (elapsed < envelopeAt) {
      playSafely(whooshAudio);
      whooshStopTimer = window.setTimeout(() => {
        whooshAudio.pause();
        whooshAudio.currentTime = 0;
      }, Math.max(0, (envelopeAt - elapsed) * 1000));
    }
  }, { once: true });
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelector('.butterfly-prelude')?.remove();
  if (audioHint) audioHint.hidden = true;
}

openButton.addEventListener('click', () => {
  // La música principal comienza al terminar la apertura visual del sobre.
  chimesAudio.pause();
  whooshAudio.pause();
  if (introAudioTimer) window.clearTimeout(introAudioTimer);
  if (whooshStopTimer) window.clearTimeout(whooshStopTimer);
  intro.classList.add('opening');
  window.setTimeout(() => {
    intro.classList.add('closed');
    invitation.classList.add('visible');
    invitation.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'auto';
    playSafely(invitationMusic);
  }, 1150);
});

// Animaciones de aparición al desplazarse
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
revealElements.forEach(element => revealObserver.observe(element));

// Cuenta regresiva: 27 de diciembre de 2026, 4:30 p. m. hora local
const eventDate = new Date(2026, 11, 27, 16, 30, 0);
function updateCountdown() {
  const distance = eventDate.getTime() - new Date().getTime();
  if (distance <= 0) {
    document.getElementById('countdown').innerHTML = '<p class="countdown-note">¡Hoy es el gran día!</p>';
    return;
  }
  const values = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60)
  };
  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).textContent = String(value).padStart(2, '0');
  });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

// Confirmación RSVP mediante Cloudflare Worker y Google Sheets.
// El token se obtiene del enlace personalizado (?token=...).
const RSVP_API_URL = 'https://xv-yarissa-api.hazelortega280.workers.dev/';
const RSVP_TOKEN = new URLSearchParams(window.location.search).get('token') || '';

(function iniciarRSVP() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;
  const familyEl = document.getElementById('rsvpFamily');
  const cupoEl = document.getElementById('rsvpCupo');
  const cupoTextEl = document.getElementById('rsvpCupoText');
  const countEl = document.getElementById('attendeeCount');
  const namesEl = document.getElementById('attendeeNames');
  const panelEl = document.getElementById('attendeesPanel');
  const submitEl = document.getElementById('rsvpSubmit');
  const messageEl = document.getElementById('rsvpMessage');
  const closedEl = document.getElementById('rsvpClosed');
  const decisionFieldset = document.getElementById('decisionFieldset');
  let cupo = 0;
  let cerrado = false;

 function mostrarMensaje(texto, error = false) {
    messageEl.textContent = texto;
    messageEl.classList.toggle('error', error);
}
}
  
  function crearCampos(cantidad, nombresPrevios = []) {
    namesEl.replaceChildren();
    for (let i = 1; i <= cantidad; i++) {
      const wrapper = document.createElement('label'); wrapper.className = 'rsvp-name-field';
      const etiqueta = document.createElement('span'); etiqueta.textContent = 'INVITADO ' + i;
      const input = document.createElement('input'); input.className = 'rsvp-name-input';
      input.type = 'text'; input.name = 'invitado' + i; input.maxLength = 80;
      input.autocomplete = 'name'; input.placeholder = 'Escribe el nombre completo'; input.required = true;
      input.value = nombresPrevios[i - 1] || '';
      wrapper.append(etiqueta, input); namesEl.appendChild(wrapper);
    }
  }
  function llenarOpciones() {
    countEl.disabled = false;
    countEl.replaceChildren();
    for (let i = 1; i <= cupo; i++) {
      const option = document.createElement('option'); option.value = String(i);
      option.textContent = i + (i === 1 ? ' persona' : ' personas'); countEl.appendChild(option);
    }
    countEl.value = '1';
  }
  function actualizarDecision() {
    const seleccion = form.querySelector('input[name="decision"]:checked');
    const asistir = !!seleccion && seleccion.value === 'asistire';
    panelEl.hidden = !asistir; submitEl.disabled = !seleccion || cerrado;
    if (asistir && !namesEl.children.length) crearCampos(Number(countEl.value || 1));
    if (!asistir) namesEl.replaceChildren();
    mostrarMensaje('');
  }
  async function llamarAPI(payload) {
    const response = await fetch(RSVP_API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, token: RSVP_TOKEN })
    });
    const resultado = await response.json();
    if (!response.ok || !resultado.success) throw new Error(resultado.error || 'No fue posible completar la solicitud.');
    return resultado.data;
  }
  if (!/^[a-f0-9]{64}$/i.test(RSVP_TOKEN)) {
    familyEl.textContent = 'Enlace de invitación no válido';
    mostrarMensaje('Solicita a la familia anfitriona tu enlace personalizado.', true);
    submitEl.disabled = true; return;
  }
  countEl.addEventListener('change', () => crearCampos(Number(countEl.value)));
  form.querySelectorAll('input[name="decision"]').forEach(radio => radio.addEventListener('change', actualizarDecision));

  (async () => {
    try {
      const datos = await llamarAPI({ action: 'obtenerEstado' });
      cupo = Number(datos.cupo); familyEl.textContent = 'Familia ' + datos.familia;
      cupoEl.textContent = String(cupo);
      cupoTextEl.textContent = cupo === 1 ? 'lugar reservado para ti' : 'lugares reservados para ti';
      llenarOpciones();
      if (datos.nombres && datos.nombres.length) {
        form.querySelector('input[value="asistire"]').checked = true;
        countEl.value = String(datos.nombres.length);
        crearCampos(datos.nombres.length, datos.nombres); panelEl.hidden = false;
      } else if (datos.estado === 'No asistirá') {
        form.querySelector('input[value="no_asistire"]').checked = true;
      }
      if (datos.cerrado) {
        cerrado = true; closedEl.hidden = false; decisionFieldset.disabled = true;
        countEl.disabled = true; namesEl.querySelectorAll('input').forEach(input => input.disabled = true);
        submitEl.disabled = true; submitEl.textContent = 'Confirmaciones cerradas';
      } else { submitEl.disabled = !form.querySelector('input[name="decision"]:checked'); }
    } catch (error) {
      familyEl.textContent = 'No pudimos cargar tu invitación';
      mostrarMensaje(error.message || 'Actualiza la página o verifica que el enlace sea correcto.', true);
      submitEl.disabled = true;
    }
  })();

  form.addEventListener('submit', async event => {
    event.preventDefault(); if (cerrado) return;
    const nota = decision.value === 'asistire'
    ? 'Nota: Si tus planes cambian o necesitas modificar tus acompañantes, puedes editar tu respuesta aquí mismo.'
    : 'Nota: Si tus planes cambian, puedes editar tu respuesta aquí mismo.';

mostrarMensaje(resultado.mensaje || 'Tu respuesta quedó guardada.', false);

const notaEl = document.createElement('span');
notaEl.className = 'rsvp-note';
notaEl.textContent = nota;

document.getElementById('rsvpMessage').appendChild(notaEl);
    
mostrarMensaje(resultado.mensaje || 'Tu respuesta quedó guardada.', false);

const notaEl = document.createElement('span');
notaEl.className = 'rsvp-note';
notaEl.textContent = nota;

document.getElementById('rsvpMessage').appendChild(notaEl);
      submitEl.textContent = 'Respuesta guardada'; submitEl.disabled = false;
      if (decision.value === 'no_asistire') { namesEl.replaceChildren(); panelEl.hidden = true; }
    } catch (error) {
      mostrarMensaje(error.message || 'No pudimos guardar tu respuesta. Intenta nuevamente.', true);
      submitEl.disabled = false; submitEl.textContent = 'Guardar mi respuesta';
    }

  });
})();
