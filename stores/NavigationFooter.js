
import { defineStore } from "pinia";


export const useSeccionFooter = defineStore('subSecciones', {
    state: () => ({
        secciones: null,
    }),
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
        }
    }
})