async function createCard(
    broadcasterKey,
    broadcasterTitle,
    broadcasterIsOffline,
    broadcasterCategories
) {
    const iconsPath = "assets/img/icons/";

    let li = document.createElement("li");
    li.dataset.channelsCard = "";
    li.classList.add("tv-channels__card");
    li.dataset.broadcasterKey = broadcasterKey;

    li.dataset.categories = broadcasterCategories.toString().replace(",", " ");

    let img = document.createElement("img");
    img.setAttribute("src", iconsPath + broadcasterKey + ".svg");
    img.classList.add("tv-channels__image");

    let h3 = document.createElement("h3");
    h3.classList.add("tv-channels__card__title");
    h3.textContent = broadcasterTitle;

    let button = document.createElement("p");
    button.textContent = "Assistir";
    button.classList.add("tv-channels__button");

    li.appendChild(img);
    li.appendChild(h3);
    li.appendChild(button);

    ulChannels.appendChild(li);

    if (broadcasterIsOffline) {
        li.dataset.broadcasterOffline = true;
    }
}

async function filterCardsWithError(
    broadcasterKey,
    broadcasterTitle,
    broadcasterId,
    broadcasterLiveUrl,
    broadcasterPlatform,
    broadcasterCategories
) {
    let broadcasterIsOffline;
    broadcasterLiveUrl == "error" || broadcasterLiveUrl == undefined
        ? (broadcasterIsOffline = true)
        : (broadcasterIsOffline = false);

    if (broadcasterIsOffline && broadcasterPlatform == "youtube") {
        console.warn(
            "A emissora",
            broadcasterTitle,
            "não está ao vivo!",
            "Caso queira assistir entre no link:",
            "https://youtube.com/channel/" + broadcasterId
        );
    } else if (broadcasterIsOffline && broadcasterPlatform == "facebook") {
        console.warn(
            "A emissora",
            broadcasterTitle,
            "não está ao vivo!",
            "Caso queira assistir entre no link:",
            "https://www.facebook.com/" + broadcasterId
        );
    }
    createCard(broadcasterKey, broadcasterTitle, broadcasterIsOffline, broadcasterCategories);
}

async function main() {
    const broadcastersJSONObject = await getOnBroadcasters("broadcasters");
    const broadcastersObjectKeys = Object.keys(broadcastersJSONObject);

    const broadcastersLivesUrls = await getJSON(livesUrlsFilePath);
    const broadcastersLivesUrlsKeys = Object.keys(broadcastersLivesUrls);

    broadcastersObjectKeys.forEach((broadcasterKey) => {
        const broadcaster = broadcastersJSONObject[broadcasterKey];

        filterCardsWithError(
            broadcasterKey,
            broadcaster.title,
            broadcaster.id,
            broadcastersLivesUrls[broadcasterKey],
            broadcaster.broadcastPlatform,
            broadcaster.categories
        );
    });
}

main();
