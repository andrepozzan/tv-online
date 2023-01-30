const body = document.querySelector("body");
const ulChannels = document.querySelector(".tv-channels__list");
const ulIframe = document.querySelector(".iframe__list");

async function getJSON(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (e) {
        console.log("Error: " + e);
    }
}

function getTitle(event, target, classTitle) {
    if (target.tagName == "LI") {
        let element = event.target;
        let title = element.querySelector(classTitle).textContent;
        return title;
    } else if (target.tagName == "UL") {
        return;
    } else {
        let element = event.target.parentNode;
        let title = element.querySelector(classTitle).textContent;
        return title;
    }
}

function createIframe(url, tag, emissora) {
    if (tag == "audio") {
        var iframe = document.createElement(tag);
        iframe.setAttribute("controls", "");
        iframe.setAttribute("autoplay", "");
        iframe.classList.add("modal__audio");
    } else if (tag == "video") {
        var iframe = document.createElement(tag);
        iframe.id = emissora + "Video";
        iframe.setAttribute("controls", "");
        iframe.setAttribute("autoplay", "");
        iframe.classList.add("modal__video");
    } else {
        var iframe = document.createElement(tag);
        iframe.setAttribute("allow", "autoplay");
        iframe.setAttribute("allowfullscreen", "");
        iframe.classList.add("modal__video");
    }

    iframe.setAttribute("src", url);

    return iframe;
}

function createButton(text, fistClass, secondClass) {
    let button = document.createElement("p");
    button.textContent = text;
    button.classList.add(fistClass, secondClass);
    return button;
}

function closeCamera(hls){
    let modal = document.querySelector(".modal");

    body.addEventListener("click", (e) => {
        let eventTarget = e.target;

        if (eventTarget == modal || eventTarget.parentNode == modal.querySelector(".modal__controls")) {
            hls.stopLoad();
            hls.destroy();
        }
    })
}

async function openCamera(cameraUrl, emissora) {
    if (await Hls.isSupported()) {
        var video = document.getElementById(emissora + "Video");
        var hls = new Hls();
        hls.loadSource(cameraUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = cameraUrl;
        video.addEventListener("canplay", function () {
            video.play();
        });
    }

    closeCamera(hls);    
}

function createModal(api, emissora) {
    let li = document.createElement("li");
    li.classList.add("modal");

    if (emissora.indexOf("radio") != -1) {
        const iconPath = "assets/img/icons/" + emissora;

        let contentRadio = document.createElement("div");
        contentRadio.classList.add("modal__content-radio");

        let img = document.createElement("img");
        img.setAttribute("src", iconPath + ".svg");
        img.classList.add("modal__image");
        contentRadio.appendChild(img);

        var iframe = createIframe(api[emissora], "audio");
        contentRadio.appendChild(iframe);

        li.appendChild(contentRadio);
    } else if (emissora.indexOf("camera") != -1) {
        let cameraUrl = api[emissora];
        var iframe = createIframe(cameraUrl, "video", emissora);

        openCamera(cameraUrl, emissora);

        li.appendChild(iframe);
    } else {
        var iframe = createIframe(api[emissora], "iframe");
        li.appendChild(iframe);
    }

    let div = document.createElement("div");
    div.classList.add("modal__controls");

    let buttonNext = createButton("Próximo >", "modal__button", "modal__controls__button--next");
    div.appendChild(buttonNext);

    let buttonClose = createButton("Fechar", "modal__button", "modal__controls__button--close");
    div.appendChild(buttonClose);

    let buttonReturn = createButton("< Anterior", "modal__button", "modal__controls__button--return");
    div.appendChild(buttonReturn);

    li.appendChild(div);

    li.id = emissora;

    ulIframe.appendChild(li);

    return li;
}

async function removeModal() {
    let modal = document.querySelector(".modal");

    modal.remove();
}

function closeModal(modal) {
    body.addEventListener("click", (e) => {
        if (e.target == modal || e.target == modal.querySelector(".modal__controls__button--close")) {
            removeModal();
        }
    })
}

function addEventListernerControl(button, emissora, api, operation) {
    button.addEventListener("click", () => {
        let number = operation;

        const emissorasList = document.querySelector(".tv-channels__list");
        const titles = emissorasList.querySelectorAll(".tv-channels__card__title");

        let titlesLength = titles.length;
        if (number == -1) {
            number = titlesLength - 1;
        } else if (number == titlesLength) {
            number = 0;
        }

        const modal = createModal(api, emissora[number].id);

        const buttonNext = modal.querySelector(".modal__controls__button--next");
        const buttonReturn = modal.querySelector(".modal__controls__button--return");

        closeModal(modal);

        channelsControls(buttonNext, buttonReturn, emissora, api, number);

        removeModal();

        return modal;
    })
}

function channelsControls(buttonNext, buttonReturn, emissora, api, i) {
    addEventListernerControl(buttonNext, emissora, api, i + 1);
    addEventListernerControl(buttonReturn, emissora, api, i - 1);
}

ulChannels.addEventListener("click", async function (event) {
    const api = await getJSON("api/livesUrl.json");

    const emissorasList = document.querySelector(".tv-channels__list");
    const titles = emissorasList.querySelectorAll(".tv-channels__card__title");
    const emissoras = emissorasList.querySelectorAll(".tv-channels__card");

    const target = event.target;
    const title = getTitle(event, target, ".tv-channels__card__title");

    for (let i = 0; i < titles.length; i++) {
        if (title == titles[i].textContent) {
            const modal = createModal(api, emissoras[i].id, i);

            const buttonNext = modal.querySelector(".modal__controls__button--next");
            const buttonReturn = modal.querySelector(".modal__controls__button--return");
            closeModal(modal);

            channelsControls(buttonNext, buttonReturn, emissoras, api, i);
        }
    }
});