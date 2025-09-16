export default defineNuxtPlugin(async () => {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  return {
    provide: {
      html2canvas,
      jsPDF,
    },
  }
})