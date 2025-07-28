<script setup>
// Componentes
import Label from "~/components/Labels/Label.vue";
import Input from "~/components/Inputs/Input.vue";
import Section from "~/components/Forms/Section.vue";
import Select from "~/components/Selects/Select.vue";
// Data
import { useDatosProfesionStore } from "~/stores/Formularios/empresa/Profesion.js";
import { ubicacion } from "../../data/colombia.js";
import { useVarView } from "../../stores/varview.js";
import { computed, watch, onMounted } from "vue";

const varView = useVarView();
const storeProfesiones = useDatosProfesionStore();
const Profesiones = ref([]);
const notificacionesStore = useNotificacionesStore();

const { simple, mensaje, options } = notificacionesStore;

const props = defineProps([
    'formData',
    'traerDatos',
    'guardarDatos',
    'noCambiar',
    'verMedico'
]);

const camposRequeridos = [
    'name', 'nacimiento', 'type_doc', 'No_document', 'profesion',
    'departamento', 'municipio', 'zona', 'celular',
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

watch(() => props.formData.Medico.nacimiento,
    (newValue) => {
        validarEdad(newValue)
    }
);

// Funcion Validar Edad
function validarEdad(newValue) {
    const nacimiento = new Date(newValue);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    const día = hoy.getDate() - nacimiento.getDate();

    if (mes < 0 || (mes === 0 && día < 0)) {
        edad--;
    }

    if (edad < 18) {
        options.position = "top-end";
        options.texto = "Paciente Menor de Edad, verifique la fecha de nacimiento.";
        options.tiempo = 1500;
        mensaje();
    }
};

// Traer datos del localStorage
onMounted(async() => {
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
        <Input :disabled="props.verMedico" v-model="formData.Medico.name" type="text" id="nombre" name="nombre" placeholder="Nombres y Apellidos"
            tamaño="md:w-4/5 w-full" minlength="5"/>
        <Input :disabled="props.verMedico" v-model="formData.Medico.nacimiento" type="date" id="nacimiento" name="nacimiento"
            placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500" />
    </Section>



    <Section class="md:flex-row flex-col">
        <Select :disabled="props.verMedico" v-model="formData.Medico.type_doc" id="tipoDocumento" name="tipoDocumento"
            :options="[{ text: 'Cedula de ciudadania', value: 'cedula' }, { text: 'Cedula Extranjera', value: 'extranjera' }, { text: 'RC', value: 'RC' }]"
            placeholder="Tipo de documento" tamaño="w-full"></Select>
        <Input v-if="!props.noCambiar" :disabled="props.verMedico" v-model="formData.Medico.No_document" type="number" id="documento" name="documento"
            placeholder="Número de documento" tamaño="w-full" min="10000000" />
        <Select :disabled="props.verMedico" v-model="formData.Medico.profesion" id="genero" name="genero"
            :options="opcionesProfesion"
            placeholder="Profesion" tamaño="w-full"></Select>
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-location-dot text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Ubicacion y Contacto</Label>
        </div>
    </Section>
    <Section>
        <Input :disabled="props.verMedico" v-model="formData.Medico.departamento" type="text" id="departamento" name="departamento"
            placeholder="Departamento" tamaño="md:w-1/3 w-full" list="listDepartamento" />
        <datalist id="listDepartamento" class="bg-white text-black">
            <option v-for="(data, id) in ubicacion" :key="id" :value="data.departamento">
                codigo: {{ 0 }}
            </option>
        </datalist>
        <Input :disabled="props.verMedico" v-model="formData.Medico.municipio" type="text" id="municipio" name="municipio" placeholder="Municipio"
            tamaño="md:w-1/3 w-full" list="listMunicipio" />
        <datalist id="listMunicipio" v-if="formData.Medico.departamento">
            <option v-for="(data, id) in ciudades" :key="id" :value="data">
            </option>
        </datalist>
        <Select :disabled="props.verMedico" v-model="formData.Medico.zona" id="zona" name="zona"
            :options="[{ text: 'Rural', value: 'rural' }, { text: 'Urbana', value: 'urbana' }]" placeholder="Zona"
            tamaño="md:w-1/3 w-full"></Select>
    </Section>


    <Section>
        <Input :disabled="props.verMedico" v-model="formData.Medico.celular" type="number" id="celular" name="celular" placeholder="Celular"
            tamaño="w-1/2" max="1000000000000" min="1000000000"/>
        <Input :disabled="props.verMedico" v-model="formData.Medico.telefono" type="number" id="telefono" name="telefono" placeholder="Telefono Fijo (opcional)"
            tamaño="w-1/2" max="100000000" min="100000"/>
    </Section>
</template>
