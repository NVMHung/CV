import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './terminal-portfolio.css';
import './effects.css';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSQotn2NPVKEYCgsza4NiiJZWs5bBn2sTjKj98XciBot_420w8D9znsXpvB2pJDShw/exec';

const projects = [
  ['01', 'Unity / Creative App', 'appTomau2', 'A Unity drawing and colouring app built around simple, accessible creative play.', ['Unity', 'C#', 'UI'], '◈', 'https://github.com/NVMHung/appTomau2', 'https://res.cloudinary.com/xxxfhnih/video/upload/v1787821110/apptomau-review.mp4', 'https://res.cloudinary.com/xxxfhnih/video/upload/v1787821111/apptomau2.mp4', 'Designed and implemented a lightweight drawing experience: user input, colour selection, brush interaction, and a clear Unity UI flow for approachable creative play.', [['00:00', 0, 'App overview'], ['00:12', 12, 'Drawing interaction'], ['00:28', 28, 'Colouring workflow']]],
  ['02', 'Unity / Adventure', 'Adventure Game', 'A Unity movement and puzzle-solving prototype focused on player control and level interaction.', ['Unity', 'C#', 'Puzzle'], '⌘', 'https://github.com/NVMHung/AdventureGame', 'https://res.cloudinary.com/xxxfhnih/video/upload/v1787821094/run-review.mp4', 'https://res.cloudinary.com/xxxfhnih/video/upload/v1787821175/run2.mp4', 'Built player movement and interaction foundations for an exploration puzzle game, with an emphasis on readable controls, environmental challenges, and iteration in Unity.', [['00:00', 0, 'Movement overview'], ['00:10', 10, 'Puzzle interaction'], ['00:25', 25, 'Level walkthrough']]],
  ['03', 'Unity / Racing', 'Pig Racing 2.0', 'A playful Unity race app where multiple pigs compete across a simple race track.', ['Unity', 'C#', 'Gameplay'], '↗', 'https://github.com/NVMHung/appHeoracing2.0', 'https://res.cloudinary.com/xxxfhnih/video/upload/v1787821081/heo-race-review.mp4', 'https://res.cloudinary.com/xxxfhnih/video/upload/v1787821149/heo-race2.mp4', 'Created a multi-pig racing experience with race setup, movement behaviour, finish-state feedback, and a focused gameplay loop designed for quick, understandable sessions.', [['00:00', 0, 'Race setup'], ['00:11', 11, 'Racing behaviour'], ['00:26', 26, 'Finish-state flow']]],
];
const skills = { 'Game development': ['Unity', 'C#', 'C++', 'Kotlin'], 'Backend & cloud': ['Node.js', '.NET', 'Firebase', 'Google Cloud', 'PostgreSQL'], 'Web & workflow': ['React', 'JavaScript', 'Docker', 'Git', 'GitHub Actions', 'Postman'] };
// Everything else from the "Tech Stack" README badges that isn't already a
// percentage skill above — shown as a plain badge row instead of a skill bar,
// since a % rating doesn't really make sense for things like Jira or Steam.
const otherTools = ['LaTeX', 'PowerShell', 'PHP', 'Windows Terminal', 'Bootstrap', 'Flutter', 'MongoDB', 'MySQL', 'SQLite', 'Canva', 'GitHub', 'Jira', 'Epic Games', 'Nvidia', 'Steam', 'Riot Games'];
const statusPhrases = ['always building', 'open to freelance', 'shipping games'];
// The 4 "work philosophy" lines from portfolio.html's about terminal,
// translated to English, cycled through the same typed-status animation
// as the hero terminal instead of being spelled out as static code.
const approachPhrases = ['clean, readable code', 'test before you ship', 'always ask why', 'good UI matters too'];
const rainGlyphs = '01アイウエオカキクケコ{}<>/;+-='.split('');

// Reads the live --ink/--paper/--teal/--pink/--yellow custom properties so
// every canvas effect (grid, rain curtain, matrix overlay) stays in sync with
// the current palette instead of hardcoding colors in multiple places.
function readPalette() {
  const s = getComputedStyle(document.documentElement);
  const get = (name, fallback) => s.getPropertyValue(name).trim() || fallback;
  return {
    ink: get('--ink', '#10100f'),
    paper: get('--paper', '#f6f4ed'),
    teal: get('--teal', '#40baa2'),
    pink: get('--pink', '#f16cd9'),
    yellow: get('--yellow', '#ffe100'),
  };
}


