document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector('.slider-track');
  const slides = document.querySelectorAll('.slide');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');

  if (!track || slides.length === 0) return; // nada a fazer

  let index = 0;
  let interval = null;
  let isAnimating = false;

  // pega a largura de um slide (individual)
  function getSlideWidth() {
    // se os slides tiverem padding/margin diferente, usar slides[0].getBoundingClientRect().width
    return slides[0].getBoundingClientRect().width;
  }

  function updateTransform() {
    const w = getSlideWidth();
    track.style.transform = `translateX(-${index * w}px)`;
  }

  function moveToSlide(i) {
    if (isAnimating) return;
    isAnimating = true;

    if (i < 0) index = slides.length - 1;
    else if (i >= slides.length) index = 0;
    else index = i;

    updateTransform();

    // pequena espera para evitar cliques múltiplos dispararem animação repetida
    setTimeout(() => {
      isAnimating = false;
    }, 450); // deve ser >= tempo da transition do CSS (0.4s)
  }

  // botões (verifica se existem antes)
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      moveToSlide(index + 1);
      resetAutoPlay();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      moveToSlide(index - 1);
      resetAutoPlay();
    });
  }

  // autoplay
  function startAutoPlay() {
    stopAutoPlay();
    interval = setInterval(() => {
      moveToSlide(index + 1);
    }, 8000); // 8s — ajuste se quiser
  }
  function stopAutoPlay() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  startAutoPlay();

  // TOUCH: suporte a drag com touchmove para melhorar UX
  let startX = 0;
  let currentX = 0;
  let isTouching = false;

  track.addEventListener("touchstart", (e) => {
    stopAutoPlay();
    isTouching = true;
    startX = e.touches[0].clientX;
    currentX = startX;
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    if (!isTouching) return;
    currentX = e.touches[0].clientX;
    const delta = currentX - startX;
    // arrastar o track enquanto toca (efeito de arraste)
    const w = getSlideWidth();
    // calcula posição em pixels (sem alterar index até o touchend)
    const base = -index * w;
    track.style.transition = 'none';
    track.style.transform = `translateX(${base + delta}px)`;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    if (!isTouching) return;
    isTouching = false;
    track.style.transition = ''; // devolve a transição do CSS
    const delta = currentX - startX;
    const threshold = Math.min(getSlideWidth() * 0.15, 60); // 15% ou 60px
    if (delta < -threshold) {
      moveToSlide(index + 1);
    } else if (delta > threshold) {
      moveToSlide(index - 1);
    } else {
      // volta pro mesmo slide
      updateTransform();
    }
    resetAutoPlay();
  });

  // Recalcular ao redimensionar para manter o slide alinhado
  window.addEventListener('resize', () => {
    // timeout curto para aguardar reflow em alguns dispositivos
    setTimeout(() => {
      updateTransform();
    }, 50);
  });

  // garantir posição inicial correta
  updateTransform();
});