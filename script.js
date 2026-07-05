// ── Holographic blob background ───────────
(() => {
    const canvas = document.getElementById('bubble-bg');
    if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
        // Render at low resolution — the CSS blur hides it and it's much cheaper
        w = Math.ceil(window.innerWidth / 3);
        h = Math.ceil(window.innerHeight / 3);
        canvas.width  = w;
        canvas.height = h;
    }
    resize();
    window.addEventListener('resize', resize);

    // Each blob is iridescent: two tints that swirl inside it (like the reference bubble)
    // Kept small & scattered so plenty of white stays visible between them
    const BLOBS = [
        { tintA: [244, 168, 232], tintB: [147, 197, 253], r: 0.22, cx: 0.14, cy: 0.22, dx: 0.10, dy: 0.14, sx: 0.00050, sy: 0.00038, a: 0.75 }, // pink→blue
        { tintA: [167, 139, 250], tintB: [153, 246, 228], r: 0.18, cx: 0.85, cy: 0.18, dx: 0.09, dy: 0.12, sx: 0.00042, sy: 0.00055, a: 0.65 }, // lavender→mint
        { tintA: [147, 197, 253], tintB: [249, 168, 212], r: 0.24, cx: 0.75, cy: 0.78, dx: 0.12, dy: 0.10, sx: 0.00047, sy: 0.00035, a: 0.70 }, // blue→rose
        { tintA: [217, 70, 239],  tintB: [253, 230, 138], r: 0.15, cx: 0.30, cy: 0.72, dx: 0.11, dy: 0.13, sx: 0.00058, sy: 0.00044, a: 0.50 }, // brand pink→warm yellow
        { tintA: [253, 224, 71],  tintB: [244, 168, 232], r: 0.13, cx: 0.55, cy: 0.40, dx: 0.14, dy: 0.11, sx: 0.00040, sy: 0.00060, a: 0.45 }, // warm yellow→pink
    ];

    BLOBS.forEach(b => {
        b.px = Math.random() * Math.PI * 2;
        b.py = Math.random() * Math.PI * 2;
        b.pm = Math.random() * Math.PI * 2; // morph phase
        b.ps = Math.random() * Math.PI * 2; // swirl phase
    });

    function frame(now) {
        ctx.clearRect(0, 0, w, h);

        BLOBS.forEach(b => {
            const x = (b.cx + Math.sin(now * b.sx + b.px) * b.dx) * w;
            const y = (b.cy + Math.cos(now * b.sy + b.py) * b.dy) * h;

            // Radius breathes ±18% — the blob feels alive
            const breathe = 1 + Math.sin(now * 0.0007 + b.pm) * 0.18;
            const R = b.r * Math.max(w, h) * breathe;

            // Squash into a slowly rotating ellipse — organic, not a perfect circle
            const angle  = now * 0.00025 + b.pm;
            const squash = 0.75 + Math.sin(now * 0.0005 + b.ps) * 0.12;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.scale(1, squash);

            const [r1, g1, b1] = b.tintA;
            const [r2, g2, b2] = b.tintB;

            // Swirling interior: the second tint orbits inside the blob
            const ox = Math.cos(now * 0.0006 + b.ps) * R * 0.45;
            const oy = Math.sin(now * 0.0006 + b.ps) * R * 0.45;

            // Base color
            const base = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
            base.addColorStop(0,    `rgba(${r1},${g1},${b1},${b.a})`);
            base.addColorStop(0.65, `rgba(${r1},${g1},${b1},${b.a * 0.4})`);
            base.addColorStop(1,    `rgba(${r1},${g1},${b1},0)`);
            ctx.fillStyle = base;
            ctx.beginPath();
            ctx.arc(0, 0, R, 0, Math.PI * 2);
            ctx.fill();

            // Second tint swirling inside (iridescence)
            const swirl = ctx.createRadialGradient(ox, oy, 0, ox, oy, R * 0.8);
            swirl.addColorStop(0,   `rgba(${r2},${g2},${b2},${b.a * 0.8})`);
            swirl.addColorStop(0.6, `rgba(${r2},${g2},${b2},${b.a * 0.25})`);
            swirl.addColorStop(1,   `rgba(${r2},${g2},${b2},0)`);
            ctx.fillStyle = swirl;
            ctx.beginPath();
            ctx.arc(0, 0, R, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();

// ── Nav ───────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── Hamburger ─────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
}));

// ── Active nav on scroll ──────────────────
const pageSections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
window.addEventListener('scroll', () => {
    let cur = '';
    pageSections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
}, { passive: true });

// ── Scroll reveal ─────────────────────────
document.querySelectorAll('.reveal').forEach(el => {
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting) el.classList.add('visible');
    }, { threshold: 0.08 }).observe(el);
});

