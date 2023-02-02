console.clear();

const livesUrlsFilePath = "api/livesUrls.json";
const broadcastersFilePath = "api/broadcasters.json";

const body = document.querySelector("body");
const ulChannels = document.querySelector("[data-channels-list]");
const ulIframe = document.querySelector("[data-iframe-list]");

async function getJSON(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (e) {
        console.log("Error: " + e);
    }
}

async function getOnBroadcasters(parameter) {
    let data = await getJSON(broadcastersFilePath);
    let broadcastersData = data[parameter];
    return broadcastersData;
}