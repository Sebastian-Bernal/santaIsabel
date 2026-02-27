<script setup>
import { decryptData } from '~/composables/Formulario/crypto';

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const token = route.query.token
const varView = useVarView()

onMounted(async () => {

  if (!token) return

  // ❌ No logueado → login
  if (!varView.getUser) {
    return router.push(`/index?redirect=/aprobar-permiso?token=${token}`)
  }

  try {

    const tokenLogin = decryptData(sessionStorage.getItem('token'))

    await $fetch(`${config.public.api}/api/v1/aprobarPermiso`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenLogin}`
      },
      body: {
        token: token
      }
    })

    alert('Permiso aprobado correctamente')
    // Si está logueado → redirigir según lógica

    router.push('Home')

  } catch (error) {
    alert('Error al aprobar permiso')
  }

})

</script>