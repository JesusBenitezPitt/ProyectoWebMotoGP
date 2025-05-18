document.addEventListener('DOMContentLoaded', () => {
    fetch('/public/templates/nav.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById('navbar-custom').innerHTML = data;
    });

    fetch('/public/templates/footer.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById('footer-custom').innerHTML = data;
    });
});