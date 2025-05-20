# __Proyecto Web: MotoGP 🏍️__
Este proyecto es una página web basada en la competición mundial de carreras de motos que se realiza a lo largo del año por todo el mundo, pasando por varios GP (Grandes Premios). Conocido como MotoGP, es el campeonato mundial de motociclismo de velocidad más prestigioso y antiguo del mundo. Fue inaugurado en 1949 por la Federación Internacional de Motociclismo (FIM), y desde entonces ha evolucionado tanto en tecnología como en popularidad.

*Si quieres usar el código de esta y quieres que se muestre el video de fondo en el indice, tienes que descargarlo desde [aqui](https://google.com) y ponerlo en la carpeta __images__.*

# __Estructura del proyecto__
## __Index__
Página principal del proyecto, donde se encuentra la información de la proxima carrera, la información de este apartado se recoge automaticamente en el archivo [proximacarrera.js](public/proximacarrera.js), también se encuentra un pequeño podio donde se muestran los 3 primeros mejores de la competición hasta lo que llevamos de temporada, la información de este apartado tambien se construye dinámicamente desde [clasificacion.js](public/clasificacion.js).

![index](https://i.imgur.com/EPt33MH.png)

## __Pilotos y equipos__
En esta pagina se muestran los diferentes pilotos y equipos que existen, estos no se cargan dinámicamente desde ningún archivo.

![pilotos](https://i.imgur.com/ca1Djli.png)

![equipos](https://i.imgur.com/qftND1o.png)

Cada piloto tiene su propia página donde se muestra información como la posicion, los puntos, las carreras ganadas y el compañero de equipo.

![piloto](https://i.imgur.com/bVvKmQ1.png)

## __Clasificación__
Aquí se muestra la tabla de clasificación de la temporada actual (2025), todo se carga dinámicamente desde el archivo [clasificacion.js](public/content/clasificacion/clasificacion.js).

![clasificacion](https://i.imgur.com/bVhaqm1.png)

## __Calendario__
Esta página carga dinámicamente mediante el script de [calendario.js](public/content/calendario/calendario.js) todas las carreras que hay en lo largo de la temporada actual (2025).

![calendario](https://i.imgur.com/mW8Jwef.png)

## __MotoGPdle__
Este es el minijuego que he creado para darle algo de interactividad con el usuario, consiste en el clasico juego de Wordle de adivinar la palabra pero con los pilotos de la temporada actual de MotoGP, este juego funciona con el siguiente script [script.js](public/content/motogpdle/script.js).

![motogpdle](https://i.imgur.com/P1esu9y.png)

# __Lado del servidor (Backend)__
Desde el cliente (navegador) para cargar los contenidos dinamicamente, hago una peticion a mi servidor de AWS donde tengo una instancia EC2, donde se aloja un contenedor docker donde se ejecuta este script y los guarda en ficheros (tanto .json en el caso del calendario, como .xml en el caso de la clasificacion (pilotos)) para no saturar la API que uso de tantas peticiones y así les hago una petición cada domingo a las 8 de la tarde para asegurarme de que se han jugado todas las carreras antes de esa hora, por lo que el endpoint que usa el cliente, es realmente un archivo del servidor que se genera a través de una petición a la[ API de MotoGP](https://github.com/micheleberardi/racingmike_motogp_import) que he usado.

```javascript
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');
const cors = require('cors');
const app = express();
const PORT = 3000;

const DATA_FILE = './calendario.json';
const XML_FILE = './clasificacion.xml';

app.use(cors());

async function fetchAndSaveData() {
  try {
    const response = await axios.get('https://api.motogp.pulselive.com/motogp/v1/results/events?seasonUuid=ae6c6f0d-c652-44f8-94aa-420fc5b3dab4');
    fs.writeFileSync(DATA_FILE, JSON.stringify(response.data, null, 2));
    console.log('Datos JSON actualizados.');
  } catch (err) {
    console.error('Error al obtener datos JSON:', err.message);
  }
}

async function fetchAndSaveClasificacion() {
  try {
    const response = await axios.get('https://resources.motogp.com/files/results/2025/FRA/MotoGP/RAC/worldstanding.XML', {
      responseType: 'text'
    });
    fs.writeFileSync(XML_FILE, response.data);
    console.log('Clasificación XML actualizada.');
  } catch (err) {
    console.error('Error al obtener clasificación:', err.message);
  }
}

app.get('/calendario', (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } else {
    res.status(404).send({ error: 'Datos no encontrados' });
  }
});

app.get('/clasificacion', (req, res) => {
  if (fs.existsSync(XML_FILE)) {
    const xml = fs.readFileSync(XML_FILE, 'utf8');
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } else {
    res.status(404).send({ error: 'Clasificación no encontrada' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);

  fetchAndSaveData();
  fetchAndSaveClasificacion();

  cron.schedule('0 20 * * 0', () => {
    console.log('Ejecutando fetch semanal cada domingo a las 20:00');
    fetchAndSaveData();
    fetchAndSaveClasificacion();
  });
});
```