// ── Language bars ─────────────────────────
const langSection = document.getElementById('languages');
if (langSection) {
    new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.lang-bar').forEach((b, i) =>
                setTimeout(() => b.classList.add('animated'), i * 120));
        }
    }, { threshold: 0.4 }).observe(langSection);
}

// ── Hero photo ────────────────────────────
const heroImg = document.getElementById('hero-img');
const heroPH = document.getElementById('photo-placeholder');
if (heroImg) {
    heroImg.addEventListener('load', () => { if (heroPH) heroPH.style.display = 'none'; });
    heroImg.addEventListener('error', () => { heroImg.style.display = 'none'; });
}

// ── Scroll hint ───────────────────────────
const scrollHint = document.getElementById('scroll-hint');
if (scrollHint) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) scrollHint.classList.add('hidden');
    }, { passive: true });
}

// ── YouTube application video toggle ─────
const ytBtn = document.getElementById('yt-toggle');
const ytWrap = document.getElementById('yt-wrap');
if (ytBtn && ytWrap) {
    ytBtn.addEventListener('click', () => {
        const opening = !ytWrap.classList.contains('open');
        ytWrap.classList.toggle('open', opening);
        ytBtn.setAttribute('aria-expanded', opening);
    });
}

// ─────────────────────────────────────────
// Portfolio
// ─────────────────────────────────────────
const CAT_COLORS = { javascript: '#ffe943', python: '#56a9f2', blender: '#ff952a', figma: '#9f72ff' };
const CAT_LABELS = { javascript: 'JavaScript', python: 'Python', blender: 'Blender', figma: 'Figma' };

// ── Change this list to reorder projects ──
const PROJECT_ORDER = [
    'osPortfolio',
    'weather',
    'suwmania',
    'strom',
    'raccoony',
    'inkly',
    'starsGame',
    'cube',
    'donut',
    'head',
    'chair',

];

