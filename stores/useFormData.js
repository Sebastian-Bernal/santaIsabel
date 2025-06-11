import { ref, watch, onMounted } from 'vue';
import { defineStore } from "pinia";

export const useFormData = defineStore('FormData', () => {
    const { $swal } = useNuxtApp();
    const formData = ref({
        Paciente: {
            name: '',
            type_doc: '',
            No_document: '',
            id: '',
        },
        Diagnosticos: [{
            id: '',
            tipo: '',
            CIE_10: '',
            id_paciente: '',
            rol_attention: '',
        }],
        Antecedentes: [{
            id: '',
            valor: '',
            id_paciente: '',
        }],
        Enfermedad: [{
            valor: '',
            fecha_diagnostico: '',
            fecha_rehabilitacion: '',
        }],
        HistoriaClinica: {
            motivo: '',
            signosVitales: {
                ta: '',
                fc: '',
                fr: '',
                t: '',
                SATo2: '',
            },
            fecha_historia: '',
            id_paciente: '',
            id_profesional: ''
        },
        examenFisico: {
            Peso: '',
            altura: '',
            otros: '',
            id_historiaClinica: '',
        },
        AnalisisTratamiento: {
            analisis: '',
            tratamiento: '',
        },
        Plan_manejo_medicamentos: [],
        Plan_manejo_procedimientos: [],
    });

    const traerDatos = () => {
        const datosGuardados = localStorage.getItem('formData');
        if (datosGuardados) {
            const data = JSON.parse(datosGuardados);
            Object.assign(formData.value, data);
        } else {
            console.log('No hay datos')
        }
    };

    // Agrega un nuevo ítem a una lista dentro de formData, validando el último campo
    const agregarItem = (campo, plantilla, campoValidar) => {
        const lista = formData.value[campo];
        const ultimoValor = lista.at(-1)?.[campoValidar];

        if (!ultimoValor || ultimoValor === '') {
            $swal.fire({
                position: "top-end",
                text: `'${campo}' esta vacio, por favor ingrese un valor`,
                showConfirmButton: false,
                timer: 1500,
                background: '#d33',
                color: '#fff'
            });
            return;
        }

        lista.push({ ...plantilla });
    };

    // Elimina un ítem de una lista, asegurando que quede al menos uno
    const eliminarItem = (campo, index) => {
        const lista = formData.value[campo];
        if (lista.length > 1) {
            lista.splice(index, 1);
        } else {
            console.log(`Debe haber al menos un elemento en '${campo}'.`);
        }
    };

    const guardarDatos = (newValue) => {
        localStorage.setItem('formData', JSON.stringify(newValue));
    };

    return {
        formData,
        traerDatos,
        guardarDatos,
        agregarItem,
        eliminarItem
    }
});