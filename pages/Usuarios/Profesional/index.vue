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
import { mapCampos } from '~/components/organism/Forms/useFormulario';
import { validarYEnviarEliminarMedico } from '~/Core/Usuarios/Profesional/DELETEMedico';

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
// Watch para actualizar informacion al agregar o actualizar
watch(() => show.value, async (estado) => {
    if(!estado && varView.cambioEnApi){
        llamadatos()
        refresh.value++
    }
})

watch(() => showVer.value, async (estado) => {
    if(!estado && varView.cambioEnApi){
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

// Variable para controlar la visibilidad del formulario de ingreso de profesional
const modificarMedico = (medico) => {
    mapCampos(medico, medicosStore.Formulario)
    medicosStore.Formulario.Profesional.id = medico.id_profesional
    medicosStore.Formulario.Profesional.id_temporal = medico.id_temporal
    medicosStore.Formulario.Profesional.id_infoUsuario = medico.id_infoUsuario
    medicosStore.Formulario.InformacionUser.id = medico.id_infoUsuario
    medicosStore.Formulario.InformacionUser.id_temporal = medico.id_temporalUsuario
    showVer.value = true;
};

function cerrar() {
    show.value = false
    showVer.value = false
    varView.soloVer = false
}

// Funciones de formularios
const agregarMedico = () => {
    show.value = true;
};

async function buscarUsuario(event) {
    const document = event.target.value
    const store = useIndexedDBStore()
    store.almacen = 'InformacionUser'
    const usuarios = await store.leerdatos()

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

    if (edad < 18 || edad > 100) {
        mensajeError = "La edad debe estar entre 18 y 100 años";
    }

    // Validación según tipo de documento
    if (medicosStore.Formulario.InformacionUser.type_doc === "cedula" && edad < 18) {
        mensajeError = "Para cédula, la edad mínima es 18 años";
    }

    if (medicosStore.Formulario.InformacionUser.type_doc === "Tarjeta de identidad" && edad > 17) {
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

async function eliminarProfesional() {
    const profesional = medicosStore.Formulario

    notificaciones.options.icono = 'warning';
    notificaciones.options.titulo = 'Deseas Eliminar Profesional?';
    notificaciones.options.html = `Se eliminará el profesional: <span>${profesional.InformacionUser.name}</span>`;
    notificaciones.options.confirmtext = 'Si, Eliminar'
    notificaciones.options.canceltext = 'Atras'
    const respuestaAlert = await notificaciones.alertRespuesta()

    if (respuestaAlert === 'confirmado') {

        const res = await validarYEnviarEliminarMedico(profesional)

        if (res) {
            notificaciones.options.position = 'top-end';
            notificaciones.options.texto = "Profesional eliminado con exito.";
            notificaciones.options.background = '#6bc517'
            notificaciones.options.tiempo = 1500
            notificaciones.mensaje()
            notificaciones.options.background = '#d33'
            window.location.reload()
        }
    }
}

const municipiosOptions = computed(() => {
    const departamentoSeleccionado = medicosStore.Formulario.InformacionUser.departamento;

    const departamento = municipios.departamentos.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

    return departamento ? departamento.municipios : [];
});

// Construccion de pagina
const builderTabla = new TablaBuilder()

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    // Verificar permisos específicos
    const puedeVer = varView.getPermisos.includes('Profesional_view');
    if(!puedeVer) return
    const puedePost = varView.getPermisos.includes('Profesional_post');
    const puedePut = varView.getPermisos.includes('Profesional_put');

    // Builder para ver usuario (siempre se usa cuando hay acción "ver")
    const propiedadesVerUser = puedePut
        ? useUserBuilder({
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
            buscarUsuario,
            departamentos: municipios.departamentos,
            seleccionarDepartamento,
            municipios: municipiosOptions,
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