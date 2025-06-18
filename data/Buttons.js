import { ref } from "vue";

export const buttons = ref([
    {
        id: 1,
        nombre: "Empresa",
        secciones: [
            {
                titulo: 'Resoluciones',
                subSecciones: ['Crear', 'Eliminar', 'Actualizar']
            },
            {
                titulo: 'Inventarios',
                subSecciones: ['Crear', 'Eliminar', 'Actualizar']
            },
            {
                titulo: 'Negocios',
                subSecciones: ['Crear', 'Eliminar', 'Actualizar']
            },
            {
                titulo: 'Usuarios',
                subSecciones: ['Crear', 'Eliminar', 'Actualizar']
            },
            {
                titulo: 'Productos',
                subSecciones: ['Crear', 'Eliminar', 'Actualizar']
            },
            {
                titulo: 'Formas de pago',
                subSecciones: ['Crear', 'Eliminar', 'Actualizar']
            },
            {
                titulo: 'Impuestos',
                subSecciones: ['Crear', 'Eliminar', 'Actualizar']
            },
            {
                titulo: 'Cajas',
                subSecciones: ['Crear', 'Eliminar', 'Actualizar']
            }
        ],
        icon: "fa-building",
        tamaño: 'max-h-[290px]',
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
        tamaño: 'max-h-[190px]',
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
            }
        ],
        icon: "fa-user",
        tamaño: 'max-h-[190px]',
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
        tamaño: 'max-h-[290px]',
        showUp: true,
        active: false,
    },
]);