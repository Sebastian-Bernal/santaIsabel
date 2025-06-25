import { defineStore } from "pinia";


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
        fechaActual: (state) => state.fecha,

        diaSemana: (state) => {
            // Convertir 'dd/mm/yyyy' a objeto Date válido
            const [dia, mes, anio] = state.fecha.split('/');
            const fechaDate = new Date(`${anio}-${mes}-${dia}`);

            // Array de días en español
            const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

            return diasSemana[fechaDate.getDay()];
        }
    },

    actions: {
        cambiarFecha(fecha) {
            const partes = fecha.split('/');
            this.fecha = fecha;
            this.dias = partes[0];
            this.meses = partes[1];
            // console.log(this.fecha);
        },


    }
})
