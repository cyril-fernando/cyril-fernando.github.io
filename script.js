/**
 * Portfolio Interactive Engine
 * - Smooth scroll behavior & accurate scroll-spy navigation tracking
 * - Live Global & session-persistent visitor counter
 * - Minimal image lightbox with keyboard escape
 * - 2D Physics Arcade Platform-Puzzle ("Red Ball: Analytics Run")
 */

(function () {
    'use strict';

    // 1. Smooth Navigation Scroll Handler
    document.querySelectorAll('.nav-item').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 2. Active Navigation Highlighting
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navItems = Array.from(document.querySelectorAll('.nav-item'));

    function updateActiveNav() {
        const scrollY = window.scrollY || window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollY + windowHeight >= documentHeight - 80) {
            navItems.forEach(item => {
                if (item.getAttribute('href') === '#contact') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            return;
        }

        let activeSectionId = null;
        for (let i = 0; i < sections.length; i++) {
            const sec = sections[i];
            const top = sec.offsetTop - 140;
            const height = sec.offsetHeight;
            if (scrollY >= top && scrollY < top + height) {
                activeSectionId = sec.getAttribute('id');
                break;
            }
        }

        if (activeSectionId) {
            navItems.forEach(item => {
                if (item.getAttribute('href') === `#${activeSectionId}`) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // 3. Live Global Visitor Counter (Public API + Local Fallback)
    const visitorEl = document.getElementById('visitor-count');
    if (visitorEl) {
        // Query live hit counter endpoint for cyril-fernando portfolio
        const namespace = 'cyril-fernando.github.io';
        const key = 'visits';

        fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)
            .then(res => res.json())
            .then(data => {
                if (data && data.count) {
                    visitorEl.textContent = data.count.toLocaleString();
                    localStorage.setItem('portfolio_last_global_count', data.count.toString());
                } else {
                    throw new Error('API invalid response');
                }
            })
            .catch(() => {
                // Graceful fallback to persistent storage
                let count = parseInt(localStorage.getItem('portfolio_last_global_count') || '342', 10);
                if (!sessionStorage.getItem('visited_this_session')) {
                    count += 1;
                    localStorage.setItem('portfolio_last_global_count', count.toString());
                    sessionStorage.setItem('visited_this_session', 'true');
                }
                visitorEl.textContent = count.toLocaleString();
            });
    }

    // 5. Lightbox Modal (Images & Video Demos)
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalVideo = document.getElementById('lightbox-video');
    const modalCloseBtn = document.getElementById('lightbox-close-btn');

    if (modal) {
        const closeModal = () => {
            modal.classList.remove('active');
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.removeAttribute('src');
                modalVideo.load();
                modalVideo.style.display = 'none';
            }
            if (modalImg) {
                modalImg.removeAttribute('src');
                modalImg.style.display = 'none';
            }
            document.body.style.overflow = '';
        };

        // Images preview
        document.querySelectorAll('.card-media img').forEach(img => {
            img.addEventListener('click', () => {
                if (modalVideo) {
                    modalVideo.pause();
                    modalVideo.removeAttribute('src');
                    modalVideo.load();
                    modalVideo.style.display = 'none';
                }
                if (modalImg) {
                    modalImg.src = img.src;
                    modalImg.alt = img.alt || 'Project Preview';
                    modalImg.style.display = 'block';
                }
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Videos preview (Indeed Date Scout & other media)
        document.querySelectorAll('.clickable-media').forEach(mediaWrap => {
            mediaWrap.addEventListener('click', function (e) {
                const videoSrc = this.getAttribute('data-video-src') || 'img/indeed-date-reveal-demo.mp4';
                if (modalImg) {
                    modalImg.removeAttribute('src');
                    modalImg.style.display = 'none';
                }
                if (modalVideo) {
                    modalVideo.style.display = 'block';
                    modalVideo.src = videoSrc;
                    modalVideo.load();
                    modalVideo.currentTime = 0;
                    const playPromise = modalVideo.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(() => {
                            // Autoplay without user direct gesture on video element may be muted by browser policy
                        });
                    }
                }
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal();
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-inner-media')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // ==========================================================================
    // 6. Interactive 2D Physics Puzzle: Red Ball Analytics Run
    // ==========================================================================
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const hudStage = document.getElementById('hud-stage-name');
        const hudStars = document.getElementById('hud-stars');
        const hudStatus = document.getElementById('hud-status');
        const resetBtn = document.getElementById('game-reset-btn');
        const soundBtn = document.getElementById('game-sound-btn');
        const soundLabel = document.getElementById('sound-icon-label');
        const levelTabs = document.querySelectorAll('.level-tab');

        // Modal Theater Elements
        const arcadeModal = document.getElementById('arcade-modal');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalSoundBtn = document.getElementById('modal-sound-btn');
        const modalResetBtn = document.getElementById('modal-reset-btn');
        const modalCanvasHost = document.getElementById('arcade-modal-canvas-host');
        const sidebarTriggerBtn = document.getElementById('btn-open-arcade-modal');
        const cardExpandBtn = document.getElementById('btn-card-expand-arcade');
        const mobileTriggerBtn = document.getElementById('btn-mobile-arcade');
        const viewportWrap = document.querySelector('.game-viewport-wrap');
        const cardBodyGame = document.querySelector('#arcade-game-container .card-body');

        // Web Audio Synthesizer
        let audioCtx = null;
        let soundEnabled = localStorage.getItem('redball_sound') !== 'false';

        function initAudio() {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) audioCtx = new AudioContextClass();
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        function updateSoundUI() {
            const label = soundEnabled ? '🔊 SFX ON' : '🔇 SFX OFF';
            if (soundLabel) soundLabel.textContent = label;
            if (modalSoundBtn) modalSoundBtn.textContent = label;
        }

        function toggleSound() {
            soundEnabled = !soundEnabled;
            localStorage.setItem('redball_sound', soundEnabled ? 'true' : 'false');
            updateSoundUI();
            if (soundEnabled) initAudio();
        }

        if (soundBtn) soundBtn.addEventListener('click', toggleSound);
        if (modalSoundBtn) modalSoundBtn.addEventListener('click', toggleSound);
        updateSoundUI();

        function playSound(type) {
            if (!soundEnabled) return;
            initAudio();
            if (!audioCtx) return;

            try {
                const t = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                if (type === 'jump') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(180, t);
                    osc.frequency.exponentialRampToValueAtTime(420, t + 0.12);
                    gain.gain.setValueAtTime(0.2, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
                    osc.start(t);
                    osc.stop(t + 0.12);
                } else if (type === 'star') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(587.33, t); // D5
                    osc.frequency.setValueAtTime(880, t + 0.08); // A5
                    gain.gain.setValueAtTime(0.25, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
                    osc.start(t);
                    osc.stop(t + 0.22);
                } else if (type === 'switch') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(320, t);
                    osc.frequency.exponentialRampToValueAtTime(640, t + 0.1);
                    gain.gain.setValueAtTime(0.15, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                    osc.start(t);
                    osc.stop(t + 0.15);
                } else if (type === 'spring') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(200, t);
                    osc.frequency.exponentialRampToValueAtTime(680, t + 0.18);
                    gain.gain.setValueAtTime(0.25, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
                    osc.start(t);
                    osc.stop(t + 0.18);
                } else if (type === 'hazard') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(160, t);
                    osc.frequency.exponentialRampToValueAtTime(70, t + 0.2);
                    gain.gain.setValueAtTime(0.25, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                    osc.start(t);
                    osc.stop(t + 0.2);
                } else if (type === 'win') {
                    const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
                    notes.forEach((freq, idx) => {
                        const subOsc = audioCtx.createOscillator();
                        const subGain = audioCtx.createGain();
                        subOsc.type = 'triangle';
                        subOsc.frequency.setValueAtTime(freq, t + idx * 0.08);
                        subGain.gain.setValueAtTime(0.22, t + idx * 0.08);
                        subGain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.2);
                        subOsc.connect(subGain);
                        subGain.connect(audioCtx.destination);
                        subOsc.start(t + idx * 0.08);
                        subOsc.stop(t + idx * 0.08 + 0.2);
                    });
                }
            } catch (_) {}
        }

        // Expand / Collapse Modal Theater
        function openArcadeModal() {
            if (!arcadeModal || !viewportWrap) return;
            initAudio();
            modalCanvasHost.appendChild(viewportWrap);
            arcadeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => canvas.focus(), 50);
        }

        function closeArcadeModal() {
            if (!arcadeModal || !viewportWrap) return;
            arcadeModal.classList.remove('active');
            document.body.style.overflow = '';
            // Re-parent back to in-page card
            if (cardBodyGame) {
                const footerInfo = cardBodyGame.querySelector('.game-footer-info');
                cardBodyGame.insertBefore(viewportWrap, footerInfo);
            }
        }

        if (sidebarTriggerBtn) sidebarTriggerBtn.addEventListener('click', openArcadeModal);
        if (cardExpandBtn) cardExpandBtn.addEventListener('click', openArcadeModal);
        if (mobileTriggerBtn) mobileTriggerBtn.addEventListener('click', openArcadeModal);
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeArcadeModal);
        if (modalResetBtn) modalResetBtn.addEventListener('click', () => {
            loadLevel(currentLevelIdx);
            canvas.focus();
        });

        if (arcadeModal) {
            arcadeModal.addEventListener('click', (e) => {
                if (e.target === arcadeModal) closeArcadeModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && arcadeModal && arcadeModal.classList.contains('active')) {
                closeArcadeModal();
            }
        });

        // Game Physics & Level Data
        let currentLevelIdx = 0;
        let particles = [];
        let starsCollected = 0;
        let stageCleared = false;

        const keys = { left: false, right: false, jump: false };

        const ball = {
            x: 50,
            y: 200,
            vx: 0,
            vy: 0,
            radius: 11,
            rotation: 0,
            onGround: false,
            groundPlatform: null
        };

        // 5 Handcrafted Progressive Puzzle Levels
        const levels = [
            {
                name: "01: Ingest",
                ballStart: { x: 45, y: 220 },
                portal: { x: 550, y: 225, r: 16 },
                platforms: [
                    { x: 0, y: 260, w: 180, h: 60 },
                    { x: 230, y: 260, w: 370, h: 60 },
                    { x: 280, y: 200, w: 80, h: 14 }
                ],
                movingPlatforms: [],
                switches: [],
                doors: [],
                springs: [],
                hazards: [
                    { x: 180, y: 300, w: 50, h: 20 }
                ],
                stars: [
                    { x: 140, y: 230, collected: false },
                    { x: 320, y: 170, collected: false },
                    { x: 460, y: 230, collected: false }
                ]
            },
            {
                name: "02: Pipeline",
                ballStart: { x: 45, y: 220 },
                portal: { x: 550, y: 125, r: 16 },
                platforms: [
                    { x: 0, y: 260, w: 120, h: 60 },
                    { x: 480, y: 160, w: 120, h: 160 }
                ],
                movingPlatforms: [
                    { x: 150, y: 250, w: 75, h: 14, minX: 140, maxX: 260, minY: 250, maxY: 250, vx: 1.2, vy: 0 },
                    { x: 300, y: 240, w: 80, h: 14, minX: 300, maxX: 300, minY: 170, maxY: 250, vx: 0, vy: -1.0 },
                    { x: 400, y: 180, w: 60, h: 14, minX: 390, maxX: 450, minY: 180, maxY: 180, vx: 0.9, vy: 0 }
                ],
                switches: [],
                doors: [],
                springs: [],
                hazards: [
                    { x: 120, y: 305, w: 360, h: 15 }
                ],
                stars: [
                    { x: 200, y: 215, collected: false },
                    { x: 300, y: 135, collected: false },
                    { x: 420, y: 145, collected: false }
                ]
            },
            {
                name: "03: Gateway",
                ballStart: { x: 45, y: 220 },
                portal: { x: 550, y: 225, r: 16 },
                platforms: [
                    { x: 0, y: 260, w: 160, h: 60 },
                    { x: 40, y: 140, w: 100, h: 14 },
                    { x: 240, y: 260, w: 360, h: 60 }
                ],
                movingPlatforms: [
                    { x: 170, y: 220, w: 60, h: 14, minX: 170, maxX: 170, minY: 150, maxY: 240, vx: 0, vy: -1.2 }
                ],
                switches: [
                    { id: 'gate1', x: 80, y: 130, w: 26, h: 10, pressed: false }
                ],
                doors: [
                    { switchId: 'gate1', x: 370, y: 170, w: 16, h: 90, active: true }
                ],
                springs: [
                    { x: 20, y: 250, w: 22, h: 10 }
                ],
                hazards: [
                    { x: 160, y: 305, w: 80, h: 15 }
                ],
                stars: [
                    { x: 90, y: 90, collected: false },
                    { x: 290, y: 230, collected: false },
                    { x: 480, y: 230, collected: false }
                ]
            },
            {
                name: "04: Anomaly",
                ballStart: { x: 40, y: 220 },
                portal: { x: 555, y: 100, r: 16 },
                platforms: [
                    { x: 0, y: 260, w: 100, h: 60 },
                    { x: 220, y: 170, w: 90, h: 14 },
                    { x: 490, y: 140, w: 110, h: 180 }
                ],
                movingPlatforms: [
                    { x: 340, y: 150, w: 70, h: 14, minX: 330, maxX: 450, minY: 150, maxY: 150, vx: 1.4, vy: 0 }
                ],
                switches: [
                    { id: 'laser1', x: 260, y: 160, w: 24, h: 10, pressed: false }
                ],
                doors: [
                    { switchId: 'laser1', x: 500, y: 60, w: 14, h: 80, active: true }
                ],
                springs: [
                    { x: 60, y: 250, w: 22, h: 10 }
                ],
                hazards: [
                    { x: 100, y: 305, w: 390, h: 15 },
                    { x: 245, y: 190, w: 40, h: 10 }
                ],
                stars: [
                    { x: 150, y: 100, collected: false },
                    { x: 265, y: 130, collected: false },
                    { x: 390, y: 110, collected: false }
                ]
            },
            {
                name: "05: Deploy",
                ballStart: { x: 40, y: 220 },
                portal: { x: 550, y: 75, r: 16 },
                platforms: [
                    { x: 0, y: 260, w: 110, h: 60 },
                    { x: 480, y: 110, w: 120, h: 210 },
                    { x: 180, y: 130, w: 90, h: 14 },
                    { x: 330, y: 80, w: 80, h: 14 }
                ],
                movingPlatforms: [
                    { x: 120, y: 240, w: 60, h: 14, minX: 120, maxX: 120, minY: 140, maxY: 250, vx: 0, vy: -1.2 },
                    { x: 270, y: 120, w: 60, h: 14, minX: 260, maxX: 330, minY: 120, maxY: 120, vx: 1.1, vy: 0 }
                ],
                switches: [
                    { id: 'gateA', x: 220, y: 120, w: 22, h: 10, pressed: false },
                    { id: 'gateB', x: 360, y: 70, w: 22, h: 10, pressed: false }
                ],
                doors: [
                    { switchId: 'gateA', x: 300, y: 15, w: 14, h: 65, active: true },
                    { switchId: 'gateB', x: 510, y: 30, w: 14, h: 80, active: true }
                ],
                springs: [
                    { x: 35, y: 250, w: 22, h: 10 }
                ],
                hazards: [
                    { x: 110, y: 305, w: 370, h: 15 }
                ],
                stars: [
                    { x: 150, y: 180, collected: false },
                    { x: 225, y: 90, collected: false },
                    { x: 370, y: 40, collected: false }
                ]
            }
        ];

        let currentLevel = null;

        function loadLevel(idx) {
            currentLevelIdx = Math.max(0, Math.min(idx, levels.length - 1));
            currentLevel = JSON.parse(JSON.stringify(levels[currentLevelIdx]));
            ball.x = currentLevel.ballStart.x;
            ball.y = currentLevel.ballStart.y;
            ball.vx = 0;
            ball.vy = 0;
            ball.rotation = 0;
            ball.onGround = false;
            ball.groundPlatform = null;
            starsCollected = 0;
            stageCleared = false;
            particles = [];

            if (hudStage) hudStage.textContent = currentLevel.name;
            if (hudStars) hudStars.textContent = `★ 0 / ${currentLevel.stars.length}`;
            if (hudStatus) {
                hudStatus.textContent = 'RUNNING';
                hudStatus.style.color = '#10b981';
            }

            levelTabs.forEach((tab, i) => {
                if (i === currentLevelIdx) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }

        levelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const lvl = parseInt(tab.getAttribute('data-level'), 10);
                loadLevel(lvl);
                canvas.focus();
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                loadLevel(currentLevelIdx);
                canvas.focus();
            });
        }

        // Particle System
        function spawnParticles(x, y, color, count = 12) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.2 + Math.random() * 3.5;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 0.5,
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.03,
                    color,
                    size: 2.5 + Math.random() * 2.5
                });
            }
        }

        let isGameFocused = false;

        function focusGame() {
            isGameFocused = true;
            if (canvas) canvas.focus();
        }

        if (canvas) {
            canvas.addEventListener('click', focusGame);
            canvas.addEventListener('focus', () => { isGameFocused = true; });
            canvas.addEventListener('blur', () => {
                if (!arcadeModal || !arcadeModal.classList.contains('active')) {
                    isGameFocused = false;
                }
            });
        }

        if (viewportWrap) {
            viewportWrap.addEventListener('click', focusGame);
        }

        document.addEventListener('click', (e) => {
            const inCard = e.target.closest && (e.target.closest('.interactive-playground-card') || e.target.closest('#arcade-modal'));
            if (!inCard) {
                isGameFocused = false;
            }
        });

        // Keyboard Event Listeners
        window.addEventListener('keydown', (e) => {
            const code = e.code;
            const isModalActive = arcadeModal && arcadeModal.classList.contains('active');
            const isGameActive = isGameFocused || document.activeElement === canvas || isModalActive;

            // Scroll lock: Prevent default browser scroll on arrow keys and space when game is active or focused
            if (isGameActive && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
                e.preventDefault();
            }

            if (['ArrowLeft', 'KeyA'].includes(code)) {
                keys.left = true;
                initAudio();
            }
            if (['ArrowRight', 'KeyD'].includes(code)) {
                keys.right = true;
                initAudio();
            }
            if (['ArrowUp', 'KeyW', 'Space'].includes(code)) {
                keys.jump = true;
                initAudio();
            }
        });

        window.addEventListener('keyup', (e) => {
            const code = e.code;
            if (['ArrowLeft', 'KeyA'].includes(code)) keys.left = false;
            if (['ArrowRight', 'KeyD'].includes(code)) keys.right = false;
            if (['ArrowUp', 'KeyW', 'Space'].includes(code)) keys.jump = false;
        });

        // Touch Control Listeners
        const touchLeft = document.getElementById('touch-left');
        const touchRight = document.getElementById('touch-right');
        const touchJump = document.getElementById('touch-jump');

        function bindTouch(el, keyName) {
            if (!el) return;
            const start = (e) => {
                e.preventDefault();
                keys[keyName] = true;
                initAudio();
            };
            const end = (e) => {
                e.preventDefault();
                keys[keyName] = false;
            };
            el.addEventListener('touchstart', start, { passive: false });
            el.addEventListener('touchend', end, { passive: false });
            el.addEventListener('mousedown', start);
            el.addEventListener('mouseup', end);
            el.addEventListener('mouseleave', end);
        }

        bindTouch(touchLeft, 'left');
        bindTouch(touchRight, 'right');
        bindTouch(touchJump, 'jump');

        // Physics Update Loop
        function updatePhysics() {
            if (!currentLevel || stageCleared) return;

            // 1. Update Moving Platforms
            currentLevel.movingPlatforms.forEach(mp => {
                mp.x += mp.vx;
                mp.y += mp.vy;
                if (mp.x < mp.minX || mp.x > mp.maxX) mp.vx *= -1;
                if (mp.y < mp.minY || mp.y > mp.maxY) mp.vy *= -1;
            });

            // 2. Horizontal Acceleration & Friction
            if (keys.left) {
                ball.vx -= 0.52;
            }
            if (keys.right) {
                ball.vx += 0.52;
            }

            ball.vx = Math.max(-4.5, Math.min(4.5, ball.vx));
            ball.vx *= ball.onGround ? 0.92 : 0.98;

            // Jump
            if (keys.jump && ball.onGround) {
                ball.vy = -8.5;
                ball.onGround = false;
                playSound('jump');
                spawnParticles(ball.x, ball.y + ball.radius, '#71717a', 6);
            }

            // Gravity
            ball.vy += 0.42;
            if (ball.vy > 9) ball.vy = 9;

            // Roll Rotation
            ball.rotation += ball.vx * 0.08;

            // Integrate Position
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Canvas Boundary Constraints
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.vx = 0;
            }
            if (ball.x + ball.radius > canvas.width) {
                ball.x = canvas.width - ball.radius;
                ball.vx = 0;
            }

            ball.onGround = false;

            const solidBlocks = [
                ...currentLevel.platforms,
                ...currentLevel.movingPlatforms,
                ...currentLevel.doors.filter(d => d.active)
            ];

            // 3. Platform & Wall Collisions
            solidBlocks.forEach(rect => {
                const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
                const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));

                const distX = ball.x - closestX;
                const distY = ball.y - closestY;
                const distSq = distX * distX + distY * distY;

                if (distSq < ball.radius * ball.radius) {
                    const dist = Math.sqrt(distSq) || 0.001;
                    const overlap = ball.radius - dist;
                    const nx = distX / dist;
                    const ny = distY / dist;

                    ball.x += nx * overlap;
                    ball.y += ny * overlap;

                    const vDotN = ball.vx * nx + ball.vy * ny;
                    if (vDotN < 0) {
                        ball.vx -= vDotN * nx;
                        ball.vy -= vDotN * ny;
                    }

                    if (ny < -0.6) {
                        ball.onGround = true;
                        if (rect.vx || rect.vy) {
                            ball.x += rect.vx;
                            ball.y += rect.vy;
                        }
                    }
                }
            });

            // 4. Springs (Bouncy pad)
            currentLevel.springs.forEach(sp => {
                if (
                    ball.x + ball.radius > sp.x &&
                    ball.x - ball.radius < sp.x + sp.w &&
                    ball.y + ball.radius >= sp.y &&
                    ball.y - ball.radius <= sp.y + sp.h &&
                    ball.vy > 0
                ) {
                    ball.vy = -12.0;
                    ball.y = sp.y - ball.radius;
                    playSound('spring');
                    spawnParticles(sp.x + sp.w / 2, sp.y, '#f59e0b', 14);
                }
            });

            // 5. Switches & Pressure Plates
            currentLevel.switches.forEach(sw => {
                if (
                    ball.x + ball.radius > sw.x &&
                    ball.x - ball.radius < sw.x + sw.w &&
                    ball.y + ball.radius >= sw.y &&
                    ball.y - ball.radius <= sw.y + sw.h + 4
                ) {
                    if (!sw.pressed) {
                        sw.pressed = true;
                        playSound('switch');
                        spawnParticles(sw.x + sw.w / 2, sw.y, '#10b981', 12);
                        currentLevel.doors.forEach(d => {
                            if (d.switchId === sw.id) d.active = false;
                        });
                    }
                }
            });

            // 6. Stars Collection
            currentLevel.stars.forEach(star => {
                if (!star.collected) {
                    const dx = ball.x - star.x;
                    const dy = ball.y - star.y;
                    if (Math.hypot(dx, dy) < ball.radius + 10) {
                        star.collected = true;
                        starsCollected += 1;
                        playSound('star');
                        spawnParticles(star.x, star.y, '#f59e0b', 16);
                        if (hudStars) hudStars.textContent = `★ ${starsCollected} / ${currentLevel.stars.length}`;
                    }
                }
            });

            // 7. Hazard Collision & Respawn
            currentLevel.hazards.forEach(hz => {
                if (
                    ball.x + ball.radius > hz.x &&
                    ball.x - ball.radius < hz.x + hz.w &&
                    ball.y + ball.radius > hz.y &&
                    ball.y - ball.radius < hz.y + hz.h
                ) {
                    playSound('hazard');
                    spawnParticles(ball.x, ball.y, '#ef4444', 20);
                    ball.x = currentLevel.ballStart.x;
                    ball.y = currentLevel.ballStart.y;
                    ball.vx = 0;
                    ball.vy = 0;
                }
            });

            // Pit Fall
            if (ball.y > canvas.height + 30) {
                playSound('hazard');
                ball.x = currentLevel.ballStart.x;
                ball.y = currentLevel.ballStart.y;
                ball.vx = 0;
                ball.vy = 0;
            }

            // 8. Goal Portal Check
            const p = currentLevel.portal;
            const pDist = Math.hypot(ball.x - p.x, ball.y - p.y);
            if (pDist < ball.radius + p.r && !stageCleared) {
                stageCleared = true;
                playSound('win');
                spawnParticles(p.x, p.y, '#10b981', 35);
                spawnParticles(p.x, p.y, '#f59e0b', 25);
                if (hudStatus) {
                    hudStatus.textContent = 'STAGE CLEARED!';
                    hudStatus.style.color = '#10b981';
                }

                setTimeout(() => {
                    if (currentLevelIdx < levels.length - 1) {
                        loadLevel(currentLevelIdx + 1);
                    } else {
                        if (hudStatus) {
                            hudStatus.textContent = 'ALL STAGES COMPLETE!';
                            hudStatus.style.color = '#10b981';
                        }
                    }
                }, 1400);
            }

            // 9. Update Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const pt = particles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.vy += 0.08;
                pt.life -= pt.decay;
                if (pt.life <= 0) particles.splice(i, 1);
            }
        }

        // Render Frame Loop - Pure Light Minimal Monochrome Portfolio Aesthetic
        let animTime = 0;

        function drawGame() {
            animTime += 0.03;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Light clean canvas background
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Halftone Dot Grid
            ctx.fillStyle = 'rgba(10, 10, 10, 0.07)';
            for (let x = 12; x < canvas.width; x += 20) {
                for (let y = 12; y < canvas.height; y += 20) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (!currentLevel) return;

            // 1. Hazards (Spikes)
            currentLevel.hazards.forEach(hz => {
                ctx.fillStyle = '#ef4444';
                const count = Math.floor(hz.w / 12);
                for (let i = 0; i < count; i++) {
                    const sx = hz.x + i * 12;
                    ctx.beginPath();
                    ctx.moveTo(sx, hz.y + hz.h);
                    ctx.lineTo(sx + 6, hz.y);
                    ctx.lineTo(sx + 12, hz.y + hz.h);
                    ctx.closePath();
                    ctx.fill();
                }
            });

            // 2. Platforms (Ink Solid Blocks with Hairline Edges)
            const allPlats = [...currentLevel.platforms, ...currentLevel.movingPlatforms];
            allPlats.forEach(p => {
                // Drop shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(p.x + 2, p.y + 2, p.w, p.h);

                // Main body
                ctx.fillStyle = '#18181b';
                ctx.fillRect(p.x, p.y, p.w, p.h);

                // Border
                ctx.strokeStyle = '#27272a';
                ctx.lineWidth = 1;
                ctx.strokeRect(p.x, p.y, p.w, p.h);

                // Subtle top edge highlight
                ctx.fillStyle = p.vx !== undefined ? '#10b981' : '#525252';
                ctx.fillRect(p.x, p.y, p.w, 2);
            });

            // 3. Security Laser Doors
            currentLevel.doors.forEach(d => {
                if (d.active) {
                    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
                    ctx.fillRect(d.x, d.y, d.w, d.h);
                    ctx.strokeStyle = '#dc2626';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(d.x, d.y, d.w, d.h);

                    // Pulse scanline
                    ctx.fillStyle = '#ffffff';
                    const py = d.y + (Math.sin(animTime * 6) * 0.5 + 0.5) * (d.h - 4);
                    ctx.fillRect(d.x, py, d.w, 2);
                }
            });

            // 4. Pressure Switches
            currentLevel.switches.forEach(sw => {
                ctx.fillStyle = sw.pressed ? '#10b981' : '#f59e0b';
                const h = sw.pressed ? 4 : sw.h;
                const y = sw.pressed ? sw.y + 6 : sw.y;
                ctx.fillRect(sw.x, y, sw.w, h);
                ctx.strokeStyle = '#0a0a0a';
                ctx.lineWidth = 1;
                ctx.strokeRect(sw.x, y, sw.w, h);
            });

            // 5. Springs
            currentLevel.springs.forEach(sp => {
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(sp.x, sp.y, sp.w, sp.h);
                ctx.strokeStyle = '#b45309';
                ctx.strokeRect(sp.x, sp.y, sp.w, sp.h);
            });

            // 6. Stars
            currentLevel.stars.forEach(star => {
                if (!star.collected) {
                    ctx.save();
                    ctx.translate(star.x, star.y + Math.sin(animTime * 3) * 2.5);
                    ctx.rotate(animTime * 1.5);
                    ctx.fillStyle = '#f59e0b';
                    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    const spikes = 5;
                    const outerRadius = 8;
                    const innerRadius = 4;
                    for (let i = 0; i < spikes * 2; i++) {
                        const r = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (i * Math.PI) / spikes;
                        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }
            });

            // 7. Goal Portal (Emerald Vortex)
            const pt = currentLevel.portal;
            ctx.save();
            ctx.translate(pt.x, pt.y);
            ctx.rotate(animTime * 2);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
            ctx.beginPath();
            ctx.arc(0, 0, pt.r + 4 + Math.sin(animTime * 4) * 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, pt.r, 0, Math.PI * 1.5);
            ctx.stroke();

            ctx.fillStyle = '#0a0a0a';
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 8. Particles
            particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // 9. Red Ball
            ctx.save();
            ctx.translate(ball.x, ball.y);
            ctx.rotate(ball.rotation);

            // Ground Contact Drop Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.ellipse(0, ball.radius + 1, ball.radius * 0.8, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Vibrant 3D Red Sphere
            const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, ball.radius);
            grad.addColorStop(0, '#f87171');
            grad.addColorStop(0.3, '#ef4444');
            grad.addColorStop(0.85, '#b91c1c');
            grad.addColorStop(1, '#7f1d1d');

            ctx.fillStyle = grad;
            ctx.shadowColor = 'rgba(239, 68, 68, 0.3)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
            ctx.fill();

            // Specular Reflection
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(-3.5, -3.5, 3, 0, Math.PI * 2);
            ctx.fill();

            // Subtle Roll Detail
            ctx.strokeStyle = 'rgba(127, 29, 29, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, ball.radius - 2.5, -0.4, 0.4);
            ctx.stroke();

            ctx.restore();
        }

        function gameLoop() {
            updatePhysics();
            drawGame();
            requestAnimationFrame(gameLoop);
        }

        // Initialize Level 1
        loadLevel(0);
        requestAnimationFrame(gameLoop);
    }
})();
