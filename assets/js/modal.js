function getBroadcasterKeyUsingEvent(event, target) {
    if (target.tagName == "LI") {
        let element = event.target;
        return element.dataset.broadcasterKey;
    } else if (target.tagName == "UL") {
        return false;
    } else {
        let element = event.target.parentNode;
        return element.dataset.broadcasterKey;
    }
}

function createIframe(url, tag, broadcaster) {
    if (tag == "audio") {
        var iframe = document.createElement(tag);
        iframe.setAttribute("controls", "");
        iframe.setAttribute("autoplay", "");
        iframe.classList.add("modal__audio");
    } else if (tag == "video") {
        var iframe = document.createElement(tag);
        iframe.id = broadcaster + "Video";
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

function closeCamera(hls) {
    let modal = document.querySelector("[data-modal]");

    body.addEventListener("click", (e) => {
        let eventTarget = e.target;

        if (
            eventTarget == modal ||
            eventTarget.parentNode == modal.querySelector("[data-modal-controls]")
        ) {
            hls.stopLoad();
            hls.destroy();
        }
    });
}

async function openCamera(cameraUrl, broadcaster) {
    if (await Hls.isSupported()) {
        var video = document.getElementById(broadcaster + "Video");
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

function createModal(broadcasterKey, broadcasterLiveUrl, broadcasterPlatform) {
    let li = document.createElement("li");
    li.dataset.modal = "";
    li.classList.add("modal");

    if (broadcasterPlatform == "youtube") {
        var iframe = createIframe(broadcasterLiveUrl, "iframe");
        li.appendChild(iframe);
    } else if (broadcasterPlatform == "radioStations") {
        const iconPath = "assets/img/icons/" + broadcasterKey;

        let contentRadio = document.createElement("div");
        contentRadio.classList.add("modal__content-radio");

        let img = document.createElement("img");
        img.setAttribute("src", iconPath + ".svg");
        img.classList.add("modal__image");
        contentRadio.appendChild(img);

        var iframe = createIframe(broadcasterLiveUrl, "audio");
        contentRadio.appendChild(iframe);

        li.appendChild(contentRadio);
    } else if (broadcasterPlatform == "camera") {
        let cameraUrl = broadcasterLiveUrl;
        var iframe = createIframe(cameraUrl, "video", broadcasterKey);

        openCamera(cameraUrl, broadcasterKey);

        li.appendChild(iframe);
    }

    let div = document.createElement("div");
    div.dataset.modalControls = "";
    div.classList.add("modal__controls");

    let buttonNext = createButton("Próximo >", "modal__button", "modal__controls__button--next");
    buttonNext.dataset.channelsControl = "next";
    div.appendChild(buttonNext);

    let buttonClose = createButton("Fechar", "modal__button", "modal__controls__button--close");
    buttonClose.dataset.channelsControl = "close";
    div.appendChild(buttonClose);

    let buttonReturn = createButton(
        "< Anterior",
        "modal__button",
        "modal__controls__button--return"
    );
    buttonReturn.dataset.channelsControl = "return";
    div.appendChild(buttonReturn);

    li.appendChild(div);

    li.id = broadcasterKey;

    ulIframe.appendChild(li);

    return li;
}

async function removeModal() {
    let modal = document.querySelector("[data-modal]");

    modal.remove();
}

function addEventListenerToCloseModal(modal) {
    body.addEventListener("click", (e) => {
        if (
            e.target == modal ||
            e.target == modal.querySelector('[data-channels-control="close"]')
        ) {
            removeModal();
        }
    });
}

function checkIfBroadcastIndexIsInCorrectRange(
    broadcasterToTargetIndex,
    broadcastersOnScreenLength,
    direction
) {
    if (broadcasterToTargetIndex + 1 >= broadcastersOnScreenLength) {
        return 0;
    } else if (broadcasterToTargetIndex - 1 < 0) {
        return broadcastersOnScreenLength - 1;
    } else {
        return (broadcasterToTargetIndex += direction);
    }
}

function checksIfTheButtonActionLeadsToAValidBroadcaster(buttonTypeControl, dataToChannelControls) {
    const broadcastersOnScreenLength = dataToChannelControls.onScreen.length;
    let direction = 0;

    buttonTypeControl == "next" ? (direction = +1) : (direction = -1);

    let broadcasterToTargetIndex = dataToChannelControls.onScreenIndex + direction;

    let broadcasterToTargetKey = dataToChannelControls.onScreen[broadcasterToTargetIndex];
    let broadcasterToTargetLiveUrl = dataToChannelControls.livesUrls[broadcasterToTargetKey];

    while (!checkIfBroadcasterTargetIsValid(broadcasterToTargetIndex, broadcasterToTargetLiveUrl)) {
        broadcasterToTargetIndex = checkIfBroadcastIndexIsInCorrectRange(
            broadcasterToTargetIndex,
            broadcastersOnScreenLength,
            direction
        );

        broadcasterToTargetKey = dataToChannelControls.onScreen[broadcasterToTargetIndex];
        broadcasterToTargetLiveUrl = dataToChannelControls.livesUrls[broadcasterToTargetKey];
    }
    return {
        broadcasterToTargetKey,
        broadcasterToTargetLiveUrl,
        broadcasterToTargetIndex,
    };
}

function addEventListenerOnChannelsControlsButtons(button, dataToChannelControls) {
    button.addEventListener("click", () => {
        const buttonTypeControl = button.dataset.channelsControl;

        const { broadcasterToTargetKey, broadcasterToTargetLiveUrl, broadcasterToTargetIndex } =
            checksIfTheButtonActionLeadsToAValidBroadcaster(
                buttonTypeControl,
                dataToChannelControls
            );

        const broadcasterToTargetPlatform = getBroadcasterPlatform(
            dataToChannelControls.JSONObject,
            broadcasterToTargetKey
        );

        removeModal();

        const modal = createModal(
            broadcasterToTargetKey,
            broadcasterToTargetLiveUrl,
            broadcasterToTargetPlatform
        );

        const buttonNext = modal.querySelector('[data-channels-control="next"]');
        const buttonReturn = modal.querySelector('[data-channels-control="return"]');

        addEventListenerToCloseModal(modal);

        dataToChannelControls.onScreenIndex = broadcasterToTargetIndex;
        dataToChannelControls.next = buttonNext;
        dataToChannelControls.return = buttonReturn;

        addChannelControlsToTheModal(dataToChannelControls);
    });
}

function addChannelControlsToTheModal(dataToChannelControls) {
    addEventListenerOnChannelsControlsButtons(dataToChannelControls.next, dataToChannelControls);
    addEventListenerOnChannelsControlsButtons(dataToChannelControls.return, dataToChannelControls);
}

function checkIfBroadcasterTargetIsValid(broadcasterOnScreenIndex, broadcasterLiveUrl) {
    if (
        broadcasterOnScreenIndex != -1 &&
        broadcasterLiveUrl != "error" &&
        broadcasterLiveUrl != undefined
    ) {
        return true;
    } else {
        return false;
    }
}

function addAllBroadcastersOnScreenInArray(broadcastersItens) {
    let broadcastersOnScreen = [];

    broadcastersItens.forEach((broadcaster) => {
        broadcastersOnScreen.push(broadcaster.dataset.broadcasterKey);
    });

    return broadcastersOnScreen;
}

function getAllBroadcastersOnScreen() {
    const broadcastersList = document.querySelector("[data-channels-list]");
    const broadcastersItens = broadcastersList.querySelectorAll("[data-channels-card]");

    return addAllBroadcastersOnScreenInArray(broadcastersItens);
}

function getBroadcasterPlatform(broadcastersJSONObject, broadcasterKey) {
    const broadcaster = broadcastersJSONObject[broadcasterKey];
    const broadcasterPlatform = broadcaster.broadcastPlatform;
    return broadcasterPlatform;
}

async function checksWhichChannelWasClickedToCreateTheModal(event) {
    const broadcasterLivesUrls = await getJSON(livesUrlsFilePath);

    const broadcastersJSONObject = await getOnBroadcasters("broadcasters");

    const broadcastersOnScreen = getAllBroadcastersOnScreen();

    const broadcasterKey = getBroadcasterKeyUsingEvent(event, event.target);

    const broadcasterOnScreenIndex = broadcastersOnScreen.indexOf(broadcasterKey);

    const broadcasterLiveUrl = broadcasterLivesUrls[broadcasterKey];

    const broadcasterPlatform = getBroadcasterPlatform(broadcastersJSONObject, broadcasterKey);

    if (checkIfBroadcasterTargetIsValid(broadcasterOnScreenIndex, broadcasterLiveUrl)) {
        const modal = createModal(broadcasterKey, broadcasterLiveUrl, broadcasterPlatform);

        const buttonNext = modal.querySelector('[data-channels-control="next"]');
        const buttonReturn = modal.querySelector('[data-channels-control="return"]');

        addEventListenerToCloseModal(modal);

        const dataToChannelControls = {
            next: buttonNext,
            return: buttonReturn,
            livesUrls: broadcasterLivesUrls,
            JSONObject: broadcastersJSONObject,
            onScreen: broadcastersOnScreen,
            onScreenIndex: broadcasterOnScreenIndex,
        };

        addChannelControlsToTheModal(dataToChannelControls);
    }
}

ulChannels.addEventListener("click", checksWhichChannelWasClickedToCreateTheModal);
