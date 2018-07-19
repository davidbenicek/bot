function track(event, label) {
  gtag('event', event, {
    event_category: 'homepage',
    event_label: label,
  });
}

// Adapted from https://www.w3schools.com/howto/howto_js_accordion.asp
const acc = document.getElementsByClassName('accordion');
let i;

for (i = 0; i < acc.length; i += 1) {
  acc[i].addEventListener('click', function () {
    this.classList.toggle('active');
    const panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      track('accordion', this.classList[1]);
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    }
  });
}
