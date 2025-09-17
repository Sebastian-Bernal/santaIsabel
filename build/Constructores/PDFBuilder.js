export class PdfBuilder {
    constructor() {
        this.config = {
            elementId: null,
            isActive: false,
            storePinia: '',
            margin: 10,
            orientation: "p",
            unit: "mm",
            format: "a4",
            filename: "documento.pdf",
            components: []
        }
    }

    setElementId(id) {
        this.config.elementId = id
        return this
    }

    setIsActive(id) {
        this.config.isActive = id
        return this
    }

    setDataPinia(store) {
        this.config.storePinia = store
        return this
    }

    setMargins(margin) {
        this.config.margin = margin
        return this
    }

    setFileName(name) {
        this.config.filename = name
        return this
    }

    setOrientation(orientation) {
        this.config.orientation = orientation
        return this
    }

    setFormat(format) {
        this.config.format = format
        return this
    }

    async export() {
        const { $html2canvas, $jsPDF } = useNuxtApp()

        if (!this.config.elementId) {
            throw new Error("Debes definir un elementId con setElementId")
        }

        const element = document.getElementById(this.config.elementId)
        if (!element) throw new Error(`No existe el elemento con id: ${this.config.elementId}`)

        // Render con html2canvas
        const canvas = await $html2canvas(element, { scale: 2 })
        const imgData = canvas.toDataURL("image/png")

        // Crear PDF
        const pdf = new $jsPDF({
            orientation: this.config.orientation,
            unit: this.config.unit,
            format: this.config.format
        })

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = pageWidth - this.config.margin * 2
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        let position = this.config.margin

        // Manejo multipágina si excede
        let heightLeft = imgHeight
        let y = position

        while (heightLeft > 0) {
            pdf.addImage(imgData, "PNG", this.config.margin, y, imgWidth, imgHeight)
            heightLeft -= pageHeight
            if (heightLeft > 0) {
                pdf.addPage()
                y = 0
            }
        }

        pdf.save(this.config.filename)
    }

    addComponente(tipo, input) {
        let componente;

        // Si el input tiene un método build, asumimos que es un builder
        if (input && typeof input.build === 'function') {
            componente = input.build();
        } else if (input && typeof input === 'object') {
            // Si ya es un objeto, lo usamos directamente
            componente = input;
        } else {
            throw new Error('El componente debe ser un objeto o tener un método build()');
        }

        componente.tipo = tipo;

        this.config.components.push(componente)
        return this;

    }

    build() {
        return this.config;
    }
}

