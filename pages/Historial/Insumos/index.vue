<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'

import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { TablaBuilder } from '~/build/Constructores/TablaBuilder'
import { ref, onMounted } from 'vue'
import { CardBuilder } from '~/build/Constructores/CardBuilder'
import { useInsumosBuilder } from '~/build/Historial/useInsumosBuilder'
import { mapCampos, mapCamposLimpios } from '~/components/organism/Forms/useFormulario'
import { useInsumosStore } from '~/stores/Formularios/insumos/Insumos'
import { useMovimientoBuilder } from '~/build/Historial/useMovimientoBuilder'
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente'
import PDFMovimientoInsumo from '~/components/paginas/PDFMovimientoInsumo.vue'
import { eliminarInsumo } from '~/Core/Historial/Insumos/DeleteInsumo'

const varView = useVarView()
const notificaciones = useNotificacionesStore()
const apiRest = useApiRest()

const show = ref(false);
const insumoStore = useInsumosStore();
const showVer = ref(false);
const showMovimiento = ref(false);
const refresh = ref(1);
const medicosStore = useMedicosStore();
const medicosList = ref([]);
const pacientesStore = usePacientesStore();
const pacientesList = ref([]);
const analisis = ref([])
const insumos = ref([]);
const movimientos = ref([])
const movimentosPaciente = ref([])

async function llamadatos() {
    insumos.value = await insumoStore.listInsumos();
    varView.datosActualizados()
}

