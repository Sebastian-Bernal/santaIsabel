export class ModalBuilder {
    constructor() {
        this.propiedades = {
            componentes: [],
            secciones: [],
            seccionActual: [],
            fondo: '',
            tamaño: '',
            estilos: '',
            layout: '',
            show: '',
            cerrarModal: '',
            header: {
                titulo: '',
                descripcion: '',
                button: [],
            },
            headerModal: {},
            contenedor: '',
        };
    }

    setFondo(fondo = 'FondoDefault') {
        this.propiedades.fondo = fondo
        return this
    }

    setTamaño(tamañoClave = 'LG') {
        const clases = tamañosDisponibles[tamañoClave] || tamañosDisponibles['LG']
        this.propiedades.tamaño = clases

        return this
    }

    setEstilos(estilos) {
        this.propiedades.estilos = estilos
        return this
    }

    setShowModal(boolean) {
        this.propiedades.show = boolean
        return this
    }

    setCerrarModal(f) {
        this.propiedades.cerrarModal = f
        return this
    }

    setHeaderModal(header) {
        this.propiedades.headerModal = header
        return this
    }

    setLayout(layout) {
        this.propiedades.layout = layout
        return this
    }

    setHeaderPage(header) {
        this.propiedades.header = header
        return this
    }

    setContenedor(contenedor) {
        this.propiedades.contenedor = contenedor
        return this
    }

    nuevaSeccion(nombre, descripcion = '') {
        const seccion = {
            nombre,
            descripcion,
            componentes: []
        };
        this.propiedades.secciones.push(seccion);
        this.propiedades.seccionActual = seccion;
        return this;
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
        if (this.propiedades.seccionActual) {
            this.propiedades.seccionActual.componentes.push(componente);
        } else {
            console.warn('No hay sección activa. Usa .nuevaSeccion(nombre) antes de agregar campos.');
        }
        return this;

    }


    build() {
        return this.propiedades;
    }
};

const tamañosDisponibles = {
    LG: 'lg:w-[70%] md:w-[85%] md:h-[85%] w-[90%] h-[90%]',
    XS: 'md:w-[65%] md:h-[70%] w-[90%] h-[80%]',
    SM: 'lg:w-[45%] lg:h-[65%] md:w-[50%] md:h-[70%]  w-[90%] h-[60%]',
}