import { defineStore } from "pinia";

// Esta funcion obtiene la fecha actual
function obtenerFechaActual() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
    const año = fecha.getFullYear();
    return {
        fechaFormateada: `${dia}/${mes}/${año}`,
        dia,
        mes,
        año
    };
};

// Store para manejar el calendario, inicializa con la fecha actual
export const useCalendarioCitas = defineStore('CalendarioCitas', {
    state: () => {
        const { fechaFormateada, dia, mes, año } = obtenerFechaActual();
        return {
            fecha: fechaFormateada,
            dias: dia,
            meses: mes,
            años: año
        };
    },

    getters: {
        fechaActual: (state) => {
            const fechaActual = new Date() // Retorna la fecha actual como objeto Date
            // Formatea la fecha actual como 'dd/mm/yyyy'
            const dia = String(fechaActual.getDate()).padStart(2, '0');
            const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
            const año = fechaActual.getFullYear();
            return `${dia}/${mes}/${año}`;
        },

        // Obtiene el dia de la semana por la fecha
        diaSemana: (state) => {
            // Convertir 'dd/mm/yyyy' a objeto Date válido
            const [dia, mes, año] = state.fecha.split('/');
            const fechaDate = new Date(`${año}-${mes}-${dia}`);

            // Array de días en español
            const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', ];
            return diasSemana[fechaDate.getDay()];
        }
    },

    actions: {
        cambiarFecha(fecha) {
            const partes = fecha.split('/');
            this.fecha = fecha;
            this.dias = partes[0];
            this.meses = partes[1];
        },


    }
})
