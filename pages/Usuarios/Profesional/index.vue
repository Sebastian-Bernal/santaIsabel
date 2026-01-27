<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
// Data
import { ref, onMounted } from 'vue';
import { municipios } from '~/data/municipios.js'
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales.js';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { useUserBuilder } from '~/build/Usuarios/useUserFormBuilder';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { useUsuarioValidaciones } from "~/composables/Usuarios/Usuarios.js";
import { useProfesionalActions } from '~/composables/Usuarios/Profesional';

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const medicosStore = useMedicosStore();
const profesionStore = useDatosProfesionStore()
const medicos = ref([]);
const profesiones = ref([]);
const refresh = ref(1);

const show = ref(false)
const showVer = ref(false)

async function llamadatos() {
    varView.cargando = true
    medicos.value = await medicosStore.listMedicos();
    varView.cargando = false
}

const {
    validarFecha,
    validarTipoDoc,
    buscarUsuarioPorDocumento,
    municipiosOptions,
    municipiosOptionsProfesional
} = useUsuarioValidaciones(medicosStore.Formulario);

const {
    agregarMedico,
    modificarMedico,
    cerrar,
    eliminarProfesional
} = useProfesionalActions({
    medicosStore,
    varView,
    notificaciones,
    show,
    showVer,
    llamadatos
});

// Watch para actualizar informacion al agregar o actualizar
watch(() => show.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        llamadatos()
        refresh.value++
    }
})

watch(() => showVer.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        llamadatos()
        refresh.value++
    }
})

// Cargar los Medicos desde el store
onMounted(async () => {
    varView.cargando = true

    await llamadatos()
    const listaProfesiones = await profesionStore.listProfesion
    profesiones.value = listaProfesiones.map((profesion) => {
        return { text: profesion.nombre, value: profesion.id }
    });

    refresh.value++

    varView.cargando = false
});

// Construccion de pagina
const builderTabla = new TablaBuilder()

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    // Verificar permisos específicos
    const puedeVer = varView.getPermisos.includes('Profesional_view');
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
                .setheaderTitle('Gestión de Profesionales')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }
    const puedePost = varView.getPermisos.includes('Profesional_post');
    const puedePut = varView.getPermisos.includes('Profesional_put');

    // Builder para ver usuario (siempre se usa cuando hay acción "ver")
    const propiedadesVerUser = puedePut
        ? useUserBuilder({
            storeId: 'ModificarProfesional',
            storePinia: 'Profesionales',
            cerrarModal: cerrar,
            show: showVer,
            tipoFormulario: 'Wizard',
            buscarUsuario: buscarUsuarioPorDocumento,
            departamentos: municipios,
            seleccionarDepartamento: () => { },
            municipios_laboral: municipiosOptionsProfesional,
            municipios: municipiosOptions,
            seleccionarMunicipio: () => { },
            tipoUsuario: 'Profesional',
            opcionesProfesion: profesiones,
            verUser: true,
            eliminar: eliminarProfesional,
            soloVer: varView.soloVer,
            validarFecha,
        })
        : null;

    // Builder para crear usuario (solo si tiene permiso POST)
    const propiedadesUser = puedePost
        ? useUserBuilder({
            storeId: 'NuevoProfesional',
            storePinia: 'Profesionales',
            cerrarModal: cerrar,
            show: show,
            tipoFormulario: 'Wizard',
            buscarUsuario: buscarUsuarioPorDocumento,
            departamentos: municipios,
            seleccionarDepartamento: () => { },
            municipios: municipiosOptions,
            municipios_laboral: municipiosOptionsProfesional,
            seleccionarMunicipio: () => { },
            opcionesProfesion: profesiones,
            tipoUsuario: 'Profesional',
            validarFecha,
        })
        : null;

    // Tabla de profesionales
    builderTabla
        .setColumnas([
            { titulo: 'name', value: 'Nombre', tamaño: 200 },
            { titulo: 'No_document', value: 'Documento', ordenar: true, tamaño: 100 },
            { titulo: 'profesion', value: 'Profesión', tamaño: 100 },
            { titulo: 'celular', value: 'Celular', tamaño: 100 },
            { titulo: 'zona', value: 'Zona', tamaño: 50 },
            { titulo: 'municipio', value: 'Municipio', tamaño: 150 }
        ])
        .setHeaderTabla({
            titulo: 'Gestión de Profesionales de Medicina',
            descripcion: 'Administra y consulta información de Médicos',
            color: 'bg-[var(--color-default)] text-white',
            accionAgregar: puedePost ? agregarMedico : null,
            buscador: true,
            excel: true,
            filtros: [
                { columna: 'municipio', placeholder: 'Ciudad', datos: [{ text: 'Palmira', value: 'Palmira' }, { text: 'Cali', value: 'Cali' }] },
                { columna: 'zona', placeholder: 'Zona', datos: [{ text: 'Urbana', value: 'urbana' }, { text: 'Rural', value: 'rural' }] },
            ]
        })
        .setDatos(medicos);

    if (puedePut) {
        builderTabla.setAcciones({ icons: [{ icon: 'ver', action: modificarMedico }], botones: true });
    }

    // Construcción de la página
    pagina
        .setFondo('FondoDefault')
        .setLayout('')
        .setContenedor('w-full')
        .addComponente('Tabla', builderTabla);

    if (propiedadesUser) pagina.addComponente('Form', propiedadesUser);
    if (propiedadesVerUser) pagina.addComponente('Form', propiedadesVerUser);

    return pagina.build();

})
// console.log(propiedades)
</script>
<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>