function useScrollReveal() {
  // Adds `.reveal` -> `.reveal.in` as elements enter the viewport.
  useEffect(() => {
    const targets = [...document.querySelectorAll('.reveal:not(.in)')];
    if (!targets.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          window.setTimeout(() => el.classList.add('in'), i * 60);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

function useTypedCycle(phrases) {
  const [text, setText] = useState('');
  useEffect(() => {
    let phrase = 0;
    let char = 0;
    let deleting = false;
    let timeoutId;
    const tick = () => {
      const current = phrases[phrase];
      if (!deleting) {
        char += 1;
        setText(current.slice(0, char));
        if (char === current.length) { deleting = true; timeoutId = window.setTimeout(tick, 1400); return; }
      } else {
        char -= 1;
        setText(current.slice(0, char));
        if (char === 0) { deleting = false; phrase = (phrase + 1) % phrases.length; }
      }
      timeoutId = window.setTimeout(tick, deleting ? 35 : 70);
    };
    tick();
    return () => window.clearTimeout(timeoutId);
  }, [phrases]);
  return text;
}

function useConfetti(canvasRef) {
  const particles = useRef([]);
  const running = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef]);

  const burst = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const colors = ['#ffe100', '#40baa2', '#f16cd9', '#10100f'];
    for (let i = 0; i < 34; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      particles.current.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)],
        life: 1, rot: Math.random() * 360,
      });
    }
    if (!running.current) {
      running.current = true;
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.current.forEach((p) => {
          p.vy += 0.12; p.x += p.vx; p.y += p.vy; p.life -= 0.012; p.rot += 6;
          ctx.save();
          ctx.globalAlpha = Math.max(p.life, 0);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        });
        particles.current = particles.current.filter((p) => p.life > 0);
        if (particles.current.length > 0) {
          window.requestAnimationFrame(animate);
        } else {
          running.current = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      window.requestAnimationFrame(animate);
    }
  };

  return burst;
}

