const converter = new showdown.Converter();

async function run() {
    // Bloquear el botón al iniciar la solicitud
    const boton = document.querySelector("#envio"); 
    boton.disabled = true;

    let prompt = document.querySelector("#question").value;

    // Marca el tiempo de cuando se presiona el botón
    const TiempoInicioBoton = performance.now();

    // Realiza la solicitud fetch al servidor
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek-r1:1.5b",  // Aquí se especifica el modelo
            prompt: prompt,
            stream: false,
            option: {
                seed: 0, 
                temperature: 0
            }
        })
    });

    // Marca el tiempo cuando empieza a recibir la respuesta
    const RespuestaIniciada = performance.now();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let RespuestaEntera = "";

    // Lee la respuesta mientras el modelo esté generando datos (streaming)
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk);

        let chunkJson = JSON.parse(chunk);

        RespuestaEntera += chunkJson.response;
        RespuestaEntera = RespuestaEntera.replace("<think>", `<div id="think">`);
        RespuestaEntera = RespuestaEntera.replace("</think>", `</div>`);
        let RespuestaEnteraHtml = converter.makeHtml(RespuestaEntera);
        document.querySelector("#respuesta").innerHTML = RespuestaEnteraHtml;
    }

    // Marca el tiempo de cuando se termina de procesar la respuesta
    const FinRespuesta = performance.now();

    // Calcula los tiempos
    const TiempoHastaInicioDeRespuesta = RespuestaIniciada - TiempoInicioBoton; // Tiempo hasta que empieza a responder el modelo
    const TiempoFinDeRespuesta = FinRespuesta - RespuestaIniciada; // Tiempo desde que el modelo empezó hasta que terminó de responder

    // Función para convertir milisegundos a formato minutos:segundos
    function formatoMinutosSegundos(ms) {
        const segundos = (ms / 1000).toFixed(2);
        const minutos = Math.floor(segundos / 60);
        const segundosFaltantes = (segundos % 60).toFixed(2);
        return `${minutos}m ${segundosFaltantes}s`;
    }

    // Función para convertir milisegundos a segundos
    function convertirSegundos(ms) {
        return (ms / 1000).toFixed(2);
    }

    // Crear el objeto JSON con los tiempos, el nombre del modelo y la pregunta enviada
    const detallesConsulta = {
        nombre_modelo: "deepseek-r1:1.5b",  // Nombre del modelo
        pregunta_usuario: prompt,  // La pregunta que enviaste al modelo
        respuesta_modelo: RespuestaEntera,  // La respuesta generada por el modelo
        TiempoHastaInicioDeRespuestaMs: TiempoHastaInicioDeRespuesta.toFixed(2), // en milisegundos
        TiempoFinDeRespuestaMs: TiempoFinDeRespuesta.toFixed(2), // en milisegundos
        TiempoHastaInicioDeRespuestaSec: convertirSegundos(TiempoHastaInicioDeRespuesta), // en segundos
        TiempoFinDeRespuestaSec: convertirSegundos(TiempoFinDeRespuesta), // en segundos
        TiempoHastaInicioDeRespuestaFormatted: formatoMinutosSegundos(TiempoHastaInicioDeRespuesta), // en minutos y segundos
        TiempoFinDeRespuestaFormatted: formatoMinutosSegundos(TiempoFinDeRespuesta), // en minutos y segundos
    };

    // Mostrar los tiempos, el prompt y el modelo en consola o enviarlos donde sea necesario
    console.log(JSON.stringify(detallesConsulta));

    // Desbloquea el botón después de que toda la respuesta se haya generado y procesado
    boton.disabled = false;
}