<script setup>
// Componentes
import Fondo from "~/components/Fondos/Fondo.vue";
import Formulario from "~/components/Forms/Formulario.vue";
import Label from "~/components/Labels/Label.vue";
import Input from "~/components/Inputs/Input.vue";
import Section from "~/components/Forms/Section.vue";
import Select from "~/components/Selects/Select.vue";
import Button from "~/components/Buttons/Button.vue";
import ButtonForm from "~/components/Buttons/ButtonForm.vue";
// Data
import { CIE10 } from "~/data/CIE10.js";
import { ubicacion } from "../../data/colombia.js";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { useNotificacionesStore } from "../../stores/notificaciones.js";

import { ref, computed, watch, onMounted, defineEmits } from "vue";

const emit = defineEmits(['close']);

const storePaciente = usePacientesStore();
const nuevoPacienteStore = storePaciente.createForm("NuevoPaciente");
const notificacionesStore = useNotificacionesStore();

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem,
    limpiar,
    estado,
    mandarFormulario,
} = nuevoPacienteStore;

const { simple, mensaje, options } = notificacionesStore;
const formComplete = ref(false);

// Guardar Datos en el localStorage
watch(
    formData,
    (newValue) => {
        guardarDatos(newValue);

        // Validacion
        if (formData.Paciente.name !== "" && formData.Paciente.No_document !== "") {
            formComplete.value = true;
        } else {
            formComplete.value = false;
        }
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    traerDatos();
});

// Enviar formulario -------------------
const enviarNuevoPaciente = async (formData) => {
    event.preventDefault();

    const estado = await mandarFormulario(formData);
    if (estado) {
        options.icono = "success";
        options.titulo = "¡Se ha enviado correctamente!";
        options.texto = "Nuevo Paciente Registrado";
        options.tiempo = 3000;
        const res = await simple();
        limpiar();
        window.location.href = "/Usuarios/Pacientes";
    } else {
        options.icono = "error";
        options.titulo = "¡A ocurrido un problema!";
        options.texto = "No se pudo registrar Paciente";
        options.tiempo = 2000;
        simple();
    }
};

// Cuidades filtradas por departamento
const ciudades = computed(() => {
    return ubicacion.filter(
        (data) => data.departamento === formData.Paciente.departamento
    )[0].ciudades ;
    
});

const validarform = () => {
    if (!formComplete.value) {
        options.position = "top-end";
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500;
        mensaje();
    }
};

function cerrarModal() {
    emit('close')
}
</script>

