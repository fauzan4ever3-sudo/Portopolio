document.addEventListener("DOMContentLoaded", function () {

    // ── Active nav link ──
    const links = document.querySelectorAll(".navigation a");
    const currentPath = window.location.pathname.split("/")[1];

    links.forEach(link => {
        const linkPath = link.getAttribute("href").split("/")[1];
        if (currentPath === linkPath) {
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

        // Close menu when a nav link is clicked
        navigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("open");
                navigation.classList.remove("open");
            });
        });

        // Close menu when clicking outside
        document.addEventListener("click", function (e) {
            if (!hamburger.contains(e.target) && !navigation.contains(e.target)) {
                hamburger.classList.remove("open");
                navigation.classList.remove("open");
            }
        });
    }
});