const PROJECTS = {
    weather: {
        title: 'Weather App', cat: 'javascript',
        stack: ['React', 'CSS', 'API'],
        learned: ['Working with public APIs', 'Dynamic UI updates'],
        description: "A simple little weather app that fetches data from a public API and displays the current weather for a searched location. In the little scene the weather conditions and the character's outfit change based on the fetched data. The UI leaves a lot to be desired but my main goal was to just have some fun with APIs and dynamic data in React, as well as dip my toes in pixel art.",
        media: [
            { type: 'image', src: 'assets/images/weather1.png' },
            { type: 'image', src: 'assets/images/weather2.png' },
            { type: 'image', src: 'assets/images/weather3.png' },
        ],
        webLink: 'https://basiaszafraniec.github.io/weather-app/',
        ghLink: 'https://github.com/basiaszafraniec/weather-app',
    },
    strom: {
        title: 'Strøm Website', cat: 'javascript',
        stack: ['JavaScript', 'HTML', 'CSS', 'Spline'],
        learned: ['Working with a client', 'Spline integration'],
        description: "A simple website I made for a local band called Strøm as one of my projects in the Multimedia Design course. I tried to add a little bit of fun to it while keeping it simple and informative. My work with the band wasn't limited to the website - I also worked on their social media, helped out with some editing and created posters and flyers for their concerts, as well as organized some of their concerts myself :)",
        media: [
            { type: 'image', src: 'assets/images/strom1.png' },
            { type: 'image', src: 'assets/images/strom2.png' },
            { type: 'image', src: 'assets/images/strom3.png' },
            { type: 'image', src: 'assets/images/strom4.png' },
            { type: 'image', src: 'assets/images/strom5.png' },
            { type: 'image', src: 'assets/images/strom6.png' },
            { type: 'image', src: 'assets/images/strom7.png' },
            { type: 'image', src: 'assets/images/strom8.png' },
            { type: 'image', src: 'assets/images/strom9.png' },
            { type: 'image', src: 'assets/images/strom10.png' },
            { type: 'image', src: 'assets/images/strom11.png' },
        ],
        ghLink: 'https://github.com/basiaszafraniec/strom-band',
    },
    raccoony: {
        title: 'Raccoony', cat: 'javascript',
        stack: ['React', 'Leaflet Maps', 'Firebase', 'API'],
        learned: ['Mobile-first design', 'Map implementation', 'Firebase'],
        description: 'An app made as part of my Multimedia Design course. Designed to help find nearest spots for dumpster diving, using a real database of locations and Leaflet maps. Uses Firebase for user posts and profiles.',
        media: [
            { type: 'image', src: 'assets/images/rac1.png' },
            { type: 'image', src: 'assets/images/rac2.png' },
            { type: 'image', src: 'assets/images/rac3.png' },
            { type: 'image', src: 'assets/images/rac4.png' },
            { type: 'image', src: 'assets/images/rac5.png' },
        ],
        webLink: 'https://basiaszafraniec.github.io/raccoony/',
        ghLink: 'https://github.com/basiaszafraniec/raccoony',
    },
    suwmania: {
        title: 'Suwmania', cat: 'javascript',
        stack: ['JavaScript', 'HTML', 'CSS', 'PHP'],
        learned: ['DOM manipulation', 'Game loops', 'Asynchronous programming'],
        description: "As my first JS project, I recreated a little puzzle toy I used to play with as a kid. It's a simple sliding tiles game with a move counter and a high score tracker. This was a super fun project to learn JavaScript with.",
        media: [{ type: 'image', src: 'assets/images/suwmania.png' }],
        webLink: 'https://host914956.xce.pl/basia/suwmania/B/',
        ghLink: 'https://github.com/basaiszafraniec/suwmaniaB',
    },
    inkly: {
        title: 'Inkly', cat: 'figma',
        stack: ['Figma'],
        learned: ['UI design', 'Component systems', 'Prototyping'],
        description: 'A Figma prototype made during my Multimedia Design course — an app for finding tattoo artists, booking appointments, and building a community around tattoos.',
        media: [
            { type: 'image', src: 'assets/images/inkly1.png' },
            { type: 'image', src: 'assets/images/inkly2.png' },
            { type: 'image', src: 'assets/images/inkly3.png' },
            { type: 'image', src: 'assets/images/inkly4.png' },
            { type: 'image', src: 'assets/images/inkly5.png' },
        ],
        webLink: 'https://www.figma.com/proto/8gGwYDcJl15IFezikTh2Qq/WebApp-project?node-id=230-989&p=f&t=PeFspIWgSgTb1cnm-1&scaling=scale-down&content-scaling=fixed&page-id=1%3A2&starting-point-node-id=320%3A4420&show-proto-sidebar=1',
    },
    starsGame: {
        title: 'Pygame Space Game', cat: 'python',
        stack: ['Python', 'Pygame'],
        learned: ['Game loop', 'Collision detection', 'Sprite management'],
        description: 'A small Pygame game exploring 2D game development — ships, bullets, enemies, and collision mechanics.',
        media: [{ type: 'video', src: 'assets/images/stars-vid.mov' }],
        ghLink: 'https://github.com/basiaszafraniec/stars_game2',
    },
    cube: {
        title: '3D Cube Simulator', cat: 'python',
        stack: ['Python', 'Pygame'],
        learned: ['3D projection math', 'Linear algebra', '2D rendering'],
        description: 'A fun experiment figuring out how to project 3D coordinates onto a 2D screen — a rotating wireframe cube built from scratch without any 3D library.',
        media: [{ type: 'video', src: 'assets/images/cube-vid.mov' }],
        ghLink: 'https://github.com/basiaszafraniec/cube_simulator',
    },
    donut: {
        title: 'Donut', cat: 'blender',
        stack: ['Blender'],
        learned: ['Modelling basics', 'Materials', 'Lighting'],
        description: 'The classic Blender beginner donut — my entry point into 3D modelling and rendering.',
        media: [{ type: 'image', src: 'assets/images/donut.GIF' }],
    },
    chair: {
        title: 'Chair', cat: 'blender',
        stack: ['Blender'],
        learned: ['Hard-surface modelling', 'UV unwrapping'],
        description: 'A modelled and rendered chair that helped me study different modelling techniques and textures.',
        media: [{ type: 'image', src: 'assets/images/chair.png' }],
    },
    head: {
        title: 'Rotating Head', cat: 'blender',
        stack: ['Blender'],
        learned: ['3D scanning'],
        description: 'Just a fun animation from a 3D scan of my mum\'s head, rendered in Blender.',
        media: [{ type: 'image', src: 'assets/images/head.gif' }],
    },
    osPortfolio: {
        title: 'OS-like personal website', cat: 'javascript',
        stack: ['React', 'Vite', 'CSS Modules'],
        learned: ['Window management', 'Draggable UI', 'Canvas API', 'Audio API'],
        description: 'A little personal website I made to have some fun with an OS-like design. I love retro operating systems and I wanted to try my hand at making my own little file system and window management system. I originaly intended for it to serve as my portfolio, but I ended up adding too many funky features in the process, so I desided to keep it as a side project instead. It\'s still a work in progress, as it serves me as a little playground to test out new ideas.',
        media: [{ type: 'image', src: 'assets/images/web-os.png' }],
        webLink: 'https://basiaszafraniec.github.io/funk/',
        ghLink: 'https://github.com/basiaszafraniec/funk',
    },
};

