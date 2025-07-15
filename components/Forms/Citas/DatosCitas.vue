<script setup>
// Componentes
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
import IngresarProfesional from '~/components/Forms/Profesionales/IngresarProfesional.vue';
// Data
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useMedicosStore } from '~/stores/Formularios/medicos/Medico';
import { useCalendarioCitas } from '~/stores/Calendario'
import { ref, onMounted } from "vue";
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const calendarioCitasStore = useCalendarioCitas();
const PacientesStore = usePacientesStore();
const notificacionesStore = useNotificacionesStore();
const medicosStore = useMedicosStore();

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
const pacientesFiltrados = ref([]);
const medicosList = ref([]);
const PacientesList = ref([]);


// Guardar los datos en localStorage
watch(props.formData, (newValue) => {
    if (props.formData.Cita.name_paciente !== "" && props.formData.Cita.fecha !== '' && props.formData.Cita.servicio) {
        varView.formComplete = true
    } else {
        varView.formComplete = false
    }
    props.guardarDatos(newValue);
}, { deep: true });

onMounted(async() => {
    await medicosStore.listMedicos
    medicosList.value = medicosStore.Medicos;
    await PacientesStore.listPacientes
    PacientesList.value = PacientesStore.Pacientes;
    console.log(PacientesList.value)
    props.traerDatos();
    props.formData.Cita.fecha = fechaformatDate();

});

// Formatear fecha dd/mm/aaaa - aaaa-mm-dd
const fechaformatDate = () => {
    const partes = fecha.split('/')
    return partes.reverse().join('-')
}

// Funcion para autocompletar el paciente
const pacienteExistente = async() => {
    const paciente = PacientesList.value.find(
        p => p.name.toLowerCase() === props.formData.Cita.name_paciente.toLowerCase()
    )

    if (!paciente && props.formData.Cita.name_paciente !== '') {
        options.icono = 'warning';
        options.titulo = 'Paciente no encontrado';
        options.texto = 'El paciente ingresado no está registrado.';
        options.confirmtext = '<a href="/Pacientes/Ingresar">Registrar</a>'
        options.canceltext = 'Cancelar'
        options.tiempo = 2000
        const respuesta = await alertRespuesta();
        if(respuesta === 'confirmado'){
            varView.showNuevoPaciente = true
        }
    }
};

// datalist para Pacientes
function filtrarPacientes() {
    if (props.formData.Cita.name_paciente.length === 0) {
        pacientesFiltrados.value = [];
        mostrarLista.value = false;
        return;
    }

    pacientesFiltrados.value = PacientesList.value.filter(p =>
        p.name.toLowerCase().includes(props.formData.Cita.name_paciente.toLowerCase())
    );
    mostrarLista.value = true;
}
// Autocompletar campos del paciente al seleccionar datalist
function seleccionarPaciente(paciente) {
    props.formData.Cita.name_paciente = paciente.name;
    props.formData.Cita.id_paciente = paciente.id;
    fechaModificacion.value = paciente.fechaModificacion;
    mostrarLista.value = false;
}

async function seleccionarMedico(medico) {
    const medicoSeleccionado = medicosList.value.find(m => m.name.toLowerCase() === medico.toLowerCase());
    if (medicoSeleccionado) {
        props.formData.Cita.name_medico = medicoSeleccionado.name;
        props.formData.Cita.id_medico = medicoSeleccionado.id;
    } else if(!medicoSeleccionado && props.formData.Cita.name_medico !== '') {
        options.icono = 'warning';
        options.titulo = 'Médico no encontrado';
        options.texto = 'El médico ingresado no está registrado.';
        options.confirmtext = 'Registrar'
        options.canceltext = 'Cancelar'
        options.tiempo = 2000
        const respuesta = await alertRespuesta();
        if(respuesta === 'confirmado'){
            varView.showNuevoProfesional = true
        }
    }
}
</script>

<template>
    <Section>
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-user text-blue-500"></i>
            <Label forLabel="nombre" size="text-sm">Paciente</Label>
        </div>
    </Section>
    <Section styles="relative">
        <Input v-model="props.formData.Cita.name_paciente" type="text" id="nombre" name="nombre" list="nombreList"
            @input="filtrarPacientes" placeholder="Nombre del paciente" tamaño="w-full" />
        <ul v-show="mostrarLista && pacientesFiltrados.length"
            class="autocomplete-list absolute top-full left-0 right-0 max-h-[200px] overflow-y-auto bg-white border border-[#d0d7de] rounded-lg z-9 p-0 mt-1">
            <li v-for="paciente in pacientesFiltrados" :key="paciente.documento"
                @click="seleccionarPaciente(paciente)">
                <strong>{{ paciente.name }}</strong><br />
                <small>cédula: {{ paciente.No_document }}</small>
            </li>
        </ul>
    </Section>

    <Section>
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-stethoscope text-blue-500"></i>
            <Label forLabel="nombre" size="text-sm">Detalles de la cita</Label>
        </div>
    </Section>

    <Section styles="relative" @blur="pacienteExistente">
        <Input v-model="props.formData.Cita.name_medico" type="text" id="nombre" name="nombre" list="medicosList"
            @click="pacienteExistente" @blur="seleccionarMedico(props.formData.Cita.name_medico)" placeholder="Nombre del profesional" tamaño="w-full" />
        <datalist id="medicosList">
            <option v-for="medico in medicosList" :value="medico.name">
                profesion: {{ medico.profesion }}
            </option>
        </datalist>
        <Select v-model="props.formData.Cita.servicio" id="profesion" name="profesion"
            :options="[{ text: 'Medicina General', value: 'Medicina General' }, { text: 'Psicologia', value: 'Psicologia' }, { text: 'Odontologia', value: 'Odontologia' }]"
            placeholder="Servicio" tamaño="w-full"></Select>
        <Select v-model="props.formData.Cita.motivo" id="motivo" name="motivo"
            :options="[{ text: 'Control', value: 'Control' }, { text: 'Primera vez', value: 'Primera vez' }, { text: 'Urgencias', value: 'Urgencias' }]"
            placeholder="Motivo" tamaño="w-full"></Select>
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-calendar text-blue-500"></i>
            <Label forLabel="tipo" size="text-sm">Fecha y Hora</Label>
        </div>
    </Section>

    <Section>
        <Input v-model="props.formData.Cita.fecha" type="date" id="fecha" name="fecha"
            placeholder="Nombre completo del acompañante" tamaño="w-full" />
        <Input v-model="props.formData.Cita.hora" type="time" id="hora" name="hora"
            placeholder="Seleccione la hora para la cita" tamaño="w-full"></Input>
    </Section>
</template>

<style scoped>
.autocomplete-list li {
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #eee;
}

.autocomplete-list li:last-child {
    border-bottom: none;
}

.autocomplete-list li:hover {
    background-color: #e5f0ff;
}
</style>