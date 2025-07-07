<script setup>
// Componentes
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import FormularioWizard from '~/components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Label from '~/components/Labels/Label.vue';
import Button from '~/components/Buttons/Button.vue';
import Section from '~/components/Forms/Section.vue';
import IngresarPaciente from '~/components/Forms/Pacientes/IngresarPaciente.vue';
import ModificarPaciente from '~/components/Forms/Pacientes/ModificarPaciente.vue';
// Data
import { pacientes } from '../data/pacientes.js';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { ref, onMounted } from "vue";
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const HistoriaStore = useHistoriasStore();
const RegistrarHistoriaStore = HistoriaStore.createForm('RegistrarHistoria')
const notificacionesStore = useNotificacionesStore();

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem,
    limpiar,
} = RegistrarHistoriaStore;

const {
    simple,
    mensaje,
    options
} = notificacionesStore;

// Delcaracionde variables y funciones
const { $swal } = useNuxtApp();
const fechaModificacion = ref('');
const mostrarLista = ref(false);
const pacientesFiltrados = ref([]);

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    if (formData.Paciente.name !== "" && formData.Paciente.type_doc !== "" && formData.Paciente.No_document !== "") {
        varView.formComplete = true
    } else {
        varView.formComplete = false
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
            confirmButtonText: 'Registrar',
            cancelButton: 'Cancelar',
            cancelButtonColor: '#d33',
            showCancelButton: true
        })
    }
};

// datalist para Pacientes
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
// Autocompletar campos al seleccionar paciente en datalist
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
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

const agregarPaciente = () => {
    varView.showNuevoPaciente = true;
}

const modificarPaciente = () => {
    varView.showModificarPaciente = true;
    varView.showNuevaHistoria = false;
}

const cerrar = () => {
    limpiar()
    varView.showNuevaHistoria = false;
    varView.showPaso2 = false;
    varView.showPaso3 = false;
    varView.showPaso4 = false;
}

function cerrarModal() {
    limpiar();
    varView.formComplete = false;
    varView.showNuevaHistoria = false
}

function enviarPrimerPaso(){
    event.preventDefault();
    if (varView.formComplete) {
        varView.showNuevaHistoria = false;
        varView.showPaso2 = true;
    } else {
        validarform();
    }
}
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarPrimerPaso"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{cancelar: 'Cancelar', enviar: 'Siguiente'}">
        <FormularioWizard :datos="{
            titulo: 'Datos del paciente',
            tituloFormulario: 'Nueva Historia Clinica',
            cerrar: cerrar,
            secciones: [
                { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, color: 'bg-gray-300' },
                { numPagina: 3, color: 'bg-gray-300' },
                { numPagina: 4, color: 'bg-gray-300' }
            ]
        }">

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user text-blue-500"></i>
                    <Label forLabel="nombre" size="text-sm">Paciente</Label>
                </div>
                <div class="flex gap-2 items-center">
                    <p class="text-xs">{{ fechaModificacion }}</p>
                    <a @click="modificarPaciente(formData.Paciente)" v-if="fechaModificacion">
                        <Button color="bg-[var(--color-warning)]"><i class="fa-solid fa-pencil"></i></Button>
                    </a>
                    <a @click="agregarPaciente">
                        <Button color="bg-blue-500"><i class="fa-solid fa-plus"></i></Button>
                    </a>
                </div>
            </Section>
            <Section styles="relative">
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


            <Section styles="flex-col md:flex-row">
                <Input v-model="formData.Paciente.No_document" type="number" id="documentoList" name="documento" @click="pacienteExistente"
                    placeholder="Número de documento" tamaño="w-full" />
                <datalist id="documentoList">
                    <option v-for="(paciente, id) in pacientes" :key="id" :value="paciente.documento"></option>
                </datalist>
                <Select v-model="formData.Paciente.type_doc" id="tipoDocumento" name="tipoDocumento"
                    :options="[{ text: 'Cedula de ciudadania', value: 'cedula' }, { text: 'Cedula Extranjera', value: 'extranjera' }, { text: 'Tarjeta de Identidad', value: 'TarjetaIdentidad' }]"
                    placeholder="Tipo de documento" tamaño="w-full"></Select>
            </Section>


            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-users text-purple-500"></i>
                    <Label forLabel="tipo" size="text-sm">Acompañante (Opcional)</Label>
                </div>
                <div class="flex gap-2 items-center">
                    <a @click="agregarItem('Pacientes', { nombre: '', parentesco: ''}, 'nombre')">
                        <Button color="bg-purple-500"><i class="fa-solid fa-plus"></i></Button>
                    </a>
                </div>
            </Section>

            <Section v-for="(item, index) in formData.Paciente.acompañante" :key="index" styles="flex-col md:flex-row">
                <Input v-model="formData.Paciente.acompañante.nombre" type="text" id="nombreAcompañante" name="nombreAcompañante"
                    placeholder="Nombre completo del acompañante" tamaño="w-full" />
                <Select v-model="formData.Paciente.acompañante.parentesco" id="parentesco" name="parentesco"
                    :options="[{ text: 'Padre', value: 'Padre' }, { text: 'Madre', value: 'Madre' }, { text: 'Hijo', value: 'Hijo' }, { text: 'Conyuge', value: 'Conyuge' }, { text: 'Hermano/a', value: 'Hermano/a' }]"
                    placeholder="Seleccione el parentesco" tamaño="w-full"></Select>
            </Section>

            <!-- <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink @click="cerrarModal">
                    <ButtonForm color="bg-gray-500"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Atras
                    </ButtonForm>
                </nuxtLink>
                <nuxtLink :to="varView.formComplete ? '/Historial/Paso2' : ''">
                    <ButtonForm color="bg-blue-500" @click="validarform"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Siguiente
                    </ButtonForm>
                </nuxtLink>
            </div> -->

        </FormularioWizard>
    </ModalFormLG>
    <IngresarPaciente v-if="varView.showNuevoPaciente" />
    <ModificarPaciente v-if="varView.showModificarPaciente" :pacienteId="formData.Paciente.id" />
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