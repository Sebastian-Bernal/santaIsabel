import { ref } from "vue";

export const buttons = ref([
    {
        id: 1,
        nombre: "Empresa",
        secciones: [
        {
            titulo: 'Resoluciones',
            subSecciones: ['Crear','Eliminar','Actualizar']
        },
        {
            titulo: 'Terceros',
            subSecciones: ['Pro', 'Familiar']
        },
        {
            titulo: 'Usuarios',
            subSecciones: ['Individual', 'Estudiante']
        }
        ],
        icon: "fa-home",
        active: false,
    },
    {
        id: 2,
        nombre: "Productos",
        secciones: [
            {
                titulo: "Todos",
                subSecciones: ['Inventario','Crear','Actualizar']
            }, 
            {
                titulo: "Historial"
            }
        ],
        icon: "fa-file",
        active: false,
    },
    {
        id: 3,
        nombre: "Reportes",
        secciones: [
            {
                titulo: "Historial",
                subSecciones: ['Index','Crear','Eliminar','Actualizar']
            }   
        ],
        icon: "fa-fire",
        active: false,
    },
    {
        id: 4,
        nombre: "Ventas",
        secciones: [
            {
                titulo: "Facturas",
                subSecciones: ['Generar','Historial','Eliminar']
            }
        ],
        icon: "fa-screwdriver-wrench",
        active: false,
    },
]);