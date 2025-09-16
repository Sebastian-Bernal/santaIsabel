export class TablaBuilder {
    constructor() {
        this.tabla = {
            columnas: [],
            headerTabla: {},
            acciones: {},
            datos: {}
        };
    }

    setColumnas(columnas) {
        this.tabla.columnas = columnas;
        return this;
    }

    setHeaderTabla(header) {
        this.tabla.headerTabla = { ...header };
        return this;
    }

    setAcciones(acciones) {
        this.tabla.acciones = { ...acciones };
        return this;
    }

    setDatos(content) {
        this.tabla.datos = { content };
        return this;
    }

    build() {
        return this.tabla;
    }
};

export class TablaDirector {
    constructor(builder) {
        this.builder = builder;
    }

    construirDesdeFormulario(formData) {
        return this.builder
            .setColumnas(formData.columnas)
            .setHeaderTabla({
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                color: formData.color,
                accionAgregar: formData.accionAgregar
            })
            .setAcciones(formData.acciones.icons, formData.acciones.botones)
            .setDatos(formData.datos)
            .build();
    }
}