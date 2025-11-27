// Wait for window.load to ensure images are fully downloaded before calculating widths
window.addEventListener('load', () => {
    
    // --- Navigation Logic ---
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('is-active');
        });
    });

    // --- Bibtex Copy Logic ---
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const code = document.getElementById('bibtex-code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = 'Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            });
        });
    }

    // --- Carousel Logic ---
    const carousels = [
        { id: 'carousel-phone', autoScroll: true },
        { id: 'carousel-stereo', autoScroll: true },
        { id: 'carousel-mixed', autoScroll: true }
    ];

    carousels.forEach(carouselInfo => {
        const wrapper = document.getElementById(carouselInfo.id);
        if (!wrapper) return;

        const track = wrapper.querySelector('.carousel-track');
        let slides = Array.from(track.children);
        const nextBtn = wrapper.querySelector('.next-btn');
        const prevBtn = wrapper.querySelector('.prev-btn');

        if(slides.length === 0) return;

        // Clone logic for loop
        const cloneCount = slides.length; 
        
        // Append clones to end
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.classList.add('clone-end');
            track.appendChild(clone);
        });

        // Prepend clones to start
        slides.slice().reverse().forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.classList.add('clone-start');
            track.insertBefore(clone, track.firstChild);
        });

        // Refresh slides list
        let allSlides = Array.from(track.children);
        
        // Start at first real slide
        let currentIndex = cloneCount; 

        // Function to Calculate Offset based on variable widths
        const getOffset = (index) => {
            let offset = 0;
            for (let i = 0; i < index; i++) {
                const slide = allSlides[i];
                const style = window.getComputedStyle(slide);
                // Total width = width + margin-right
                offset += slide.getBoundingClientRect().width + (parseFloat(style.marginRight) || 0);
            }
            return offset;
        };
        
        const updateSlidePosition = (transition = true) => {
            const offset = getOffset(currentIndex);
            track.style.transition = transition ? 'transform 0.5s ease-in-out' : 'none';
            track.style.transform = `translateX(-${offset}px)`;
        };

        // Initialize position (no transition)
        updateSlidePosition(false);

        // Movement Logic
        const moveNext = () => {
            if (currentIndex >= allSlides.length - cloneCount) return;
            currentIndex++;
            updateSlidePosition();
            checkReset();
        };

        const movePrev = () => {
            if (currentIndex <= 0) return;
            currentIndex--;
            updateSlidePosition();
            checkReset();
        };

        const checkReset = () => {
            track.addEventListener('transitionend', () => {
                // Forward reset
                if (currentIndex >= allSlides.length - cloneCount) {
                    currentIndex = cloneCount;
                    updateSlidePosition(false);
                }
                // Backward reset
                if (currentIndex <= cloneCount - 1) {
                    // Logic: The distance from the start of the clones to current
                    const distFromStart = cloneCount - currentIndex; 
                    // Jump to end real slides
                    currentIndex = (allSlides.length - cloneCount) - distFromStart;
                    updateSlidePosition(false);
                }
            }, { once: true });
        };

        // Event Listeners
        if(nextBtn) nextBtn.addEventListener('click', () => { moveNext(); resetTimer(); });
        if(prevBtn) prevBtn.addEventListener('click', () => { movePrev(); resetTimer(); });

        // Auto Scroll
        let scrollInterval;
        const startTimer = () => {
            if(carouselInfo.autoScroll) {
                scrollInterval = setInterval(moveNext, 3500); // 3.5s for smoother read
            }
        };
        const resetTimer = () => {
            clearInterval(scrollInterval);
            startTimer();
        };

        startTimer();
        
        // Pause on hover
        wrapper.addEventListener('mouseenter', () => clearInterval(scrollInterval));
        wrapper.addEventListener('mouseleave', startTimer);

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            // Disable transition during resize to prevent weird jumping
            track.style.transition = 'none';
            resizeTimer = setTimeout(() => {
                updateSlidePosition(false);
            }, 100);
        });
    });
});