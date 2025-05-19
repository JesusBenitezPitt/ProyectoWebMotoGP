document.addEventListener('submit', async function(event) {
    if (event.target && event.target.id === "formulario") {
        event.preventDefault();
        const formulario = document.getElementById("formulario");
        if (!formulario) {
            console.error('No se encontró el formulario de suscripción');
            return;
        }

        // Evita agregar múltiples listeners
        if (formulario.dataset.listenerAdded) return;
        formulario.dataset.listenerAdded = "true";
            
        let formData = new FormData(formulario);
        let jsonData = {};
        formData.forEach((value, key) => { jsonData[key] = value; });

        // Referencia al botón y su texto original
        const submitButton = formulario.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            const response1 = await fetch("https://script.google.com/macros/s/AKfycbyJZfMcggCxAgaeHiu4XY7xxqeq6mGlNFd_f_lk1hG3AIFSn6ERLDXC7d6fu3AtIvh4Lg/exec", {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData)
            });

            const templateResponse = await fetch('/plantilla-correo/plantilla_correo.html');
            if (!templateResponse.ok) throw new Error('No se pudo cargar la plantilla del correo');
            const emailTemplate = await templateResponse.text();

            const emailData = {
                to: jsonData.email,
                subject: "¡Gracias por suscribirte a MotoGP!",
                htmlBody: emailTemplate
            };

            const params = new URLSearchParams();
            params.append('to', jsonData.email);
            params.append('subject', "¡Gracias por suscribirte a MotoGP!");
            params.append('htmlBody', emailTemplate);

            await fetch("https://script.google.com/macros/s/AKfycbz2sQjXD-v0FK9MIGuswr4NxKdF3s3djc9LK7GybN8fLYRCuT95RecaFSQl1f97tg/exec", {
                method: "POST",
                body: params
            });

            formulario.reset();
            
            const Toast = Swal.mixin({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                showCloseButton: true,
                timer: 3000,
                timerProgressBar: true,
                background: '#4CAF50',
                color: '#fff',
                customClass: {
                    closeButton: 'swal2-close-white',
                    popup: 'swal2-toast-slide',
                    timerProgressBar: 'swal2-timer-custom',
                    container: 'swal2-container-custom'
                },
                willClose: (toast) => {
                    toast.classList.add('swal2-toast-slide-out');
                }
            });

            if (!document.getElementById('swal2-custom-styles')) {
                const styles = document.createElement('style');
                styles.id = 'swal2-custom-styles';
                styles.innerHTML = `
                    .swal2-container-custom {
                        gap: 10px !important;
                        flex-direction: column-reverse !important;
                        align-items: flex-end !important;
                    }
                    .swal2-close-white {
                        color: white !important;
                    }
                    .swal2-timer-custom {
                        height: 3px !important;
                        background: rgba(255, 255, 255, 0.5) !important;
                    }
                    .swal2-timer-custom:before {
                        background: white !important;
                    }
                    .swal2-toast-slide {
                        animation: slideIn 0.5s ease-out;
                        margin: 0.5em !important;
                    }
                    .swal2-toast-slide-out {
                        animation: slideOut 0.5s ease-out forwards !important;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    @keyframes slideOut {
                        from { 
                            transform: translateY(0);
                            opacity: 1;
                        }
                        to { 
                            transform: translateY(100%);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(styles);
            }

            Toast.fire({
                icon: 'success',
                title: '¡Suscripción exitosa!',
                text: 'Te hemos enviado un correo de confirmación'
            });

        } catch (error) {
            console.error('Error:', error);
            
            const Toast = Swal.mixin({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                showCloseButton: true,
                timer: 3000,
                timerProgressBar: true,
                background: '#f44336',
                color: '#fff',
                customClass: {
                    closeButton: 'swal2-close-white',
                    popup: 'swal2-toast-slide',
                    timerProgressBar: 'swal2-timer-custom',
                    container: 'swal2-container-custom'
                },
                willClose: (toast) => {
                    toast.classList.add('swal2-toast-slide-out');
                }
            });

            Toast.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al procesar tu suscripción'
            });
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
});