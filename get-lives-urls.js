const fs = require("fs");
const https = require("https");

const livesUrlsFilePath = "livesUrl.json";
const emissorasFilePath = "api/emissoras.json";
const fileEncoding = "utf-8";

function getOnEmissoras(parameter) {
    let data = readJSONFile(emissorasFilePath);
    let emissorasData = data[parameter];
    return emissorasData;
}

const emissoras = getOnEmissoras("emissoras");
const channelsIds = getOnEmissoras("channels");

function createJSONFile(filePath) {
    const data = {};
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), fileEncoding);
    console.log("\033[0;32mArquivo JSON criado com sucesso em : " + filePath + "\033[m");
}

function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, fileEncoding);
        const json = JSON.parse(data);
        return json;
    } catch (e) {
        console.log("\033[0;37;41m" + e + "\033[m");
    }
}

function writeJSONFile(filePath, json, content, list, i) {
    json[list[i]] = content;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 4), fileEncoding);
}

function stringResultProcessing(data, parameter, secondParameter) {
    let numberPosition = data.indexOf(parameter);
    if (numberPosition != -1) {
        let string = data.slice(numberPosition);
        let stringSplit = string.split(secondParameter);
        let stringFistElement = stringSplit[0];
        let liveUrl = stringFistElement.replace(parameter, "") + "?autoplay=1";

        return liveUrl;
    } else {
        return "error";
    }
}

async function getLiveUrl(channelId, emissora, i) {
    if (emissora.indexOf("radio") != -1) {
        let json = readJSONFile(livesUrlsFilePath);
        writeJSONFile(livesUrlsFilePath, json, channelId, emissoras, i);

        https.get(channelId, (res) => {
            res.on("data", () => {
                let json = readJSONFile(livesUrlsFilePath);
                let contentType = res.headers["content-type"];
                if (contentType.indexOf("audio") != -1) {
                    console.log("\033[0;37;44m" + emissora + " : " + channelId + "\033[m");
                    writeJSONFile(livesUrlsFilePath, json, channelId, emissoras, i);
                    res.destroy();
                } else {
                    console.log("\033[0;37;41mError: " + emissora + " não disponível!\033[m");
                    writeJSONFile(livesUrlsFilePath, json, "error", emissoras, i);
                    res.destroy();
                }
            });
        });

        return;
    } else if (emissora.indexOf("camera") != -1) {
        let json = readJSONFile(livesUrlsFilePath);
        writeJSONFile(livesUrlsFilePath, json, "error", emissoras, i);
        return;
    } else if (emissora.indexOf("facebook") != -1) {
        let urlLive = "https://www.facebook.com/" + channelId + "/live";

        const options = {
            headers: {
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "sec-fetch-mode": "navigate",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
            },
        };

        https.get(urlLive, options, (res) => {
            let data = "";
            res.on("data", (d) => (data += d));
            res.on("end", () => {
                let json = readJSONFile(livesUrlsFilePath);

                let liveId = stringResultProcessing(data, '"videoId":"', '",');

                if (liveId == "error") {
                    console.log("\033[0;37;41mError: " + emissora + " não disponível!\033[m");
                    writeJSONFile(livesUrlsFilePath, json, "error", emissoras, i);
                    return;
                } else {
                    console.log("\033[0;37;44m" + emissora + " : " + liveId + "\033[m");
                    let liveUrl =
                        "https://www.facebook.com/plugins/video.php?&href=https%3A%2F%2Fwww.facebook.com%2F" +
                        channelId +
                        "%2Fvideos%2F" +
                        liveId +
                        "%2F";
                    writeJSONFile(livesUrlsFilePath, json, liveUrl, emissoras, i);
                }
            });
            return;
        });
    } else {
        let channelIdYoutube = "https://www.youtube.com/channel/" + channelId + "/live";
        https.get(channelIdYoutube, (res) => {
            let data = "";

            res.on("data", (d) => (data += d));

            res.on("end", () => {
                let liveUrl = stringResultProcessing(data, '<link rel="canonical" href="', '">').replace(
                    "watch?v=",
                    "embed/"
                );
                if (liveUrl.indexOf("channel") != -1 || liveUrl.indexOf("error") != -1) {
                    console.log("\033[0;37;41mError: " + emissora + " não disponível!\033[m");
                    liveUrl = "error";
                } else {
                    console.log("\033[0;37;44m" + emissora + " : " + liveUrl + "\033[m");
                }
                let json = readJSONFile(livesUrlsFilePath);
                writeJSONFile(livesUrlsFilePath, json, liveUrl, emissoras, i);
            });
        });
    }
}

function saveUrls() {
    createJSONFile(livesUrlsFilePath);

    console.log("\033[0;33m[ Iniciando Requisições O==={zzzzzzzzzz> www.youtube.com ]\033[m");

    for (let i = 0; i < emissoras.length; i++) {
        let emissora = emissoras[i];
        let channelId = channelsIds[emissora];
        getLiveUrl(channelId, emissora, i);
    }
}
saveUrls();
