<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Wizard from '../components/Forms/Wizard.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
import Textarea from '~/components/Textareas/Textarea.vue';
import { ref, watch } from 'vue';
definePageMeta({
    layout: 'authentication'
});

const { formData, traerDatos, guardarDatos } = useFormData();
const formComplete = ref(false);

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue)

    if (formData.HistoriaClinica.signosVitales.ta !== "" && formData.HistoriaClinica.signosVitales.fc !== "" && formData.HistoriaClinica.signosVitales.fr !== "" && formData.HistoriaClinica.signosVitales.t !== "" && formData.HistoriaClinica.signosVitales.SATo2 !== ""
        && formData.examenFisico.otros !== "" && formData.AnalisisTratamiento.analisis !== "" && formData.AnalisisTratamiento.tratamiento !== "") {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
}, { deep: true });

onMounted(() => {
    traerDatos();
});

</script>

<template>
    <!-- Indicador de seccion, form wizard -->
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/forms/HistoriaClinica/Paso1', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/HistoriaClinica/Paso2', color: 'bg-sky-700 text-white' },
        { numPagina: 3, ruta: '/forms/HistoriaClinica/Paso3', color: 'bg-sky-700 text-white' }
    ]" />

    <Formulario :datos="{
        titulo: 'Examen y Analisis',
        botones: [
            { texto: 'Atras', ruta: '/forms/HistoriaClinica/Paso2', color: 'bg-gray-500' },
            { texto: 'Finalizar', ruta: '', color: 'bg-[var(--color-primary)]', submit: formComplete ? true : false }
        ],
        formData: formData.value
    }">

        <div class="w-full md:w-4/5">
            <Label forLabel="ta">Signos vitales</Label>
        </div>
        <Section class="md:flex-row flex-col">
            <Input v-model="formData.HistoriaClinica.signosVitales.ta" type="number" id="ta" name="ta" placeholder="TA"
                tamaño="md:w-1/5 w-full" />
            <Input v-model="formData.HistoriaClinica.signosVitales.fc" type="number" id="fc" name="fc" placeholder="FC"
                tamaño="md:w-1/5 w-full" />
            <Input v-model="formData.HistoriaClinica.signosVitales.fr" type="number" id="fr" name="fr" placeholder="FR"
                tamaño="md:w-1/5 w-full" />
            <Input v-model="formData.HistoriaClinica.signosVitales.t" type="number" id="t" name="t" placeholder="Tº"
                tamaño="md:w-1/5 w-full" />
            <Input v-model="formData.HistoriaClinica.signosVitales.SATo2" type="number" id="sat" name="sat"
                placeholder="Sat O2" tamaño="md:w-1/5 w-full" />
        </Section>

        <div class="w-full md:w-4/5">
            <Label forLabel="examenFisico">Examen Fisico</Label>
        </div>
        <Section class="md:flex-row flex-col">
            <Input v-model="formData.examenFisico.Peso" type="number" id="examenFisico" name="examenFisico"
                placeholder="Peso" tamaño="w-full" />
            <Input v-model="formData.examenFisico.altura" type="number" id="examenFisico" name="examenFisico"
                placeholder="Altura" tamaño="w-full" />
            <Input v-model="formData.examenFisico.otros" type="text" id="examenFisico" name="examenFisico"
                placeholder="Otros" tamaño="w-full" />
        </Section>

        <Section class="md:flex-row flex-col">
            <Textarea v-model="formData.AnalisisTratamiento.analisis" id="analisis" name="analisis"
                placeholder="Analisis"></Textarea>
        </Section>

        <div class="w-full md:w-4/5">
            <Label forLabel="rehabilitacion">Tratamiento</Label>
        </div>
        <Section class="md:flex-row flex-col">
            <Select v-model="formData.AnalisisTratamiento.tratamiento" id="rehabilitacion" name="rehabilitacion"
                :options="[{ text: 'Total o Parcial', value: 'Total o Parcial' }, { text: 'Sin potencial de rehabilitacion', value: 'Sin potencial de rehabilitacion' }, { text: 'Cuidados paliativos o de mantenimiento', value: 'Cuidados paliativos o de mantenimiento' }]"
                placeholder="Condicion de rehabilitacion" tamaño="md:w-3/5 w-full"></Select>

            <div class="md:w-2/5 w-full flex items-center gap-1">
                <nuxt-link to="/forms/HistoriaClinica/Medicamentos" class="w-1/2">
                    <button type="button"
                        class="w-full h-[40px] flex justify-center items-center gap-2 bg-[var(--color-green)] text-white text-sm rounded hover:opacity-75">
                        <i class="fa-solid fa-plus"></i>Medicina
                    </button>
                </nuxt-link>
                <nuxt-link to="/forms/HistoriaClinica/Procedimientos" class="w-1/2">
                    <button type="button"
                        class="w-full h-[40px] flex justify-center items-center gap-2 bg-blue-400 text-white text-sm rounded hover:opacity-75">
                        <i class="fa-solid fa-plus"></i>Servicios
                    </button>
                </nuxt-link>
            </div>
        </Section>

    </Formulario>
</template>