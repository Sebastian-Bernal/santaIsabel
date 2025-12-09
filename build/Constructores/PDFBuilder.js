export class PdfBuilder {
    constructor() {
        this.config = {
            elementId: null, // ID Componente padre html
            isActive: false,
            storePinia: '',
            margin: 10,
            orientation: "p",
            unit: "mm",
            format: "a4",
            filename: "documento.pdf",
            components: [],
            sello: '',
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

    setSello(sello) {
        this.config.sello = sello
        return this
    }

    async cargarSelloComoBase64() {
        if (!this.config.sello) return null;
        const config = useRuntimeConfig()

        try {
            // const res = await fetch(`${config.public.api}/${config.publico.obtenerSelloBase64}/${this.config.sello}`);
            const res = await fetch("http://127.0.0.1:8000/api/v1/sello/L5jHtC91M80723m8E7Gf.jpg");
            const data = await res.json();
            return data.base64;
        } catch (err) {
            console.error("Error cargando sello:", err);
            return null;
        }
    }


    async export() {
    const { $html2canvas, $jsPDF } = useNuxtApp();

    if (!this.config.elementId) {
        throw new Error("Debes definir un elementId con setElementId");
    }

    // Convertir la URL del sello a Base64
    const selloBase64 = await this.cargarSelloComoBase64();

    if (selloBase64) {
        const selloDiv = document.getElementById("selloProfesional");
        if (selloDiv) {
        selloDiv.innerHTML = `<img src="${selloBase64}" style="width:80px;height:80px;" />`;
        }
    }

    const element = document.getElementById(this.config.elementId);
    if (!element) throw new Error(`No existe el elemento con id: ${this.config.elementId}`);

    // Render con html2canvas
    const canvas = await $html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    // Crear PDF
    const pdf = new $jsPDF({
        orientation: this.config.orientation,
        unit: this.config.unit,
        format: this.config.format
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - this.config.margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = this.config.margin;

    // Primera página
    pdf.addImage(imgData, "PNG", this.config.margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 👉 Calcular posición del sello según DOM
    if (selloBase64) {
        const selloElement = document.getElementById("selloProfesional");
        if (selloElement) {
        const rect = selloElement.getBoundingClientRect();

        // Escala DOM → PDF
        const scaleX = imgWidth / canvas.width;
        const scaleY = imgHeight / canvas.height;

        const selloX = this.config.margin + rect.left * scaleX;
        const selloY = this.config.margin + rect.top * scaleY;
        const selloW = rect.width * scaleX;
        const selloH = rect.height * scaleY;

        pdf.addImage(selloBase64, "JPEG", selloX, selloY, selloW, selloH);
        }
    }

    // Páginas adicionales
    while (heightLeft > 0) {
        pdf.addPage();
        position = this.config.margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, "PNG", this.config.margin, position, imgWidth, imgHeight);

        // Repetir sello en cada página
        if (selloBase64) {
        const selloElement = document.getElementById("selloProfesional");
        if (selloElement) {
            const rect = selloElement.getBoundingClientRect();
            const scaleX = imgWidth / canvas.width;
            const scaleY = imgHeight / canvas.height;

            const selloX = this.config.margin + rect.left * scaleX;
            const selloY = this.config.margin + rect.top * scaleY;
            const selloW = rect.width * scaleX;
            const selloH = rect.height * scaleY;

            pdf.addImage(selloBase64, "JPEG", selloX, selloY, selloW, selloH);
        }
        }

        heightLeft -= pageHeight;
    }

    pdf.save(this.config.filename);
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

