import { ref } from "vue";
// Creacion de botones Aside de ejemplo Icono, titulo, subsecciones

export const buttons = ref([
    {
        id: 1,
        nombre: "Empresas",
        secciones: [
            {
                titulo: 'Configuracion',
                ruta: '/Empresas/Configuracion'
            },
            // {
            //     titulo: 'Resoluciones',
            // },
            {
                titulo: 'Datos',
                ruta: '/Empresas/Datos'
            },
            {
                titulo: 'Usuarios',
                ruta: '/Empresas/Usuarios'
            },
            // {
            //     titulo: 'Inventarios',
            // },
            // {
            //     titulo: 'Negocios',
            // },
            // {
            //     titulo: 'Productos',
            // },
            // {
            //     titulo: 'Formas de pago',
            // },
            // {
            //     titulo: 'Impuestos',
            // },
            // {
            //     titulo: 'Cajas',
            // },

        ],
        icon: "fa-building",
        tamaño: 'max-h-[37vh]',
        active: false,
    },
    {
        id: 2,
        nombre: "Historial",
        secciones: [
            {
                titulo: "Historias",
                ruta: '/Historial/Historias'
            },
            {
                titulo: "Insumos",
                ruta: '/Historial/Insumos'
            },
        ],
        icon: "fa-file",
        tamaño: 'max-h-[25vh]',
        active: false,
    },
    {
        id: 3,
        nombre: "Usuarios",
        secciones: [
            {
                titulo: "Pacientes",
                ruta: '/Usuarios/Pacientes'
            },
            {
                titulo: "Profesional",
                ruta: '/Usuarios/Profesional'
            },
            {
                titulo: "Citas",
                ruta: '/Usuarios/Citas'
            }
        ],
        icon: "fa-user",
        tamaño: 'max-h-[25vh] pb-0',
        showUp: true,
        active: false,
    },
    {
        id: 4,
        nombre: "Facturacion",
        secciones: [
            {
                titulo: "Crear"
            },
            {
                titulo: "Rips"
            },
            {
                titulo: "Reportes"
            }
        ],
        icon: "fa-receipt",
        tamaño: 'max-h-[37vh]',
        showUp: true,
        active: false,
    },
]);

export const secciones = ['Configuracion','Resoluciones','Inventarios','Datos','Usuarios','Negocios','Productos','Formas de pago','Impuestos','Cajas','Historias','Consultas','Análisis','Evoluciones','Notas','Tratamientos','Medicacion',
    'Pacientes','Profesional','Citas','Crear','Rips','Reportes'];

export const seccionesConAcciones = secciones.flatMap(seccion => {
  const clave = seccion.replace(/\s+/g, '_'); // reemplaza espacios por guiones bajos
  return [`${clave}_get`, `${clave}_post`, `${clave}_put`, `${clave}_delete`, `${clave}_view`];
});