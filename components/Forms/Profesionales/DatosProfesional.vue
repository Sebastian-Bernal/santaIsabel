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
const contraseñaSegura = ref(false);
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
    'name', 'nacimiento', 'type_doc', 'No_document', 'profesion',
    'departamento', 'municipio', 'zona', 'celular',
]

// Guardar Datos en el localStorage
watch(
    props.formData,
    (newValue) => {
        props.guardarDatos(newValue);
        const medico = newValue.Medico

        if (props.formData.Medico.contraseña !== '' && !validarContraseña(props.formData.Medico.contraseña)) {
            contraseñaSegura.value = true
        } else {
            contraseñaSegura.value = false
        }

        // Validacion
        const camposValidos = camposRequeridos.every((campo) => medico[campo] !== '');
        // Detectar inputs inválidos sin usar ref
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = camposValidos && !hayCamposInvalidos && validarContraseña(props.formData.Medico.contraseña);
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

const validarContraseña = (valor) => {
    // Al menos 3 letras (mayúsculas o minúsculas)
    const letras = valor.match(/[a-zA-Z]/g) || [];
    // Al menos 2 números
    const numeros = valor.match(/[0-9]/g) || [];
    // Al menos 1 símbolo (cualquier cosa que no sea letra o número)
    const simbolos = valor.match(/[^a-zA-Z0-9]/g) || [];

    return letras.length >= 3 && numeros.length >= 2 && simbolos.length >= 1;
}

async function buscarUsuario() {
    const usuarios = await usuarioStore.listUsers
    const usuario = usuarios.filter((user) => {
        return user.No_document === props.formData.Medico.No_document
    })

    if (usuario.length < 1) {
        options.position = "top-end";
        options.texto = "Usuario no registrado.";
        options.tiempo = 1500;
        mensaje();
        return
    }
    
    Object.assign(props.formData.Medico, usuario[0]);
}

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
        <Input v-if="!props.noCambiar" :disabled="props.verMedico" v-model="formData.Medico.No_document" type="number"
            id="documento" name="documento" placeholder="Número de documento" tamaño="w-full" min="10000000"
            @keyup.enter="buscarUsuario" />
        <Select :disabled="props.verMedico" v-model="formData.Medico.type_doc" id="tipoDocumento" name="tipoDocumento"
            :options="[{ text: 'Cedula de ciudadania', value: 'cedula' }, { text: 'Cedula Extranjera', value: 'extranjera' }, { text: 'RC', value: 'RC' }]"
            placeholder="Tipo de documento" tamaño="w-full"></Select>
        <Select :disabled="props.verMedico" v-model="formData.Medico.profesion" id="profesion" name="profesion"
            :options="opcionesProfesion" placeholder="Profesion" tamaño="w-full" required></Select>
    </Section>

    <Section class="md:flex-row flex-col">
        <Input :disabled="props.verMedico" v-model="formData.Medico.name" type="text" id="nombre" name="nombre"
            placeholder="Nombres y Apellidos" tamaño="md:w-4/5 w-full" minlength="5" />
        <Input :disabled="props.verMedico" v-model="formData.Medico.nacimiento" type="date" id="nacimiento"
            name="nacimiento" placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-location-dot text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Ubicacion y Contacto</Label>
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


    <Section>
        <Input :disabled="props.verMedico" v-model="formData.Medico.celular" type="number" id="celular" name="celular"
            placeholder="Celular" tamaño="w-1/2" max="1000000000000" min="1000000000" />
        <Input :disabled="props.verMedico" v-model="formData.Medico.telefono" type="number" id="telefono"
            name="telefono" placeholder="Telefono Fijo (opcional)" tamaño="w-1/2" max="100000000" min="100000" />
    </Section>

    <Section>
        <Input :disabled="props.verMedico" v-model="formData.Medico.correo" type="email" id="correo" name="correo"
            placeholder="Correo" :mayuscula="false" />
        <div class="w-full" v-if="!props.noCambiar">
            <Input :disabled="props.verMedico" v-model="formData.Medico.contraseña" type="password" id="contraseña"
                name="contraseña" placeholder="Contraseña" minlength="5" />
            <p v-if="contraseñaSegura" class="text-red-500 text-sm">
                La contraseña debe contener al menos 3 letras, 2 números y 1 símbolo.
            </p>
        </div>
    </Section>
</template>
