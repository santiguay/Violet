const https = require('https');


function obtenerDatos(titulo) {
    return new Promise((resolve, reject) => {
        let url = "https://openlibrary.org/search.json?title="; // Reemplaza esto con la URL de tu API
        titulo = String(titulo);
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
                resolve("https://openlibrary.org/" + response['docs'][0]['key']);
            });

        }).on("error", (err) => {
            reject("Error: " + err.message);
        });
    });
}
async function traducirTexto(texto) {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=`+texto+`&langpair=es-ES|en-GB`);
    const data = await res.json();

    return data.responseData.translatedText;
}

traducirTexto().then(translatedText => console.log(translatedText));



const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


const flowSecundario = addKeyword(['/2', '/siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

const flowDocs = addKeyword(['/doc', '/documentacion', '/documentación']).addAnswer(
    [
        '📄 Aquí encontras las documentación recuerda que puedes mejorarla',
        'Puedes usar /violet para inicializar el proyecto y /libros para bbuscar librros por titulo',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowTuto = addKeyword(['/tutorial', '/tuto']).addAnswer(
    [
        '🙌 Aquí encontras un ejemplo rapido',
        'https://bot-whatsapp.netlify.app/docs/example/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowGracias = addKeyword(['/gracias', '/grac']).addAnswer(
    [
        'De nada bro'
    ],
    null,
    null,
    [flowSecundario]
)

const flowDiscord = addKeyword(['/about']).addAnswer(
    ['Somos un equipo jovenes programadores'],
    null,
    null,
    [flowSecundario]
)

const flowLibros = addKeyword(['/libros'])
    .addAction(async (_, { flowDynamic }) => {
        return flowDynamic('¿Cual libro te gustaria?')
    })
    .addAction({ capture: true }, async (ctx, { flowDynamic, state }) => {
        await state.update({ name: ctx.body })
        let titulo = await traducirTexto(`${ctx.body}`)
        
        let datos = await obtenerDatos(titulo)
        return flowDynamic(`Gracias por el nombre!: ${datos}`)
    })

const flowPrincipal = addKeyword([ '/violet','/Violet'])
    .addAnswer('🙌 Hola bienvenid/a a violet', {
        media: './violet.jpg',
})
    .addAnswer(
        [
            'te comparto los siguientes links de interes sobre el proyecto',
            '👉 */doc* para ver la documentación',
            '👉 */gracias*  para ver la lista de videos',
            '👉 */about* ¿Quienes somos?',
            '👉 */libros* busca libros por titulo',
        ],
        null,
        null,
        [flowDocs, flowGracias, flowTuto, flowDiscord, flowLibros]
    )

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()