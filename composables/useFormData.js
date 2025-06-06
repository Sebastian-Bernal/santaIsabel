import { ref, watch, onMounted } from 'vue';

export const useFormData = () => {
    const formData = ref({
        nombre: '',
        tipoDocumento: '',
        documento: '',
        diagnosticos: [{ tipo: '', cie10: '' }],
        motivo: '',
        enfermedad: '',
        antecedentes: '',
        ta: '',
        fc: '',
        fr: '',
        t: '',
        satO2: '',
        rehabilitacion: '',
        analisis: ''
    });


    // Guardar los datos en localStorage
    watch(formData, (newValue) => {
        localStorage.setItem('formData', JSON.stringify(newValue));
    }, { deep: true });

    onMounted(() => {
        traerDatos();
    });

    const traerDatos = () => {
        const datosGuardados = localStorage.getItem('formData');
        if (datosGuardados) {
            formData.value = JSON.parse(datosGuardados);
        } else {
            formData.value = {
                motivo: '',
                enfermedad: '',
                antecedentes: '',
            };
        }
    };
}