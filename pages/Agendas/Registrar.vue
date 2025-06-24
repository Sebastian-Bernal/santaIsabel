<script setup>
import Fondo from '~/components/Fondos/Fondo'
import FormularioWizard from '~/components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Label from '~/components/Labels/Label.vue';
import Button from '~/components/Buttons/Button.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
import Section from '~/components/Forms/Section.vue';
import { ref, onMounted } from "vue";
import { pacientes } from '../data/pacientes.js';
import { medicos } from '../../data/medicos.js'
import { useNuevaCitaStore } from '~/composables/Formulario/NuevaCita';

const NuevaCitaStore = useNuevaCitaStore();

const {
    formData,
    traerDatos,
    guardarDatos,
} = NuevaCitaStore;

// Delcaracionde variables y funciones
const { $swal } = useNuxtApp();
const fechaModificacion = ref('');
const formComplete = ref(false);
const mostrarLista = ref(false);
const pacientesFiltrados = ref([]);

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    if (formData.Paciente.name !== "" && formData.Paciente.type_doc !== "" && formData.Paciente.No_document !== "") {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
    guardarDatos(newValue);
}, { deep: true });

onMounted(() => {
    traerDatos();
});


// Funcion para autocompletar el paciente
const pacienteExistente = () => {
    const paciente = pacientes.value.find(
        p => p.nombre.toLowerCase() === formData.Paciente.name.toLowerCase()
    )

    if (paciente) {
        formData.Paciente.type_doc = paciente.tipoDocumento
        formData.Paciente.No_document = paciente.documento
        formData.Paciente.id = paciente.id
        fechaModificacion.value = paciente.fechaModificacion

    } else if (!paciente && formData.Paciente.name !== '') {
        $swal.fire({
            icon: 'warning',
            title: 'Paciente no encontrado',
            text: 'El paciente ingresado no está registrado.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: '<a href="/Pacientes/Ingresar">Registrar</a>',
            cancelButton: 'Cancelar',
            cancelButtonColor: '#d33',
            showCancelButton: true
        })
    }
};

// datalist -------------
function filtrarPacientes() {
    if (formData.Paciente.name.length === 0) {
        pacientesFiltrados.value = [];
        mostrarLista.value = false;
        return;
    }

    pacientesFiltrados.value = pacientes.value.filter(p =>
        p.nombre.toLowerCase().includes(formData.Paciente.name.toLowerCase())
    );
    mostrarLista.value = true;
}

function seleccionarPaciente(paciente) {
    formData.Paciente.name = paciente.nombre;
    formData.Paciente.type_doc = paciente.tipoDocumento;
    formData.Paciente.No_document = paciente.documento;
    formData.Paciente.id = paciente.id;
    fechaModificacion.value = paciente.fechaModificacion;
    mostrarLista.value = false;
    // Aquí puedes también autocompletar el número de documento

}


const validarform = () => {
    if (!formComplete.value) {
        $swal.fire({
            position: "top-end",
            text: "Falta campos por llenar, por favor ingrese valores",
            showConfirmButton: false,
            timer: 1500,
            background: '#d33',
            color: '#fff'
        });
    }
};
</script>

<template>
    <Fondo class="w-full h-full flex flex-col items-center">
        <FormularioWizard class="mt-3" :datos="{
            titulo: '',
            tituloFormulario: 'Nueva Cita Medica',
            formData: formData.value,
        }" tamaño="w-[70%] h-[80%]">

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user text-blue-500"></i>
                    <Label forLabel="nombre" size="text-sm">Paciente</Label>
                </div>
            </Section>
            <Section styles="relative" @blur="pacienteExistente">
                <Input v-model="formData.Paciente.name" type="text" id="nombre" name="nombre" list="nombreList"
                    @input="filtrarPacientes" placeholder="Nombre del paciente" tamaño="w-full"/>
                <ul v-show="mostrarLista && pacientesFiltrados.length"
                    class="autocomplete-list absolute top-full left-0 right-0 max-h-[200px] overflow-y-auto bg-white border border-[#d0d7de] rounded-lg z-9 p-0 mt-1">
                    <li v-for="paciente in pacientesFiltrados" :key="paciente.documento" class=""
                        @click="seleccionarPaciente(paciente)">
                        <strong>{{ paciente.nombre }}</strong><br />
                        <small>cédula: {{ paciente.documento }}</small>
                    </li>
                </ul>
            </Section>

            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-calendar text-blue-500"></i>
                    <Label forLabel="tipo" size="text-sm">Fecha y Hora</Label>
                </div>
            </Section>

            <Section>
                <Input v-model="formData.fecha" type="date" id="fecha" name="fecha"
                    placeholder="Nombre completo del acompañante" tamaño="w-full" />
                <Input v-model="formData.parentesco" type="time" id="parentesco" name="parentesco"
                    placeholder="Seleccione el parentesco" tamaño="w-full"></Input>
            </Section>

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-stethoscope text-blue-500"></i>
                    <Label forLabel="nombre" size="text-sm">Detalles de la cita</Label>
                </div>
            </Section>

            <Section styles="relative" @blur="pacienteExistente">
                <Input v-model="formData.Medico.name" type="text" id="nombre" name="nombre" list="medicosList"
                    placeholder="Nombre del profesional" tamaño="w-full"/>
                <datalist id="medicosList">
                    <option v-for="medico in medicos" :value="medico.nombre"></option>
                </datalist>
                <Select v-model="formData.Medico.servicio" id="profesion" name="profesion"
                    :options="[{ text: 'Medicina General', value: 'Medicina General' }, { text: 'Psicologia', value: 'Psicologia' }, { text: 'Odontologia', value: 'Odontologia' }]"
                    placeholder="Servicio" tamaño="w-full"></Select>
            </Section>




            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink to="/Agendas">
                    <ButtonForm color="bg-gray-500"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Atras
                    </ButtonForm>
                </nuxtLink>
                <nuxtLink :to="formComplete ? '' : ''">
                    <ButtonForm color="bg-blue-500" @click="validarform"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Registrar
                    </ButtonForm>
                </nuxtLink>
            </div>

        </FormularioWizard>
    </Fondo>
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