<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useEpsBuilder } from '~/build/Empresa/useEpsBuilder'
import { useProfesionesBuilder } from '~/build/Empresa/useProfesionesBuilder'
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { useDatosEPSStore } from '~/stores/Formularios/empresa/EPS';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { mapCampos, mapCamposLimpios } from '~/components/organism/Forms/useFormulario';
import { ref, onMounted } from 'vue';

const storeEPS = useDatosEPSStore();
const storeProfesion = useDatosProfesionStore();
const varView = useVarView();

const EPSdata = ref([]);
const Profesiones = ref([]);
const showModificarProfesion = ref(false)
const showModificarEPS = ref(false)
const secciones = ref([])

onMounted(async () => {
    varView.cargando = true
    EPSdata.value = await storeEPS.listEPS
    Profesiones.value = await storeProfesion.listProfesion
    secciones.value = await storeProfesion.listSecciones()
    varView.cargando = false
});

// Formularios Configuracion Empresa
const propiedadesEPS = useEpsBuilder({
    storeId: 'EPS',
    storePinia: 'EPS',
})


const propiedadesVerEPS = useEpsBuilder({
    storeId: 'ActualizarEPS',
    storePinia: 'EPS',
    actualizar: true,
    showModificarEPS: showModificarEPS,
    cerrar: cerrarEPS
})

// Funciones Actualizar Profesion
function actualizarProfesion(profesion) {
    mapCampos(profesion, storeProfesion.Formulario)
    storeProfesion.Formulario.Profesion.id = profesion.id
    storeProfesion.Formulario.Profesion.id_temporal = profesion.id_temporal
    showModificarProfesion.value = true
}

function cerrar() {
    showModificarProfesion.value = false
    mapCamposLimpios(storeProfesion.Formulario)
}

// Funciones actualizar eps
function actualizarEPS(eps) {
    mapCampos(eps, storeEPS.Formulario)
    storeEPS.Formulario.EPS.id = eps.id
    storeEPS.Formulario.EPS.id_temporal = eps.id_temporal
    showModificarEPS.value = true
}

function cerrarEPS() {
    showModificarEPS.value = false
    mapCamposLimpios(storeEPS.Formulario)
}

// Construccion de pagina

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const builderTablaProfessions = new TablaBuilder()
    const builderTablaEPS = new TablaBuilder()

    const propiedadesProfesion = useProfesionesBuilder({
        storeId: 'Profesion',
        storePinia: 'Profesion',
        permisos: secciones.value,
        actualizar: false
    })
    
    const propiedadesVerProfesion = useProfesionesBuilder({
        storeId: 'ActualizarProfesion',
        storePinia: 'Profesion',
        permisos: secciones.value,
        actualizar: true,
        showModificarProfesion: showModificarProfesion,
        cerrar
    })


    return pagina
        .setFondo('FondoDefault')
        .setHeaderPage({ titulo: 'Datos Asociados a la Empresa', descripcion: 'Registra y configura segun los datos de tu Empresa.', })
        .setEstilos('')
        .setLayout('')
        .setContenedor('w-full flex flex-col gap-5')
        .addComponente('Form', propiedadesEPS)
        .addComponente('Tabla', builderTablaEPS
            .setColumnas([
                { titulo: 'nombre', value: 'Nombre', tamaño: 100, ordenar: true },
                { titulo: 'direccion', value: 'Direccion', tamaño: 100, ordenar: true },
                { titulo: 'email', value: 'Correo', tamaño: 100, ordenar: true },
                { titulo: 'telefono', value: 'Telefono', tamaño: 100, ordenar: true },
                { titulo: 'codigo', value: 'Codigo', tamaño: 100, ordenar: true },
            ])
            .setHeaderTabla({ titulo: 'EPS Registradas', color: 'bg-[var(--color-default)] text-white', })
            .setAcciones({ icons: [{ icon: 'ver', action: actualizarEPS }], botones: true, })
            .setDatos(EPSdata)
        )
        .addComponente('Form', propiedadesVerEPS)
        .addComponente('Form', propiedadesProfesion)
        .addComponente('Tabla', builderTablaProfessions
            .setColumnas([
                { titulo: 'nombre', value: 'Nombre', tamaño: 500, ordenar: true },
                { titulo: 'codigo', value: 'Codigo', tamaño: 200, ordenar: true },
            ])
            .setHeaderTabla({
                titulo: 'Profesiones Registradas',
                color: 'bg-[var(--color-default)] text-white',
                buscador: true,
                excel: true,
            })
            .setAcciones({ icons: [{ icon: 'ver', action: actualizarProfesion }], botones: true, })
            .setDatos(Profesiones)
        )
        .addComponente('Form', propiedadesVerProfesion)
        .build()
})

// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" />
</template>