// Matrix-rain used as a scene-transition wipe: a quick rain cascade covers the
// screen, the scroll position jumps to the target section while hidden, then
// a downward "water line" sweeps the curtain away, revealing the new section
// top-to-bottom as it passes — the rain itself never toggles on its own.
function useRainTransition(curtainRef, canvasRef) {
  const [pendingTarget, setPendingTarget] = useState(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (!pendingTarget) return undefined;
    const canvas = canvasRef.current;
    const curtain = curtainRef.current;
    if (!canvas || !curtain) { setPendingTarget(null); return undefined; }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      document.getElementById(pendingTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingTarget(null);
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const fontSize = 16;
    const cols = Math.ceil(width / fontSize);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -height);
    const palette = ['#40baa2', '#f16cd9', '#ffe100', '#f6f4ed'];

    curtain.style.clipPath = 'inset(0 0 0 0)';
    curtain.style.opacity = '1';

    let raf;
    let phase = 'cover';
    let phaseStart = performance.now();
    const coverDuration = 380;
    const revealDuration = 720;

    function drawRain(trailAlpha) {
      ctx.fillStyle = `rgba(16,16,15,${trailAlpha})`;
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px 'DM Mono', monospace`;
      drops.forEach((y, i) => {
        ctx.fillStyle = palette[i % palette.length];
        ctx.fillText(rainGlyphs[Math.floor(Math.random() * rainGlyphs.length)], i * fontSize, y);
        drops[i] += fontSize * (0.9 + Math.random() * 0.6);
        if (drops[i] > height && Math.random() > 0.92) drops[i] = Math.random() * -100;
      });
    }

    function tick(now) {
      const elapsed = now - phaseStart;
      if (phase === 'cover') {
        drawRain(0.16);
        if (elapsed >= coverDuration) {
          ctx.fillStyle = '#10100f';
          ctx.fillRect(0, 0, width, height);
          document.getElementById(pendingTarget)?.scrollIntoView({ behavior: 'auto', block: 'start' });
          phase = 'reveal';
          phaseStart = now;
        }
      } else {
        drawRain(0.12);
        const p = Math.min((now - phaseStart) / revealDuration, 1);
        const eased = 1 - (1 - p) ** 3;
        curtain.style.clipPath = `inset(${eased * 100}% 0 0 0)`;
        if (p >= 1) {
          cancelAnimationFrame(raf);
          runningRef.current = false;
          setPendingTarget(null);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    runningRef.current = true;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pendingTarget, curtainRef, canvasRef]);

  const start = (id) => { if (!runningRef.current) setPendingTarget(id); };
  return { start, isActive: pendingTarget !== null };
}

// Mouse-reactive background grid, ported from portfolio.html's #bg-grid.
// Points near the cursor push outward within RADIUS, easing back to their
// base position once the cursor moves away. Colors are read from the same
// --teal/--pink/--yellow custom properties the rest of the UI uses, so it
// tracks the palette instead of the violet/cyan hard-coded in the original.
function useInteractiveGrid(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const { teal, pink, yellow } = readPalette();

    const SPACING = 48;
    const RADIUS = 190;
    const MAX_PUSH = 26;
    const EASE = 0.12;

    let gw;
    let gh;
    let cols;
    let rows;
    let grid = [];
    const mouseRaw = { x: -9999, y: -9999 };
    const mouseSmooth = { x: -9999, y: -9999 };

    function buildGrid() {
      cols = Math.ceil(gw / SPACING) + 2;
      rows = Math.ceil(gh / SPACING) + 2;
      grid = [];
      for (let j = 0; j < rows; j += 1) {
        const row = [];
        for (let i = 0; i < cols; i += 1) row.push({ bx: i * SPACING, by: j * SPACING, x: i * SPACING, y: j * SPACING, force: 0 });
        grid.push(row);
      }
    }

    function resize() {
      gw = canvas.width = window.innerWidth;
      gh = canvas.height = window.innerHeight;
      buildGrid();
    }
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => { mouseRaw.x = e.clientX; mouseRaw.y = e.clientY; };
    const onTouch = (e) => { if (e.touches[0]) { mouseRaw.x = e.touches[0].clientX; mouseRaw.y = e.touches[0].clientY; } };
    const onLeave = () => { mouseRaw.x = -9999; mouseRaw.y = -9999; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    function updatePoints() {
      for (let j = 0; j < rows; j += 1) {
        for (let i = 0; i < cols; i += 1) {
          const p = grid[j][i];
          const dx = p.bx - mouseSmooth.x;
          const dy = p.by - mouseSmooth.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < RADIUS && dist > 0.001) {
            const force = (1 - dist / RADIUS) ** 1.5;
            const nx = dx / dist;
            const ny = dy / dist;
            p.x = p.bx + nx * force * MAX_PUSH;
            p.y = p.by + ny * force * MAX_PUSH;
            p.force = force;
          } else {
            p.x = p.bx;
            p.y = p.by;
            p.force = 0;
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, gw, gh);
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.14;
      ctx.strokeStyle = teal;
      for (let j = 0; j < rows; j += 1) {
        ctx.beginPath();
        for (let i = 0; i < cols; i += 1) { const p = grid[j][i]; if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.stroke();
      }
      ctx.strokeStyle = pink;
      for (let i = 0; i < cols; i += 1) {
        ctx.beginPath();
        for (let j = 0; j < rows; j += 1) { const p = grid[j][i]; if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
        ctx.stroke();
      }
      for (let j = 0; j < rows; j += 1) {
        for (let i = 0; i < cols; i += 1) {
          const p = grid[j][i];
          if (p.force > 0.05) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.4 + p.force * 2.2, 0, Math.PI * 2);
            ctx.globalAlpha = p.force * 0.9;
            ctx.fillStyle = yellow;
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    let raf;
    function loop() {
      mouseSmooth.x += (mouseRaw.x - mouseSmooth.x) * EASE;
      mouseSmooth.y += (mouseRaw.y - mouseSmooth.y) * EASE;
      updatePoints();
      draw();
      raf = window.requestAnimationFrame(loop);
    }

    if (reduceMotion) {
      draw(); // static grid, no cursor tracking
    } else {
      raf = window.requestAnimationFrame(loop);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('mouseleave', onLeave);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [canvasRef]);
}

// Persistent full-screen matrix rain, independent from the boot/scene-transition
// curtain above. Only runs while `active` is true, driven by the floating
// matrix-toggle button — this is the "press a button to show it" behavior,
// as opposed to rain auto-playing on every nav click.
function useMatrixOverlay(canvasRef, active) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return undefined;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { teal, pink, yellow, paper } = readPalette();
    const palette = [teal, pink, yellow, paper];
    const fontSize = 16;
    let width;
    let height;
    let drops = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const cols = Math.ceil(width / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * -height);
    }
    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
      ctx.fillStyle = '#10100f';
      ctx.fillRect(0, 0, width, height);
      return () => window.removeEventListener('resize', resize);
    }

    let raf;
    function tick() {
      ctx.fillStyle = 'rgba(16,16,15,0.09)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px 'DM Mono', monospace`;
      drops.forEach((y, i) => {
        ctx.fillStyle = palette[i % palette.length];
        ctx.fillText(rainGlyphs[Math.floor(Math.random() * rainGlyphs.length)], i * fontSize, y);
        drops[i] += fontSize * (0.7 + Math.random() * 0.5);
        if (drops[i] > height && Math.random() > 0.975) drops[i] = Math.random() * -100;
      });
      raf = window.requestAnimationFrame(tick);
    }
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      if (raf) window.cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [canvasRef, active]);
}

