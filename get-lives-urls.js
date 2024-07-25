console.clear();

const fs = require("fs");
const https = require("https");

const livesUrlsFilePath = "api/livesUrls.json";
const broadcastersFilePath = "api/broadcasters.json";
const fileEncoding = "utf-8";

function getOnBroadcasters(parameter) {
  let data = readJSONFile(broadcastersFilePath);
  let broadcastersData = data[parameter];
  return broadcastersData;
}

function createJSONFile(filePath) {
  const data = {};
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4), fileEncoding);
  console.log(
    "\033[0;32mArquivo JSON criado com sucesso em : " + filePath + "\033[m"
  );
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

function writeJSONFile(filePath, json, broadcasterKey, broadcasterLiveUrl) {
  json[broadcasterKey] = broadcasterLiveUrl;
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

function checkIfTheRadioStationIsOnline(broadcasterKey, broadcasterId) {
  console.log(broadcasterKey);
  let json = readJSONFile(livesUrlsFilePath);
  writeJSONFile(livesUrlsFilePath, json, broadcasterKey, broadcasterId);
  https.get(broadcasterId, (res) => {
    res.on("data", () => {
      /*let contentType = res.headers["content-type"];
      if (contentType.indexOf("audio") != -1) {
                console.log("\033[0;37;44m" + broadcasterKey + " : " + broadcasterId + "\033[m");
                writeJSONFile(livesUrlsFilePath, json, broadcasterKey, broadcasterId);
                res.destroy();
            } else {
                console.log("\033[0;37;41mError: " + broadcasterKey + " não disponível!\033[m");
                writeJSONFile(livesUrlsFilePath, json, broadcasterKey, "error");
                res.destroy();
            }*/
    });
  });
}

function getTheFacebookLiveUrl(broadcasterKey, broadcasterId) {
  let urlLive = "https://www.facebook.com/" + broadcasterId + "/live";

  const headerHTTPSOptions = {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "sec-fetch-mode": "navigate",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
    },
  };

  https.get(urlLive, headerHTTPSOptions, (res) => {
    let data = "";
    res.on("data", (d) => (data += d));
    res.on("end", () => {
      let json = readJSONFile(livesUrlsFilePath);

      let liveId = stringResultProcessing(data, '"videoId":"', '",');

      let liveUrl = "";

      if (liveId == "error") {
        console.log(
          "\033[0;37;41mError: " + broadcasterKey + " não disponível!\033[m"
        );
        liveUrl = "error";
      } else {
        console.log(
          "\033[0;37;44m" + broadcasterKey + " : " + liveId + "\033[m"
        );
        liveUrl =
          "https://www.facebook.com/plugins/video.php?&href=https%3A%2F%2Fwww.facebook.com%2F" +
          channelId +
          "%2Fvideos%2F" +
          liveId +
          "%2F";
      }
      writeJSONFile(livesUrlsFilePath, json, broadcasterKey, liveUrl);
    });
    return;
  });
}

function getTheYoutubeLiveUrl(broadcasterKey, broadcasterId) {
  let channelIdYoutube =
    "https://www.youtube.com/channel/" + broadcasterId + "/live";

  https.get(channelIdYoutube, (res) => {
    let data = "";

    res.on("data", (d) => (data += d));

    res.on("end", () => {
      let liveUrl = stringResultProcessing(
        data,
        '<link rel="canonical" href="',
        '">'
      ).replace("watch?v=", "embed/");
      if (liveUrl.indexOf("channel") != -1 || liveUrl.indexOf("error") != -1) {
        console.log(
          "\033[0;37;41mError: " + broadcasterKey + " não disponível!\033[m"
        );
        liveUrl = "error";
      } else {
        console.log(
          "\033[0;37;44m" + broadcasterKey + " : " + liveUrl + "\033[m"
        );
      }
      let json = readJSONFile(livesUrlsFilePath);
      writeJSONFile(livesUrlsFilePath, json, broadcasterKey, liveUrl);
    });
  });
}

function getLivesUrls(broadcasterKey, broadcasterPlatform, broadcasterId) {
  if (broadcasterPlatform == "radioStations") {
    checkIfTheRadioStationIsOnline(broadcasterKey, broadcasterId);

    return;
  } else if (broadcasterPlatform == "facebook") {
    getTheFacebookLiveUrl(broadcasterKey, broadcasterId);
  } else if (broadcasterPlatform == "youtube") {
    getTheYoutubeLiveUrl(broadcasterKey, broadcasterId);
  }
}

function main() {
  createJSONFile(livesUrlsFilePath);

  console.log(
    "\033[0;33m[ Iniciando Requisições O==={zzzzzzzzzz> TV Online ]\033[m"
  );

  broadcastersObjectKeys.forEach((broadcasterKey) => {
    const broadcaster = broadcastersJSONObject[broadcasterKey];
    const broadcasterPlatform = broadcaster.broadcastPlatform;
    const broadcasterId = broadcaster.id;

    getLivesUrls(broadcasterKey, broadcasterPlatform, broadcasterId);
  });
}

const broadcastersJSONObject = getOnBroadcasters("broadcasters");
const broadcastersObjectKeys = Object.keys(broadcastersJSONObject);

main();
