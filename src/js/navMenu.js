const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');

if (navList && navToggle) {
  navToggle.addEventListener('click', (_) => {
    document.body.classList.toggle('nav-open');
  });

  navList.addEventListener('click', (_) => {
    document.body.classList.remove('nav-open');
  });
}
