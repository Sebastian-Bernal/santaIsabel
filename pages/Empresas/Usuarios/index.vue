<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { municipios } from '~/data/municipios';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { useUserBuilder } from '~/build/Usuarios/useUserFormBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { mapCampos } from '~/components/organism/Forms/useFormulario';
import { traerAdministradores } from '~/Core/Empresa/Usuario/GetAdministradores';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { validarYEnviarEliminarUsuario } from '~/Core/Empresa/Usuario/EliminarUsuario';

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const UsersStore = useUsersStore();
const Users = ref([]);
const refresh = ref(1)
const show = ref(false)
const showVer = ref(false)

async function llamadatos() {
    Users.value = await traerAdministradores()
    await UsersStore.indexDBDatos()
}
// Actualizar pagina cunso se agrega Nuevo Usuario
watch(() => show.value, 
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
)

watch(() => showVer.value, 
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
)

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
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
    UsersStore.Formulario.InformacionUser.id = usuario.id
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

    if (!UsersStore.Formulario.InformacionUser.nacimiento) return

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

    const departamento = municipios.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

    return departamento ? departamento.municipios : [];
});

async function eliminarUsuario() {
    const Usuario = UsersStore.Formulario
    console.log(Usuario)
    notificaciones.options.icono = 'warning';
    notificaciones.options.titulo = 'Deseas Eliminar Usuario?';
    notificaciones.options.html = `Se descativara el administrador ${Usuario.InformacionUser.name}.`;
    notificaciones.options.confirmtext = 'Si, Eliminar'
    notificaciones.options.canceltext = 'Atras'
    const respuestaAlert = await notificaciones.alertRespuesta()

    if (respuestaAlert === 'confirmado') {
        const res = await validarYEnviarEliminarUsuario(Usuario.InformacionUser)
        if (res) {
            notificaciones.options.position = 'top-end';
            notificaciones.options.texto = "Usuario eliminado con exito.";
            notificaciones.options.background = '#6bc517'
            notificaciones.options.tiempo = 1500
            notificaciones.mensaje()
            notificaciones.options.background = '#d33'
            
            cerrar()
            await llamadatos();
            refresh.value++;
        }
    }
}


// Construccion de pagina
const propiedades = computed(() => {
    const builderTabla = new TablaBuilder()
    const pagina = new ComponenteBuilder()

    // Verifica permisos específicos
    const puedeVer = varView.getPermisos.includes('Usuarios_view');
    const puedePut = varView.getPermisos.includes('Usuarios_put');
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
                .setheaderTitle('Gestión de Usuarios')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }
    const puedePostUsuarios = varView.getPermisos.includes('Usuarios_post');
    const propiedadesUser = useUserBuilder({
        storeId: 'NuevoUsuario',
        storePinia: 'Usuarios',
        tipoUsuario: 'Administrador',
        cerrarModal: cerrar,
        show: show,
        tipoFormulario: 'Wizard',
        buscarUsuario,
        departamentos: municipios,
        seleccionarDepartamento,
        municipios: municipiosOptions,
        seleccionarMunicipio: () => { },
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
        validarTipoDoc,
        eliminar: eliminarUsuario
    });

    builderTabla
        .setColumnas([
            { titulo: 'name', value: 'Nombre', tamaño: 180, ordenar: true },
            { titulo: 'No_document', value: 'Documento', tamaño: 150 },
            { titulo: 'celular', value: 'Celular', tamaño: 100 },
            { titulo: 'municipio', value: 'Ciudad', tamaño: 150 },
        ])
        .setHeaderTabla({
            titulo: 'Gestion de Administradores',
            descripcion: 'Administra y consulta información de Usuarios Admin',
            color: 'bg-[var(--color-default)] text-white',
            accionAgregar: puedePostUsuarios ? nuevoUser : ''
        })
        .setDatos(Users);

        const acciones = [];
        if (puedePut) {
            acciones.push({ icon: "ver", action: verUser });
        }

        if (acciones.length > 0) {
            builderTabla.setAcciones({ icons: acciones, botones: true });
        }

    pagina
        .setFondo('FondoDefault')
        .setEstilos('')
        .setContenedor('w-full')
        .addComponente('Tabla', builderTabla)
        .addComponente('Form', propiedadesUser)
        if (propiedadesVerUser) pagina.addComponente("Form", propiedadesVerUser);

    return pagina.build();
});

</script>
<template>
    <Pagina :Propiedades="propiedades" />
</template>