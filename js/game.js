/* =========================================================
   TRÒ CHƠI SỐ: Khám phá cùng Vuông Vàng Tròn Đỏ (bản web độc lập)
   Màn 1 – Đút bánh cho quái vật (phân loại HÌNH)
   Màn 2 – Cơn mưa bong bóng      (phân loại MÀU)
   Màn 3 – Xây tháp phép thuật    (kết hợp HÌNH + MÀU)
   Chạy bằng cách mở index.html hoặc đưa lên GitHub Pages. Không cần máy chủ.
   ========================================================= */
(function () {
  const S = window.STORY;
  const $ = (q, el = document) => el.querySelector(q);
  const stage = $('#tcStage');
  const H = n => 'hinh/' + n + '.png';
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Muốn có nút "Đọc truyện" trên thanh trên cùng: dán đường link truyện vào đây (để trống thì ẩn nút)
  const STORY_URL = 'https://canva.link/wvbdf805kr3tmus';

  let muted = false, scene = 0, timers = [], intro = [];

  /* ---------------- Bảng sao (lưu trên máy, không có vẫn chạy) ---------------- */
  const KEY = 'tronvuong.trochoi.v1';
  const STARS = [['m1', 'Màn 1 · Đút bánh cho quái vật'], ['m2', 'Màn 2 · Cơn mưa bong bóng'], ['m3', 'Màn 3 · Xây tháp phép thuật']];
  let prog = { stars: {}, certShown: false };
  try { const r = JSON.parse(localStorage.getItem(KEY) || 'null'); if (r && r.stars) prog = r; } catch (e) {}
  const saveProg = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) {} };
  const hasStar = id => !!prog.stars[id];
  const starCount = () => STARS.filter(s => prog.stars[s[0]]).length;
  function updateStars() {
    $('#starTxt').textContent = starCount() + '/' + STARS.length;
    const b = $('#btnStars'); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash');
  }
  function award(id) { if (prog.stars[id]) return; prog.stars[id] = true; saveProg(); updateStars(); }

  /* ---------------- Âm thanh hiệu ứng (WebAudio, không cần file) ---------------- */
  let ac = null;
  function initAudio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} }
  function tone(f, t0, dur, type = 'sine', vol = .2, f2) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, ac.currentTime + t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, ac.currentTime + t0 + dur);
    g.gain.setValueAtTime(0, ac.currentTime + t0);
    g.gain.linearRampToValueAtTime(vol, ac.currentTime + t0 + .015);
    g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + t0 + dur);
    o.connect(g).connect(ac.destination); o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + dur + .05);
  }
  function noise(t0, dur, vol, fFrom, fTo, q = 1, type = 'bandpass') {
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(fFrom, ac.currentTime + t0); f.frequency.exponentialRampToValueAtTime(fTo, ac.currentTime + t0 + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, ac.currentTime + t0); g.gain.linearRampToValueAtTime(vol, ac.currentTime + t0 + dur * .3); g.gain.linearRampToValueAtTime(0, ac.currentTime + t0 + dur);
    s.connect(f).connect(g).connect(ac.destination); s.start(ac.currentTime + t0);
  }
  function sfx(name) {
    if (muted || !ac) return;
    try {
      switch (name) {
        case 'chime': tone(880, 0, .25, 'sine', .22); tone(1320, .12, .4, 'sine', .2); tone(1760, .24, .5, 'sine', .12); break;
        case 'buzz': tone(220, 0, .18, 'triangle', .18, 170); tone(180, .2, .25, 'triangle', .16, 140); break;
        case 'chew': for (let i = 0; i < 4; i++) { noise(i * .22, .12, .5, 500, 200, 1, 'lowpass'); tone(140, i * .22, .1, 'sine', .25, 90); } break;
        case 'boop': tone(330, 0, .2, 'sine', .25, 260); break;
        case 'roll': noise(0, .8, .25, 300, 900, 1, 'lowpass'); break;
        case 'thunk': tone(160, 0, .18, 'sine', .35, 80); noise(0, .08, .3, 800, 400); break;
        case 'burst': noise(0, .12, .7, 3000, 600); tone(600, 0, .1, 'square', .08, 120); break;
        case 'pop': tone(700, 0, .14, 'sine', .25, 220); break;
        case 'applause': for (let i = 0; i < 70; i++) noise(Math.random() * 2.2, .05, .45, 1800, 1400, 1.5); break;
        case 'fanfare': [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .14, .45, 'triangle', .18)); tone(1047, .6, .9, 'triangle', .16); break;
      }
    } catch (e) {}
  }

  /* ---------------- Giọng đọc + phụ đề ---------------- */
  let token = 0, curAudio = null, curResolve = null;
  const subAv = $('#subAvatar'), subName = $('#subName'), subText = $('#subText');
  function showSub(clip, talking) {
    const v = S.voices[clip.v] || S.voices.dan;
    subAv.className = 'av av-' + clip.v + (talking ? ' talk' : '');
    subName.textContent = v.name; subName.style.color = v.color; subText.textContent = clip.t;
  }
  function stopAudio() {
    token++;
    if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
    if (curResolve) { const r = curResolve; curResolve = null; r(); }
    subAv.classList.remove('talk');
  }
  const viVoice = () => { try { return speechSynthesis.getVoices().find(v => /^vi/i.test(v.lang)); } catch (e) { return null; } };
  function playOne(id) {
    const clip = S.clips[id];
    if (!clip) return Promise.resolve();
    showSub(clip, true);
    return new Promise(resolve => {
      let finished = false;
      const done = () => { if (finished) return; finished = true; curResolve = null; subAv.classList.remove('talk'); resolve(); };
      curResolve = done;
      const est = Math.max(1400, clip.t.length * 70);
      if (muted) { setTimeout(done, est); return; }
      const a = new Audio('audio/' + id + '.mp3');
      curAudio = a; a.onended = done;
      a.onerror = () => {
        const vv = viVoice();
        if (vv && window.speechSynthesis) {
          const u = new SpeechSynthesisUtterance(clip.t); u.voice = vv; u.lang = 'vi-VN'; u.rate = .95; u.pitch = clip.v === 'dan' ? 1 : 1.35;
          u.onend = done; u.onerror = done; speechSynthesis.speak(u);
        } else setTimeout(done, est);
      };
      a.play().catch(() => { if (!finished) setTimeout(done, est); });
    });
  }
  async function say(ids) {
    stopAudio(); const my = token;
    for (const id of ids || []) {
      if (my !== token) return false;
      await playOne(id);
      if (my !== token) return false;
      await wait(250);
    }
    return my === token;
  }

  /* ---------------- Hiệu ứng ---------------- */
  const fxLayer = $('#fxLayer');
  function sparkle(cx, cy, n = 10) {
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div'); s.className = 'spark'; s.textContent = pick(['✨', '⭐', '🌟', '💛', '❤️']);
      const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 90;
      s.style.left = cx + 'px'; s.style.top = cy + 'px';
      s.style.setProperty('--dx', Math.cos(a) * r + 'px'); s.style.setProperty('--dy', Math.sin(a) * r + 'px');
      fxLayer.appendChild(s); setTimeout(() => s.remove(), 1100);
    }
  }
  function confetti(n = 120) {
    const cols = ['#e53935', '#ffc107', '#43a047', '#1e88e5', '#ab47bc', '#ff7043'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = pick(cols);
      if (Math.random() < .4) c.style.borderRadius = '50%';
      c.style.animationDuration = (2.4 + Math.random() * 2.2) + 's'; c.style.animationDelay = (Math.random() * .8) + 's';
      fxLayer.appendChild(c); setTimeout(() => c.remove(), 5500);
    }
  }
  function starBurst() { const s = document.createElement('div'); s.className = 'starBurst'; s.textContent = '⭐'; fxLayer.appendChild(s); setTimeout(() => s.remove(), 1700); }
  const sparkleEl = el => { const r = el.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top + r.height / 2, 10); };

  /* ---------------- Bằng khen ---------------- */
  function showCert() {
    const all = starCount() === STARS.length;
    $('#certBody').innerHTML = `
      <div class="certStars">${STARS.map(s => hasStar(s[0]) ? '⭐' : '☆').join('')}</div>
      <h2>${all ? 'Bé ngoan – Bé giỏi!' : 'Bé giỏi lắm! ' + starCount() + '/' + STARS.length + ' ngôi sao'}</h2>
      <p>${all ? 'Bé đã nhận biết giỏi hình tròn, hình vuông, màu đỏ và màu vàng!' : 'Bé chơi tiếp các màn còn lại để có đủ 3 ngôi sao nhé!'}</p>
      <ul class="certList">${STARS.map(s => `<li class="${hasStar(s[0]) ? 'got' : ''}">${hasStar(s[0]) ? '⭐' : '☆'} ${s[1]}</li>`).join('')}</ul>
      <div class="certBtns">
        <button class="big-btn green" id="certPlay">🎮 Chơi tiếp</button>
        <button class="big-btn blue" id="certClose">Đóng</button>
      </div>
      <button class="link-btn" id="certReset">Xoá hết sao, bắt đầu lại (dành cho cô)</button>`;
    $('#cert').classList.remove('hidden');
    $('#certClose').onclick = () => { $('#cert').classList.add('hidden'); stopAudio(); };
    $('#certPlay').onclick = () => { $('#cert').classList.add('hidden'); stopAudio(); home(); };
    $('#certReset').onclick = () => { if (confirm('Xoá hết sao của bé và bắt đầu lại?')) { prog = { stars: {}, certShown: false }; saveProg(); updateStars(); showCert(); } };
    if (all) { prog.certShown = true; saveProg(); sfx('fanfare'); sfx('applause'); confetti(140); say(['tc_ket', 'g_all']); }
  }

  /* ---------------- dựng phần tử ---------------- */
  const pc = cls => cls.split(' ').filter(Boolean).map(c => 'tc-' + c).join(' ');
  const setTitle = t => { $('#brandTxt').textContent = t; };
  const badge = t => { $('#pageNum').textContent = t; };
  function img(name, x, y, w, cls = '') { const i = document.createElement('img'); i.src = H(name); i.alt = ''; i.className = 'tc-o ' + pc(cls); Object.assign(i.style, { left: x + '%', top: y + '%', width: w + '%' }); stage.appendChild(i); return i; }
  function btn(name, x, y, w, fn, cls = '') { const b = document.createElement('button'); b.className = 'tc-btn ' + pc(cls); b.innerHTML = `<img src="${H(name)}" alt="">`; Object.assign(b.style, { left: x + '%', top: y + '%', width: w + '%' }); b.onclick = () => { initAudio(); fn(); }; stage.appendChild(b); return b; }
  function div(cls, css, html = '') { const d = document.createElement('div'); d.className = pc(cls); Object.assign(d.style, css); d.innerHTML = html; stage.appendChild(d); return d; }
  function clear(bg, title, introIds) {
    stopAudio(); timers.forEach(clearInterval); timers.forEach(clearTimeout); timers = []; scene++;
    stage.innerHTML = ''; stage.style.backgroundImage = `url(hinh/${bg}.jpg)`;
    badge(''); setTitle(title); intro = introIds || [];
    return scene;
  }
  const inRect = (x, y, el, pad = 0) => { const r = el.getBoundingClientRect(); return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad; };

  function draggable(el, onDrop, onTap) {
    let sx, sy, on = false, moved = false;
    el.classList.add('tc-drag');
    el.addEventListener('pointerdown', e => {
      if (el.dataset.lock) return; e.preventDefault(); initAudio(); try { el.setPointerCapture(e.pointerId); } catch (_) {}
      sx = e.clientX; sy = e.clientY; on = true; moved = false; el.classList.remove('tc-back', 'tc-wig', 'tc-rollin'); el.classList.add('tc-lift');
    });
    el.addEventListener('pointermove', e => {
      if (!on) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.hypot(dx, dy) > 6) moved = true;
      el.style.transform = `translate(${dx}px,${dy}px) scale(1.1)`; if (el.onMove) el.onMove(e.clientX, e.clientY);
    });
    const up = async e => {
      if (!on) return; on = false; el.classList.remove('tc-lift'); if (el.onMove) el.onMove(-1, -1);
      if (!moved) { el.style.transform = ''; onTap && onTap(); return; }
      const ok = await onDrop(e.clientX, e.clientY);
      if (!ok) { el.style.transition = 'transform .4s cubic-bezier(.3,1.4,.6,1)'; el.style.transform = ''; setTimeout(() => el.style.transition = '', 450); }
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  function flyTo(el, target, scale = .3) {
    const a = el.getBoundingClientRect(), b = target.getBoundingClientRect();
    const cur = el.style.transform.match(/translate\(([-\d.]+)px, ?([-\d.]+)px\)/) || [0, 0, 0];
    const dx = +cur[1] + (b.left + b.width / 2) - (a.left + a.width / 2), dy = +cur[2] + (b.top + b.height / 2) - (a.top + a.height / 2);
    el.style.transition = 'transform .45s ease-in, opacity .3s ease-in .2s'; el.style.transform = `translate(${dx}px,${dy}px) scale(${scale})`; el.style.opacity = '0';
    setTimeout(() => el.remove(), 520);
  }

  /* =========================================================
     MÀN HÌNH CHỌN MÀN
     ========================================================= */
  function home() {
    clear('nen_bia', 'Khám phá cùng Vuông Vàng Tròn Đỏ', ['tc_bia']);
    img('bien_ten_game', 12, 3, 76, 'popin');
    img('nhan_vat_tron_do', 4, 30, 19, 'popin'); img('nhan_vat_vuong_vang', 77, 30, 19, 'popin');
    img('quai_vat_tron_mo', 6, 68, 13); img('quai_vat_vuong_mo', 81, 68, 13);
    [['Đút bánh cho quái vật', man1], ['Cơn mưa bong bóng', man2], ['Xây tháp phép thuật', man3]].forEach(([t, fn], i) => {
      const c = document.createElement('button'); c.className = 'tc-lvl'; Object.assign(c.style, { left: 27 + i * 16 + '%', top: '27%', width: '13.5%' });
      c.innerHTML = `<img src="${H(['quai_vat_tron_mo', 'bong_bong_do', 'lau_dai'][i])}" alt="" style="background:#f3f8ff"><div>Màn ${i + 1}</div><div style="font-size:.8em;font-weight:600">${t}</div><span class="st">${hasStar('m' + (i + 1)) ? '⭐' : '☆'}</span>`;
      c.onclick = () => { initAudio(); fn(); }; stage.appendChild(c);
    });
    btn('nut_choi', 44, 74, 12, man1, 'breathe');
    say(intro);
  }

  /* =========================================================
     MÀN 1: ĐÚT BÁNH CHO QUÁI VẬT (HÌNH)
     ========================================================= */
  function man1() {
    const my = clear('nen_man1', 'Màn 1: Đút bánh cho quái vật', ['tc_m1_intro']);
    img('bien_man1', 22, 1, 56);
    const mons = {};
    [['tron', 3, 'Quái vật TRÒN'], ['vuong', 69, 'Quái vật VUÔNG']].forEach(([k, x, lbl]) => {
      const m = img(`quai_vat_${k}_mo`, x, 36, 28); m.dataset.k = k; mons[k] = m;
      div('label', { left: x + 14 + '%', top: '92%' }, lbl);
    });
    const cols = ['hong', 'xanhla', 'xanhduong', 'tim'];
    const queue = shuffle([...shuffle(cols).map(c => ['tron', c]), ...shuffle(cols).map(c => ['vuong', c])]);
    let i = 0;
    const prog = () => badge('🍬'.repeat(queue.length - i) + '✔'.repeat(i));
    const next = () => {
      if (my !== scene) return;
      if (i >= queue.length) return finish(0, man2);
      prog();
      const [k, c] = queue[i];
      const wrap = document.createElement('div'); wrap.className = 'tc-o tc-rollin'; Object.assign(wrap.style, { left: '42%', top: '42%', width: '16%' });
      wrap.innerHTML = `<img src="${H('keo_' + k + '_' + c)}" alt="">`; stage.appendChild(wrap); sfx('roll');
      setTimeout(() => wrap.classList.add('tc-wig'), 950);
      wrap.onMove = (x, y) => Object.values(mons).forEach(m => m.classList.toggle('tc-hot', inRect(x, y, m)));
      draggable(wrap, async (x, y) => {
        const m = Object.values(mons).find(m => inRect(x, y, m, 20)); if (!m) return false;
        const mk = m.dataset.k;
        if (mk === k) {
          wrap.dataset.lock = 1; flyTo(wrap, m, .2); sfx('chew');
          m.src = H(`quai_vat_${mk}_nhai`); m.classList.add('tc-chomp'); sparkleEl(m);
          setTimeout(() => { if (my !== scene) return; m.src = H(`quai_vat_${mk}_mo`); m.classList.remove('tc-chomp'); }, 1300);
          i++; prog(); say([`tc_m1_ok_${mk}`]); setTimeout(next, 1500); return true;
        }
        sfx('buzz'); m.src = H(`quai_vat_${mk}_lac`); m.classList.add('tc-shake');
        setTimeout(() => { if (my !== scene) return; m.src = H(`quai_vat_${mk}_mo`); m.classList.remove('tc-shake'); }, 1100);
        say([`tc_m1_no_${mk}`]); return false;
      }, () => say([k === 'tron' ? 'g_round' : 'g_square']));
    };
    say(intro); setTimeout(next, 600);
  }

  /* =========================================================
     MÀN 2: CƠN MƯA BONG BÓNG (MÀU)
     ========================================================= */
  function man2() {
    const my = clear('nen_man2', 'Màn 2: Cơn mưa bong bóng', ['tc_m2_intro']);
    img('bien_man2', 22, 1, 56);
    const ro = { do: img('ro_do', 2, 70, 20), vang: img('ro_vang', 78, 70, 20) };
    const cnt = { do: div('count', { left: '12%', top: '62%', color: '#e53935' }, '0 / 5'), vang: div('count', { left: '88%', top: '62%', color: '#e0a100' }, '0 / 5') };
    const got = { do: 0, vang: 0 }; let target = 'do', wrong = 0, busy = false;
    const prog = () => badge((target === 'do' ? '🔴 ' : '🟡 ') + got[target] + '/5');
    prog();
    function spawn() {
      if (my !== scene || busy) return;
      const others = ['xanh', 'xanhla', target === 'do' ? 'vang' : 'do'];
      const col = Math.random() < .45 ? target : pick(others);
      const b = document.createElement('div'); b.className = 'tc-bal'; const w = 8 + Math.random() * 3;
      Object.assign(b.style, { left: 22 + Math.random() * 52 + '%', top: '102%', width: w + '%' });
      b.innerHTML = `<img src="${H('bong_bong_' + col)}" alt="">`; stage.appendChild(b);
      const dur = 7000 + Math.random() * 2500, t0 = performance.now(), sway = Math.random() * 6.28;
      const step = t => {
        if (!b.isConnected) return; const p = (t - t0) / dur;
        b.style.top = 102 - p * 140 + '%'; b.style.marginLeft = Math.sin(p * 9 + sway) * 1.5 + '%';
        if (p < 1) requestAnimationFrame(step); else b.remove();
      };
      requestAnimationFrame(step);
      b.addEventListener('pointerdown', e => {
        e.preventDefault(); initAudio(); if (b.dataset.done) return;
        if (col === target) {
          b.dataset.done = 1; sfx('burst');
          const r = b.getBoundingClientRect(); sparkle(r.left + r.width / 2, r.top + r.height / 3, 8);
          b.querySelector('img').src = H('bong_no'); b.style.width = parseFloat(b.style.width) * 1.3 + '%';
          setTimeout(() => { if (my !== scene) return; b.querySelector('img').src = H('bong_bong_' + col); flyTo(b, ro[target], .35); }, 380);
          got[target]++; cnt[target].textContent = got[target] + ' / 5'; prog();
          ro[target].classList.add('tc-chomp'); setTimeout(() => ro[target].classList.remove('tc-chomp'), 1000);
          if (got[target] >= 5) phaseDone();
        } else {
          sfx('boop'); b.classList.remove('tc-no'); void b.offsetWidth; b.classList.add('tc-no');
          if (++wrong % 3 === 1) say([target === 'do' ? 'tc_m2_no_do' : 'tc_m2_no_vang']);
        }
      });
    }
    async function phaseDone() {
      busy = true; sfx('chime'); stage.querySelectorAll('.tc-bal').forEach(b => { if (!b.dataset.done) b.remove(); });
      if (target === 'do') { target = 'vang'; prog(); await say(['tc_m2_vang']); if (my !== scene) return; busy = false; }
      else finish(1, man3);
    }
    timers.push(setInterval(spawn, 850));
    busy = true; say(intro).then(() => { if (my === scene) busy = false; });
    timers.push(setTimeout(() => { busy = false; }, 2500));
  }

  /* =========================================================
     MÀN 3: XÂY THÁP PHÉP THUẬT (HÌNH + MÀU)
     ========================================================= */
  function man3() {
    const my = clear('nen_man3', 'Màn 3: Xây tháp phép thuật', ['tc_m3_intro']);
    img('bien_man3', 22, 1, 56);
    const tower = {};
    [['tron', 4, 'nhan_vat_tron_do', 'do'], ['vuong', 81, 'nhan_vat_vuong_vang', 'vang']].forEach(([k, x, av, c]) => {
      const plate = div('plate', { left: x + '%', top: '20%', width: '15%', height: '77%' });
      img(av, x + 3.5, 21, 8);
      const slots = [];
      for (let s = 0; s < 4; s++) slots.push(img('o_trong_' + k, x + 2.5, 82 - s * 14.5, 10));
      tower[k] = { plate, slots, n: 0, color: c };
    });
    const pieces = shuffle([...Array(4).fill(['tron', 'do']), ...Array(4).fill(['vuong', 'vang']), ['tron', 'vang'], ['tron', 'vang'], ['vuong', 'do'], ['vuong', 'do']]);
    const prog = () => badge('🔴 ' + tower.tron.n + '/4  🟨 ' + tower.vuong.n + '/4');
    prog();
    pieces.forEach(([sh, c], idx) => {
      const col = idx % 4, row = idx / 4 | 0;
      const el = document.createElement('div'); el.className = 'tc-o tc-popin';
      Object.assign(el.style, { left: 24.5 + col * 13.2 + '%', top: 26 + row * 22 + '%', width: '11%', animationDelay: idx * 60 + 'ms' });
      el.innerHTML = `<img src="${H('khoi_' + sh + '_' + c)}" alt="">`; stage.appendChild(el);
      el.onMove = (x, y) => Object.values(tower).forEach(t => t.plate.classList.toggle('tc-hot', inRect(x, y, t.plate)));
      draggable(el, async (x, y) => {
        const k = Object.keys(tower).find(k => inRect(x, y, tower[k].plate, 10)); if (!k) return false;
        const t = tower[k];
        if (k === sh && t.color === c && t.n < 4) {
          el.dataset.lock = 1; const slot = t.slots[t.n];
          const a = el.getBoundingClientRect(), b = slot.getBoundingClientRect();
          const cur = el.style.transform.match(/translate\(([-\d.]+)px, ?([-\d.]+)px\)/) || [0, 0, 0];
          el.style.transition = 'transform .35s ease-out';
          el.style.transform = `translate(${+cur[1] + b.left - a.left}px,${+cur[2] + b.top - a.top}px) scale(${b.width / a.width})`;
          setTimeout(() => { if (my !== scene) return; slot.src = H('khoi_' + sh + '_' + c); el.remove(); sfx('thunk'); sparkleEl(slot); }, 360);
          t.n++; prog(); say([`tc_m3_ok_${k}`]);
          if (tower.tron.n === 4 && tower.vuong.n === 4) setTimeout(() => win3(my), 1400);
          return true;
        }
        sfx('buzz'); t.plate.classList.add('tc-shake'); setTimeout(() => t.plate.classList.remove('tc-shake'), 500);
        say([`tc_m3_no_${k}`]); return false;
      }, () => say([(sh === 'tron' ? 'g_round' : 'g_square'), (c === 'do' ? 'g_red' : 'g_yellow')]));
    });
    say(intro);
  }
  async function win3(my) {
    if (my !== scene) return;
    stage.querySelectorAll('.tc-o.tc-drag').forEach(e => e.style.opacity = '.25');
    div('dim', {});
    const c = img('lau_dai', 30, 8, 40, 'popin'); c.style.zIndex = 60;
    sfx('fanfare'); sfx('applause'); confetti(160);
    await say(['tc_m3_win']); if (my !== scene) return;
    finish(2, null);
  }

  /* ---------------- hoàn thành màn: +1 sao ---------------- */
  async function finish(i, nextFn) {
    const my = scene;
    award('m' + (i + 1)); starBurst(); sfx('fanfare'); confetti(80);
    await say(['tc_sao']); if (my !== scene) return;
    if (nextFn) btn('nut_tiep', 43, 66, 14, nextFn, 'breathe popin').style.zIndex = 70;
    else { await wait(400); if (my === scene) { clear('nen_bia', 'Bé ngoan – Bé giỏi!', []); img('nhan_vat_tron_do', 6, 40, 20, 'popin'); img('lau_dai', 34, 30, 32, 'popin'); img('nhan_vat_vuong_vang', 74, 40, 20, 'popin'); showCert(); } }
  }

  /* ---------------- thanh công cụ ---------------- */
  $('#btnHome').onclick = () => { initAudio(); home(); };
  $('#btnStars').onclick = () => { initAudio(); showCert(); };
  $('#btnReplay').onclick = () => { initAudio(); if (intro.length) say(intro); };
  $('#btnSound').onclick = e => { muted = !muted; if (muted) stopAudio(); e.currentTarget.firstChild.textContent = muted ? '🔇' : '🔊'; e.currentTarget.classList.toggle('off', muted); };
  $('#btnFull').onclick = () => { const d = document; if (!d.fullscreenElement) d.documentElement.requestFullscreen && d.documentElement.requestFullscreen(); else d.exitFullscreen(); };
  if (STORY_URL) { const a = $('#btnStory'); a.href = STORY_URL; a.classList.remove('hidden'); }
  try { speechSynthesis.getVoices(); } catch (e) {}
  stage.style.backgroundImage = 'url(hinh/nen_bia.jpg)';
  updateStars();

  // Mở thẳng một màn để thử: ?man=1|2|3
  const startMan = () => { const m = new URLSearchParams(location.search).get('man'); ({ 1: man1, 2: man2, 3: man3 }[m] || home)(); };
  $('#btnOpen').onclick = () => { initAudio(); sfx('pop'); $('#splash').classList.add('hidden'); startMan(); };
  window.TroChoi = { home, man1, man2, man3, award, hasStar };
})();
