<script setup>
// Componentes
import ModalFormLG from '~/components/Modales/ModalFormLG.vue';
import FormularioWizard from '../../components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Label from '~/components/Labels/Label.vue';
import Section from '~/components/Forms/Section.vue';
import Textarea from '~/components/Textareas/Textarea.vue';
import Button from '~/components/Buttons/Button.vue';
import Medicinas from './Medicinas.vue';
import Procedimientos from './Procedimientos.vue';
import Insumos from './Insumos.vue';
import Equipos from './Equipos.vue';
// Data
// import { CIE10 } from '~/data/CIE10.js'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useNotificacionesStore } from '../../stores/notificaciones.js'
import { useCodigos } from '~/stores/CIE10';;
import { ref, watch, onMounted } from 'vue';
import { useVarView } from "../../stores/varview.js";

const varView = useVarView();
const HistoriaStore = useHistoriasStore();
const RegistrarHistoriaStore = HistoriaStore.createForm('RegistrarHistoria')
const notificacionesStore = useNotificacionesStore();
const storeCIE10 = useCodigos();

const CIE10 = ref([])
// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem,
    limpiar,
    estado,
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
        && formData.ExamenFisico.otros !== "" && formData.AnalisisTratamiento.analisis !== "" && formData.AnalisisTratamiento.tratamiento !== "") {
        varView.formComplete = true
    } else {
        varView.formComplete = false
    }

}, { deep: true });

onMounted(async () => {
    CIE10.value = await storeCIE10.leerdatos()
    traerDatos();
});

function autocompletarCodigo(index) {
    const descripcion = formData.Diagnosticos[index].CIE_10;
    const enfermedad = CIE10.value.find(e => e.description === descripcion);
    if (enfermedad) {
        formData.Diagnosticos[index].codigoCIE_10 = enfermedad.code;
    } else {
        formData.Diagnosticos[index].codigoCIE_10 = '';
    }
}

// Enviar formulario
const enviarRegistrarHistoria = async (formData) => {
    event.preventDefault();

    const estado = await mandarFormulario(formData)
    if (estado) {
        options.icono = 'success';
        options.titulo = '¡Se ha enviado correctamente!';
        options.texto = 'Nueva Historia Registrada';
        options.tiempo = 2000
        const respuesta = await simple()
        if(respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            varView.showPaso4 = false;
            HistoriaStore.listHistorias
        }
    }
};

const validarform = () => {
    if (!varView.formComplete.value) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

const cerrarModal = () => {
    varView.showNuevaHistoria = false;
    varView.showPaso2 = false;
    varView.showPaso3 = true;
    varView.showPaso4 = false;
};
</script>

<template>
    <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarRegistrarHistoria" :formData="formData"
        :formComplete="varView.formComplete" :validarform="validarform"
        :botones="{ cancelar: 'Atras', enviar: 'Registrar' }">
        <FormularioWizard :datos="{
            titulo: 'Analisis',
            tituloFormulario: 'Nueva Historia Clinica',
            secciones: [
                { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 3, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 4, color: 'bg-[rgba(0,0,0,0.5)] text-white' }
            ],
        }">

            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-file text-blue-500"></i>
                    <Label forLabel="tipo" size="text-sm">Diagnoticos</Label>
                </div>
                <Button color="bg-blue-500"
                    @click="agregarItem('Diagnosticos', { id: '', CIE_10: '', id_paciente: formData.HistoriaClinica.id_paciente, rol_attention: '', }, 'CIE_10')">
                    <i class="fa-solid fa-plus"></i>
                </Button>
            </Section>

            <Section styles="flex-col max-h-[150px] overflow-y-auto">
                <div class="w-full flex gap-3 items-center" v-for="(diagnostico, i) in formData.Diagnosticos">
                    <Input v-model="diagnostico.CIE_10" type="text" id="cie10" name="cie10" placeholder="CIE-10"
                        list="cie10List" tamaño="w-full" @change="autocompletarCodigo(i)" />
                    <datalist id="cie10List">
                        <option v-for="enfermedad in CIE10" :value="enfermedad.description">codigo: {{ enfermedad.code
                            }}</option>
                    </datalist>
                    <i class="fa-solid fa-close text-red-400" @click="eliminarItem('Diagnosticos', i)"></i>
                </div>
                <div v-if="formData.Diagnosticos.length < 1" class="w-full flex justify-center items-center py-3">
                    <p class="text-gray-500">No hay datos, Haz click en agregar Diagnosticos.</p>
                </div>
            </Section>
            <Section>
                <Select v-model="formData.HistoriaClinica.tipoAnalisis" id="rehabilitacion" name="rehabilitacion"
                    :options="[{ text: 'Estado clinico sin cambios', value: 'Estado clinico sin cambios' }, { text: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' }, { text: 'Cambios criticos', value: 'Cambios criticos' }]"
                    placeholder="Tipo de Analisis" tamaño="w-full"></Select>
                <Input v-model="formData.HistoriaClinica.analisis" type="text" id="analisist" name="analisist"
                    placeholder="Observacion" tamaño="w-full" />
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
            <Section class="md:flex-row flex-col mb-3">
                <Select v-model="formData.AnalisisTratamiento.tratamiento" id="rehabilitacion" name="rehabilitacion"
                    :options="[{ text: 'Total o Parcial', value: 'Total o Parcial' }, { text: 'Sin potencial de rehabilitacion', value: 'Sin potencial de rehabilitacion' }, { text: 'Cuidados paliativos o de mantenimiento', value: 'Cuidados paliativos o de mantenimiento' }]"
                    placeholder="Condicion de rehabilitacion" tamaño="w-full"></Select>
            </Section>

            <Section>
                <div class="w-full flex items-center gap-1">
                    <a @click="varView.showMedicinas = true" class="w-1/4">
                        <button type="button"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-[var(--color-default-200)] text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Medicina
                        </button>
                    </a>
                    <a @click="varView.showProcedimientos = true" class="w-1/4">
                        <button type="button"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-[var(--color-default-300)] text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Servicios
                        </button>
                    </a>
                    <a @click="varView.showInsumos = true" class="w-1/4">
                        <button type="button"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-[var(--color-default-500)] text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Insumos
                        </button>
                    </a>
                    <a @click="varView.showEquipos = true" class="w-1/4">
                        <button type="button"
                            class="w-full h-[40px] flex justify-center items-center gap-2 bg-[var(--color-default-600)] text-white text-sm rounded hover:opacity-75">
                            <i class="fa-solid fa-plus"></i>Equipos
                        </button>
                    </a>
                </div>
            </Section>

            <Section styles="flex flex-col justify-between items-center bg-blue-50 p-5 rounded-lg">

                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-stethoscope text-blue-500"></i>
                    <Label forLabel="motivo">Resumen De Historia</Label>
                </div>
                <div class="w-full flex flex-col justify-center items-start text-blue-400">
                    <span class="text-sm font-semibold">Enfermedad Actual : {{ formData.Enfermedad.valor }}</span>
                    <span class="text-sm font-semibold">Diagnostico Principal : {{ formData.Diagnosticos[0]?.CIE_10
                        }}</span>
                    <span class="text-sm font-semibold">Medicamentos : {{ formData.Plan_manejo_medicamentos.length
                        }}</span>
                </div>
            </Section>
        </FormularioWizard>
    </ModalFormLG>
    <Medicinas v-if="varView.showMedicinas" />
    <Procedimientos v-if="varView.showProcedimientos" />
    <Insumos v-if="varView.showInsumos" />
    <Equipos v-if="varView.showEquipos" />
</template>