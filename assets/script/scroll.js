const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        } else {
            entry.target.classList.remove("show");
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll(".content-img").forEach(el => observer.observe(el));
document.querySelectorAll(".header").forEach(el => observer.observe(el));
document.querySelectorAll(".general").forEach(el => observer.observe(el));
document.querySelectorAll(".edu-item").forEach(el => observer.observe(el));
