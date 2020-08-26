const backToTopButton = document.querySelector('.back-to-top');

if (backToTopButton) {
  window.addEventListener('scroll', scrollFunction);

  function scrollFunction() {
    if (document.documentElement.scrollTop > 250) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  }
}
