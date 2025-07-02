<script setup>
// Componentes
import Fondo from '../../components/Fondos/Fondo.vue'
import FormularioWizard from '../../components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
import Textarea from '~/components/Textareas/Textarea.vue';
import Button from '~/components/Buttons/Button.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
// Data
import { CIE10 } from '~/data/CIE10.js'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { ref, watch } from 'vue';

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

const formComplete = ref(false);

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue)

    // Validaciones
    if (formData.HistoriaClinica.signosVitales.ta !== "" && formData.HistoriaClinica.signosVitales.fc !== "" && formData.HistoriaClinica.signosVitales.fr !== "" && formData.HistoriaClinica.signosVitales.t !== "" && formData.HistoriaClinica.signosVitales.SATo2 !== ""
        && formData.ExamenFisico.otros !== "") {
        formComplete.value = true
    } else {
        formComplete.value = false
    }

}, { deep: true });

onMounted(() => {
    traerDatos();
});

const validarform = () => {
    if (!formComplete.value) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};
</script>

<template>
    <Fondo>
        <FormularioWizard class="mt-3" :datos="{
            titulo: 'Examen fisico',
            tituloFormulario: 'Nueva Historia Clinica',
            secciones: [
                { numPagina: 1, ruta: '/Historial/Ingresar', color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, ruta: '/Historial/Paso2', color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 3, ruta: '/Historial/Paso3', color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 4, ruta: '/Historial/Paso4', color: 'bg-gray-300' }
            ],
        }" tamaño="w-[80%] h-[85%]">

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-heart-pulse text-blue-500"></i>
                    <Label forLabel="motivo">Signos Vitales</Label>
                </div>
            </Section>

            <Section styles="md:flex-row flex-col">
                <Input v-model="formData.HistoriaClinica.signosVitales.ta" type="number" id="ta" name="ta"
                    placeholder="TA" tamaño="md:w-1/5 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.fc" type="number" id="fc" name="fc"
                    placeholder="FC" tamaño="md:w-1/5 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.fr" type="number" id="fr" name="fr"
                    placeholder="FR" tamaño="md:w-1/5 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.t" type="number" id="t" name="t" placeholder="Tº"
                    tamaño="md:w-1/5 w-full" />
                <Input v-model="formData.HistoriaClinica.signosVitales.SATo2" type="number" id="sat" name="sat"
                    placeholder="Sat O2" tamaño="md:w-1/5 w-full" />
            </Section>

            <Section styles="flex-col mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-weight-hanging text-blue-500"></i>
                    <Label forLabel="examenFisico">Medidas Antropométricas</Label>
                </div>
            </Section>
            <Section class="md:flex-row flex-col">
                <Input v-model="formData.ExamenFisico.Peso" type="number" id="examenFisico" name="examenFisico"
                    placeholder="Peso" tamaño="w-full" />
                <Input v-model="formData.ExamenFisico.altura" type="number" id="examenFisico" name="examenFisico"
                    placeholder="Altura" tamaño="w-full" />
                <Input v-model="formData.ExamenFisico.otros" type="text" id="examenFisico" name="examenFisico"
                    placeholder="Otros" tamaño="w-full" />
            </Section>

            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink to="/Historias/Paso2">
                    <ButtonForm color="bg-gray-500"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Atras
                    </ButtonForm>
                </nuxtLink>

                <nuxtLink :to="formComplete ? '/Historial/Paso4' : ''">
                <ButtonForm color="bg-blue-500" @click="validarform()"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Registrar
                </ButtonForm>
                </nuxtLink>
            </div>

        </FormularioWizard>
    </Fondo>
</template>