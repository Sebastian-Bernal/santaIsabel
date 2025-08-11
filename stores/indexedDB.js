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
                const request = indexedDB.open('db-thesalus', 1)
                request.onupgradeneeded = (event) => {
                    const db = event.target.result
                    const pacientes = db.createObjectStore('Paciente', { keyPath: 'id', autoIncrement: true });
                    pacientes.createIndex("buscapaciente", "id_paciente", { unique: false });

                    const medicos = db.createObjectStore('Medico', { keyPath: 'id', autoIncrement: true });
                    medicos.createIndex("buscapaciente", "id", { unique: false });

                    const users = db.createObjectStore('User', { keyPath: 'id', autoIncrement: true });
                    users.createIndex("buscaaUser", "id", { unique: false });

                    const diagnostico = db.createObjectStore('Diagnosticos', { keyPath: 'CIE_10' });
                    diagnostico.createIndex("buscadiagnostico", "id_diagnostico", { unique: false });

                    const antecedentes = db.createObjectStore('Antecedentes', { keyPath: 'id', autoIncrement: true });
                    antecedentes.createIndex("buscaantecedentes", "id_antecedente", { unique: false });

                    const enfermedadActual = db.createObjectStore('Enfermedad', { keyPath: 'id', autoIncrement: true });
                    enfermedadActual.createIndex("buscaenfermedadActual", "enfermedad", { unique: false });

                    const historiaClinica = db.createObjectStore('HistoriaClinica', { keyPath: 'id_temporal', autoIncrement: true });
                    historiaClinica.createIndex("buscahistoriaClinica", "id_historiaClinica", { unique: false });

                    const examenFisico = db.createObjectStore('ExamenFisico', { keyPath: 'otros' });
                    examenFisico.createIndex("buscaexamenFisico", "historiaClinica", { unique: false });

                    const analisis = db.createObjectStore('Analisis', { keyPath: 'id', autoIncrement: true });
                    analisis.createIndex("buscaanalisis", "id", { unique: false });

                    const planManejoMedicamentos = db.createObjectStore('Plan_manejo_medicamentos', { keyPath: 'id', autoIncrement: true });
                    planManejoMedicamentos.createIndex("buscaMedicamentos", "descripcion", { unique: false });

                    const planManejoProcedimientos = db.createObjectStore('Plan_manejo_procedimientos', { keyPath: 'id', autoIncrement: true });
                    planManejoProcedimientos.createIndex("buscaProcedimientos", "descripcion", { unique: false });

                    const planManejoInsumos = db.createObjectStore('Plan_manejo_insumos', { keyPath: 'id', autoIncrement: true });
                    planManejoInsumos.createIndex("buscainsumos", "nombre", { unique: false });

                    const planManejoEquipos = db.createObjectStore('Plan_manejo_equipos', { keyPath: 'id', autoIncrement: true });
                    planManejoEquipos.createIndex("buscaequipos", "descripcion", { unique: false });

                    const citas = db.createObjectStore('Cita', { keyPath: 'id', autoIncrement: true });
                    citas.createIndex("buscaCita", "id", { unique: false });

                    const empresa = db.createObjectStore('Empresa', { keyPath: 'no_identificacion' });
                    empresa.createIndex("buscaEmpresa", "no_identificacion", { unique: false });

                    const software = db.createObjectStore('Software', { keyPath: 'id', autoIncrement: true });
                    software.createIndex("buscaSoftware", "id", { unique: false });

                    const facturacion = db.createObjectStore('Facturacion', { keyPath: 'id', autoIncrement: true });
                    facturacion.createIndex("buscaFacturacion", "id", { unique: false });

                    const nota = db.createObjectStore('Nota', { keyPath: 'id', autoIncrement: true });
                    nota.createIndex("buscaNota", "id", { unique: false });

                    const eps = db.createObjectStore('EPS', { keyPath: 'id', autoIncrement: true });
                    eps.createIndex("buscaEPS", "id", { unique: false });

                    const profesion = db.createObjectStore('Profesion', { keyPath: 'id', autoIncrement: true });
                    profesion.createIndex("buscaProfesion", "id", { unique: false });
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
            if (!this.bd) {
                await this.initialize()
            }
            let transaccion = this.bd.transaction(this.almacen, "readwrite");
            let STabre = transaccion.objectStore(this.almacen);
            STabre.add(aguardar);
        },

        async guardardatosID(aguardar) {
            if (!this.bd) {
                await this.initialize()
            }
            const tx = this.bd.transaction(this.almacen, 'readwrite');
            const store = tx.objectStore(this.almacen);

            const result = await new Promise((resolve, reject) => {
                const request = store.add(aguardar);
                request.onsuccess = () => resolve(request.result); // El ID generado
                request.onerror = () => reject(request.error);
            });

            await tx.done;
            return result;
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

        async buscar_no_enviados() {
            this.almacen = 'HistoriaClinica'
            let datos = await this.leerdatos()
            return datos.map(dato => dato.id === null)
        },

        // Temporal Administrador Demo
        async adminDemo() {
            this.almacen = 'User'
            const usuarios = await this.leerdatos()
            
            const user = {
                name: 'Admin Demo',
                No_document: '1111111111',
                celular: '1111111111',
                telefono: '111111',
                Tipo: 'Gerente',
                correo: 'demo@admin.com',
                contraseña: 'thesalus2025*.',
                estado: 'activo',
                rol: 'Administrativo'
            }

            usuarios.find((ad) => {
                ad.correo === user.correo
            })
            if(usuarios.length > 0){
                return
            }

            await this.guardardatos(user)
        }

    }
})