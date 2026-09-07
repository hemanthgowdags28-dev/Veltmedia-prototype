document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Sticky Navbar Effect ---
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // --- 2. Mobile Menu Toggle ---
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        // Animate hamburger lines into an 'X'
        hamburger.classList.toggle("toggle");
    });

    // Close menu when a link is clicked
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });

    // --- 3. Intersection Observer for Scroll Animations ---
    const animElements = document.querySelectorAll(".scroll-anim");
    
    const animObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger CSS transition
                entry.target.classList.add("is-visible");
                
                // If the element has a counter, trigger it
                const counters = entry.target.querySelectorAll(".counter");
                if (counters.length > 0) {
                    runCounters(counters);
                }
                
                // Unobserve after animating so it doesn't repeat unnecessarily
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    });

    // Staggered delays for grids (Services, Gallery)
    let delay = 0;
    animElements.forEach((el, index) => {
        // If element has 'stagger-up', add inline transition delay based on previous siblings
        if (el.classList.contains('stagger-up') || el.classList.contains('zoom-in')) {
            el.style.transitionDelay = `${delay}s`;
            delay += 0.15;
            // Reset delay if we suspect a new row/section (naive approach)
            if (delay > 0.6) delay = 0; 
        }
        animObserver.observe(el);
    });

    // --- 4. Number Counter Animation ---
    // This function animates numbers from 0 to target value
    function runCounters(counters) {
        counters.forEach(counter => {
            counter.innerText = '0';
            
            const updateCounter = () => {
                const target = +counter.getAttribute('data-target');
                const c = +counter.innerText;
                
                // Calculate increment logic based on target size
                const increment = target / 40; 
                
                if (c < target) {
                    counter.innerText = `${Math.ceil(c + increment)}`;
                    setTimeout(updateCounter, 30); // 30ms frame rate
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCounter();
        });
    }

    // --- 5. Custom Hover 3D Tilt Effect on Service Cards (Bonus Dynamics) ---
    const cards = document.querySelectorAll(".service-card, .gallery-item");
    
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation values
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg
            const rotateY = ((x - centerX) / centerX) * 5;  // max 5 deg
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener("mouseleave", () => {
            // Reset transforms on mouse leave
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            // Small timeout to allow css transition to take over
            setTimeout(() => {
                card.style.transition = "all 0.4s ease";
            }, 10);
        });
        
        card.addEventListener("mouseenter", () => {
            // Remove transition while moving to feel immediate
            card.style.transition = "none";
        });
    });

});
