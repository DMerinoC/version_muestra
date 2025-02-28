const converter = new showdown.Converter()

async function run(){
    let prompt = document.querySelector("#question").value

    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek-r1:1.5b",
            prompt: prompt,
            stream: true
        })
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let entireResponse = ""
    while (true) {
        const { done, value } = await reader.read();
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        console.log(chunk)
        
        let chunkJson = JSON.parse(chunk)

        entireResponse += chunkJson.response
        entireResponse = entireResponse.replace("<think>", `<div id="think">`)
        entireResponse = entireResponse.replace("</think>", `</div>`)
        let entireResponseAsHtml = converter.makeHtml(entireResponse)
        document.querySelector("#answer").innerHTML = entireResponseAsHtml
    }
}