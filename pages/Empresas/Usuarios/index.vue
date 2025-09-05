<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { municipios } from '~/data/municipios';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { useUserBuilder } from '~/build/Usuarios/useUserFormBuilder';
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { storeToRefs } from 'pinia';

const varView = useVarView();
const UsersStore = useUsersStore();
const { listUsers } = storeToRefs(UsersStore);
const Users = ref([]);
const datosUser = ref()
const refresh = ref(1)
const show = ref(false)
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
    varView.cargando = false
});


const modificarUser = (user) => {
    varView.showModificarUser = true
    datosUser.value = user;
}

const nuevoUser = () => {
    show.value = true
}

function cerrar() {
    show.value = false
}

watch(() => UsersStore.Formulario.User.rol, (newValue) => {
    console.log(newValue)
    tipoUsuario.value = newValue
})

function buscarUsuario() {

}

function seleccionarDepartamento() {

}

// const propiedadesUser = useUserBuilder({
//     storeId: 'NuevoUser',
//     storePinia: 'Usuarios',
//     tipoUsuario: tipoUsuario,
//     cerrarModal: cerrar,
//     show: show,
//     tipoFormulario: 'Wizard',
//     buscarUsuario,
//     departamentos: municipios.departamentos,
//     seleccionarDepartamento,
// });



// Construccion de pagina

const builderTabla = new TablaBuilder()


const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const propiedadesUser = useUserBuilder({
        storeId: 'NuevoUser',
        storePinia: 'Usuarios',
        tipoUsuario: tipoUsuario.value,
        cerrarModal: cerrar,
        show: show,
        tipoFormulario: 'Wizard',
        buscarUsuario,
        departamentos: municipios.departamentos,
        seleccionarDepartamento
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
                icons: [{ icon: 'ver', action: modificarUser }],
                botones: true
            })
            .setDatos(Users)
        )
        .addComponente('Form', propiedadesUser)
        .build();
});
// const propiedades = pagina
//     .setFondo('FondoDefault')
//     .setEstilos('')
//     .setLayout('')
//     .setContenedor('w-full')
//     .addComponente('Tabla', builderTabla
//         .setColumnas([
//             { titulo: 'name', value: 'Nombre', tamaño: 200, ordenar: true },
//             { titulo: 'No_document', value: 'Documento', tamaño: 100 },
//             { titulo: 'rol', value: 'Rol', tamaño: 100 },
//             { titulo: 'celular', value: 'Celular', tamaño: 100 },
//             { titulo: 'estado', value: 'Estado', tamaño: 150 },
//         ])
//         .setHeaderTabla({titulo: 'Gestion de Usuarios', descripcion: 'Administra y consulta información de Usuarios Admin', color: 'bg-[var(--color-default)] text-white', accionAgregar: nuevoUser})
//         .setAcciones({ icons: [{ icon: 'ver', action: modificarUser }], botones: true })
//         .setDatos(Users)
//     )
//     .addComponente('Form', unref(propiedadesUser))
//     .build()
</script>
<template>
    <Pagina :Propiedades="propiedades" />
</template>