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
                position: '',
                background: '#d33',
                input: 'text',
                inputAtributes: { placeholder: "Digite" },
            }

        };
    },
    actions: {
        inicia() {
            const { $swal } = useNuxtApp()
            this.swal = $swal
        },
        // Alerta simple
        simple() {
            this.inicia()
            const result = this.swal.fire({
                title: this.options.titulo,
                text: this.options.texto,
                icon: this.options.icono,
                timer: this.options.tiempo
            });
            return result
        },
        // Alerta con posicion de mensaje o notificacion
        mensaje() {
            this.inicia()
            this.swal.fire({
                position: this.options.position,
                text: this.options.texto,
                showConfirmButton: false,
                timer: this.options.tiempo,
                background: this.options.background,
                color: '#fff'
            });
        },
        // Alerta con Respuesta
        async alertRespuesta() {
            this.inicia()
            const result = await this.swal.fire({
                icon: this.options.icono,
                title: this.options.titulo,
                html: this.options.html,
                showCancelButton: true,
                confirmButtonText: this.options.confirmtext,
                cancelButtonText: this.options.canceltext,
            })
            if (result.isConfirmed) {
                return 'confirmado'
            } else if (result.isDenied) {
                return 'denegado'
            } else {
                return 'cancelado'
            }
        },
        // Alerta con Input
        async alertRespuestaInput() {
            this.inicia()
            const result = await this.swal.fire({
                icon: this.options.icono,
                title: this.options.titulo,
                html: this.options.html,
                input: this.options.input,
                inputAttributes: this.options.inputAtributes,
                showCancelButton: true,
                confirmButtonText: this.options.confirmtext,
                cancelButtonText: this.options.canceltext,
            })
            if (result.isConfirmed) {
                return {
                    estado: 'confirmado',
                    valor: result.value || ''
                };
            } else if (result.isDenied) {
                return {
                    estado: 'denegado',
                    valor: null
                };
            } else {
                return {
                    estado: 'cancelado',
                    valor: null
                };
            }

        }
    }
})