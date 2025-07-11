<script setup>
// Componentes
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import FormularioWizard from '~/components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Textarea from '~/components/Textareas/Textarea.vue';
import Section from '~/components/Forms/Section.vue';
import Label from '~/components/Labels/Label.vue';
import Button from '~/components/Buttons/Button.vue';
// Data
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { ref, watch, onMounted } from 'vue';
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
} = RegistrarHistoriaStore;

const {
    simple,
    mensaje,
    options
} = notificacionesStore;

// Datos de ejemplo
const antecedentesDatos = ref(['Hipertensión', 'Diabetes', 'Enfermedad cardíaca']);
const enfermedades = ref([ 'Gripe', 'Infección respiratoria', 'Dolor de cabeza']);

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue)

    if (formData.HistoriaClinica.motivo !== "" && formData.Enfermedad.valor !== "" && formData.Antecedentes.at(-1)?.valor !== "") {
        varView.formComplete = true
    } else {
        varView.formComplete = false
    }
}, { deep: true });

onMounted(() => {
    traerDatos();
});

// Funciones
const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

const cerrarModal = () => {
    varView.showNuevaHistoria = true;
    varView.showPaso2 = false;
    varView.showPaso3 = false;
    varView.showPaso4 = false;
    varView.showRegistrarHistoria = false;
};

const enviarSegundoPaso = () => {
    event.preventDefault();
    if (varView.formComplete) {
        varView.showNuevaHistoria = false;
        varView.showPaso2 = false;
        varView.showPaso3 = true;
        varView.showPaso4 = false;
    } else {
        validarform();
    }
};
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarSegundoPaso"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{cancelar: 'Atras', enviar: 'Siguiente'}">
        <FormularioWizard :datos="{
            titulo: 'Consulta Medica',
            tituloFormulario: 'Nueva Historia Clinica',
            secciones: [
                { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 3, color: 'bg-gray-300' },
                { numPagina: 4, color: 'bg-gray-300' }
            ]
        }">

            <Section styles="flex-col">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-comment text-blue-500"></i>
                    <Label forLabel="motivo">Consulta</Label>
                </div>
            </Section>
            <Section>
                <Textarea v-model="formData.HistoriaClinica.motivo" id="motivo" name="motivo"
                    placeholder="Describa el motivo principal de la consulta..." rows="3"></Textarea>
            </Section>


            <Section>
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-clock text-red-300"></i>
                    <Label forLabel="enfermedad">Enfermedad Actual</Label>
                </div>
            </Section>

            <Section>
                <Textarea v-model="formData.Enfermedad.valor" type="text" id="enfermedad" name="enfermedad"
                    placeholder="Describa la evolucion de la enfermedad actual, sintomas, duracion, factores, desencadenantes..."
                        tamaño="w-full" rows="3"></Textarea>
            </Section>

            <Section class="mt-3">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-folder text-blue-500"></i>
                    <Label forLabel="antecedentes">Antecedentes</Label>
                </div>

                <div class="flex gap-5 items-center">
                    <a class="flex items-center gap-1" @click="
                            agregarItem(
                                'Antecedentes',
                                { id: '', valor: '', id_paciente: formData.HistoriaClinica.id_paciente, tipo: 'personal' },
                                'valor'
                            )
                            " >
                        <Button color="bg-blue-500">
                            <i class="fa-solid fa-plus"></i>
                        </Button>
                        Personal
                    </a>
                    <a class="flex items-center gap-1" @click="
                            agregarItem(
                                'Antecedentes',
                                { id: '', valor: '', id_paciente: formData.HistoriaClinica.id_paciente, tipo: 'familiar' },
                                'valor'
                            )
                            " >
                        <Button color="bg-purple-500">
                            <i class="fa-solid fa-plus"></i>
                        </Button>
                        Familiar
                    </a>
                </div>
            </Section>
            <Section styles="flex-col gap-1 mb-2 w-full max-h-[100px] overflow-y-auto">
                <div class="w-full flex gap-3 items-center" v-for="(antecedente, i) in formData.Antecedentes" :key="i">
                    <Input v-model="antecedente.valor" type="text" id="antecedentes" name="antecedentes"
                        :placeholder="antecedente.tipo === 'personal'? 'Antecedentes Personales': antecedente.tipo === 'familiar' ? 'Antecedentes Familiares': 'Antecedentes'" tamaño="w-full" />
                    <i v-if="i > 0" class="fa-solid fa-close text-red-400"
                        @click="eliminarItem('Antecedentes', i)"></i>
                </div>
            </Section>
            <!-- Registro de antecedentes -->
            <Section>
                <div class="w-full md:w-4/5 flex flex-col gap-3 border border-gray-300 rounded-md py-5">
                    <div class="flex items-center w-full justify-center">
                        <p class="block text-sm font-medium text-gray-700">Antecedentes Personales</p>
                    </div>
                    <div class="flex flex-col items-center w-full">
                        <p v-for="antecedente in antecedentesDatos" class="text-gray-500 text-sm">{{ antecedente }}</p>
                    </div>
                </div>
                <div class="w-full md:w-4/5 flex flex-col gap-3 border border-gray-300 rounded-md py-5">
                    <div class="flex items-center w-full justify-center">
                        <p class="block text-sm font-medium text-gray-700">Antecedentes Familiares</p>
                    </div>
                    <div class="flex flex-col items-center w-full">
                        <p v-for="antecedente in enfermedades" class="text-gray-500 text-sm">{{ antecedente }}</p>
                    </div>
                </div>
            </Section>

        </FormularioWizard>
        </ModalFormLG>
</template>