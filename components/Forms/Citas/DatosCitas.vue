<script setup>
// Componentes
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import SelectSearch from '~/components/atoms/Selects/SelectSearch.vue';
import Label from '~/components/atoms/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
// Data
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico';
import { useCalendarioCitas } from '~/stores/Calendario'
import { ref, onMounted } from "vue";
import { useVarView } from "../../stores/varview.js";
import { storeToRefs } from 'pinia';

const varView = useVarView();
const calendarioCitasStore = useCalendarioCitas();
const PacientesStore = usePacientesStore();
const notificacionesStore = useNotificacionesStore();
const medicosStore = useMedicosStore();

const { Pacientes } = storeToRefs(PacientesStore);
const { Medicos } = storeToRefs(medicosStore)
const props = defineProps([
    'formData',
    'traerDatos',
    'guardarDatos',
    'agregarItem',
    'eliminarItem',
    'noCambiar'
]);
// Importar states y funciones del store
const {
    fecha,
    fechaActual
} = calendarioCitasStore;

const {
    simple,
    mensaje,
    alertRespuesta,
    options
} = notificacionesStore;


// Delcaracionde variables y funciones
const fechaModificacion = ref('');
const mostrarLista = ref(false);
const medicosList = ref([]);
const PacientesList = ref([]);
const camposVacios = ref(false);

const camposRequeridos = [
    'name_paciente', 'servicio', 'hora', 'fecha', 'name_medico', 'motivo',
];

onMounted(async () => {
    await medicosStore.listMedicos
    medicosList.value = medicosStore.Medicos;

    await PacientesStore.listPacientes
    PacientesList.value = PacientesStore.Pacientes;

    props.traerDatos();
    props.formData.Cita.fecha = fechaformatDate();

});

// Guardar los datos en localStorage
watch(props.formData, (newValue) => {
    props.guardarDatos(newValue);

    const cita = newValue.Cita;
    // Validacion
    const camposValidos = camposRequeridos.every((campo) => cita[campo] !== '');
    // Detectar inputs inválidos
    const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
    varView.formComplete = camposValidos && !hayCamposInvalidos;
    camposVacios.value = !varView.formComplete
}, { deep: true });

watch(
    () => props.formData.Cita.fecha, (newFecha) => {
        const fechaHoy = new Date();
        const fecha = newFecha
        // Fecha cita del formulario
        const [year, month, day] = fecha.split('-').map(Number);
        const fechaCita = new Date(year, month - 1, day); // mes base 0

        // Normalizar ambas fechas para comparar solo año/mes/día
        fechaHoy.setHours(0, 0, 0, 0);
        fechaCita.setHours(0, 0, 0, 0);
        const fechaValida = fechaCita >= fechaHoy;

        if (!fechaValida) {
            props.formData.Cita.fecha = ''; // Formato YYYY-MM-DD
            options.position = "top-end";
            options.texto = "La fecha de la cita no puede ser anterior a hoy.";
            options.tiempo = 1500;
            mensaje();
            props.formData.Cita.fecha = ''
        }
    });

watch(() => props.formData.Cita.hora, (newHora) => {
    if (!newHora) return;

    const [horaStr, minutoStr] = newHora.split(':');
    const hora = parseInt(horaStr, 10);
    const minuto = parseInt(minutoStr, 10);

    // Convertimos la hora a minutos desde medianoche para comparación
    const horaEnMinutos = hora * 60 + minuto;
    const minPermitido = 6 * 60;     // 6:00 AM
    const maxPermitido = 22 * 60;    // 10:00 PM

    if (horaEnMinutos < minPermitido || horaEnMinutos > maxPermitido) {
        props.formData.Cita.hora = ''; // Invalidamos la hora seleccionada
        options.position = "top-end";
        options.texto = "La hora debe estar entre las 6:00 AM y 10:00 PM.";
        options.tiempo = 1500;
        mensaje();
        props.formData.Cita.hora = '';
    }
});

