async function getJSON(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (e) {
        console.log("Error: " + e);
    }
}

async function createCard(emissora, title) {
    const iconsPath = "assets/img/icons/";
    const ul = document.querySelector(".tv-channels__list");

    let li = document.createElement("li");
    li.classList.add("tv-channels__card");
    li.id = emissora;

    let img = document.createElement("img");
    img.setAttribute("src", iconsPath + emissora + ".svg");
    img.classList.add("tv-channels__image");

    let h3 = document.createElement("h3");
    h3.classList.add("tv-channels__card__title");
    h3.textContent = title;

    let button = document.createElement("p");
    button.textContent = "Assistir";
    button.classList.add("tv-channels__button");

    li.appendChild(img);
    li.appendChild(h3);
    li.appendChild(button);

    ul.appendChild(li);
}

async function removeCardsWithError() {
    const json = await getJSON("api/emissoras.json");
    const livesUrls = await getJSON("api/livesUrl.json");
    const emissoras = json.emissoras;
    const titles = json.titles;
    const channels = json.channels;

    for (let i = 0; i < emissoras.length; i++) {
        if (livesUrls[emissoras[i]] == "error") {
            let emissora = emissoras[i];
            if(emissora.indexOf("radio") != -1 || emissora.indexOf("camera") != -1 || emissora.indexOf("facebook") != -1) {
                console.error(titles[i], "não está ao vivo!, caso queira assistir entre em contato: admin@viajemais.inf.br");
                
            } else {
                console.error(titles[i], "não está ao vivo!, caso queira assistir a esta emissora entre no link:", "https://www.youtube.com/channel/" + channels[emissoras[i]]);
            }
        } else {
            createCard(emissoras[i], titles[i]);
        }
    }
}

removeCardsWithError();