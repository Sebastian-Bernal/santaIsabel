import { ref } from "vue";
// Creacion de botones Aside de ejemplo Icono, titulo, subsecciones

export const buttons = ref([
    {
        id: 1,
        nombre: "Empresas",
        secciones: [
            {
                titulo: 'Configuracion',
                subSecciones: [
                    {
                        titulo: 'Crear',
                    },
                ]
            },
            {
                titulo: 'Resoluciones',
                subSecciones: [
                    {
                        titulo: 'Crear',
                    },
                    { 
                        titulo: 'Eliminar',
                    },
                    {
                        titulo: 'Actualizar',
                    }
                ]
            },
            {
                titulo: 'Inventarios',
                subSecciones: [
                    {
                        titulo: 'Crear',
                    },
                    { 
                        titulo: 'Eliminar',
                    },
                    {
                        titulo: 'Actualizar',
                    }
                ]
            },
            {
                titulo: 'Datos',
            },
            {
                titulo: 'Usuarios',
            },
            {
                titulo: 'Negocios',
                subSecciones: [
                    {
                        titulo: 'Crear',
                    },
                    { 
                        titulo: 'Eliminar',
                    },
                    {
                        titulo: 'Actualizar',
                    }
                ]
            },
            {
                titulo: 'Productos',
                subSecciones: [
                    {
                        titulo: 'Crear',
                    },
                    { 
                        titulo: 'Eliminar',
                    },
                    {
                        titulo: 'Actualizar',
                    }
                ]
            },
            {
                titulo: 'Formas de pago',
                subSecciones: [
                    {
                        titulo: 'Crear',
                    },
                    { 
                        titulo: 'Eliminar',
                    },
                    {
                        titulo: 'Actualizar',
                    }
                ]
            },
            {
                titulo: 'Impuestos',
                subSecciones: [
                    {
                        titulo: 'Crear',
                    },
                    { 
                        titulo: 'Eliminar',
                    },
                    {
                        titulo: 'Actualizar',
                    }
                ]
            },
            {
                titulo: 'Cajas',
                subSecciones: [
                    {
                        titulo: 'Crear',
                    },
                    { 
                        titulo: 'Eliminar',
                    },
                    {
                        titulo: 'Actualizar',
                    }
                ]
            },

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
                subSecciones: [
                    {
                        titulo: 'Datos',
                        ruta: '/Usuarios/Pacientes'
                    },
                    {
                        titulo: 'Evoluciones',
                        ruta: '/Usuarios/Pacientes/Evoluciones'
                    }
                ]
            },
            {
                titulo: "Profesional",
                subSecciones: [
                    {
                        titulo: 'Datos',
                        ruta: '/Usuarios/Profesional'
                    },
                ]
            },
            {
                titulo: "Citas",
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