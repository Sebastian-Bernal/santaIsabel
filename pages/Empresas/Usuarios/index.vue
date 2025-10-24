<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { municipios } from '~/data/municipios';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { useUserBuilder } from '~/build/Usuarios/useUserFormBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
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
// Actualizar pagina cunso se agrega Nuevo Usuario
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

// Visibilidad Formulario
const nuevoUser = () => {
    show.value = true
}

function cerrar() {
    show.value = false
    showVer.value = false
    varView.soloVer = true
}

// Funciones Formulario
const verUser = (usuario) => {
    mapCampos(usuario, UsersStore.Formulario)
    UsersStore.Formulario.User.id = usuario.id
    showVer.value = true
}

function buscarUsuario() {

}

function seleccionarDepartamento() {

}

function validarFecha(event) {
    const fecha = new Date(event.target.value);
    const hoy = new Date();

    let mensajeError = '' 
    // Calcular edad
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
    }

    if (edad < 0 || edad > 100) {
        mensajeError = "La edad debe estar entre 0 y 100 años";
    }

    // Validación según tipo de documento
    if (UsersStore.Formulario.InformacionUser.type_doc === "cedula" && edad < 18) {
        mensajeError = "Para cédula, la edad mínima es 18 años";
    }

    if (UsersStore.Formulario.InformacionUser.type_doc === "Tarjeta de identidad" && edad > 17) {
        mensajeError = "Para tarjeta de identidad, la edad máxima es 17 años";
    }

    const errorDiv = document.getElementById(`error-fecha`);
    if (errorDiv) {
        if (mensajeError) {
            errorDiv.innerHTML = `<p>${mensajeError}</p>`;
        } else {
            errorDiv.innerHTML = ''; // Limpia el mensaje si no hay error
        }
    }
}

function validarTipoDoc(event) {
    const tipoDoc = event.target.value

    if(!UsersStore.Formulario.InformacionUser.nacimiento) return

    const fecha = new Date(UsersStore.Formulario.InformacionUser.fecha);
    const hoy = new Date();

    let mensajeError = ''
    // Calcular edad
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
    }

    if (edad < 0 || edad > 100) {
        mensajeError = "La edad debe estar entre 0 y 100 años";
    }

    // Validación según tipo de documento
    if (tipoDoc === "cedula" && edad < 18) {
        mensajeError = "Para cédula, la edad mínima es 18 años";
    }

    if (tipoDoc === "Tarjeta de identidad" && edad > 17) {
        mensajeError = "Para tarjeta de identidad, la edad máxima es 17 años";
    }

    const errorDiv = document.getElementById(`error-fecha`);
    if (errorDiv) {
        if (mensajeError) {
            errorDiv.innerHTML = `<p>${mensajeError}</p>`;
        } else {
            errorDiv.innerHTML = ''; // Limpia el mensaje si no hay error
        }
    }
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
        validarFecha,
        validarTipoDoc,
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
        validarFecha,
        validarTipoDoc
    });

    return pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')
        .addComponente('Tabla', builderTabla
            .setColumnas([
                { titulo: 'name', value: 'Nombre', tamaño: 200, ordenar: true },
                { titulo: 'No_document', value: 'Documento', tamaño: 100 },
                { titulo: 'celular', value: 'Celular', tamaño: 100 },
                { titulo: 'estado', value: 'Estado', tamaño: 150 },
            ])
            .setHeaderTabla({
                titulo: 'Gestion de Usuarios',
                descripcion: 'Administra y consulta información de Usuarios Admin',
                color: 'bg-[var(--color-default)] text-white',
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