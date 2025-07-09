import { CIE10 } from "~/data/CIE10";
import { defineStore } from "pinia";

// Store para guardar codigos CIE-10
export const useCodigos = defineStore('CodigosCie10', {
    state: () => ({
        CIE10_codes: CIE10,
        bd: null
    }),

    getters: {

    },

    actions: {
        async initialize() {
            return new Promise((resolve, reject) => {
                const indexedDB = window.indexedDB || window.webkitIndexedDB;
                const request = indexedDB.open('datos-thesalus', 1)
                request.onupgradeneeded = (event) => {
                    const db = event.target.result

                    const CIE_10 = db.createObjectStore('CIE_10', { keyPath: "code" });
                    CIE_10.createIndex("buscaCie", "code", { unique: false });
                }

                request.onerror = (event) => {
                    reject(event.target.errorCode)
                }

                request.onsuccess = (event) => {
                    this.bd = request.result
                    resolve(this.bd)
                }
            })
        },

        async leerdatos() {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction('CIE_10', "readonly");
                let STlee = transaccion.objectStore('CIE_10');
                const request = STlee.getAll();

                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async guardardatos() {
            const datos = await new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction('CIE_10', "readonly");
                let STlee = transaccion.objectStore('CIE_10');
                const request = STlee.getAll();

                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })

            if(datos.length > 0) return

            let transaccion = this.bd.transaction('CIE_10', "readwrite");
            let STabre = transaccion.objectStore('CIE_10');

            // Limpiar objeto de ref
            const cleanData = await JSON.parse(JSON.stringify(this.CIE10_codes));
            for (let item of cleanData) {
                try {
                    await new Promise((resolve, reject) => {
                        const request = STabre.add(item);
                        request.onsuccess = () => resolve();
                        request.onerror = (e) => reject(e);
                    });
                } catch (e) {
                    console.error("Error agregando el código:", item.code, e);
                }
            }
        },


    }
})
