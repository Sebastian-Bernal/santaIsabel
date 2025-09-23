<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { municipios } from '~/data/municipios';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { useUserBuilder } from '~/build/Usuarios/useUserFormBuilder';
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { storeToRefs } from 'pinia';
import { mapCampos } from '~/components/organism/Forms/useFormulario';

const varView = useVarView();
const UsersStore = useUsersStore();
const { listUsers } = storeToRefs(UsersStore);
const Users = ref([]);
const refresh = ref(1)
const show = ref(false)
const showVer = ref(false)
const tipoUsuario = ref('Administrador')

async function llamadatos() {
    Users.value = await listUsers.value;
}

watch(() => varView.showNuevoUser, async () => {
    await llamadatos()
    refresh.value++
})

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    await UsersStore.indexDBDatos()
    varView.cargando = false
});

const nuevoUser = () => {
    show.value = true
}

function cerrar() {
    show.value = false
    showVer.value = false
    varView.soloVer = true
}

const verUser = (usuario) => {
    mapCampos(usuario, UsersStore.Formulario)
    UsersStore.Formulario.User.id = usuario.id
    showVer.value = true
}

watch(() => UsersStore.Formulario.User.rol, (newValue) => {
    tipoUsuario.value = newValue
})

function buscarUsuario() {

}

function seleccionarDepartamento() {

}

const municipiosOptions = computed(() => {
    const departamentoSeleccionado = UsersStore.Formulario.InformacionUser.departamento;

    const departamento = municipios.departamentos.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

    return departamento ? departamento.municipios : [];
});


// Construccion de pagina

const builderTabla = new TablaBuilder()


const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const propiedadesUser = useUserBuilder({
        storeId: 'NuevoUsuario',
        storePinia: 'Usuarios',
        tipoUsuario: 'Administrador',
        cerrarModal: cerrar,
        show: show,
        tipoFormulario: 'Wizard',
        buscarUsuario,
        departamentos: municipios.departamentos,
        seleccionarDepartamento,
        municipios: municipiosOptions,
        seleccionarMunicipio: () => {},
    });

    const propiedadesVerUser = useUserBuilder({
        storeId: "ModificarUsuario",
        storePinia: "Usuarios",
        cerrarModal: cerrar,
        show: showVer,
        tipoFormulario: "Wizard",
        verUser: true,
        soloVer: varView.soloVer,
        tipoUsuario: "Administrador",
    });

    return pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setLayout('')
        .setContenedor('w-full')
        .addComponente('Tabla', builderTabla
            .setColumnas([
                { titulo: 'name', value: 'Nombre', tamaño: 200, ordenar: true },
                { titulo: 'No_document', value: 'Documento', tamaño: 100 },
                { titulo: 'rol', value: 'Rol', tamaño: 100 },
                { titulo: 'celular', value: 'Celular', tamaño: 100 },
                { titulo: 'estado', value: 'Estado', tamaño: 150 },
            ])
            .setHeaderTabla({
                titulo: 'Gestion de Usuarios',
                descripcion: 'Administra y consulta información de Usuarios Admin',
                color: 'bg-[var(--color-default)] text-white',
                accionAgregar: nuevoUser
            })
            .setAcciones({
                icons: [{ icon: 'ver', action: verUser }],
                botones: true
            })
            .setDatos(Users)
        )
        .addComponente('Form', propiedadesUser)
        .addComponente('Form', propiedadesVerUser)
        .build();
});

</script>
<template>
    <Pagina :Propiedades="propiedades" />
</template>