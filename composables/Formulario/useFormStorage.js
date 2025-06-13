import { ref } from 'vue';

export function useFormStorage(key = 'formData') {
    const formData = ref(null);

    const guardar = (data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    const traerDatos = () => {
        const saved = localStorage.getItem(key);
        formData.value = saved ? JSON.parse(saved) : null;
    };

    const limpiar = () => {
        localStorage.removeItem(key);
    };

    return { formData, guardar, traerDatos, limpiar };
}