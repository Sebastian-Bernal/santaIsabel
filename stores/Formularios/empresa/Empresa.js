import { traerdatosEmpresa } from "~/Core/Empresa/Configuracion/Empresa/GETEmpresa";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";

// Estructura de datos de Empresa
const estructura = {
    Empresa: {
        nombre: '',
        logo: '',
        logoLogin: '',
        JPG: '',
        no_identificacion: '',
        DV: '',
        registroMercantil: '',
        direccion: '',
        telefono: '',
        lenguaje: '',
        impuesto: '',
        pais: '',
        tipoDocumento: '',
        tipoOperacion: '',
        tipoEntorno: '',
        tipoMoneda: '',
        tipoOrganizacion: '',
        municipio: '',
        tipoResponsabilidad: '',
        tipoRegimen: '',
    },
}

// Pinia Empresa
export const useEmpresaStore = defineStore('Empresa', {
    state: () => ({
        Formulario: estructura,
        Empresa: JSON.parse(JSON.stringify(estructura)), // estructura base compartida
        Empresas: []
    }),

    getters: {

    },

    actions: {
        async listEmpresas () {
            const store = useIndexedDBStore();
            store.almacen = 'Empresa';
            let empresas = await store.leerdatos();

            this.Empresas = empresas;
            return empresas;
        },


        async indexDBDatos() {
            const empresa = await traerdatosEmpresa()
            const empresasLocal = await this.listEmpresas()

            // Crear un conjunto de IDs locales para comparación rápida
            const ids = new Set(
                empresasLocal.map(data => data.id)
            );

            const empresaIndexed = empresa?.map((data) => ({
                Empresa: {
                    id: data.id,
                    nombre: data.nombre,
                    no_identificacion: data.no_identificacion,
                    DV: data.DV,
                    direccion: data.direccion,
                    municipio: data.municipio,
                    departamento: data.departamento,
                    pais: data.pais,
                    telefono: data.telefono,
                    lenguaje: data.lenguaje,
                    tipoDocumento: data.tipoDocumento,
                    tipoEntorno: data.tipoEntorno,
                    tipoMoneda: data.tipoMoneda,
                    tipoOperacion: data.tipoOperacion,
                    tipoOrganizacion: data.tipoOrganizacion,
                    tipoRegimen: data.tipoRegimen,
                    tipoResponsabilidad: data.tipoResponsabilidad,
                    impuesto: data.impuesto,
                    registroMercantil: data.registroMercantil,
                    logo: data.logo,
                    logoLogin: data.logoLogin,
                    JPG: data.JPG
                }
            }));

            // Filtrar los que no están en local
            const nuevasEmpresas = empresaIndexed.filter(item => {
                const key = item.Empresa.id;
                return !ids.has(key);
            });

            // Guardar solo los nuevos
            nuevasEmpresas.forEach(item => {
                guardarEnDB(item);
            });
        },
    }
});