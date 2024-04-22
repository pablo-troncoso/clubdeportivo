const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;
const deportesFilePath = 'deportes.json';

// Middleware para los datos JSON enviados
app.use(express.json());

// Ruta para levantar el html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Ruta para agregar nuevo deporte
app.get('/agregar', (req, res) => {
    const { nombre, precio } = req.query;

    // Verificador de parámetros recibidos
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    // Validar los parámetros
    if (typeof nombre !== 'string' || typeof precio !== 'string') {
        return res.status(400).json({ error: 'Los parámetros deben ser de tipo string' });
    }

    // Leer el archivo JSON de deportes o crear
    let deportes;
    try {
        deportes = JSON.parse(fs.readFileSync(deportesFilePath, 'utf-8'));
    } catch (error) {
        deportes = [];
    }

    // Verificar si el deporte ya existe
    if (deportes.find(sport => sport.nombre === nombre)) {
        return res.status(400).json({ error: 'El deporte ya existe' });
    }

    // Agregar el nuevo deporte
    deportes.push({ nombre, precio });

    // Escribir los datos actualizados en el archivo JSON
    fs.writeFileSync(deportesFilePath, JSON.stringify(deportes, null, 2));

    // Enviar una respuesta exitosa
    res.status(201).json({ message: 'Deporte agregado correctamente' });
});

// Ruta para editar el precio de un deporte registrado
app.get('/editar', (req, res) => {
    const { nombre, precio } = req.query;

    // Verificar que se recibieron los parámetros necesarios
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'Nombre y precio son requeridos' });
    }

    // Leer archivo JSON de deportes o crearlo 
    let deportes;
    try {
        deportes = JSON.parse(fs.readFileSync(deportesFilePath, 'utf-8'));
    } catch (error) {
        return res.status(500).json({ error: 'Error al cargar el archivo de deportes' });
    }

    // Buscar el deporte
    const deporteIndex = deportes.findIndex(sport => sport.nombre === nombre);
    if (deporteIndex === -1) {
        return res.status(404).json({ error: 'Deporte no encontrado' });
    }

    // Actualizar el precio del deporte
    deportes[deporteIndex].precio = precio;

    // Escribir los datos actualizados en el archivo JSON
    fs.writeFileSync(deportesFilePath, JSON.stringify(deportes, null, 2));

    // Enviar una respuesta exitosa
    res.json({ message: 'Precio del deporte actualizado correctamente' });
});

// Ruta para eliminar un deporte
app.delete('/eliminar/:nombre', (req, res) => {
    const { nombre } = req.params;

    // Leer el archivo JSON de deportes o crearlo si no existe
    let deportes;
    try {
        deportes = JSON.parse(fs.readFileSync(deportesFilePath, 'utf-8'));
    } catch (error) {
        return res.status(500).json({ error: 'Error al cargar el archivo de deportes' });
    }

    // Filtrar los deportes excluyendo el que se desea eliminar
    const nuevosDeportes = deportes.filter(sport => sport.nombre !== nombre);

    // Verificar si se eliminó algún deporte
    if (nuevosDeportes.length === deportes.length) {
        return res.status(404).json({ error: 'Deporte no encontrado' });
    }

    // Escribir los datos actualizados en el archivo JSON
    fs.writeFileSync(deportesFilePath, JSON.stringify(nuevosDeportes, null, 2));

    // Enviar una respuesta exitosa
    res.json({ message: 'Deporte eliminado correctamente' });
});

// Ruta para obtener todos los deportes registrados
app.get('/deportes', (req, res) => {
    // Leer el archivo JSON de deportes o crearlo si no existe
    let deportes;
    try {
        deportes = JSON.parse(fs.readFileSync(deportesFilePath, 'utf-8'));
    } catch (error) {
        deportes = [];
    }

    // Enviar la lista de deportes como respuesta
    res.json({ deportes });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar el servidor en el puerto.
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