// Formatear fecha dd/mm/aaaa - aaaa-mm-dd
const fechaformatDate = () => {
    const partes = fecha.split('/')
    return partes.reverse().join('-')
}

// Funcion para autocompletar el paciente
const pacienteExistente = async () => {
    const paciente = Pacientes.value.find(
        p => p.name.toLowerCase() === props.formData.Cita.name_paciente.toLowerCase()
    )

    if (!paciente && props.formData.Cita.name_paciente !== '') {
        options.icono = 'warning';
        options.titulo = 'Paciente no encontrado';
        options.texto = 'El paciente ingresado no está registrado.';
        options.confirmtext = 'Registrar'
        options.canceltext = 'Cancelar'
        options.tiempo = 2000
        const respuesta = await alertRespuesta();
        if (respuesta === 'confirmado') {
            varView.showNuevoPaciente = true
        }
    }
};

// Autocompletar campos del paciente al seleccionar datalist
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

</script>

<template>
    <Section>
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-user text-blue-500"></i>
            <Label :Propiedades="{
                forLabel: 'nombreP',
                size: 'text-sm'
            }">Paciente</Label>
        </div>
    </Section>
    <Section>
        <SelectSearch v-model="formData.Cita.name_paciente" :options="PacientesList"
            :seleccionarItem="seleccionarPaciente" name="nombreP" id="nombreP" placeholder="Nombre del paciente"
            :opciones="[{ value: 'name' }, { text: 'Cedula', value: 'No_document' }]" />
    </Section>

    <Section>
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-stethoscope text-blue-500"></i>
            <Label :Propiedades="{
                forLabel: 'nombre',
                size: 'text-sm'
            }">Detalles de la cita</Label>
        </div>
    </Section>

    <Section styles="relative md:flex-row flex-col" @blur="pacienteExistente">

        <SelectSearch v-model="formData.Cita.name_medico" :options="medicosList" @click="pacienteExistente"
            :seleccionarItem="seleccionarMedico" name="nombreM" id="nombreM" placeholder="Nombre del profesional"
            :opciones="[{ value: 'name' }, { text: 'Profesion', value: 'profesion' }]" />

        <Select v-model="props.formData.Cita.servicio" :Propiedades="{
            placeholder: 'Servicio',
            options: [
                { text: 'Medicina General', value: 'Medicina General' },
                { text: 'Psicologia', value: 'Psicologia' },
                { text: 'Odontologia', value: 'Odontologia' }
            ],
            id: 'profesion',
            name: 'profesion',
            tamaño: 'w-full',
            modelValue: props.formData.Cita.servicio
        }" />

        <Select v-model="props.formData.Cita.motivo" :Propiedades="{
            placeholder: 'Motivo',
            options: [
                { text: 'Control', value: 'Control' },
                { text: 'Primera vez', value: 'Primera vez' },
                { text: 'Urgencias', value: 'Urgencias' }
            ],
            id: 'motivo',
            name: 'motivo',
            tamaño: 'w-full',
            modelValue: props.formData.Cita.motivo
        }" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-calendar text-blue-500"></i>
            <Label :Propiedades="{
                forLabel: 'fecha',
                size: 'text-sm'
            }">Fecha y Hora</Label>
        </div>
    </Section>

    <Section>
        <Input v-model="props.formData.Cita.fecha" :Propiedades="{
            type: 'date',
            id: 'fecha',
            name: 'fecha',
            tamaño: 'w-full',
            placeholder: 'Nombre completo del acompañante',
            modelValue: props.formData.Cita.fecha
        }" />
        <Input v-model="props.formData.Cita.hora" :Propiedades="{
            type: 'time',
            id: 'hora',
            name: 'hora',
            tamaño: 'w-full',
            placeholder: 'Seleccione la hora para la cita',
            modelValue: props.formData.Cita.hora
        }" />
    </Section>

</template>