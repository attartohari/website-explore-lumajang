//TOOGLE CLASS ACTIVE
const navbarNav = document.querySelector
('.navbar-nav');

document.querySelector('#menu').onclick = () => {
    navbarNav.classList.toggle('active')
};

// Click Sembarang Tempat Menghilangkan Menu
const menu = document.querySelector('#menu');

document.addEventListener('click', function (e) {
    if (!menu.contains(e.target) && !navbarNav.contains(e.target)) {
        navbarNav.classList.remove('active')
    }
})