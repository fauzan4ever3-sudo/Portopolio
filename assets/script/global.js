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
    // Only apply on non-touch devices
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
        // Small initial delay so page is ready
        setTimeout(type, 600);
    }

    // ── Skill bar animate on view ──
    const skillBars = document.querySelectorAll(".skill-fill");
    if (skillBars.length) {
        // Set initial width to 0 via inline style so transition works
        skillBars.forEach(b => { b.style.width = "0"; });

        const barIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    // Read --w from inline style attribute e.g. style="--w: 85%"
                    const inlineStyle = bar.getAttribute("style") || "";
                    const match = inlineStyle.match(/--w\s*:\s*([^;]+)/);
                    const targetW = match ? match[1].trim() : getComputedStyle(bar).getPropertyValue("--w").trim();
                    // Short delay so the element is visible before animating
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
                const duration = 1200; // ms
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

    // ── Page transition: fade out on link click ──
    document.querySelectorAll("a[href]").forEach(a => {
        const href = a.getAttribute("href");
        // Only internal links, not hash/mailto/tel/target=_blank
        if (
            href &&
            !href.startsWith("#") &&
            !href.startsWith("mailto:") &&
            !href.startsWith("tel:") &&
            !a.target &&
            !a.hasAttribute("data-no-transition")
        ) {
            a.addEventListener("click", function (e) {
                e.preventDefault();
                document.body.style.opacity = "0";
                setTimeout(() => {
                    window.location.href = href;
                }, 320);
            });
        }
    });

    // ── Active link highlight ── (re-run for SPA-like feel)
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
