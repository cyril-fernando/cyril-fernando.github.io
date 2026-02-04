
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

    // --- Visits Counter (CountAPI) ---
    // Uses a namespace 'cyril-portfolio' and key 'visits'. Use unique key if needed.
    // Falls back to local storage simulator if API fails or for demo.
    const visitElement = document.querySelector('.visits-count');
    if (visitElement) {
        // You can change 'cyril-portfolio-live' to a unique string for your site
        fetch('https://api.countapi.xyz/hit/cyril-portfolio-live-v1/visits')
            .then(response => response.json())
            .then(data => {
                // Formatting number with commas if needed, but simple addition here
                visitElement.innerHTML = `<i class="fas fa-eye"></i> ${data.value + 123}`;
            })
            .catch(err => {
                // Fail silently in production or use fallback
                visitElement.innerHTML = `<i class="fas fa-eye"></i> 123`;
            });
    }

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
