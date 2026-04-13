<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { useCie10Store } from '~/stores/Formularios/Codigos/Cie10';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { useCie10Builder } from '~/build/Codigos/useCie10Builder';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { useCie10Actions } from '~/composables/Usuarios/Cie10';

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const cie10Store = useCie10Store();
const cie10List = ref([]);
const refresh = ref(1);

const show = ref(false);
const showVer = ref(false);

async function llamadatos() {
    cie10List.value = await cie10Store.listCie10();
    varView.datosActualizados();
}

const {
    agregarCie10,
    verCie10,
    cerrar,
    eliminarCie10s
} = useCie10Actions({
    cie10Store,
    varView,
    notificaciones,
    show,
    showVer,
    llamadatos
});

watch(() => show.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        llamadatos();
        refresh.value++;
    }
});

watch(() => showVer.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        llamadatos();
        refresh.value++;
    }
});

onMounted(async () => {
    await llamadatos();
});

const builderTabla = new TablaBuilder();

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder();
    const puedeVer = varView.getPermisos.includes('Codigo_view');
    const puedeGet = varView.getPermisos.includes('Codigo_get');
    const puedePost = varView.getPermisos.includes('Codigo_post');
    const puedePut = varView.getPermisos.includes('Codigo_put');

    if (!puedeVer && !puedePost && !puedePut && !puedeGet) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', new CardBuilder()
                .setCards([
                    {
                        header: {
                            html: `<div class="flex flex-col items-center justify-center h-full text-gray-500">
                            <i class="fa-solid fa-user-lock text-6xl mb-4"></i>
                            <h2 class="text-lg font-semibold">Acceso restringido</h2>
                            <p class="text-sm text-center">No tienes permisos para acceder a este módulo.</p>
                            </div>`,
                        },
                    },
                    {},
                    {}
                ])
                .setcontenedorCards('flex flex-col')
                .setContenedor('w-full')
                .setTamaño('flex sm:flex-row justify-center items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Gestión de Códigos CIE-10')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            );
        return pagina.build();
    }

    const propiedadesVerCie10 = puedePut
        ? useCie10Builder({
            storeId: 'ModificarCie10',
            storePinia: 'Cie10',
            cerrarModal: cerrar,
            show: showVer,
            tipoFormulario: 'Form',
            verUser: true,
            eliminar: eliminarCie10s,
            soloVer: varView.soloVer,
        })
        : null;

    const propiedadesCie10 = puedePost
        ? useCie10Builder({
            storeId: 'NuevoCie10',
            storePinia: 'Cie10',
            cerrarModal: cerrar,
            show: show,
            tipoFormulario: 'Form',
        })
        : null;

    builderTabla
        .setColumnas([
            { titulo: 'codigo', value: 'Código', ordenar: true, tamaño: 150 },
            { titulo: 'nombre', value: 'Nombre de la Condición', tamaño: 400 }
        ])
        .setHeaderTabla({
            titulo: 'Gestión de Códigos CIE-10',
            descripcion: 'Administra los códigos de diagnóstico CIE-10',
            color: 'bg-[var(--color-default)] text-white',
            accionAgregar: puedePost ? agregarCie10 : null,
            buscador: true,
            excel: true,
            filtros: []
        })
        .setDatos(cie10List);

    const acciones = [];
    if (puedePut) {
        acciones.push({ icon: "ver", action: verCie10 });
    }

    if (acciones.length > 0) {
        builderTabla.setAcciones({ icons: acciones, botones: true });
    }

    pagina
        .setFondo('FondoDefault')
        .setLayout('')
        .setContenedor('w-full')
        .addComponente('Tabla', builderTabla);

    if (propiedadesCie10) pagina.addComponente('Form', propiedadesCie10);
    if (propiedadesVerCie10) pagina.addComponente('Form', propiedadesVerCie10);

    return pagina.build();
});
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>
