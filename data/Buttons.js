import { ref } from "vue";
// Creacion de botones Aside de ejemplo Icono, titulo, subsecciones

export const buttons = ref([
    {
        id: 1,
        nombre: "Empresas",
        secciones: [
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
                titulo: 'Usuarios',
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
            }
        ],
        icon: "fa-building",
        tamaño: 'max-h-[37vh] pt-10',
        active: false,
    },
    {
        id: 2,
        nombre: "Historias",
        secciones: [
            {
                titulo: "Ingresar"
            },
            {
                titulo: "Buscar"
            },
            {
                titulo: "Modificar"
            }
        ],
        icon: "fa-file",
        tamaño: 'max-h-[25vh]',
        active: false,
    },
    {
        id: 3,
        nombre: "Pacientes",
        secciones: [
            {
                titulo: "Ingresar"
            },
            {
                titulo: "Buscar"
            },
            {
                titulo: "Modificar"
            },
            {
                titulo: "Evoluciones"
            },
            {
                titulo: "Profesional",
                subSecciones: [
                    {
                        titulo: 'Ingresar',
                        ruta: '/Pacientes/Ingresar'
                    },
                    { 
                        titulo: 'Buscar',
                        ruta: '/Pacientes/Profesional/Buscar'
                    },
                    {
                        titulo: 'Modificar',
                    }
                ]
            }
        ],
        icon: "fa-user",
        tamaño: 'max-h-[25vh]',
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