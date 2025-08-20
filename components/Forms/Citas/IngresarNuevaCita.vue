<script setup>
// Componentes
import FormLG from '~/components/organism/Forms/FormLG.vue';
import IngresarProfesional from '~/components/Forms/Profesionales/IngresarProfesional.vue';
import IngresarPaciente from '~/components/Forms/Pacientes/IngresarPaciente.vue';
// Data
import { FormularioBuilder } from "~/composables/Formulario/ClassFormulario";
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita';
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const citasStore = useCitasStore();
const PacientesStore = usePacientesStore();
const medicosStore = useMedicosStore();
const medicosList = ref([]);
const PacientesList = ref([]);
const NuevaCitaStore = citasStore.createForm('NuevaCita');

const notificacionesStore = useNotificacionesStore();


const {
    simple,
    mensaje,
    alertRespuesta,
    options
} = notificacionesStore;

const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario
} = NuevaCitaStore;

onMounted(async() => {
    await medicosStore.listMedicos
    medicosList.value = medicosStore.Medicos;

    await PacientesStore.listPacientes
    PacientesList.value = PacientesStore.Pacientes;
})

function seleccionarPaciente(paciente) {
    props.formData.Cita.name_paciente = paciente.name;
    props.formData.Cita.id_paciente = paciente.id;
    fechaModificacion.value = paciente.fechaModificacion;
    mostrarLista.value = false;
}

async function seleccionarMedico(medico) {
    const medicoSeleccionado = Medicos.value.find(m => m.name.toLowerCase() === medico.toLowerCase());
    if (medicoSeleccionado) {
        props.formData.Cita.name_medico = medicoSeleccionado.name;
        props.formData.Cita.id_medico = medicoSeleccionado.id;
    } else if (!medicoSeleccionado && props.formData.Cita.name_medico !== '') {
        options.icono = 'warning';
        options.titulo = 'Médico no encontrado';
        options.texto = 'El médico ingresado no está registrado.';
        options.confirmtext = 'Registrar'
        options.canceltext = 'Cancelar'
        options.tiempo = 2000
        const respuesta = await alertRespuesta();
        if (respuesta === 'confirmado') {
            varView.showNuevoProfesional = true
        }
    }
}

// Enviar formulario -------------------
const enviarNuevaCita = async (formData) => {
    event.preventDefault()
    varView.cargando = true
    const estado = await mandarFormulario(formData)
    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Nueva cita Registrada';
        options.tiempo = 3000
        const respuesta = await simple()
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            window.location.reload()
        }
    } else {
        options.icono = 'error';
        options.titulo = '¡A ocurrido un problema!';
        options.texto = 'No se pudo registrar Cita';
        options.tiempo = 2000
        simple()
    }
    varView.cargando = false
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

function cerrarModal() {
    limpiar()
    varView.showNuevaCita = false;
}

const builder = new FormularioBuilder()

const propiedades = builder
    .setFormData(formData)
    .setValidarForm(validarform)
    .setFormularioTitulo('Agendar Cita')
    .setContentTraerDatos(traerDatos)
    .setContentGuardarDatos(guardarDatos)
    .setFormularioTituloFormulario('Nueva Cita')
    .setFormularioCerrar(cerrarModal)
    .setFormData(formData)
    .setBotones([
        { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500' },
        { text: 'Guardar', accion: guardarDatos, color: 'bg-blue-500' },
    ])

    // 📌 Sección: Paciente
    .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente',
        tamaño: 'w-full col-span-2',
        forLabel: 'nombreP',
    })
    .addCampo({
        component: 'SelectSearch',
        placeholder: 'Nombre del paciente',
        id: 'nombreP',
        name: 'nombreP',
        tamaño: 'w-full',
        vmodel: 'Cita.name_paciente',
        options: PacientesList,
        opciones: [{ value: 'name' }, { text: 'Cedula', value: 'No_document' }],
        seleccionarItem: seleccionarPaciente,
    })

    // 📌 Sección: Detalles de la cita
    .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-stethoscope text-blue-500 mr-1"></i>Detalles de la cita',
        tamaño: 'w-full col-span-2',
        forLabel: 'nombreM',
    })
    .addCampo({
        component: 'SelectSearch',
        placeholder: 'Nombre del profesional',
        id: 'nombreM',
        name: 'nombreM',
        tamaño: 'w-full',
        vmodel: 'Cita.name_medico',
        options: medicosList,
        opciones: [{ value: 'name' }, { text: 'Profesion', value: 'profesion' }],
        seleccionarItem: seleccionarMedico,
    })
    .addCampo({
        component: 'Select',
        placeholder: 'Servicio',
        id: 'servicio',
        name: 'servicio',
        tamaño: 'w-full',
        options: [
            { text: 'Medicina General', value: 'Medicina General' },
            { text: 'Psicologia', value: 'Psicologia' },
            { text: 'Odontologia', value: 'Odontologia' },
        ],
        vmodel: 'Cita.servicio',
    })
    .addCampo({
        component: 'Select',
        placeholder: 'Motivo',
        id: 'motivo',
        name: 'motivo',
        tamaño: 'w-full',
        options: [
            { text: 'Control', value: 'Control' },
            { text: 'Primera vez', value: 'Primera vez' },
            { text: 'Urgencias', value: 'Urgencias' },
        ],
        vmodel: 'Cita.motivo',
    })

    // 📌 Sección: Fecha y Hora
    .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-calendar text-blue-500 mr-1"></i>Fecha y Hora',
        tamaño: 'w-full col-span-2',
        forLabel: 'fecha',
    })
    .addCampo({
        component: 'Input',
        placeholder: 'Seleccione la fecha',
        type: 'date',
        id: 'fecha',
        name: 'fecha',
        tamaño: 'w-full',
        vmodel: 'Cita.fecha',
    })
    .addCampo({
        component: 'Input',
        placeholder: 'Seleccione la hora para la cita',
        type: 'time',
        id: 'hora',
        name: 'hora',
        tamaño: 'w-full',
        vmodel: 'Cita.hora',
    })
    .build()

</script>

<template>
    <FormLG :Propiedades="propiedades" v-model:formData="formData">

    </FormLG>
    <!-- <IngresarProfesional  v-if="varView.showNuevoProfesional"/>
    <IngresarPaciente  v-if="varView.showNuevoPaciente"/> -->
</template>