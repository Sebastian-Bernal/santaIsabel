
import { defineStore } from "pinia";


export const useSeccionFooter = defineStore('subSecciones', {
    state: () => ({
        secciones: null,
        idActivo: ''
    }),
    getters: {
        idActivoDefault: (state) => {
            if(state.idActivo === ''){
                state.idActivo = state.secciones?.[0]
            }
        }
    },

    actions: {
        cambiarSecciones (subSecciones) {
            this.secciones = subSecciones ? subSecciones : null;
            sessionStorage.setItem('seccionesGuardadas', JSON.stringify(this.secciones));
        },
        seccionesGuardadas () {
            const secciones = JSON.parse(sessionStorage.getItem('seccionesGuardadas'));
                if (secciones) {
                    this.cambiarSecciones(secciones);
                }
        },
        cambiarIdActivo (pagina) {
            this.idActivo = pagina
        }
    }
})