
document.addEventListener('DOMContentLoaded', function () {

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Subtle Ambient Mouse Glow ---
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        requestAnimationFrame(() => {
            document.body.style.setProperty('--mouse-x', `${x}px`);
            document.body.style.setProperty('--mouse-y', `${y}px`);
        });
    });


    // --- Theme Toggle Logic ---
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn.querySelector('i');

    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');

        const isLight = document.body.classList.contains('light-mode');

        // Update Icon
        if (isLight) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

});