// Refrescar pagina cuando se agrega o modifica Paciente
watch(() => show.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => showVer.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => showMovimiento.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

onMounted(async () => {
    insumos.value = await insumoStore.listInsumos(false);
    await llamadatos()
    medicosList.value = await medicosStore.listMedicos(true);
    pacientesList.value = await pacientesStore.listPacientes(false);
    analisis.value = await apiRest.getData('Analisis', 'analisis')
    movimentosPaciente.value = await insumoStore.listMovimientos(medicosList.value, pacientesList.value, analisis.value, insumos.value)
    console.log(movimentosPaciente.value)
});

// Funciones para manejar la visibilidad de los formularios
const agregarInsumo = () => {
    mapCamposLimpios(insumoStore.Formulario)
    show.value = true
};

const verInsumo = async (insumo) => {
    mapCampos(insumo, insumoStore.Formulario);
    movimientos.value = await insumoStore.listMovimientodeInsumo(medicosList.value, analisis.value)
    showVer.value = true;
}

const confirmarEliminarUsuario = async() => {
    const insumoAEliminar = insumoStore.Formulario.Insumos;

    notificaciones.options = {
        icono: "warning",
        titulo: "¿Deseas eliminar el insumo?",
        html: `Se eliminará el insumo: <span>${insumoAEliminar.nombre}</span>`,
        confirmtext: "Sí, eliminar",
        canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarInsumo(insumoAEliminar);

    if (!eliminado) return;

    notificaciones.options = {
        position: "top-end",
        texto: "Insumo eliminado con éxito.",
        background: "#6bc517",
        tiempo: 1500
    };

    notificaciones.mensaje();
    notificaciones.options.background = "#d33";

    showVer.value = false
    await llamadatos();
    refresh.value++;
}

const agregarMovimiento = (insumo) => {
    mapCampos(insumo, insumoStore.Formulario);
    insumoStore.Formulario.Movimiento.id_insumo = insumo.id
    showMovimiento.value = true;
}

function validarStock(insumo) {
    if (insumo.stock > 10) {
        return 'Verde'
    } else if (insumo.stock <= 10 && insumo.stock > 0) {
        return 'Naranja'
    } else if (insumo.stock === 0) {
        return 'Rojo'
    } else {
        return ''
    }

}
// Construccion de pagina

const propiedades = computed(() => {

    const pagina = new ComponenteBuilder()
    const tablaBuilder = new TablaBuilder()
    const tablaMovimientoPaciente = new TablaBuilder()

    const puedeVer = varView.getPermisos.includes('Insumos_view');
    if (!puedeVer) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', new CardBuilder()
                .setCards(
                    [
                        {
                            header: {
                                html: `<div class="flex flex-col items-center justify-center h-full text-gray-500">
                                <i class="fa-solid fa-user-lock text-6xl mb-4"></i>
                                <h2 class="text-lg font-semibold">Acceso restringido</h2>
                                <p class="text-sm text-center">
                                    No tienes permisos para acceder a este módulo.
                                </p>
                                </div>`,
                            },
                        },
                        {

                        },
                        {

                        }
                    ]
                )
                .setcontenedorCards('flex flex-col')
                .setContenedor('w-full')
                .setTamaño('flex sm:flex-row justify-center items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Gestion de Insumos.')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }
    const puedePost = varView.getPermisos.includes('Insumos_post')
    const puedePut = varView.getPermisos.includes('Insumos_put')

    const formularioInsumo = puedePost
        ? useInsumosBuilder({
            storeId: "NuevoInsumo",
            storePinia: "Insumos",
            show: show.value,
            cerrarModal: () => { show.value = false; }
        })
        : null;

    const formularioVerInsumo = puedePut
        ? useInsumosBuilder({
            storeId: "ActualizarInsumo",
            storePinia: "Insumos",
            show: showVer.value,
            soloVer: varView.soloVer,
            actulizarDatos: true,
            eliminarDato: confirmarEliminarUsuario,
            cerrarModal: () => { showVer.value = false; },
            movimientos: movimientos.value
        })
        : null;

    const formularioRegistrarMovimiento = puedePut
        ? useMovimientoBuilder({
            storeId: "NuevoMovimiento",
            storePinia: "Insumos",
            show: showMovimiento.value,
            medicosList: medicosList,
            cerrarModal: () => { showMovimiento.value = false; }
        })
        : null;

    tablaBuilder
        .setColumnas([
            { titulo: "vencimiento", value: "Vencimiento", tamaño: 100 },
            { titulo: "nombre", value: "Nombre", tamaño: 350, ordenar: true },
            { titulo: "activoL", value: "Activo", tamaño: 120 },
            { titulo: "ubicacion", value: "Ubicacion", tamaño: 100 },
            { titulo: "categoria", value: "Tipo", tamaño: 200, ordenar: true },
            { titulo: "stock", value: "Stock", tamaño: 100, ordenar: true },
        ])
        .setHeaderTabla({
            titulo: "Gestión de Insumos",
            descripcion: "Visualiza y administra el almacen de insumos.",
            accionAgregar: puedePost ? agregarInsumo : null,
            color: "bg-[var(--color-default)] text-white",
            buscador: true,
            excel: true,
            filtros: [
                { columna: 'categoria', placeholder: 'Tipo' },
                { columna: 'ubicacion', placeholder: 'Ubicacion' },
            ]
        })
        .setDatos(insumos);
    const acciones = [];
    if (puedePut) {
        acciones.push({ icon: validarStock, action: () => {} });
        acciones.push({ icon: "ver", action: verInsumo });
        acciones.push({ icon: "movimiento", action: agregarMovimiento });
    }
    if (acciones.length > 0) {
        tablaBuilder.setAcciones({ icons: acciones, botones: true });
    }

    tablaMovimientoPaciente
        .setColumnas([
            { titulo: "fecha", value: "Fecha", tamaño: 100 },
            { titulo: "name_paciente", value: "Paciente", tamaño: 200 },
            { titulo: "name_medico", value: "Profesional", tamaño: 200, ordenar: true },
            { titulo: "nombre", value: "Nombre", tamaño: 200 },
            { titulo: "activoL", value: "Activo", tamaño: 120 },
            { titulo: "nombreServicio", value: "Servicio", tamaño: 150 },
            { titulo: "categoria", value: "Tipo", tamaño: 200, ordenar: true },
            { titulo: "dosis", value: "Dosis", tamaño: 150 },
        ])
        .setHeaderTabla({
            titulo: "Movimientos relacionados a pacientes",
            descripcion: "Visualiza y administra el almacen de insumos.",
            color: "bg-[var(--color-default)] text-white",
            buscador: true,
            excel: true,
            filtros: [
                { columna: 'categoria', placeholder: 'Tipo' },
                { columna: 'ubicacion', placeholder: 'Ubicacion' },
            ]
        })
        .setDatos(movimentosPaciente);

    pagina
        .setFondo('FondoDefault')
        .setContenedor('grid grid-cols-1 gap-3')
        .addComponente('Tabla', tablaBuilder.build())
        .addComponente('Tabla', tablaMovimientoPaciente.build())
    if (formularioInsumo) pagina.addComponente("Form", formularioInsumo);
    if (formularioVerInsumo) pagina.addComponente("Form", formularioVerInsumo);
    if (formularioRegistrarMovimiento) pagina.addComponente("Form", formularioRegistrarMovimiento);

    return pagina.build()
})
// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
    <PDFMovimientoInsumo v-if="varView.showPDFInsumo" />
</template>