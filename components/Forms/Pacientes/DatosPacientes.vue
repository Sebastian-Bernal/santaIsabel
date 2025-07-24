<script setup>
// Componentes
import Label from "~/components/Labels/Label.vue";
import Input from "~/components/Inputs/Input.vue";
import Section from "~/components/Forms/Section.vue";
import Select from "~/components/Selects/Select.vue";
import Button from "~/components/Buttons/Button.vue";
// Data
import { CIE10 } from "~/data/CIE10.js";
import { ubicacion } from "../../data/colombia.js";
import { municipios } from '~/data/municipios.js'
import { useVarView } from "../../stores/varview.js";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { computed, watch, onMounted } from "vue";

const varView = useVarView();
const notificacionesStore = useNotificacionesStore();
const epsStore = useDatosEPSStore();
const EPS = ref([])

const { simple, mensaje, options } = notificacionesStore;

const props = defineProps([
    'formData',
    'traerDatos',
    'guardarDatos',
    'agregarItem',
    'eliminarItem',
    'noCambiar',
    'verPaciente'
]);

const camposRequeridos = [
    'name', 'nacimiento', 'type_doc', 'No_document', 'sexo', 'genero',
    'direccion', 'departamento', 'municipio', 'zona', 'barrio',
    'celular', 'Eps', 'Regimen', 'poblacionVulnerable'
];

// Guardar Datos en el localStorage
watch(
    props.formData,
    (newValue) => {
        props.guardarDatos(newValue);
        const paciente = newValue.Paciente;
        // Validacion
        const camposValidos = camposRequeridos.every((campo) => paciente[campo] !== '');

        // Detectar inputs inválidos
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = camposValidos && !hayCamposInvalidos;
    },
    { deep: true }
);

// Validar campo tipo de documento
watch(
    () => props.formData.Paciente.type_doc,
    (newValue) => {
        validarEdad(newValue, props.formData.Paciente.nacimiento);
    }
);
// Validar campo fecha de nacimiento
watch(
    () => props.formData.Paciente.nacimiento,
    (newNacimiento) => {
        const tipo = props.formData.Paciente.type_doc;
        if (tipo) {
            validarEdad(tipo, newNacimiento);
        }
    }
);

