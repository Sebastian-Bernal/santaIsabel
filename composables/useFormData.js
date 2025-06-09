import { ref, watch, onMounted } from 'vue';

export function useFormData (initialForm) {
    const formData = ref(initialForm);
    
    const traerDatos = () => {
        const datosGuardados = localStorage.getItem('formData');
        if (datosGuardados) {
            formData.value = JSON.parse(datosGuardados);
        } else {
            console.log('No hay datos')
        }
    };

    onMounted(() => {
        traerDatos();
    });

    // Guardar los datos en localStorage
    watch(formData, (newValue) => {
        localStorage.setItem('formData', JSON.stringify(newValue));
    }, { deep: true });

    return {
        formData,
        traerDatos
    }
}

// Agrega un nuevo ítem a una lista dentro de formData, validando el último campo
export const agregarItem = (campo, plantilla, campoValidar) => {
    const lista = formData.value[campo];
    const ultimoValor = lista.at(-1)?.[campoValidar];

    if (!ultimoValor || ultimoValor === '') {
        console.log(`Por favor, complete el último valor del campo '${campo}' antes de agregar otro.`);
        return;
    }

    lista.push({ ...plantilla });
};

// Elimina un ítem de una lista, asegurando que quede al menos uno
export const eliminarItem = (campo, index) => {
    const lista = formData.value[campo];
    if (lista.length > 1) {
        lista.splice(index, 1);
    } else {
        console.log(`Debe haber al menos un elemento en '${campo}'.`);
    }
};