<template>
    <Fondo>
        <Formulario class="mt-3" :datos="{
            titulo: 'Nuevo paciente',
        }" tamaño="w-[70%] h-[85%]">
            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user text-blue-500"></i>
                    <Label forLabel="nombre" size="text-sm">Paciente</Label>
                </div>
            </Section>

            <Section class="md:flex-row flex-col">
                <Input v-model="formData.Paciente.name" type="text" id="nombre" name="nombre"
                    placeholder="Nombres y Apellidos" tamaño="md:w-4/5 w-full" />
                <Input v-model="formData.Paciente.nacimiento" type="date" id="nacimiento" name="nacimiento"
                    placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500" />
            </Section>

            <Section class="md:flex-row flex-col">
                <Select v-model="formData.Paciente.type_doc" id="tipoDocumento" name="tipoDocumento" :options="[
                    { text: 'Cedula de ciudadania', value: 'cedula' },
                    { text: 'Tarjeta de identidad', value: 'ti' },
                    { text: 'Cedula Extranjera', value: 'extranjera' },
                    { text: 'RC', value: 'RC' },
                ]" placeholder="Tipo de Documento" tamaño="w-full"></Select>
                <Input v-model="formData.Paciente.No_document" type="number" id="documento" name="documento"
                    placeholder="Número de documento" tamaño="w-full" />
            </Section>

            <Section class="md:flex-row flex-col">
                <Select v-model="formData.Paciente.sexo" id="Sexo" name="Sexo" :options="[
                    { text: 'Masculino', value: 'masculino' },
                    { text: 'Femenino', value: 'femenino' },
                ]" placeholder="Sexo al nacer" tamaño="w-full"></Select>
                <Select v-model="formData.Paciente.genero" id="genero" name="genero" :options="[
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
            <Section>
                <Input v-model="formData.Paciente.departamento" type="text" id="departamento" name="departamento"
                    placeholder="Departamento" tamaño="md:w-1/3 w-full" list="listDepartamento" />
                <datalist id="listDepartamento" class="bg-white text-black">
                    <option v-for="(data, id) in ubicacion" :key="id" :value="data.departamento">
                        codigo: {{ 0 }}
                    </option>
                </datalist>
                <Input v-model="formData.Paciente.municipio" type="text" id="municipio" name="municipio"
                    placeholder="Municipio" tamaño="md:w-1/3 w-full" list="listMunicipio" />
                <datalist id="listMunicipio" v-if="formData.Paciente.departamento">
                    <option v-for="(data, id) in ciudades" :key="id" :value="data"></option>
                </datalist>
                <Select v-model="formData.Paciente.zona" id="zona" name="zona" :options="[
                    { text: 'Rural', value: 'rural' },
                    { text: 'Urbana', value: 'urbana' },
                ]" placeholder="Zona" tamaño="md:w-1/3 w-full" :showInfoSelect="true"></Select>
            </Section>

            <Section>
                <Input v-model="formData.Paciente.barrio" type="text" id="barrio" name="barrio" placeholder="Barrio"
                    tamaño="md:w-1/2 w-full" />
                <Input v-model="formData.Paciente.direccion" type="text" id="direccion" name="direccion"
                    placeholder="Direccion" tamaño="md:w-1/2 w-full" />
            </Section>

            <Section>
                <Input v-model="formData.Paciente.celular" type="number" id="celular" name="celular"
                    placeholder="Celular" tamaño="w-1/2" />
                <Input v-model="formData.Paciente.telefono" type="number" id="telefono" name="telefono"
                    placeholder="Telefono" tamaño="w-1/2" />
            </Section>

            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-file text-blue-500"></i>
                    <Label forLabel="eps" size="text-sm">Datos Adicionales</Label>
                </div>
            </Section>
            <Section class="md:flex items-center gap-3 grid grid-cols-2 mb-3">
                <Input v-model="formData.Paciente.Eps" type="text" id="eps" name="eps" placeholder="Eps"
                    tamaño="md:w-1/4 w-full" />
                <Input v-model="formData.Paciente.Regimen" type="text" id="regimen" name="regimen" placeholder="Regimen"
                    tamaño="md:w-1/4 w-full" />
                <Input v-model="formData.Paciente.poblacionVulnerable" type="text" id="poblacion" name="poblacion"
                    placeholder="Poblacion vulnerable" tamaño="md:w-1/4 w-full" />
                <Input v-model="formData.Paciente.Tipo" type="text" id="tipo" name="tipo" placeholder="Tipo"
                    tamaño="md:w-1/4 w-full" />
            </Section>

            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-file text-blue-500"></i>
                    <Label forLabel="tipo" size="text-sm">Diagnoticos</Label>
                </div>
                <Button color="bg-blue-500" @click="
                    agregarItem(
                        'Diagnosticos',
                        {
                            id: '',
                            tipo: '',
                            CIE_10: '',
                            id_paciente: '',
                            rol_attention: '',
                        },
                        'tipo'
                    )
                    ">
                    <i class="fa-solid fa-plus"></i>
                </Button>
            </Section>

            <Section styles="flex-col max-h-[150px] overflow-y-auto">
                <div class="w-full flex gap-3 items-center" v-for="(diagnostico, i) in formData.Diagnosticos">
                    <Input v-model="diagnostico.tipo" type="text" id="tipo" name="tipo" placeholder="Tipo de Diagnostico"
                        tamaño="w-full" />
                    <Input v-model="diagnostico.CIE_10" type="text" id="cie10" name="cie10" placeholder="CIE-10"
                        list="cie10List" tamaño="w-full" />
                    <datalist id="cie10List">
                        <option v-for="enfermedad in CIE10" :value="enfermedad.description">
                            codigo: {{ enfermedad.code }}
                        </option>
                    </datalist>
                    <i v-if="i > 0" class="fa-solid fa-close text-gray-500"
                        @click="eliminarItem('Diagnosticos', i)"></i>
                </div>
            </Section>

            <Section class="flex justify-between gap-5 mt-3">
                <div class="w-full flex flex-col items-center">
                    <div class="w-full flex justify-between mt-3">
                        <div class="flex items-center gap-3">
                            <i class="fa-solid fa-folder text-blue-500"></i>
                            <Label forLabel="antecedentes">Antecedentes</Label>
                        </div>
                        <Button color="bg-blue-500" @click="
                            agregarItem(
                                'Antecedentes',
                                { id: '', valor: '', id_paciente: '' },
                                'valor'
                            )
                            ">
                            <i class="fa-solid fa-plus"></i>
                        </Button>
                    </div>

                    <div class="flex flex-col gap-1 my-2 w-full max-h-[150px] overflow-y-auto">
                        <div class="w-full flex gap-3 items-center" v-for="(antecedente, i) in formData.Antecedentes"
                            :key="i">
                            <Input v-model="antecedente.valor" type="text" id="antecedentes" name="antecedentes"
                                placeholder="Antecedentes Personales" tamaño="w-full" />
                            <i v-if="i > 0" class="fa-solid fa-close text-gray-500"
                                @click="eliminarItem('Antecedentes', i)"></i>
                        </div>
                    </div>
                </div>

                <div class="w-full flex flex-col items-center">
                    <div class="w-full flex justify-between mt-3">
                        <div class="flex items-center gap-3">
                            <i class="fa-solid fa-users text-blue-500"></i>
                            <Label forLabel="antecedentes">Antecedentes Familiares</Label>
                        </div>
                        <Button color="bg-blue-500" @click="
                            agregarItem(
                                'Antecedentes_familiares',
                                { id: '', valor: '', id_paciente: '' },
                                'valor'
                            )
                            ">
                            <i class="fa-solid fa-plus"></i>
                        </Button>
                    </div>

                    <div class="flex flex-col gap-1 mb-2 w-full max-h-[150px] overflow-y-auto">
                        <div class="w-full flex gap-3 items-center" v-for="(antecedente, i) in formData.Antecedentes_familiares"
                            :key="i">
                            <Input v-model="antecedente.valor" type="text" id="antecedentes" name="antecedentes"
                                placeholder="Antecedentes Familiares" tamaño="w-full" />
                            <i v-if="i > 0" class="fa-solid fa-close text-gray-500"
                                @click="eliminarItem('Antecedentes_familiares', i)"></i>
                        </div>
                    </div>
                </div>
            </Section>

            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink @click="cerrarModal">
                    <ButtonForm color="bg-gray-500" @click="limpiar()"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Cancelar
                    </ButtonForm>
                </nuxtLink>
                <ButtonForm color="bg-blue-500" @click="formComplete ? enviarNuevoPaciente(formData) : validarform()"
                    class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    Registrar
                </ButtonForm>
            </div>
        </Formulario>
    </Fondo>
</template>