// ── Render one carousel slide ─────────────
function renderSlide(item) {
    if (item.type === 'image') {
        return `<div class="pf-carousel-slide"><img src="${item.src}" alt="" loading="lazy"></div>`;
    }
    if (item.type === 'video') {
        // autoplay, muted, loop — background video, no controls
        return `<div class="pf-carousel-slide">
            <video src="${item.src}" autoplay muted loop playsinline preload="auto"></video>
        </div>`;
    }
    return '';
}

// ── Infinite looping carousel ─────────────
function buildCarousel(container, media, catLabel, catColor, ctaLink) {
    const count = media.length;
    const track = container.querySelector('.pf-carousel-track');
    const dots = container.querySelector('.pf-carousel-dots');
    const prev = container.querySelector('.pf-carousel-prev');
    const next = container.querySelector('.pf-carousel-next');
    const hide = el => { if (el) el.style.display = 'none'; };

    if (count === 0) {
        // Show a "play live" CTA if there's a link, otherwise a plain placeholder
        if (ctaLink) {
            track.innerHTML = `
                <div class="pf-slide-placeholder pf-slide-cta"
                     style="background:linear-gradient(135deg,${catColor}88,${catColor}33)">
                    <p class="pf-cta-label">${catLabel} project</p>
                    <a href="${ctaLink}" target="_blank" rel="noopener" class="pf-cta-btn">
                        Open live ↗
                    </a>
                </div>`;
        } else {
            track.innerHTML = `
                <div class="pf-slide-placeholder"
                     style="background:linear-gradient(135deg,${catColor}88,${catColor}33)">
                    <span>${catLabel}</span>
                </div>`;
        }
        hide(prev); hide(next); hide(dots);
        return;
    }

    if (count === 1) {
        track.innerHTML = renderSlide(media[0]);
        hide(prev); hide(next); hide(dots);
        return;
    }

    // count >= 2: clone last→front and first→back for seamless loop
    const cloned = [media[count - 1], ...media, media[0]];
    track.innerHTML = cloned.map(renderSlide).join('');

    if (dots) {
        dots.innerHTML = media.map((_, i) =>
            `<button class="pf-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></button>`
        ).join('');
    }

    let idx = 1;
    let animating = false;

    const w = () => container.getBoundingClientRect().width;

    const setPos = (animated) => {
        track.style.transition = animated
            ? 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'none';
        track.style.transform = `translateX(${-idx * w()}px)`;
    };

    setPos(false);

    const updateDots = () => {
        if (!dots) return;
        const real = ((idx - 1) % count + count) % count;
        dots.querySelectorAll('.pf-dot').forEach((d, i) => d.classList.toggle('active', i === real));
    };

    track.addEventListener('transitionend', () => {
        if (idx === 0) { idx = count; setPos(false); }
        else if (idx === count + 1) { idx = 1; setPos(false); }
        animating = false;
        updateDots();
    });

    const move = (dir) => {
        if (animating) return;
        animating = true;
        idx += dir;
        setPos(true);
        updateDots();
    };

    if (prev) prev.addEventListener('click', () => move(-1));
    if (next) next.addEventListener('click', () => move(1));

    if (dots) {
        dots.addEventListener('click', e => {
            const dot = e.target.closest('.pf-dot');
            if (!dot || animating) return;
            animating = true;
            idx = parseInt(dot.dataset.idx) + 1;
            setPos(true);
            updateDots();
        });
    }

    new ResizeObserver(() => setPos(false)).observe(container);
}

// ── Render grid cards ─────────────────────
const grid = document.getElementById('pf-grid');

