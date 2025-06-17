import {ref} from 'vue';

export const pacientes = ref([
    { id: 0,nombre: 'Juan Perez', edad: 30, genero: 'Masculino', telefono: '1234567890', eps: 'Coomeva', tipoDocumento: 'cedula', documento: 123456789, fechaModificacion: '2023-10-01', direccion: 'Calle 11' },
    { id: 1,nombre: 'Ana Lopez', edad: 28, genero: 'Femenino', telefono: '9876543210', eps: 'Sura', tipoDocumento: 'cedula', documento: 126756789, fechaModificacion: '2023-10-01', direccion: 'Calle 11'  },
    { id: 2,nombre: 'Carlos Martinez', edad: 35, genero: 'Masculino', telefono: '1231231234', eps: 'Compensar', tipoDocumento: 'cedula', documento: 15656789, fechaModificacion: '2023-10-01', direccion: 'Calle 11'  },
    { id: 3,nombre: 'Laura Hernandez', edad: 22, genero: 'Femenino', telefono: '4564564567', eps: 'Sanitas', tipoDocumento: 'cedula', documento: 12389, fechaModificacion: '2023-10-01', direccion: 'Calle 11'  },
    { id: 4,nombre: 'Pedro Ramirez', edad: 40, genero: 'Masculino', telefono: '7897897890', eps: 'Nueva EPS', tipoDocumento: 'extranjera', documento: 12056789, fechaModificacion: '2023-10-01', direccion: 'Calle 11'  },
    { id: 5,nombre: 'Sofia Torres', edad: 32, genero: 'Femenino', telefono: '3213213210', eps: 'Medimás', tipoDocumento: 'cedula', documento: 1234234, fechaModificacion: '2023-10-01', direccion: 'Calle 11'  },
    { id: 6,nombre: 'Luis Gonzalez', edad: 29, genero: 'Masculino', telefono: '6546546543', eps: '', tipoDocumento: 'cedula', documento: 123456789, fechaModificacion: '2023-10-01', direccion: 'Calle 11' },
    { id: 7,nombre: 'Isabel Fernandez', edad: 27, genero: 'Femenino', telefono: '1112223333', eps: 'Famisanar', tipoDocumento: 'cedula', documento: 123456789, fechaModificacion: '2023-10-01', direccion: 'Calle 11'  },
    { id: 8,nombre: 'Andres Castro', edad: 31, genero: 'Masculino', telefono: '4445556666', eps: 'Coosalud', tipoDocumento: 'cedula', documento: 123456789, fechaModificacion: '2023-10-01', direccion: 'Calle 11'  },
    { id: 9,nombre: 'Maria Gomez', edad: 25, genero: 'Femenino', telefono: '0987654321', eps: 'Nueva EPS', tipoDocumento: 'cedula', documento: 1107837697, fechaModificacion: '2023-10-01', direccion: 'Calle 11' }
]);