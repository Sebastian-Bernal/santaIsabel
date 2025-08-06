<script setup>
// Componentes
import Label from "~/components/Labels/Label.vue";
import Input from "~/components/Inputs/Input.vue";
import Section from "~/components/Forms/Section.vue";
import Select from "~/components/Selects/Select.vue";
// Data
import { useDatosProfesionStore } from "~/stores/Formularios/empresa/Profesion.js";
import { useUsersStore } from "~/stores/Formularios/usuarios/Users.js";
import { ubicacion } from "../../data/colombia.js";
import { useVarView } from "../../stores/varview.js";
import { computed, watch, onMounted } from "vue";

const varView = useVarView();
const storeProfesiones = useDatosProfesionStore();
const Profesiones = ref([]);
const notificacionesStore = useNotificacionesStore();
const usuarioStore = useUsersStore();

const { simple, mensaje, options } = notificacionesStore;

const props = defineProps([
    'formData',
    'traerDatos',
    'guardarDatos',
    'noCambiar',
    'verMedico'
]);

const camposRequeridos = [
    'profesion', 'departamento', 'municipio', 'zona',
]

// Guardar Datos en el localStorage
watch(
    props.formData,
    (newValue) => {
        props.guardarDatos(newValue);
        const medico = newValue.Medico

        // Validacion
        const camposValidos = camposRequeridos.every((campo) => medico[campo] !== '');
        // Detectar inputs inválidos sin usar ref
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = camposValidos && !hayCamposInvalidos;
    },
    { deep: true }
);


// Traer datos del localStorage
onMounted(async () => {
    props.traerDatos();
    Profesiones.value = await storeProfesiones.listProfesion
});

// Cuidades filtradas por departamento
const ciudades = computed(() => {
    return ubicacion.filter(
        (data) => data.departamento.toUpperCase() === props.formData.Medico.departamento.toUpperCase()
    )[0]?.ciudades;

});

// Formatear array para mandar datos a Select
const opcionesProfesion = computed(() => {
    return Profesiones.value.map(item => ({
        text: item.nombre,
        value: item.nombre
    }));
})
</script>

<template>
    <Section>
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-user text-blue-500"></i>
            <Label forLabel="nombre" size="text-sm">Medico</Label>
        </div>
    </Section>

    <Section class="md:flex-row flex-col">
        <Select :disabled="props.verMedico" v-model="formData.Medico.profesion" id="profesion" name="profesion"
            :options="opcionesProfesion" placeholder="Profesion" tamaño="w-full" required></Select>
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-location-dot text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Ubicacion Laboral</Label>
        </div>
    </Section>
    <Section>
        <Input :disabled="props.verMedico" v-model="formData.Medico.departamento" type="text" id="departamento"
            name="departamento" placeholder="Departamento" tamaño="md:w-1/3 w-full" list="listDepartamento" />
        <datalist id="listDepartamento" class="bg-white text-black">
            <option v-for="(data, id) in ubicacion" :key="id" :value="data.departamento">
                codigo: {{ 0 }}
            </option>
        </datalist>
        <Input :disabled="props.verMedico" v-model="formData.Medico.municipio" type="text" id="municipio"
            name="municipio" placeholder="Municipio" tamaño="md:w-1/3 w-full" list="listMunicipio" />
        <datalist id="listMunicipio" v-if="formData.Medico.departamento">
            <option v-for="(data, id) in ciudades" :key="id" :value="data">
            </option>
        </datalist>
        <Select :disabled="props.verMedico" v-model="formData.Medico.zona" id="zona" name="zona"
            :options="[{ text: 'Rural', value: 'Rural' }, { text: 'Urbana', value: 'Urbana' }]" placeholder="Zona"
            tamaño="md:w-1/3 w-full"></Select>
    </Section>
</template>