PROJECT_ORDER.forEach(id => {
    const p = { id, ...PROJECTS[id] };
    if (!p.title) return; // skip unknown ids
    const color = CAT_COLORS[p.cat] || '#ddd';
    const label = CAT_LABELS[p.cat] || p.cat;
    const first = p.media[0];

    let thumbHtml;
    if (first?.type === 'image') {
        thumbHtml = `<img src="${first.src}" alt="${p.title}" loading="lazy">`;
    } else if (first?.type === 'video') {
        // Video plays silently as thumbnail; fallback placeholder shows if video can't load (e.g. AVI)
        thumbHtml = `
            <div class="pf-card-placeholder" style="position:absolute;inset:0;background:linear-gradient(135deg,${color}bb,${color}44)">
                <span class="pf-thumb-icon">▶</span>
            </div>
            <video src="${first.src}" autoplay muted loop playsinline preload="auto" class="card-video-thumb"
                onerror="this.style.display='none'"></video>`;
    } else {
        // No media — gradient placeholder
        const icon = p.webLink ? '↗' : label[0];
        thumbHtml = `<div class="pf-card-placeholder"
            style="background:linear-gradient(135deg,${color}bb,${color}44)">
            <span class="pf-thumb-icon">${icon}</span>
        </div>`;
    }

    const card = document.createElement('div');
    card.className = 'pf-card';
    card.dataset.cat = p.cat;
    card.dataset.id = p.id;
    card.innerHTML = `
        <div class="pf-card-thumb">${thumbHtml}</div>
        <div class="pf-card-info">
            <div class="pf-card-title">${p.title}</div>
            <div class="pf-card-meta">
                <span class="pf-cat-dot" style="background:${color}"></span>
                <span class="pf-cat-label">${label}</span>
            </div>
            <div class="pf-stack-tags">${p.stack.map(s => `<span class="pf-stack-tag">${s}</span>`).join('')}</div>
        </div>`;

    card.addEventListener('click', () => openModal(p));
    grid.appendChild(card);
});

// Pause card videos when out of view (performance)
const videoThumbObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        const v = e.target.querySelector('.card-video-thumb');
        if (!v) return;
        if (e.isIntersecting) v.play().catch(() => { });
        else v.pause();
    });
}, { threshold: 0.1 });
grid.querySelectorAll('.pf-card').forEach(c => videoThumbObserver.observe(c));

// ── Filter ────────────────────────────────
document.getElementById('pf-filters').addEventListener('click', e => {
    const btn = e.target.closest('.pf-filter');
    if (!btn) return;
    document.querySelectorAll('.pf-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.pf-card').forEach(c => {
        c.dataset.hidden = (f !== 'all' && c.dataset.cat !== f) ? 'true' : 'false';
    });
});

// ── Modal ─────────────────────────────────
const modal = document.getElementById('pf-modal');
const modalBody = document.getElementById('pf-modal-body');

function openModal(p) {
    const color = CAT_COLORS[p.cat] || '#ddd';
    const label = CAT_LABELS[p.cat] || p.cat;

    const links = [
        p.webLink ? `<a href="${p.webLink}" target="_blank" rel="noopener" class="pf-modal-link primary">View live ↗</a>` : '',
        p.ghLink ? `<a href="${p.ghLink}"  target="_blank" rel="noopener" class="pf-modal-link secondary">GitHub ↗</a>` : '',
    ].filter(Boolean).join('');

    modalBody.innerHTML = `
        <div class="pf-carousel">
            <div class="pf-carousel-track"></div>
            <button class="pf-carousel-btn pf-carousel-prev">‹</button>
            <button class="pf-carousel-btn pf-carousel-next">›</button>
            <div class="pf-carousel-dots"></div>
        </div>
        <div class="pf-modal-header">
            <h2 class="pf-modal-title">${p.title}</h2>
            <span class="pf-modal-cat">
                <span class="pf-cat-dot" style="background:${color}"></span>${label}
            </span>
        </div>
        <p class="pf-modal-desc">${p.description}</p>
        <div class="pf-modal-section-label">Stack</div>
        <div class="pf-modal-tags">${p.stack.map(s => `<span class="pf-modal-tag">${s}</span>`).join('')}</div>
        <div class="pf-modal-section-label">What I learned</div>
        <div class="pf-modal-tags" style="margin-bottom:${links ? '28px' : '0'}">${p.learned.map(l => `<span class="pf-modal-tag">${l}</span>`).join('')}</div>
        ${links ? `<div class="pf-modal-links">${links}</div>` : ''}
    `;

    buildCarousel(
        modalBody.querySelector('.pf-carousel'),
        p.media, label, color,
        p.media.length === 0 ? p.webLink : null  // pass CTA link only when no media
    );

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalBody.querySelectorAll('video').forEach(v => v.pause());
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { if (!modal.classList.contains('open')) modalBody.innerHTML = ''; }, 300);
}

document.getElementById('pf-modal-bg').addEventListener('click', closeModal);
document.getElementById('pf-modal-close').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
