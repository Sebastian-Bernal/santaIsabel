<script setup>
// Componentes
import ModalLG from '~/components/Modales/ModalLG.vue';
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

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue)

    // Validaciones
    if (formData.HistoriaClinica.signosVitales.ta !== "" && formData.HistoriaClinica.signosVitales.fc !== "" && formData.HistoriaClinica.signosVitales.fr !== "" && formData.HistoriaClinica.signosVitales.t !== "" && formData.HistoriaClinica.signosVitales.SATo2 !== ""
        && formData.ExamenFisico.otros !== "") {
        varView.formComplete = true
    } else {
        varView.formComplete = false
    }

}, { deep: true });

onMounted(() => {
    traerDatos();
});

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
</script>

<template>
    <ModalLG :cerrarModal="cerrarModal" :enviarFormulario="enviarTercerPaso" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform" :botones="[]">
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

            <Section styles="md:flex-row flex-col">
                <Input v-model="formData.HistoriaClinica.signosVitales.ta" type="number" id="ta" name="ta"
                    placeholder="TA" tamaño="md:w-1/3 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.fc" type="number" id="fc" name="fc"
                    placeholder="FC" tamaño="md:w-1/3 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.fr" type="number" id="fr" name="fr"
                    placeholder="FR" tamaño="md:w-1/3 w-full" />
            </Section>

            <Section styles="md:flex-row flex-col">
                <Input v-model="formData.HistoriaClinica.signosVitales.t" type="number" id="t" name="t" placeholder="Tº"
                    tamaño="md:w-1/2 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.SATo2" type="number" id="sat" name="sat"
                    placeholder="Sat O2" tamaño="md:w-1/2 w-full" />
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
                </div>
            </Section>

        </FormularioWizard>
    </ModalLG>
</template>