document.getElementById("formulario").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    let formData = new FormData(this);
    let jsonData = {};
    formData.forEach((value, key) => { jsonData[key] = value; });

    try {
        // Enviar datos al Google Script
        await fetch("https://script.google.com/macros/s/AKfycbyJZfMcggCxAgaeHiu4XY7xxqeq6mGlNFd_f_lk1hG3AIFSn6ERLDXC7d6fu3AtIvh4Lg/exec", {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonData)
        });

        // Cargar plantilla del correo
        const response = await fetch('/public/plantilla-correo/plantilla_correo.html');
        const emailTemplate = await response.text();

        // Enviar correo de confirmación
        const emailData = {
            to: jsonData.email,
            subject: "¡Gracias por suscribirte a MotoGP!",
            message: emailTemplate
        };

        await fetch("https://script.google.com/macros/s/AKfycbzUXwGz6C6v42BRMwsswP77--m32R357FW4jPyCHrERBYdS8qtpUeYwt4VoKAWDwISR/exec", {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailData)
        });

        // Limpiar el formulario
        this.reset();
        
        // Toast de éxito
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

        // Agregar estilos personalizados
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
        
        // Toast de error (usar la misma configuración que el toast de éxito)
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
    }
});