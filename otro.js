const https = require('https');

function obtenerDatos(titulo) {
    return new Promise((resolve, reject) => {
        let url = "https://openlibrary.org/search.json?title="; // Reemplaza esto con la URL de tu API
        titulo = titulo.replace(" ", "+");
        https.get(url+titulo, (res) => {
            let data = '';

            // A callback for when a data chunk is received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                let response = JSON.parse(data);
                resolve("https://openlibrary.org/" + response['docs'][0]['seed'][0]);
            });

        }).on("error", (err) => {
            reject("Error: " + err.message);
        });
    });
}

// Llama a la función con un título de ejemplo
n = obtenerDatos("A court of Mist and Fury").then(console.log).catch(console.error);
console.log(n);