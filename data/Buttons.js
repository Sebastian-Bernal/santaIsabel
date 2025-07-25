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
        tamaño: 'max-h-[37vh] pt-10',
        active: false,
    },
    {
        id: 2,
        nombre: "Historial",
        secciones: [
            {
                titulo: "Historias"
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
                titulo: "Administrativos",
                subSecciones: [
                    {
                        titulo: 'Datos',
                        ruta: '/Usuarios/Administrativos'
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