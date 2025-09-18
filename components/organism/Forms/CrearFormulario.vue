<script setup>
import { ref } from 'vue'
import { FormularioBuilder } from '~/build/Constructores/ClassFormulario'
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue'

const emit = defineEmits(['form-creado']);
// Opciones disponibles
const tiposComponentes = [
    { label: 'Campo de texto', value: 'Input' },
    { label: 'Contraseña', value: 'Password' },
    { label: 'Área de texto', value: 'TextArea' },
    { label: 'Selector', value: 'Select' },
    { label: 'Checkbox', value: 'Checkbox' },
    { label: 'Radio', value: 'Radio' },
]

const tamaños = ['SM', 'MD', 'LG', 'XL']
const stores = ['Notas', 'Pacientes', 'Profesionales']

// Datos del formulario meta
const metaForm = ref({
    tituloFormulario: '',
    tamaño: 'MD',
    fondo: false,
    secciones: [],
    store: '',
})

// Datos para crear sección/campo temporal
const nuevaSeccion = ref({ nombre: '', descripcion: '' })
const nuevoCampo = ref({
    component: 'Input',
    key: '',
    label: '',
    placeholder: '',
    vmodel: '',
    required: false,
    options: [],
})

// Agregar sección
const agregarSeccion = () => {
    if (!nuevaSeccion.value.nombre) return
    metaForm.value.secciones.push({
        nombre: nuevaSeccion.value.nombre,
        descripcion: nuevaSeccion.value.descripcion,
        campos: []
    })
    nuevaSeccion.value = { nombre: '', descripcion: '' }
}

// Agregar campo a la última sección
const agregarCampo = () => {
    if (metaForm.value.secciones.length === 0) return alert('Primero crea una sección')
    const ultima = metaForm.value.secciones.at(-1)
    ultima.campos.push({ ...nuevoCampo.value })
    nuevoCampo.value = { component: 'Input', key: '', label: '', placeholder: '', vmodel: '', required: false, options: [] }
}


// Generar JSON con FormularioBuilder
const generarFormulario = () => {
    let builder = new FormularioBuilder()
        .setFormularioTitulo(metaForm.value.tituloFormulario)
        .setFormulariotamaño(metaForm.value.tamaño)
        .setFormularioFondo(metaForm.value.fondo)
        .setStorePinia(metaForm.value.store)

    metaForm.value.secciones.forEach(seccion => {
        builder.nuevaSeccion(seccion.nombre, seccion.descripcion)
        seccion.campos.forEach(campo => builder.addCampo(campo))
    })

    console.log('Formulario generado:', builder.build())
    const form = builder.build()
    emit('form-creado', form);
}
</script>

<template>
    <FondoBlur>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7 md:w-[65%] md:h-[70%] w-[90%] h-[80%]">
            <div class="p-6 bg-gray-100 rounded-xl shadow-md overflow-y-auto scrollForm flex flex-col gap-5">
                <div class="h-[40vh] ">
                <h2 class="text-xl font-bold">Creador de Formularios</h2>

                <!-- Configuración básica -->
                <div class="space-y-2">
                    <label class="block font-semibold">Título del Formulario</label>
                    <input v-model="metaForm.tituloFormulario" class="border rounded p-2 w-full"
                        placeholder="Ej: Registro de usuario" />

                    <label class="block font-semibold">Tamaño</label>
                    <select v-model="metaForm.tamaño" class="border rounded p-2 w-full">
                        <option v-for="t in tamaños" :key="t" :value="t">{{ t }}</option>
                    </select>

                    <label class="block font-semibold">Store</label>
                    <select v-model="metaForm.store" class="border rounded p-2 w-full">
                        <option v-for="t in stores" :key="t" :value="t">{{ t }}</option>
                    </select>

                    <label class="flex items-center gap-2">
                        <input type="checkbox" v-model="metaForm.fondo" />
                        Fondo activado
                    </label>
                </div>

                <!-- Sección -->
                <div class="space-y-2">
                    <h3 class="font-bold">Nueva Sección</h3>
                    <input v-model="nuevaSeccion.nombre" class="border rounded p-2 w-full"
                        placeholder="Nombre de la sección" />
                    <input v-model="nuevaSeccion.descripcion" class="border rounded p-2 w-full"
                        placeholder="Descripción" />
                    <button @click="agregarSeccion" class="bg-green-600 text-white px-4 py-2 rounded">Agregar
                        Sección</button>
                </div>

                <!-- Campos -->
                <div class="space-y-2">
                    <h3 class="font-bold">Nuevo Campo</h3>
                    <label class="block">Tipo de componente</label>
                    <select v-model="nuevoCampo.component" class="border rounded p-2 w-full">
                        <option v-for="c in tiposComponentes" :key="c.value" :value="c.value">{{ c.label }}</option>
                    </select>

                    <input v-model="nuevoCampo.key" class="border rounded p-2 w-full" placeholder="Key (ej: correo)" />
                    <input v-model="nuevoCampo.label" class="border rounded p-2 w-full"
                        placeholder="Label (ej: Correo electrónico)" />
                    <input v-model="nuevoCampo.placeholder" class="border rounded p-2 w-full"
                        placeholder="Placeholder" />
                    <input v-model="nuevoCampo.vmodel" class="border rounded p-2 w-full"
                        placeholder="V-Model" />

                    <label class="flex items-center gap-2">
                        <input type="checkbox" v-model="nuevoCampo.required" />
                        Requerido
                    </label>

                    <!-- Opciones (para Select/Radio/Checkbox) -->
                    <div v-if="['Select', 'Radio', 'Checkbox'].includes(nuevoCampo.component)" class="space-y-2">
                        <label class="block">Opciones (separadas por coma)</label>
                        <input @blur="nuevoCampo.options = $event.target.value.split(',').map(o => o.trim())"
                            class="border rounded p-2 w-full" placeholder="Ej: Hombre,Mujer,Otro" />
                    </div>

                    <button @click="agregarCampo" class="bg-blue-600 text-white px-4 py-2 rounded">Agregar
                        Campo</button>
                </div>


                <!-- Botón generar -->
                <div class="pt-4">
                    <button @click="generarFormulario" class="bg-purple-600 text-white px-6 py-2 rounded-lg">
                        Generar Formulario JSON
                    </button>
                </div>
                                </div>
            </div>
        </div>
    </FondoBlur>
</template>
