import { defineStore } from "pinia";

export const useNotificacionesStore = defineStore("Notificaciones", {

    // state
    state: () => {
        return {
            swal: null,
            respuesta: null,
            options: {
                titulo: '',
                texto: '',
                confirmtext: '',
                icono: '',
                canceltext: '',
                position: '',
                tiempo: 2000,
                position: ''
            }

        };
    },
    actions: {
        inicia() {
            const { $swal } = useNuxtApp()
            this.swal = $swal
        },

        simple() {
            this.inicia()
            this.swal.fire({
                title: this.options.titulo,
                text: this.options.texto,
                icon: this.options.icono,
                timer: this.options.tiempo
            });
        },
        mensaje() {
            this.inicia()
            this.swal.fire({
                position: this.options.position,
                text: this.options.texto,
                showConfirmButton: false,
                timer: this.options.tiempo,
                background: '#d33',
                color: '#fff'
            });
        },
        alertRespuesta() {
            this.inicia()
            this.swal.fire({
                icon: this.options.icono,
                title: this.options.titulo,
                html: this.options.html,
                showCancelButton: true,
                confirmButtonText: this.options.confirmtext,
                cancelButtonText: this.options.canceltext,
            }).then((result) => {
                if(result.isConfirmed){
                    this.estado = true
                } else{
                    this.estado = false
                }
            })
        }
    }
})