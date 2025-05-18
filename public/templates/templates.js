document.addEventListener('DOMContentLoaded', () => {
    fetch('/templates/nav.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById('navbar-custom').innerHTML = data;
    });

    fetch('/templates/footer.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById('footer-custom').innerHTML = data;
    });
});