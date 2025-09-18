<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
// Data
import { ref, onMounted } from 'vue';
import { municipios } from '~/data/municipios.js'
import { useMedicosStore } from '~/stores/Formularios/profesional/Profesionales.js';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { storeToRefs } from 'pinia';
import { useUserBuilder } from '~/build/Usuarios/useUserFormBuilder';
import { mapCampos } from '~/components/organism/Forms/useFormulario';

const varView = useVarView();
const medicosStore = useMedicosStore();
const profesionStore = useDatosProfesionStore()
const usuariosStore = useUsersStore()
const { listMedicos } = storeToRefs(medicosStore);
const medicos = ref([]);
const profesiones = ref([]);
const refresh = ref(1);
const show = ref(false)
const showVer = ref(false)

async function llamadatos() {
    medicos.value = await listMedicos.value;
}

watch(() => varView.showNuevoProfesionalPaso2, async () => {
    llamadatos()
    refresh.value++
})

watch(() => varView.showModificarProfesional, async () => {
    llamadatos()
    refresh.value++
})

// Cargar los Medicos desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    const listaProfesiones = await profesionStore.listProfesion
    profesiones.value = listaProfesiones.map((profesion) => {
        return { text: profesion.nombre, value: profesion.nombre }
    })
    varView.cargando = false
});

// Variable para controlar la visibilidad del formulario de ingreso de profesional
const modificarMedico = (medico) => {
    mapCampos(medico, medicosStore.Formulario)
    medicosStore.Formulario.Medico.id = medico.id_profesional
    medicosStore.Formulario.User.id = medico.id
    showVer.value = true;
};

// Formulario
const agregarMedico = () => {
    show.value = true;
};

function cerrar() {
    show.value = false
    showVer.value = false
    varView.soloVer = false
}

async function buscarUsuario(event) {
    const document = event.target.value
    const usuarios = await usuariosStore.listUsers

    const usuarioExistente = usuarios.filter((user) => {
        return user.No_document === document
    });

    if (usuarioExistente[0]) {
        mapCampos(usuarioExistente[0], medicosStore.Formulario)
    }

}

function seleccionarDepartamento(item) {
    // formData.InformacionUser.departamento = item.nombre;
}

const municipiosOptions = computed(() => {
    const departamentoSeleccionado = medicosStore.Formulario.InformacionUser.departamento;

    const departamento = municipios.departamentos.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

    return departamento ? departamento.municipios : [];
});

const propiedadesUser = useUserBuilder({
    storeId: 'NuevoProfesional',
    storePinia: 'Profesionales',
    camposRequeridos: [],
    cerrarModal: cerrar,
    show: show,
    tipoFormulario: 'Wizard',
    buscarUsuario,
    departamentos: municipios.departamentos,
    seleccionarDepartamento,
    municipios: municipiosOptions,
    seleccionarMunicipio: () => { },
    opcionesProfesion: profesiones,
    tipoUsuario: 'Profesional'
});

// Construccion de pagina
const builderTabla = new TablaBuilder()


const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()

    const propiedadesVerUser = useUserBuilder({
        storeId: 'ModificarProfesional',
        storePinia: 'Profesionales',
        camposRequeridos: [],
        cerrarModal: cerrar,
        show: showVer,
        tipoFormulario: 'Wizard',
        buscarUsuario,
        departamentos: municipios.departamentos,
        seleccionarDepartamento,
        municipios: municipiosOptions,
        seleccionarMunicipio: () => { },
        tipoUsuario: 'Profesional',
        verUser: true,
        soloVer: varView.soloVer
    });

    pagina
        .setFondo('FondoDefault')
        .setLayout('')
        .setContenedor('w-full')
        .addComponente('Tabla', builderTabla
            .setColumnas([
                { titulo: 'name', value: 'Nombre', tamaño: 200 },
                { titulo: 'No_document', value: 'Documento', ordenar: true, tamaño: 100 },
                { titulo: 'profesion', value: 'Profesión', tamaño: 100 },
                { titulo: 'celular', value: 'Celular', tamaño: 100 },
                { titulo: 'zona', value: 'Zona', tamaño: 50 },
                { titulo: 'municipio', value: 'Municipio', tamaño: 150 }
            ])
            .setHeaderTabla({
                titulo: 'Gestion de Profesionales de Medicina',
                descripcion: 'Administra y consulta información de Medicos',
                color: 'bg-[var(--color-default)] text-white',
                accionAgregar: agregarMedico,
                buscador: true,
                excel: true,
                filtros: [
                    { columna: 'municipio', placeholder: 'Ciudad', datos: [{ text: 'Palmira', value: 'Palmira' }, { text: 'Cali', value: 'Cali' }] },
                    { columna: 'zona', placeholder: 'Zona', datos: [{ text: 'Urbana', value: 'urbana' }, { text: 'Rural', value: 'rural' }] },
                ]
            })
            .setAcciones({ icons: [{ icon: 'ver', action: modificarMedico }], botones: true })
            .setDatos(medicos)
        )
        .addComponente('Form', propiedadesUser)
        .addComponente('Form', propiedadesVerUser)

    return pagina.build()
})
// console.log(propiedades)
</script>
<template>
    <Pagina :Propiedades="propiedades" />
</template>