// Code-comment-styled divider marking the end of a section, with two rule
// lines that draw in from the edges once the section scrolls into view
// (reuses the .reveal/.in machinery from useScrollReveal, no extra JS).
function SectionEnd({ label }) {
  return (
    <div className="section-end reveal">
      <span className="rule" />
      <code>// EOF — {label}</code>
      <span className="rule" />
    </div>
  );
}

// A project card whose preview clip only plays on hover, YouTube-thumbnail
// style — falls back to the static glyph if no video is reachable at `video`.
function ProjectCard({ id, type, title, text, tags, github, preview, walkthrough, scope, chapters, onOpen }) {
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const handleEnter = () => {
    const v = videoRef.current;
    if (v && !videoFailed) { v.currentTime = 0; v.play().catch(() => {}); }
  };
  const handleLeave = () => {
    const v = videoRef.current;
    if (v && !videoFailed) { v.pause(); v.currentTime = 0; }
  };

  return (
    <article className="project reveal" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div className="project-head"><span className="lights"><i /><i /><i /></span><b>{id}.project</b></div>
      <button className="project-art" type="button" aria-label={`Open ${title} walkthrough`} onClick={(event) => onOpen({ id, type, title, text, tags, github, walkthrough, scope, chapters }, event)}>
        {!videoFailed && <video ref={videoRef} className="project-preview" src={preview} muted loop playsInline onError={() => setVideoFailed(true)} />}
        <span className="preview-label">Click for detailed walkthrough ↗</span>
      </button>
      <div className="project-body">
        <small>{type}</small>
        <h3>{title}</h3>
        <p>{text}</p>
        <div>{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <a className="project-link" href={github} target="_blank" rel="noreferrer">⌘ view source on GitHub →</a>
      </div>
    </article>
  );
}

function WalkthroughModal({ project, origin, closing, onClose }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const escape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [onClose]);
  // Lock background scroll while the modal is open, restoring the exact
  // previous inline style when it closes, and compensate for the vanished
  // scrollbar width so the page doesn't jump/shift sideways.
  useEffect(() => {
    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousPaddingRight = style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    style.overflow = 'hidden';
    if (scrollbarWidth > 0) style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      style.overflow = previousOverflow;
      style.paddingRight = previousPaddingRight;
    };
  }, []);
  const toggle = () => { const video = videoRef.current; if (!video) return; if (video.paused) video.play(); else video.pause(); };
  const seek = (time) => { const video = videoRef.current; if (video) { video.currentTime = time; video.play(); } };
  const fmt = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  return <div className={`walkthrough-backdrop ${closing ? 'closing' : 'opening'}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="crt-flash" />
    <div className="walkthrough-modal" style={{ '--origin-x': `${origin.x}px`, '--origin-y': `${origin.y}px` }} role="dialog" aria-modal="true" aria-label={`${project.title} detailed walkthrough`}>
      <button className="modal-close" onClick={onClose} aria-label="Close walkthrough">✕</button>
      <div className="modal-video-wrap"><video ref={videoRef} src={project.walkthrough} playsInline onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)} /></div>
      <div className="modal-controls"><button onClick={toggle}>{playing ? 'Pause' : 'Play'}</button><input aria-label="Video progress" type="range" min="0" max={duration || 0} step="0.1" value={progress} onChange={(event) => seek(Number(event.target.value))} /><span>{fmt(progress)} / {fmt(duration)}</span></div>
      <div className="modal-details"><div><small>{project.type}</small><h3>{project.title}</h3><p>{project.text}</p><h4>Project scope & tools</h4><p>{project.scope}</p><div className="modal-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a href={project.github} target="_blank" rel="noreferrer">View source on GitHub →</a></div><aside><h4>Chapters</h4>{project.chapters.map(([label, time, chapter]) => <button key={label} onClick={() => seek(time)}><b>{label}</b><span>{chapter}</span></button>)}</aside></div>
    </div>
  </div>;
}

function App() {
  const [booted, setBooted] = useState(false);
  const [active, setActive] = useState('home');
  const [modalProject, setModalProject] = useState(null);
  const [modalClosing, setModalClosing] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  const [skillsVisible, setSkillsVisible] = useState(false);
 const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactError, setContactError] = useState('');
  const [matrixOn, setMatrixOn] = useState(false);

  const skillGridRef = useRef(null);
  const confettiRef = useRef(null);
  const sendBtnRef = useRef(null);
  const curtainRef = useRef(null);
  const rainCanvasRef = useRef(null);
  const bgGridRef = useRef(null);
  const matrixCanvasRef = useRef(null);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const burstConfetti = useConfetti(confettiRef);
  const typedStatus = useTypedCycle(statusPhrases);
  const typedApproach = useTypedCycle(approachPhrases);
  const { start: playSceneTransition, isActive: rainActive } = useRainTransition(curtainRef, rainCanvasRef);
  useInteractiveGrid(bgGridRef);
  useMatrixOverlay(matrixCanvasRef, matrixOn);

  useEffect(() => {
    // Boot screen hides and the matrix-rain wipe covers/reveals the hero at
    // the same moment, so the rain becomes the transition *into* the site
    // rather than something only triggered later by nav clicks.
    const timer = window.setTimeout(() => {
      setBooted(true);
      playSceneTransition('home');
    }, 1450);
    const sections = [...document.querySelectorAll('section[id]')];
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-42% 0px -48% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => { window.clearTimeout(timer); observer.disconnect(); };
  }, []);

  // Skill bars fill only once, when the toolbox grid scrolls into view.
  useEffect(() => {
    const node = skillGridRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { setSkillsVisible(true); observer.disconnect(); } });
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Fixed header no longer takes up flow space, so measure its real height
  // and expose it as --header-h for body padding + section scroll-margin.
  useEffect(() => {
    const setHeaderHeight = () => {
      const h = headerRef.current?.offsetHeight;
      if (h) document.documentElement.style.setProperty('--header-h', `${h}px`);
    };
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);
    return () => window.removeEventListener('resize', setHeaderHeight);
  }, []);

  // Sliding pill under the nav that tracks whichever section is active,
  // recalculated whenever scroll moves `active` to a new section.
  useEffect(() => {
    const positionIndicator = () => {
      const nav = navRef.current;
      const indicator = indicatorRef.current;
      if (!nav || !indicator) return;
      const btn = nav.querySelector(`button[data-id="${active}"]`);
      if (!btn) return;
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      indicator.style.width = `${btnRect.width}px`;
      indicator.style.transform = `translateX(${btnRect.left - navRect.left}px)`;
    };
    positionIndicator();
    window.addEventListener('resize', positionIndicator);
    return () => window.removeEventListener('resize', positionIndicator);
  }, [active]);

  useScrollReveal();

  // Nav/CTA clicks are a plain smooth scroll now — the matrix-rain wipe is
  // reserved for the boot -> homepage entrance and the dedicated toggle
  // button below, not something that fires on every click.
  const move = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openWalkthrough = (project, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setModalClosing(false);
    setModalProject(project);
  };
  const closeWalkthrough = () => {
    if (modalClosing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setModalProject(null); return; }
    setModalClosing(true);
    window.setTimeout(() => { setModalProject(null); setModalClosing(false); }, 480);
  };

const handleContactSubmit = async (event) => {
  event.preventDefault();
  setContactError('');

  const form = event.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  setSending(true);
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // tránh CORS preflight với Apps Script
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json();

    if (data.result !== 'success') {
      throw new Error(data.message || 'Gửi thất bại, thử lại sau.');
    }

    setSent(true);
    const btn = sendBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      burstConfetti(rect.left + rect.width / 2, rect.top);
    }
    form.reset();
    window.setTimeout(() => setSent(false), 3500);
  } catch (err) {
    setContactError(err.message || 'Không thể gửi tin nhắn. Kiểm tra kết nối mạng.');
  } finally {
    setSending(false);
  }
};

  return <>
    <canvas ref={bgGridRef} className="bg-grid" />
    <canvas ref={confettiRef} className="confetti-canvas" />
    <canvas ref={matrixCanvasRef} className={`matrix-overlay ${matrixOn ? 'on' : ''}`} />
    {modalProject && <WalkthroughModal project={modalProject} origin={modalOrigin} closing={modalClosing} onClose={closeWalkthrough} />}
    <button type="button" className={`matrix-toggle ${matrixOn ? 'on' : ''}`} onClick={() => setMatrixOn((v) => !v)} aria-pressed={matrixOn}>
      <i className="dot" /> matrix: {matrixOn ? 'on' : 'off'}
    </button>
    <div ref={curtainRef} className={`rain-curtain ${rainActive ? 'active' : ''}`}><canvas ref={rainCanvasRef} /></div>
    <div className={`boot ${booted ? 'hidden' : ''}`}><div className="boot-box"><p>&gt; booting nvmhung.dev <b>[OK]</b></p><p>&gt; loading game toolkit <b>[OK]</b></p><p>&gt; connecting backend systems <b>[OK]</b></p><p>&gt; ready.</p><div><i /></div></div></div>
    <header ref={headerRef} className={booted ? 'is-visible' : ''}><div className="nav-shell"><span className="lights"><i /><i /><i /></span><nav ref={navRef}><span ref={indicatorRef} className="nav-indicator" />{[['home', 'home.tsx'], ['about', 'about.md'], ['tools', 'skills.yml'], ['work', 'projects.json'], ['contact', 'contact.sh']].map(([id, label]) => <button data-id={id} className={active === id ? 'active' : ''} onClick={() => move(id)} key={id}>{label}</button>)}</nav></div></header>
    <main>
      <section id="home" className="hero"><div className="hero-grid"><div className="hero-copy"><p className="pill"><i /> AVAILABLE FOR CREATIVE BUILDS</p><h1>I build games<br />and the systems<br /><em>that power them.</em></h1><p>Game developer and backend developer from Ho Chi Minh City. I turn playful ideas into polished experiences—from the first Unity scene to the services that keep it alive.</p><div className="cta"><button onClick={() => move('work')}>./explore_work <b>→</b></button><button className="ghost" onClick={() => move('about')}>about_me.md <b>→</b></button></div><div className="quick"><span><b className="hl">Unity</b> game engine</span><span><b className="hl">Node.js</b> backend systems</span></div></div><div className="hero-visual"><div className="term-window"><div className="term-head"><span className="lights"><i /><i /><i /></span><b>nvmhung@portfolio:~</b></div><div className="term-content"><p><strong>$</strong> cat profile.json</p><p className="muted">{'{'}</p><p>&nbsp;&nbsp;<em>"role"</em>: <b>"Game + Backend Developer"</b>,</p><p>&nbsp;&nbsp;<em>"location"</em>: <b>"Ho Chi Minh City"</b>,</p><p>&nbsp;&nbsp;<em>"status"</em>: <b>"{typedStatus}<i className="type-cursor" /></b></p><p className="muted">{'}'}</p><p><strong>$</strong> <i className="cursor" /></p></div></div><figure className="hero-avatar"><img src="/avatar.jpg" alt="Nguyen Van Minh Hung" /></figure></div></div></section>
      <section id="about"><p className="eyebrow reveal">about me</p><h2 className="reveal">Built for play.<br />Reliable by <em>design.</em></h2><div className="about-grid"><div className="code-card reveal"><p><span>01</span><i>// profile.ts</i></p><p><span>02</span><b>const</b> developer = {'{'}</p><p><span>03</span>&nbsp;&nbsp;name: <em>'Nguyen Vu Manh Hung'</em>,</p><p><span>04</span>&nbsp;&nbsp;born: <em>'2003'</em>,</p><p><span>05</span>&nbsp;&nbsp;focus: <em>'game + backend'</em>,</p><p><span>06</span>&nbsp;&nbsp;mindset: <em>'indie-minded'</em>,</p><p><span>07</span>&nbsp;&nbsp;<i>// my approach to work</i></p><p><span>08</span>&nbsp;&nbsp;approach: <em>'{typedApproach}<i className="type-cursor" /></em></p><p><span>09</span>{'}'};</p></div><div className="about-copy"><p className="reveal">I enjoy every layer of making an idea real: shaping game feel in <b className="hl">Unity</b>, solving mobile challenges, and building web backends that make an experience work beyond the screen.</p><p className="reveal">I have spent more hours playing games than writing code—now I <b className="hl">make the games</b>.</p><div className="number-row"><span className="reveal"><b>01</b>game craft</span><span className="reveal"><b>02</b>backend logic</span><span className="reveal"><b>03</b>mobile focus</span></div></div></div><SectionEnd label="about.md" /></section>
      <section id="tools"><p className="eyebrow reveal">toolbox</p><h2 className="reveal">A practical stack<br />for <em>shipping.</em></h2><p className="section-copy reveal">The tools I use to build, test, and deliver game and web experiences.</p><div className="skill-grid" ref={skillGridRef}>{Object.entries(skills).map(([title, list], index) => <article key={title} className="reveal"><h3><span>0{index + 1}</span>{title}</h3>{list.map((skill, i) => { const pct = 94 - i * 6; return <div className="skill-line" key={skill}><label>{skill}<b>{pct}%</b></label><i><em style={{ width: skillsVisible ? `${pct}%` : '0%' }} /></i></div>; })}</article>)}</div><p className="section-copy reveal" style={{ marginTop: 44 }}>Also reached for along the way:</p><div className="tool-badges reveal">{otherTools.map((tool) => <span key={tool}>{tool}</span>)}</div><SectionEnd label="skills.yml" /></section>
      <section id="work"><p className="eyebrow reveal">selected work</p><h2 className="reveal">Projects with<br /><em>purpose.</em></h2><p className="section-copy reveal">Game experiences, reliable services, and the connective tissue between them.</p>
        <div className="project-grid">{projects.map(([id, type, title, text, tags, mark, github, preview, walkthrough, scope, chapters]) => <ProjectCard key={id} id={id} type={type} title={title} text={text} tags={tags} mark={mark} github={github} preview={preview} walkthrough={walkthrough} scope={scope} chapters={chapters} onOpen={openWalkthrough} />)}</div>
        <SectionEnd label="projects.json" />
      </section>
      <section id="contact"><p className="eyebrow reveal">contact</p><h2 className="reveal">Let’s build<br /><em>something fun.</em></h2><div className="contact-panel reveal"><div><h3>Say hello</h3><p>Have a project in mind? I’m open to creating thoughtful games and <b className="hl">dependable systems</b>.</p><a href="mailto:your.email@example.com">✉ manhhung.nvm@gmail.com</a><a href="https://github.com/NVMHung" target="_blank" rel="noreferrer">⌘ github.com/NVMHung</a><a href="tel:+819000000000">☎ +81 070-9064-0879</a></div><form onSubmit={handleContactSubmit}>
  <label>$ name<input name="name" placeholder="Your name" required /></label>
  <label>$ email<input name="email" type="email" placeholder="you@email.com" required /></label>
  <label>$ message<textarea name="message" placeholder="Tell me about your project" required /></label>
  <button type="submit" ref={sendBtnRef} disabled={sending}>
    {sending ? './sending...' : './send_message.sh'} <b>→</b>
  </button>
  {contactError && <div className="send-status show error">✖ {contactError}</div>}
  <div className={`send-status ${sent ? 'show' : ''}`}>✔ Message sent — I'll get back to you soon.</div>
</form></div><SectionEnd label="contact.sh" /></section>
    </main><footer>© 2026 NVMHUNG — DESIGNED FOR PLAY + PURPOSE</footer></>;
}
createRoot(document.getElementById('root')).render(<App />);
