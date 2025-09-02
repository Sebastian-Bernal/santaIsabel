<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted } from 'vue';
import { useVarView } from '~/stores/varview';
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario'
import { useLoginBuilder } from '~/build/Login/useLoginBuilder';
import { useRecuperarContraseñaBuilder } from '~/build/Login/useRecuperarContraseñaBuilder.js';
import { useCambiarContraseñaBuilder } from '~/build/Login/useCambiarContraseñaBuilder';

definePageMeta({
    layout: 'authentication'
});

// 
const api = useApiRest()
const config = useRuntimeConfig()
const indexedDB = useIndexedDBStore();

onMounted(async () => {
    await indexedDB.initialize()
    await indexedDB.adminDemo()
    sessionStorage.clear()
})

const mostrarContraseña = ref(false);
const varView = useVarView();
const selectEmpresa = ref(false)
const opcionesCompañy = ref([])
const show = ref(false)
const showCambiarContraseña = ref(varView.showCambiarContraseña)

const cambiarMostrarContraseña = () => {
    mostrarContraseña.value = !mostrarContraseña.value;
    const passwordInput = document.getElementById('password');
    if (mostrarContraseña.value) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
};
// Temporal idexedDB
async function validaUsuario() {
    varView.cargando = true

    let options = {
        metodo: 'GET',
        url: config.public.authentication + Usuario.correo,
    }

    let validacion = await api.functionCall(options)

    if(validacion.data.length > 1){
        selectEmpresa.value = true
        validacion.data.forEach((item) => {
            opcionesCompañy.value.push({text: item.tenant_name, value: item.tenant_identifier}) 
        })
        console.log(opcionesCompañy.value)
    }

    varView.cargando = false
}

function recuperarContraseña() {
    // varView.showRecuperarContraseña = true
    show.value = true
}

function cerrar(){
    show.value = false
}

function cerrarCambiarContraseña(){
    show.value = false
}

function validarCodigo() {

}
// Formulario 
const propiedadesForm = useLoginBuilder({
    storeId: 'Ingresar',
    storePinia: 'Login',
    recuperarcontraseña: recuperarContraseña
});

const propiedadesRecuperarContraseña = useRecuperarContraseñaBuilder({
    storeId: 'RecuperarContraseña',
    storePinia: 'Login',
    cerrar: cerrar,
    show: show,
});

const propiedadesCambiarContraseña = useCambiarContraseñaBuilder({
    storeId: 'CambiarContraseña',
    storePinia: 'Login',
    validarCodigo: validarCodigo,
    cerrar: cerrarCambiarContraseña,
    show: showCambiarContraseña,
});

// Builder Pagina
const pagina = new ComponenteBuilder()

const propiedadesLogin = pagina
    .setFondo('FondoBlur')
    .setContenedor('w-1/3 flex justify-center')
        .addComponente('Form', propiedadesForm)
        .addComponente('Form', propiedadesRecuperarContraseña)
        .addComponente('Form', propiedadesCambiarContraseña)
    .build()
    console.log(propiedadesLogin)

</script>

<template>
    <Pagina :Propiedades="propiedadesLogin"/>
    <!-- <RecuperarContraseña v-if="varView.showRecuperarContraseña" />
    <CambiarContraseña v-if="false" correo="camilojara" /> -->
</template>