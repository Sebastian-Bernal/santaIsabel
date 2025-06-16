import { defineStore } from "pinia";

export const useIndexedDBStore = defineStore("indexeddb", {
    id: 'idexeddb',
    // state
    state: () => {
        return {
            bd: null,
            almacen: '',
            aguardar: {},
            respuesta: null,
        };
    },
    actions: {
        async initialize() {
            return new Promise((resolve, reject) => {
                const indexedDB = window.indexedDB || window.webkitIndexedDB;
                const request = indexedDB.open('datos-santaIsabel', 1)
                request.onupgradeneeded = (event) => {
                    const db = event.target.result
                    const pacientes = db.createObjectStore('Paciente', { keyPath: 'No_document' });
                    pacientes.createIndex("buscapaciente", "id_paciente", { unique: false });

                    const diagnostico = db.createObjectStore('Diagnosticos', { keyPath: 'tipo' });
                    diagnostico.createIndex("buscadiagnostico", "id_diagnostico", { unique: false });

                    const antecedentes = db.createObjectStore('Antecedentes', { keyPath: 'valor' });
                    antecedentes.createIndex("buscaantecedentes", "id_antecedente", { unique: false });

                    const enfermedadActual = db.createObjectStore('Enfermedad', { keyPath: 'valor' });
                    enfermedadActual.createIndex("buscaenfermedadActual", "enfermedad", { unique: false });

                    const historiaClinica = db.createObjectStore('HistoriaClinica', { keyPath: 'motivo' });
                    historiaClinica.createIndex("buscahistoriaClinica", "id_historiaClinica", { unique: false });

                    const examenFisico = db.createObjectStore('ExamenFisico', { keyPath: 'otros' });
                    examenFisico.createIndex("buscaexamenFisico", "historiaClinica", { unique: false });

                    const analisisTratamiento = db.createObjectStore('AnalisisTratamiento', { keyPath: 'analisis' });
                    analisisTratamiento.createIndex("buscaanalisisTratamiento", "analisis", { unique: false });

                    const planManejoMedicamentos = db.createObjectStore('Plan_manejo_medicamentos', { keyPath: 'medicamento' });
                    planManejoMedicamentos.createIndex("buscaMedicamentos", "descripcion", { unique: false });

                    const planManejoProcedimientos = db.createObjectStore('Plan_manejo_procedimientos', { keyPath: 'descripcion' });
                    planManejoProcedimientos.createIndex("buscaProcedimientos", "descripcion", { unique: false });

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
                let transaccion = this.bd.transaction(this.almacen, "readonly");
                let STlee = transaccion.objectStore(this.almacen);
                const request = STlee.getAll();

                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async guardardatos(aguardar) {
            let transaccion = this.bd.transaction(this.almacen, "readwrite");
            let STabre = transaccion.objectStore(this.almacen);
            STabre.add(aguardar);
        },

        async leerpordato(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readonly");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.get(key)
                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })

        },

        async borrardato(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.delete(key)

                request.onerror = function () {
                    reject('error al eliminar')
                };

                request.onsuccess = () => {
                    resolve()
                }
            })
        },

        async actualiza(aguardar) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.put(aguardar)

                request.onerror = function () {
                    reject('error al actualizar')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async borrartodo() {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.clear()

                request.onerror = function () {
                    reject('error al eliminar')
                };

                request.onsuccess = () => {
                    resolve();
                }
            })
        },

        async borra_lee(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return await borrardato(key).then(() => {
                return leerdatos()
            })
        },

        async buscar_no_enviados(){
            this.almacen = 'HistoriaClinica'
            let datos = await this.leerdatos()
            return datos.map( dato => dato.id === null )
        }

    }
})