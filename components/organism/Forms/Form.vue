<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
import Wizard from './Wizard.vue';
import { loadComponent } from './componentLoader';

const props = defineProps({
    Propiedades: {
        default: {}
    }
});
const varView = useVarView();

// Inicializa formData con las claves de vmodel
const formData = ref(transformarFormData(props.Propiedades.campos));

function transformarFormData(campos) {
  const resultado = {};

  campos.forEach(campo => {
    const clave = campo.vmodel;
    if (!clave || typeof clave !== 'string' || !clave.includes('.')) return;
    const [grupo, propiedad] = clave.split('.');
    if (!resultado[grupo]) {
      resultado[grupo] = {};
    }
    resultado[grupo][propiedad] = '';
  });

  return resultado;
};

// Propiedad para traer componentes de cada campo
const componentInstances = computed(() => {
  const map = {};
  props.Propiedades.campos.forEach(campo => {
    if (campo.component && !map[campo.component]) {
      map[campo.component] = loadComponent(campo.component);
    }
  });
  return map;
});


// Guardar y validar Datos
watch(
    formData.value,
    (newValue) => {
        props.Propiedades?.content?.guardarDatos?.(newValue);

        // Detectar inputs inválidos
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = false
        varView.formComplete = !hayCamposInvalidos;
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    props.Propiedades?.content?.traerDatos?.();
});

// 🔹 función para leer un path dinámico
function getValue(obj, path) {
    if (!path) return undefined
    return path.split('.').reduce((acc, key) => acc[key], obj)
}

// 🔹 función para asignar en un path dinámico
function setValue(obj, path, value) {
    if (!path) return undefined
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((acc, key) => acc[key], obj)
  target[lastKey] = value
}


</script>
<template>
    <FondoBlur>
        <div
            class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7"
            :class="Propiedades.formulario.tamañoForm">

            <div class="pb-5 z-1 flex flex-col items-center h-[90%]  rounded-2xl">
                <!-- Formulario Wizard -->
                <Wizard v-if="Propiedades.formulario && Propiedades.formulario.tipo !== undefined && Propiedades.formulario.tipo === 'Wizard'" :secciones="Propiedades.formulario.secciones" :titulo="Propiedades.formulario.tituloFormulario"
                    :cerrar="Propiedades.formulario.cerrar" />
                <div class="w-full h-full px-6 pt-2">
                    <h1 v-if="Propiedades.formulario && Propiedades.formulario.titulo !== undefined" class="text-3xl text-[var(--color-default)] dark:text-white font-bold mb-3 text-center pt-5">{{
                        Propiedades.formulario.titulo }}</h1>
                    <!-- Formulario -->
                    <form action="" class="w-full h-full flex justify-center">
                        <div
                            class="scrollForm w-full flex flex-col items-center py-3 gap-[15px] h-[73%] overflow-y-auto">
                            <!-- Contenido del formulario -->
                            <div class="w-full px-10 grid grid-cols-2 gap-[15px]">
                                <component v-for="(item, index) in Propiedades.campos" :key="index"
                                    :is="componentInstances[item.component]"
                                    :Propiedades="item"
                                    :modelValue="getValue(formData, item.vmodel)"
                                    @update:modelValue="val => setValue(formData, item.vmodel, val)" />
                                <slot></slot>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <!-- Botones -->
            <div class="mt-2 w-full flex justify-center items-center gap-3">
                <ButtonForm v-for="item in props.Propiedades.formulario.botones" :color="item.color" @click="item.type === 'enviar' && !varView.formComplete ? Propiedades.content.validarform() : item.type === 'enviar' ? Propiedades.content.mandarFormulario(formData) : item.accion()"
                    class="md:w-[200px] w-1/3 text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                    {{ props.Propiedades.formulario.botones ? item.text : 'Cancelar' }}
                </ButtonForm>
            </div>
        </div>
    </FondoBlur>
</template>