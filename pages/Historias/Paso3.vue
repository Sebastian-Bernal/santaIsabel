<script setup>
import FormularioWizard from '../../components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
import Textarea from '~/components/Textareas/Textarea.vue';
import Button from '~/components/Buttons/Button.vue'
import { CIE10 } from '~/data/CIE10.js'
import { useHistoriaClinicaStore } from '~/composables/Formulario/HistoriaClinica';
import { ref, watch } from 'vue';

const historiaClinicaStore = useHistoriaClinicaStore();

const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem
} = historiaClinicaStore;

const formComplete = ref(false);

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue)

    if (formData.HistoriaClinica.signosVitales.ta !== "" && formData.HistoriaClinica.signosVitales.fc !== "" && formData.HistoriaClinica.signosVitales.fr !== "" && formData.HistoriaClinica.signosVitales.t !== "" && formData.HistoriaClinica.signosVitales.SATo2 !== ""
        && formData.Diagnosticos.at(-1).tipo !== "" && formData.ExamenFisico.otros !== "" && formData.AnalisisTratamiento.analisis !== "" && formData.AnalisisTratamiento.tratamiento !== "") {
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
    <div class="w-full h-full flex flex-col items-center">
        <FormularioWizard :datos="{
            titulo: 'Examen y Analisis',
            tituloFormulario: 'Nueva Historia Clinica',
            botones: [
                { texto: 'Atras', ruta: '/Historias/Paso2', color: 'bg-gray-500' },
                { texto: 'Finalizar', ruta: '', color: 'bg-blue-500', submit: formComplete ? true : false, action: 'validarYEnviar' }
            ],
            secciones: [
                { numPagina: 1, ruta: '/Historias/Ingresar', color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, ruta: '/Historias/Paso2', color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 3, ruta: '/Historias/Paso3', color: 'bg-[rgba(0,0,0,0.5)] text-white' }
            ],
            formStore: 'HistoriaClinica'
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

            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-file text-blue-500"></i>
                    <Label forLabel="tipo" size="text-sm">Diagnoticos</Label>
                </div>
                <Button color="bg-blue-500"
                    @click="agregarItem('Diagnosticos', { id: '', tipo: '', CIE_10: '', id_paciente: '', rol_attention: '', }, 'tipo' )">
                    <i class="fa-solid fa-plus"></i>
                </Button>
            </Section>

            <Section styles="flex-col max-h-[100px] overflow-y-auto">
                <div class="w-full flex gap-3 items-center" v-for="(diagnostico, i) in formData.Diagnosticos">
                    <Input v-model="diagnostico.tipo" type="text" id="tipo" name="tipo" placeholder="Tipo"
                        tamaño="w-full" />
                    <Input v-model="diagnostico.CIE_10" type="text" id="cie10" name="cie10" placeholder="CIE-10" list="cie10List"
                        tamaño="w-full" />
                    <datalist id="cie10List">
                        <option v-for="enfermedad in CIE10" :value="enfermedad.description">codigo: {{ enfermedad.code }}</option>
                    </datalist>
                    <i v-if="i > 0" class="fa-solid fa-close text-gray-500"
                        @click="eliminarItem('Diagnosticos', i)"></i>
                </div>
            </Section>


            <Section class="md:flex-row flex-col">
                <Textarea v-model="formData.AnalisisTratamiento.analisis" id="analisis" name="analisis"
                    placeholder="Analisis"></Textarea>
            </Section>

            <Section class="mt-3">
                
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-notes-medical text-blue-500"></i>
                    <Label forLabel="rehabilitacion">Tratamiento</Label>
                </div>
            </Section>
            <Section class="md:flex-row flex-col mb-5">
                <Select v-model="formData.AnalisisTratamiento.tratamiento" id="rehabilitacion" name="rehabilitacion"
                    :options="[{ text: 'Total o Parcial', value: 'Total o Parcial' }, { text: 'Sin potencial de rehabilitacion', value: 'Sin potencial de rehabilitacion' }, { text: 'Cuidados paliativos o de mantenimiento', value: 'Cuidados paliativos o de mantenimiento' }]"
                    placeholder="Condicion de rehabilitacion" tamaño="md:w-3/5 w-full"></Select>

                <div class="md:w-2/5 w-full flex items-center gap-1">
                    <nuxt-link to="/Historias/Medicamentos" class="w-1/2">
                        <button type="button"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-[var(--color-green)] text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Medicina
                        </button>
                    </nuxt-link>
                    <nuxt-link to="/Historias/Procedimientos" class="w-1/2">
                        <button type="button"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-blue-400 text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Servicios
                        </button>
                    </nuxt-link>
                </div>
            </Section>

        </FormularioWizard>
    </div>
</template>