function obtenerEdad(datoNacimiento) {
    const nacimiento = new Date(datoNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    const día = hoy.getDate() - nacimiento.getDate();

    if (mes < 0 || (mes === 0 && día < 0)) {
        edad--;
    }
    return edad
}

function autocompletarTipo() {
    const edad = obtenerEdad(props.formData.Paciente.nacimiento)

    if (edad > 18) {
        props.formData.Paciente.type_doc = 'cedula'
    } else if (edad < 18) {
        props.formData.Paciente.type_doc = 'Tarjeta de identidad'
    }
}

// Funcion Validar Edad
function validarEdad(type_doc, nacimientoStr) {
    const edad = obtenerEdad(nacimientoStr)

    if (type_doc === 'Tarjeta de identidad' && edad > 18) {
        props.formData.Paciente.type_doc = 'cedula';
        options.position = "top-end";
        options.texto = "Paciente Mayor de Edad, verifique la fecha de nacimiento.";
        options.tiempo = 1500;
        mensaje();
    } else if (type_doc === 'cedula' && edad < 18) {
        props.formData.Paciente.type_doc = 'Tarjeta de identidad';
        options.position = "top-end";
        options.texto = "Paciente Menor de Edad, verifique la fecha de nacimiento.";
        options.tiempo = 1500;
        mensaje();
    }
    return edad
}



// Traer datos del localStorage
onMounted(async () => {
    props.traerDatos();
    EPS.value = await epsStore.listEPS
});

// Cuidades filtradas por departamento
const ciudades = computed(() => {
    return municipios.departamentos.filter(
        (data) => data.nombre.toLowerCase() === props.formData.Paciente.departamento.toLowerCase()
    )[0]?.municipios;

});

// Formatear array para mandar datos a Select
const opcionesEPS = computed(() => {
    return EPS.value.map(eps => ({
        text: eps.nombre,
        value: eps.nombre
    }));
})


</script>

<template>
    <Section>
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-user text-blue-500"></i>
            <Label forLabel="nombre" size="text-sm">Paciente</Label>
        </div>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verPaciente" v-model="props.formData.Paciente.name" type="text" id="nombre"
            name="nombre" placeholder="Nombres y Apellidos" tamaño="md:w-4/5 w-full" minlength="5" />
        <Input :disabled="props.verPaciente" v-model="props.formData.Paciente.nacimiento" type="date" id="nacimiento"
            name="nacimiento" placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500"
            @blur="autocompletarTipo()" />
    </Section>

    <Section styles="md:flex-row flex-col">
        <Select :disabled="props.verPaciente" v-model="props.formData.Paciente.type_doc" id="tipoDocumento"
            name="tipoDocumento" :options="[
                { text: 'Cedula de ciudadania', value: 'cedula' },
                { text: 'Tarjeta de identidad', value: 'Tarjeta de identidad' },
                { text: 'Cedula Extranjera', value: 'extranjera' },
                { text: 'RC', value: 'RC' },
            ]" placeholder="Tipo de Documento" tamaño="w-full"></Select>
        <Input v-if="!props.noCambiar" :disabled="props.verPaciente" v-model="props.formData.Paciente.No_document"
            type="number" id="documento" name="documento" placeholder="Número de documento" tamaño="w-full"
            max="10000000000" min="1000000" />
    </Section>

    <Section styles="md:flex-row flex-col">
        <Select :disabled="props.verPaciente" v-model="props.formData.Paciente.sexo" id="Sexo" name="Sexo" :options="[
            { text: 'Masculino', value: 'masculino' },
            { text: 'Femenino', value: 'femenino' },
        ]" placeholder="Sexo al nacer" tamaño="w-full"></Select>
        <Select :disabled="props.verPaciente" v-model="props.formData.Paciente.genero" id="genero" name="genero"
            :options="[
                { text: 'Masculino', value: 'masculino' },
                { text: 'Femenino', value: 'femenino' },
                { text: 'Neutro', value: 'neutro' },
                { text: 'No lo declara', value: 'no lo declara' },
                { text: 'Transgenero', value: 'transgenero' },
            ]" placeholder="Identidad de Genero" tamaño="w-full"></Select>
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-location-dot text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Ubicacion y Contacto</Label>
        </div>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verPaciente" v-model="props.formData.Paciente.departamento" type="text"
            id="departamento" name="departamento" placeholder="Departamento" tamaño="md:w-1/3 w-full"
            list="listDepartamento" />
        <datalist id="listDepartamento" class="bg-white text-black">
            <option v-for="(data, id) in municipios.departamentos" :key="id" :value="data.nombre">
            </option>
        </datalist>
        <Input :disabled="props.verPaciente" v-model="props.formData.Paciente.municipio" type="text" id="municipio"
            name="municipio" placeholder="Municipio" tamaño="md:w-1/3 w-full" list="listMunicipio" />
        <datalist id="listMunicipio" v-if="props.formData.Paciente.departamento">
            <option v-for="(data, id) in ciudades" :key="id" :value="data.nombre">{{ data.id }}</option>
        </datalist>
        <Select :disabled="props.verPaciente" v-model="props.formData.Paciente.zona" id="zona" name="zona" :options="[
            { text: 'Rural', value: 'Rural' },
            { text: 'Urbana', value: 'Urbana' },
        ]" placeholder="Zona" tamaño="md:w-1/3 w-full"></Select>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verPaciente" v-model="props.formData.Paciente.barrio" type="text" id="barrio"
            name="barrio" placeholder="Barrio" tamaño="md:w-1/2 w-full" minlength="5" />
        <Input :disabled="props.verPaciente" v-model="props.formData.Paciente.direccion" type="text" id="direccion"
            name="direccion" placeholder="Direccion" tamaño="md:w-1/2 w-full" minlength="5" />
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verPaciente" v-model="props.formData.Paciente.celular" type="number" id="celular"
            name="celular" placeholder="Celular" tamaño="md:w-1/2 w-full" max="1000000000000" min="1000000000" />
        <Input :disabled="props.verPaciente" v-model="props.formData.Paciente.telefono" type="number" id="telefono"
            name="telefono" placeholder="Telefono" tamaño="md:w-1/2 w-full" max="100000000" min="100000" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-file text-blue-500"></i>
            <Label forLabel="eps" size="text-sm">Datos Adicionales</Label>
        </div>
    </Section>
    <Section styles="md:flex items-center gap-3 grid grid-cols-2 mb-3">
        <Select :disabled="props.verPaciente" v-model="props.formData.Paciente.Eps" id="eps" name="eps" :options="opcionesEPS" placeholder="EPS" tamaño="md:w-1/3 w-full"></Select>
        <Select :disabled="props.verPaciente" v-model="props.formData.Paciente.Regimen" id="regimen" name="regimen"
            :options="[
                { text: 'Contributivo', value: 'Contributivo' },
                { text: 'Subsidiado', value: 'Subsidiado' },
                { text: 'Especial/Excepcion', value: 'Especial/Excepcion' },
            ]" placeholder="Regimen" tamaño="md:w-1/3 w-full"></Select>
        <Select :disabled="props.verPaciente" v-model="props.formData.Paciente.poblacionVulnerable"
            id="poblacionVulnerable" name="poblacionVulnerable" :options="[
                { text: 'Ninguno', value: 'Ninguno' },
                { text: 'Adultos Mayores', value: 'Adultos Mayores' },
                { text: 'Discapacidad', value: 'Discapacidad' },
                { text: 'Victimas Conflicto Armado', value: 'Victimas Conflicto Armado' },
                { text: 'Habitantes de calle', value: 'Habitantes de calle' },
                { text: 'Poblacion LGBTIQ+', value: 'Poblacion LGBTIQ+' },
                { text: 'Grupos étnicos', value: 'Grupos étnicos' },
                { text: 'Personas privadas de la libertad', value: 'Personas privadas de la libertad' },
                { text: 'Desmovilizados', value: 'Desmovilizados' },
                { text: 'Migrantes colombianos repatriados', value: 'Migrantes colombianos repatriados' },
                { text: 'Madres comunitarias o sustitutas', value: 'Madres comunitarias o sustitutas' },
                { text: 'Voluntarios activos', value: 'Voluntarios activos' },
                { text: 'Personas con enfermedades huerfanas o catastroficas', value: 'Personas con enfermedades huerfanas o catastroficas' },
            ]" placeholder="Pblacion Vulnerable" tamaño="md:w-1/3 w-full"></Select>
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-file text-blue-500"></i>
            <Label forLabel="tipo" size="text-sm">Diagnoticos (opcional)</Label>
        </div>
        <Button v-if="!props.verPaciente" color="bg-blue-500" @click="
            agregarItem(
                'Diagnosticos',
                {
                    id: '',
                    CIE_10: '',
                    id_paciente: !props.verPaciente ? formData.Paciente.id : null,
                    rol_attention: '',
                },
                'CIE_10'
            )
            ">
            <i class="fa-solid fa-plus"></i>
        </Button>
    </Section>

    <Section styles="flex-col max-h-[150px] overflow-y-auto">
        <div class="w-full flex gap-3 items-center" v-for="(diagnostico, i) in props.formData.Diagnosticos">
            <Input :disabled="props.verPaciente" v-model="diagnostico.CIE_10" type="text" id="cie10" name="cie10"
                placeholder="CIE-10" list="cie10List" tamaño="w-full" />
            <datalist id="cie10List">
                <option v-for="enfermedad in CIE10" :value="enfermedad.description">
                    codigo: {{ enfermedad.code }}
                </option>
            </datalist>
            <i v-if="!props.verPaciente" class="fa-solid fa-close text-red-400"
                @click="eliminarItem('Diagnosticos', i)"></i>
        </div>
        <div v-if="formData.Diagnosticos.length < 1" class="w-full flex justify-center items-center py-3">
            <p class="text-gray-500">No hay Diagnosticos registrados.</p>
        </div>
    </Section>

    <Section class="flex justify-between gap-5 mt-5">
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-folder text-blue-500"></i>
            <Label forLabel="antecedentes">Antecedentes (opcional)</Label>
        </div>
        <div v-if="!props.verPaciente" class="flex gap-5 items-center">
            <a class="flex items-center gap-1" @click="
                agregarItem(
                    'Antecedentes',
                    { id: '', valor: '', id_paciente: !props.verPaciente ? formData.Paciente.id : null, tipo: 'personal' },
                    'valor'
                )
                ">
                <Button color="bg-blue-500">
                    <i class="fa-solid fa-plus"></i>
                </Button>
                <span class="text-sm text-semibold">Personal</span>
            </a>
            <a class="flex items-center gap-1" @click="
                agregarItem(
                    'Antecedentes',
                    { id: '', valor: '', id_paciente: '', tipo: 'familiar' },
                    'valor'
                )
                ">
                <Button color="bg-purple-500">
                    <i class="fa-solid fa-plus"></i>
                </Button>
                <span class="text-sm text-semibold">Familiar</span>
            </a>
        </div>
    </Section>
    <Section styles="flex-col gap-1 mb-2 w-full max-h-[150px] overflow-y-auto">
        <div class="w-full flex gap-3 items-center" v-for="(antecedente, i) in props.formData.Antecedentes" :key="i">
            <Input :disabled="props.verPaciente" v-model="antecedente.valor" type="text" id="antecedentes"
                name="antecedentes"
                :placeholder="antecedente.tipo === 'personal' ? 'Antecedentes Personales' : antecedente.tipo === 'familiar' ? 'Antecedentes Familiares' : 'Antecedentes'"
                tamaño="w-full" />
            <i v-if="!props.verPaciente" class="fa-solid fa-close text-red-400"
                @click="eliminarItem('Antecedentes', i)"></i>
        </div>
        <div v-if="formData.Antecedentes.length < 1" class="w-full flex justify-center items-center py-3">
            <p class="text-gray-500">No hay antecedentes registrados.</p>
        </div>
    </Section>
</template>
