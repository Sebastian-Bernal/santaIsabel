<script setup>
// Componentes
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import FormularioWizard from '../../components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
// Data
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { ref, watch } from 'vue';
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
    mandarFormulario
} = RegistrarHistoriaStore;

const {
    simple,
    mensaje,
    options
} = notificacionesStore;

const errores = ref({
    fc: false,
    fr: false,
    t: false,
    SATo2: false,
});

const camposRequeridos = [
    'ta', 'fc', 'fr', 't', 'SATo2'
];
const camposRequeridosExamenes = [
    'Peso', 'altura'
]

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue)
    const signosvitales = newValue.HistoriaClinica.signosVitales;
    const examenes = newValue.ExamenFisico
    // Validacion
    const camposValidos = camposRequeridos.every((campo) => signosvitales[campo] !== '');
    const camposValidosExamenes = camposRequeridosExamenes.every((campo) => examenes[campo] !== '');
    // Detectar inputs inválidos
    const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;

    varView.formComplete = camposValidos && !hayCamposInvalidos && camposValidosExamenes;

}, { deep: true });

onMounted(() => {
    traerDatos();
});

function validarTA(event) {
    const valor = event.target.value.match(/^\d{0,3}(\/\d{0,3})?/)?.[0] || '';
    formData.HistoriaClinica.signosVitales.ta = valor;
    // Refleja el valor también en el campo del input
    event.target.value = valor;
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

const cerrarModal = () => {
    varView.showNuevaHistoria = false;
    varView.showPaso2 = true;
    varView.showPaso3 = false;
    varView.showPaso4 = false;
    varView.showRegistrarHistoria = false;
};

const enviarTercerPaso = () => {
    event.preventDefault();
    if (varView.formComplete) {
        varView.showNuevaHistoria = false;
        varView.showPaso2 = false;
        varView.showPaso3 = false;
        varView.showPaso4 = true;
    } else {
        validarform();
    }
};

function validarCampo(event, campo) {
    const valor = event.target.value;

    switch (campo) {
        case 'fc':
            errores.value.fc = !(valor >= 0 && valor <= 100);
            break;
        case 'fr':
            errores.value.fr = !(valor >= 0 && valor <= 250);
            break;
        case 't':
            errores.value.t = !(valor >= 0 && valor <= 50);
            break;
        case 'SATo2':
            errores.value.SATo2 = !(valor >= 0 && valor <= 100);
            break;
        default:
            break;
    }

    formData.value.HistoriaClinica.signosVitales[campo] = valor;
}

</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarTercerPaso" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform"
        :botones="{ cancelar: 'Atras', enviar: 'Siguiente' }">
        <FormularioWizard :datos="{
            titulo: 'Examen fisico',
            tituloFormulario: 'Nueva Historia Clinica',
            secciones: [
                { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 3, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 4, color: 'bg-gray-300' }
            ],
        }">

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-heart-pulse text-blue-500"></i>
                    <Label forLabel="motivo">Signos Vitales</Label>
                </div>
            </Section>

            <Section styles="md:flex-row flex-col relative">
                <Input v-model="formData.HistoriaClinica.signosVitales.ta" type="text" id="ta" name="ta"
                    placeholder="TA" tamaño="md:w-1/3 w-full" @input="validarTA">
                </Input>
                <div class="relative md:w-1/3 w-full">
                    <Input v-model="formData.HistoriaClinica.signosVitales.fc" type="number" id="fc" name="fc"
                        placeholder="FC" @input="event => validarCampo(event, 'fc')" max="100" />
                    <p v-show="errores.fc" class="text-xs text-red-500 absolute top-[100%] mt-1">FC Excede el valor maximo (100) </p>
                </div>
                <div class="relative md:w-1/3 w-full">
                <Input v-model="formData.HistoriaClinica.signosVitales.fr" type="number" id="fr" name="fr"
                    placeholder="FR" @input="event => validarCampo(event, 'fr')" max="250" />
                <p v-show="errores.fr" class="text-xs text-red-500 absolute top-[100%]">FR Excede el valor maximo (250) </p>
                    </div>
            </Section>

            <Section styles="md:flex-row flex-col relative mt-1">
                <div class="relative md:w-1/2 w-full">
                    <Input v-model="formData.HistoriaClinica.signosVitales.t" type="number" id="t" name="t" placeholder="Tº"
                        @input="event => validarCampo(event, 't')" max="50" />
                    <p v-show="errores.t" class="text-xs text-red-500 absolute top-[100%]">Temperatura excede el valor
                        maximo (50)</p>
                </div>
                <div class="relative md:w-1/2 w-full">
                    <Input v-model="formData.HistoriaClinica.signosVitales.SATo2" type="number" id="sat" name="sat"
                        placeholder="Sat O2" @input="event => validarCampo(event, 'SATo2')"
                        max="100" />
                    <p v-show="errores.SATo2" class="text-xs text-red-500 absolute top-[100%]">Saturacion excede el valor
                        maximo (100)</p>
                </div>
            </Section>

            <Section styles="flex-col mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-weight-hanging text-blue-500"></i>
                    <Label forLabel="examenFisico">Medidas Antropométricas</Label>
                </div>
            </Section>
            <Section class="md:flex-row flex-col">
                <Input v-model="formData.ExamenFisico.Peso" type="number" id="examenFisico" name="examenFisico"
                    placeholder="Peso (KG)" tamaño="w-full" />
                <Input v-model="formData.ExamenFisico.altura" type="number" id="examenFisico" name="examenFisico"
                    placeholder="Altura (CM)" tamaño="w-full" />
                <Input v-model="formData.ExamenFisico.otros" type="text" id="examenFisico" name="examenFisico"
                    placeholder="Otros" tamaño="w-full" />
            </Section>

            <Section>

            </Section>

            <Section styles="flex flex-col justify-between items-center bg-orange-50 p-5 rounded-lg">

                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-stethoscope text-blue-500"></i>
                    <Label forLabel="motivo">Valores de referencia</Label>
                </div>
                <div class="w-full flex md:flex-row flex-col justify-between items-center text-orange-400">
                    <span class="text-sm font-semibold">TA : 90-140/60-90 mmHg</span>
                    <span class="text-sm font-semibold">FC : 60-100 lpm</span>
                    <span class="text-sm font-semibold">FR : 12-20 rpm</span>
                    <span class="text-sm font-semibold">Tº : 36.1-37.2°C</span>
                    <span class="text-sm font-semibold">SAT o2 : 90% - 100%</span>
                </div>
            </Section>

        </FormularioWizard>
    </ModalFormLG>
</template>