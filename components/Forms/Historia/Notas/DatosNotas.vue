<!-- <script setup>
// Componentes
import Label from "~/components/Labels/Label.vue";
import Input from "~/components/Inputs/Input.vue";
import Section from "~/components/Forms/Section.vue";
import Select from "~/components/Selects/Select.vue";
import InputContenido from "~/components/Inputs/InputContenido.vue";
import Textarea from "~/components/Textareas/Textarea.vue";
// Data
import { useVarView } from "../../stores/varview.js";
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { useCalendarioCitas } from "~/stores/Calendario.js";
import { storeToRefs } from 'pinia';
import { ref, watch, onMounted } from "vue";

const varView = useVarView();
const PacientesStore = usePacientesStore();
const CalendarioStore = useCalendarioCitas();
const { listPacientes } = storeToRefs(PacientesStore);
const { fechaActual } = storeToRefs(CalendarioStore)
const PacientesList = ref([]);
const pacientesFiltrados = ref([]);
const mostrarLista = ref(false);

const props = defineProps([
    'formData',
    'traerDatos',
    'guardarDatos',
    'agregarItem',
    'eliminarItem',
    'noCambiar',
    'verNota'
]);

const camposRequeridos = [
    'fecha_nota',
    'hora_nota',
    'id_paciente',
    'name_paciente',
    'No_document_paciente',
    'direccion',
    'nota',
];

// Guardar Datos en el localStorage
watch(
    props.formData,
    (newValue) => {
        props.guardarDatos(newValue);
        const nota = newValue.Nota;
        // Validacion
        const camposValidos = camposRequeridos.every((campo) => nota[campo] !== '');
        varView.formComplete = camposValidos;
    },
    { deep: true }
);

watch(listPacientes, (newvalue) => {
    PacientesList.value = newvalue.value
})

// Traer datos del localStorage
onMounted(async () => {
    props.traerDatos();
    await PacientesStore.listPacientes
    PacientesList.value = PacientesStore.Pacientes;

    if (!props.formData.Nota.fecha_nota) {
        props.formData.Nota.fecha_nota = fechaActual.value.split('/').reverse().join('-');
    }

});

// datalist para Pacientes
function filtrarPacientes() {
    if (props.formData.Nota.name_paciente.length === 0) {
        pacientesFiltrados.value = [];
        mostrarLista.value = false;
        return;
    }

    pacientesFiltrados.value = PacientesList.value.filter(p =>
        p.name.toLowerCase().includes(props.formData.Nota.name_paciente.toLowerCase())
    );
    mostrarLista.value = true;
}
// Autocompletar campos del paciente al seleccionar datalist
function seleccionarPaciente(paciente) {
    props.formData.Nota.name_paciente = paciente.name;
    props.formData.Nota.No_document_paciente = paciente.No_document;
    props.formData.Nota.id_paciente = paciente.id;
    mostrarLista.value = false;
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
        <Input v-model="props.formData.Nota.name_paciente" type="text" id="nombre" name="nombre" list="nombreList"
            @input="filtrarPacientes" placeholder="Nombre del paciente" tamaño="w-full" />
        <ul v-show="mostrarLista && pacientesFiltrados.length"
            class="autocomplete-list absolute top-full left-0 right-50 max-h-[200px] overflow-y-auto bg-white border border-[#d0d7de] rounded-lg z-9 p-3 mt-1">
            <li v-for="paciente in pacientesFiltrados" :key="paciente.documento" @click="seleccionarPaciente(paciente)">
                <strong>{{ paciente.name }}</strong><br />
                <small>cédula: {{ paciente.No_document }}</small>
            </li>
        </ul>
        <Input :disabled="props.verNota" v-model="props.formData.Nota.No_document_paciente" type="number" id="documento"
            name="documento" placeholder="Número de documento" tamaño="w-full" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-location-dot text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Fecha y Ubicacion</Label>
        </div>
    </Section>

    <Section styles="md:flex-row flex-col">
        <InputContenido :disabled="props.verNota" v-model="props.formData.Nota.fecha_nota" type="text" id="fecha_nota"
            name="fecha_nota" placeholder="Fecha" tamaño="md:w-1/3 w-full">
            <input v-model="props.formData.Nota.fecha_nota" type="date" class="w-[20px]">
        </InputContenido>
        <InputContenido :disabled="props.verNota" v-model="props.formData.Nota.hora_nota" type="text" id="hora_nota"
            name="hora_nota" placeholder="Hora (00:00)" tamaño="md:w-1/3 w-full">
            <input v-model="props.formData.Nota.hora_nota" type="time" class="w-[30px]">
        </InputContenido>
        <Input :disabled="props.verNota" v-model="props.formData.Nota.direccion" type="text" id="direccion"
            name="direccion" placeholder="Direccion" tamaño="md:w-1/3 w-full" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-file text-blue-500"></i>
            <Label forLabel="tipo" size="text-sm">Diagnoticos</Label>
        </div>
    </Section>

    <Section styles="flex-col max-h-[150px] overflow-y-auto">
        <Select v-model="props.formData.Nota.tipoAnalisis" id="rehabilitacion" name="rehabilitacion"
            :options="[{ text: 'Estado clinico sin cambios', value: 'Estado clinico sin cambios' }, { text: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' }, { text: 'Cambios criticos', value: 'Cambios criticos' }]"
            placeholder="Tipo de Analisis" tamaño="w-full"></Select>
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-comment text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Nota</Label>
        </div>
    </Section>
    <Section styles="md:flex-row flex-col">
        <Textarea :disabled="props.verNota" v-model="props.formData.Nota.nota" type="number" id="nota" name="nota"
            placeholder="Nota" tamaño="w-full"></Textarea>
    </Section>
</template> -->
