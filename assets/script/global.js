document.addEventListener("DOMContentLoaded", function () {

    // ── Active nav link ──
    const links = document.querySelectorAll(".navigation a");
    const currentPath = window.location.pathname.replace(/\/$/, "").split("/").pop() || "";

    links.forEach(link => {
        const href = link.getAttribute("href");
        const linkPath = href.replace(/\/$/, "").split("/").pop() || "";
        if (currentPath === linkPath || (currentPath === "" && (linkPath === "" || href === "/"))) {
            link.classList.add("active");
        }
    });

    // ── Hamburger menu ──
    const hamburger = document.querySelector(".hamburger");
    const navigation = document.querySelector(".navigation");

    if (hamburger && navigation) {
        hamburger.addEventListener("click", function () {
            hamburger.classList.toggle("open");
            navigation.classList.toggle("open");
        });

        navigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("open");
                navigation.classList.remove("open");
            });
        });

        document.addEventListener("click", function (e) {
            if (!hamburger.contains(e.target) && !navigation.contains(e.target)) {
                hamburger.classList.remove("open");
                navigation.classList.remove("open");
            }
        });
    }

    // ── Nav scroll style ──
    const nav = document.querySelector("nav");
    if (nav) {
        const onScroll = () => {
            nav.classList.toggle("scrolled", window.scrollY > 20);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    // ── Cursor glow ──
    const glow = document.querySelector(".cursor-glow");
    if (glow) {
        document.addEventListener("mousemove", e => {
            glow.style.left = e.clientX + "px";
            glow.style.top  = e.clientY + "px";
        });
    }

    // ── Reveal on scroll (IntersectionObserver) ──
    const revealEls = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-scale, .edu-item, .exp-item"
    );
    if (revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

        revealEls.forEach(el => io.observe(el));
    }

    // ── Tilt on hover for cards (subtle 3D feel) ──
    const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (hasMouse) {
        document.querySelectorAll("[data-tilt]").forEach(card => {
            card.addEventListener("mousemove", e => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width  - 0.5;
                const y = (e.clientY - rect.top)  / rect.height - 0.5;
                card.style.transform = `perspective(700px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
            });
            card.addEventListener("mouseleave", () => {
                card.style.transition = "transform 0.4s ease";
                card.style.transform  = "";
                setTimeout(() => { card.style.transition = ""; }, 400);
            });
        });
    }

    // ── Typing effect ──
    const typingEl = document.querySelector("[data-typing]");
    if (typingEl) {
        const words = typingEl.getAttribute("data-typing").split(",").map(w => w.trim());
        let wordIdx = 0, charIdx = 0, deleting = false;

        function type() {
            const word = words[wordIdx];
            if (!deleting) {
                charIdx++;
                typingEl.textContent = word.slice(0, charIdx);
                if (charIdx === word.length) {
                    deleting = true;
                    setTimeout(type, 2000);
                    return;
                }
            } else {
                charIdx--;
                typingEl.textContent = word.slice(0, charIdx);
                if (charIdx === 0) {
                    deleting = false;
                    wordIdx = (wordIdx + 1) % words.length;
                }
            }
            setTimeout(type, deleting ? 50 : 95);
        }
        setTimeout(type, 600);
    }

    // ── Skill bar animate on view ──
    const skillBars = document.querySelectorAll(".skill-fill");
    if (skillBars.length) {
        skillBars.forEach(b => { b.style.width = "0"; });

        const barIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const inlineStyle = bar.getAttribute("style") || "";
                    const match = inlineStyle.match(/--w\s*:\s*([^;]+)/);
                    const targetW = match ? match[1].trim() : getComputedStyle(bar).getPropertyValue("--w").trim();
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            bar.style.width = targetW;
                        }, 150);
                    });
                    barIO.unobserve(bar);
                }
            });
        }, { threshold: 0.3 });

        skillBars.forEach(b => barIO.observe(b));
    }

    // ── Number counter animate ──
    document.querySelectorAll("[data-count]").forEach(el => {
        const target = parseInt(el.getAttribute("data-count"), 10);
        const suffix = el.dataset.suffix || "";
        const countIO = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                let start = 0;
                const duration = 1200;
                const steps = 50;
                const increment = target / steps;
                const interval = duration / steps;
                const timer = setInterval(() => {
                    start = Math.min(Math.round(start + increment), target);
                    el.textContent = start + suffix;
                    if (start >= target) clearInterval(timer);
                }, interval);
                countIO.unobserve(el);
            }
        }, { threshold: 0.5 });
        countIO.observe(el);
    });

    // ── Page transition: fade in on load ──
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.4s ease";
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.style.opacity = "1";
        });
    });

    // ── Page transition: fade out on link click (FIXED FOR MOBILE NAVIGATION) ──
    document.querySelectorAll("a[href]").forEach(a => {
        const href = a.getAttribute("href");
        if (
            href &&
            !href.startsWith("#") &&
            !href.startsWith("mailto:") &&
            !href.startsWith("tel:") &&
            !a.target &&
            !a.hasAttribute("data-no-transition")
        ) {
            a.addEventListener("click", function (e) {
                // Jika menu mobile sedang terbuka, tutup menunya terlebih dahulu sebelum transisi halaman berjalan
                if (navigation && navigation.classList.contains("open")) {
                    hamburger.classList.remove("open");
                    navigation.classList.remove("open");
                }
                
                e.preventDefault();
                document.body.style.opacity = "0";
                setTimeout(() => {
                    window.location.href = href;
                }, 320);
            });
        }
    });

    // ── Particle background for pages ──
    const particlesCanvas = document.getElementById("particles-js");
    if (particlesCanvas && typeof particlesJS === "function") {
        particlesJS("particles-js", {
            particles: {
                number: { value: 70, density: { enable: true, value_area: 900 } },
                color: { value: "#ffffff" },
                shape: { type: "circle", stroke: { width: 0, color: "#ffffff" }, polygon: { nb_sides: 5 } },
                opacity: { value: 0.48, random: true, anim: { enable: true, speed: 1.2, opacity_min: 0.18, sync: false } },
                size: { value: 3.2, random: true, anim: { enable: true, speed: 4, size_min: 0.22, sync: false } },
                line_linked: { enable: true, distance: 160, color: "#c0392b", opacity: 0.2, width: 1.2 },
                move: { enable: true, speed: 1.5, direction: "none", random: false, straight: false, out_mode: "out", bounce: false, attract: { enable: false } }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 180, line_linked: { opacity: 0.42 } },
                    bubble: { distance: 220, size: 10, duration: 0.4, opacity: 0.55, speed: 3 },
                    repulse: { distance: 220, duration: 0.4 },
                    push: { particles_nb: 4 },
                    remove: { particles_nb: 2 }
                }
            },
            retina_detect: true
        });
    }

    // ── Ratings System Logic ──
    async function fetchRatingSummary() {
        try {
            const response = await fetch("/api/ratings");
            if (!response.ok) throw new Error("Failed to load rating summary");
            return response.json();
        } catch (error) {
            console.error(error);
            return { count: 0, sum: 0, last: 0, average: 0 };
        }
    }

    async function postRating(value, email, comment) {
        try {
            const response = await fetch("/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: value, email, comment })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Unable to submit rating.");
            }
            return response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    function renderStars(rating) {
        const stars = [];
        const rounded = Math.round(rating);
        for (let i = 1; i <= 5; i++) {
            const active = i <= rounded ? "active" : "";
            stars.push(`<span class="${active}">★</span>`);
        }
        return stars.join("");
    }

    async function updateRatingSummary() {
        const data = await fetchRatingSummary();
        document.querySelectorAll("[data-rating-summary]").forEach(el => {
            if (data.count > 0) {
                el.classList.remove("empty");
                el.innerHTML = `
                    <div class="rating-summary-score">${data.average.toFixed(1)}<span>/ 5</span></div>
                    <div class="rating-summary-stars">${renderStars(data.average)}</div>
                    <div class="rating-summary-meta">Based on ${data.count} visitor rating${data.count === 1 ? "" : "s"}.</div>
                `;
            } else {
                el.classList.add("empty");
                el.innerHTML = "<div>No visitor rating yet. Share your feedback on the contact page.</div>";
            }
        });
    }

    const ratingWidget = document.querySelector(".contact-rating");
    if (ratingWidget) {
        let selectedRating = 0;
        const ratingStars = ratingWidget.querySelectorAll("[data-rating-value]");
        const ratingSubmit = ratingWidget.querySelector(".rating-submit");
        const ratingHelp = ratingWidget.querySelector(".rating-help-text");
        const ratingEmail = ratingWidget.querySelector(".rating-email");
        const ratingComment = ratingWidget.querySelector(".rating-comment");

        function updateStarSelection() {
            ratingStars.forEach(star => {
                const value = Number(star.dataset.ratingValue);
                star.classList.toggle("active", value <= selectedRating);
            });
            ratingHelp.textContent = selectedRating > 0
                ? `You selected ${selectedRating} star${selectedRating === 1 ? "" : "s"}. Fill email and comment, then submit.`
                : "Choose a score from 1 to 5, then add your email and comment.";
        }

        ratingStars.forEach(star => {
            star.addEventListener("click", () => {
                selectedRating = Number(star.dataset.ratingValue);
                updateStarSelection();
            });
        });

        if (ratingSubmit) {
            ratingSubmit.addEventListener("click", async () => {
                const emailValue = ratingEmail ? ratingEmail.value.trim() : "";
                const commentValue = ratingComment ? ratingComment.value.trim() : "";

                if (!selectedRating) {
                    ratingHelp.textContent = "Please select a rating before submitting.";
                    return;
                }
                if (!emailValue) {
                    ratingHelp.textContent = "Please enter your email before submitting.";
                    return;
                }
                if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
                    ratingHelp.textContent = "Please enter a valid email address.";
                    return;
                }
                if (!commentValue) {
                    ratingHelp.textContent = "Please add a comment to complete your feedback.";
                    return;
                }

                const data = await postRating(selectedRating, emailValue, commentValue);
                if (!data) {
                    ratingHelp.textContent = "An error occurred. Please try again later.";
                    return;
                }
                await updateRatingSummary();
                ratingHelp.textContent = `Thanks! Your ${selectedRating}-star rating has been saved.`;
                ratingSubmit.textContent = "Rating submitted";
                ratingSubmit.disabled = true;
                updateStarSelection();
            });
        }

        updateRatingSummary();
    } else {
        updateRatingSummary();
    }

    function setActiveLink() {
        const path = window.location.pathname.replace(/\/$/, "");
        const segment = path.split("/").pop() || "";
        document.querySelectorAll(".navigation a").forEach(a => {
            const aHref = a.getAttribute("href") || "";
            const aSegment = aHref.replace(/\/$/, "").split("/").pop() || "";
            const isHome = (segment === "" || segment === "index.html") && (aSegment === "" || aHref === "/" || aHref === "./");
            const isMatch = aSegment === segment && segment !== "";
            a.classList.toggle("active", isHome || isMatch);
        });
    }
    setActiveLink();

});