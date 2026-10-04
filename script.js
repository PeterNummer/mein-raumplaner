"use strict";

/* =========================================================
   MEIN RAUMPLANER
   Raum + Möbel editierbar
========================================================= */


/* =========================================================
   KONFIGURATION
========================================================= */

const STORAGE_KEY = "meinRaumplaner_github_v2";


/* =========================================================
   MÖBEL
========================================================= */

const furnitureTypes = {

    Bett: {
        width: 290,
        height: 130,
        fill: "#63788b"
    },

    Nachttisch: {
        width: 65,
        height: 65,
        fill: "#806447"
    },

    Kleiderschrank: {
        width: 160,
        height: 220,
        fill: "#536879"
    },

    Kommode: {
        width: 145,
        height: 80,
        fill: "#806447"
    },

    Sofa: {
        width: 220,
        height: 95,
        fill: "#596d7d"
    },

    Sessel: {
        width: 95,
        height: 95,
        fill: "#60798b"
    },

    Hocker: {
        width: 65,
        height: 65,
        fill: "#735b45"
    },

    Couchtisch: {
        width: 130,
        height: 75,
        fill: "#806447"
    },

    "TV-Schrank": {
        width: 190,
        height: 55,
        fill: "#4e6372"
    },

    Fernseher: {
        width: 145,
        height: 55,
        fill: "#17232e"
    },

    Schreibtisch: {
        width: 125,
        height: 205,
        fill: "#765c43"
    },

    Schreibtischstuhl: {
        width: 70,
        height: 70,
        fill: "#536a7b"
    },

    Schreibtischlampe: {
        width: 45,
        height: 45,
        fill: "#c7ad79"
    },

    Bücherregal: {
        width: 95,
        height: 180,
        fill: "#657d8e"
    },

    Esstisch: {
        width: 210,
        height: 105,
        fill: "#806447"
    },

    Tisch: {
        width: 145,
        height: 100,
        fill: "#806447"
    },

    Stuhl: {
        width: 65,
        height: 65,
        fill: "#6c5540"
    },

    Barhocker: {
        width: 55,
        height: 55,
        fill: "#76583e"
    },

    Regal: {
        width: 85,
        height: 145,
        fill: "#607889"
    },

    Wandregal: {
        width: 140,
        height: 35,
        fill: "#765c43"
    },

    Schrank: {
        width: 150,
        height: 220,
        fill: "#536879"
    },

    Sideboard: {
        width: 190,
        height: 70,
        fill: "#596d7d"
    },

    Teppich: {
        width: 320,
        height: 230,
        fill: "#927b67"
    },

    Pflanze: {
        width: 65,
        height: 65,
        fill: "#477b5d"
    },

    Stehlampe: {
        width: 55,
        height: 130,
        fill: "#c7ad79"
    },

    Mülleimer: {
        width: 45,
        height: 55,
        fill: "#56636d"
    }

};


/* =========================================================
   STANDARD-RAUM
========================================================= */

const defaultRoom = {

    width: 705,
    height: 750,

    slope: 120,

    door: {
        x: 95,
        y: 300,
        width: 130
    },

    window: {
        y: 310,
        height: 220
    }

};


/* =========================================================
   STANDARD-MÖBEL
========================================================= */

const defaultFurniture = [

    {
        id: "bed-default",
        name: "Bett",
        type: "Bett",
        x: 535,
        y: 190,
        width: 290,
        height: 130,
        rotation: 0
    },

    {
        id: "shelf-default",
        name: "Regal",
        type: "Regal",
        x: 187,
        y: 317,
        width: 85,
        height: 145,
        rotation: 0
    },

    {
        id: "carpet-default",
        name: "Teppich",
        type: "Teppich",
        x: 460,
        y: 465,
        width: 320,
        height: 230,
        rotation: 0
    },

    {
        id: "tv-default",
        name: "TV-Schrank",
        type: "TV-Schrank",
        x: 212,
        y: 582,
        width: 155,
        height: 55,
        rotation: 0
    },

    {
        id: "desk-default",
        name: "Schreibtisch",
        type: "Schreibtisch",
        x: 690,
        y: 492,
        width: 125,
        height: 205,
        rotation: 0
    }

];


/* =========================================================
   STATE
========================================================= */

let room = clone(defaultRoom);

let furniture = clone(defaultFurniture);

let selectedId = null;

let selectedRoomObject = null;

let dragState = null;


/* =========================================================
   DOM
========================================================= */

const svg = document.getElementById("roomSvg");

const furnitureLayer =
    document.getElementById("furnitureLayer");

const selectionLayer =
    document.getElementById("selectionLayer");

const roomEditLayer =
    document.getElementById("roomEditLayer");

const selectionInfo =
    document.getElementById("selectionInfo");

const noSelection =
    document.getElementById("noSelection");

const furnitureProperties =
    document.getElementById("furnitureProperties");


/* =========================================================
   HILFSFUNKTIONEN
========================================================= */

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}


function makeId(prefix = "item") {
    return (
        prefix +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 7)
    );
}


function clamp(value, min, max) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return min;
    }

    return Math.max(min, Math.min(max, number));
}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   SVG HILFSFUNKTION
========================================================= */

function svgPoint(event) {

    const point =
        svg.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    return point.matrixTransform(
        svg.getScreenCTM().inverse()
    );
}


/* =========================================================
   RAUM RENDERN
========================================================= */

function renderRoom() {

    const floor = document.getElementById("floor");

    const wallBottom =
        document.getElementById("wallBottom");

    const wallRight =
        document.getElementById("wallRight");

    const roomWidth =
        room.width;

    const roomHeight =
        room.height;

    const bottomY =
        105 + roomHeight;

    const leftBottomY =
        bottomY - room.slope;

    const rightX =
        120 + roomWidth;

    /*
       Boden
    */

    floor.setAttribute(
        "points",
        [
            `120,105`,
            `${rightX},105`,
            `${rightX},${bottomY}`,
            `120,${leftBottomY}`
        ].join(" ")
    );


    /*
       rechte Wand
    */

    wallRight.setAttribute(
        "points",
        [
            `${rightX + 25},80`,
            `${rightX + 50},105`,
            `${rightX + 50},${bottomY + 25}`,
            `${rightX + 25},${bottomY}`
        ].join(" ")
    );


    /*
       untere schräge Wand
    */

    wallBottom.setAttribute(
        "points",
        [
            `95,${leftBottomY - 25}`,
            `120,${leftBottomY}`,
            `${rightX},${bottomY}`,
            `${rightX + 25},${bottomY + 25}`,
            `${rightX + 25},${bottomY}`,
            `125,${leftBottomY}`
        ].join(" ")
    );


    renderDoor();

    renderWindow();

    renderBuiltInWardrobe();

    renderRoomSelection();

}


/* =========================================================
   TÜR RENDERN
========================================================= */

function renderDoor() {

    const frame =
        document.getElementById("doorFrame");

    const panel =
        document.getElementById("doorPanel");

    const swing =
        document.getElementById("doorSwing");

    const handle =
        document.querySelector(".door-handle");

    const x = room.door.x;

    const y = room.door.y;

    const width = room.door.width;

    frame.setAttribute("x", x);
    frame.setAttribute("y", y);

    panel.setAttribute("x", x + 7);
    panel.setAttribute("y", y + 7);

    /*
       Die Tür wird als vertikale Tür dargestellt.
       width bestimmt die Öffnungslänge.
    */

    frame.setAttribute(
        "height",
        width
    );

    panel.setAttribute(
        "height",
        width - 14
    );

    swing.setAttribute(
        "d",
        `M${x + 25} ${y + 7}
         A${width - 14} ${width - 14}
         0 0 1
         ${x + 25 + width - 14} ${y + width - 7}`
    );

    handle.setAttribute(
        "cx",
        x + 16
    );

    handle.setAttribute(
        "cy",
        y + width / 2
    );

}


/* =========================================================
   FENSTER RENDERN
========================================================= */

function renderWindow() {

    const frame =
        document.getElementById("windowFrame");

    const glass =
        document.getElementById("windowGlass");

    const cross =
        document.querySelector(".window-cross");

    const rightX =
        120 + room.width;

    const y =
        room.window.y;

    const height =
        room.window.height;

    frame.setAttribute(
        "x",
        rightX
    );

    frame.setAttribute(
        "y",
        y
    );

    frame.setAttribute(
        "height",
        height
    );

    glass.setAttribute(
        "x",
        rightX + 5
    );

    glass.setAttribute(
        "y",
        y + 10
    );

    glass.setAttribute(
        "height",
        height - 20
    );

    cross.setAttribute(
        "x1",
        rightX + 5
    );

    cross.setAttribute(
        "x2",
        rightX + 20
    );

    cross.setAttribute(
        "y1",
        y + height / 2
    );

    cross.setAttribute(
        "y2",
        y + height / 2
    );

}


/* =========================================================
   EINBAUSCHRANK
========================================================= */

function renderBuiltInWardrobe() {

    const g =
        document.getElementById("builtInWardrobe");

    const startX = 232;

    const endX =
        120 + room.width - 33;

    const leftY =
        105 + room.height - room.slope - 53;

    const rightY =
        105 + room.height - 53;

    const width =
        endX - startX;

    /*
       Einbauschrank folgt weiterhin
       automatisch der Schräge.
    */

    const body =
        g.querySelector(".built-in-body");

    const shadow =
        g.querySelector(".built-in-shadow");

    const top =
        g.querySelector(".built-in-top");

    body.setAttribute(
        "points",
        [
            `${startX},${leftY}`,
            `${endX},${rightY}`,
            `${endX},${rightY + 73}`,
            `${startX},${leftY + 73}`
        ].join(" ")
    );

    shadow.setAttribute(
        "points",
        [
            `${startX - 3},${leftY + 7}`,
            `${endX + 2},${rightY + 7}`,
            `${endX + 2},${rightY + 80}`,
            `${startX - 3},${leftY + 80}`
        ].join(" ")
    );

    top.setAttribute(
        "points",
        [
            `${startX},${leftY}`,
            `${endX},${rightY}`,
            `${endX},${rightY + 13}`,
            `${startX},${leftY + 13}`
        ].join(" ")
    );

    /*
       Türen
    */

    const doorGroups =
        g.querySelectorAll(".built-in-door");

    const doorWidth =
        width / 4;

    doorGroups.forEach(
        (door, index) => {

            const x1 =
                startX +
                index * doorWidth +
                6;

            const x2 =
                startX +
                (index + 1) * doorWidth -
                6;

            const y1 =
                leftY +
                ((x1 - startX) / width) *
                (rightY - leftY) +
                18;

            const y2 =
                leftY +
                ((x2 - startX) / width) *
                (rightY - leftY) +
                18;

            door.setAttribute(
                "points",
                [
                    `${x1},${y1}`,
                    `${x2},${y2}`,
                    `${x2},${y2 + 57}`,
                    `${x1},${y1 + 57}`
                ].join(" ")
            );
        }
    );

}


/* =========================================================
   RAUM AUSWÄHLUNG
========================================================= */

function renderRoomSelection() {

    roomEditLayer.innerHTML = "";

    if (!selectedRoomObject) {
        return;
    }

    if (selectedRoomObject === "bottomWall") {

        const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );

        line.setAttribute(
            "x1",
            "120"
        );

        line.setAttribute(
            "y1",
            105 + room.height - room.slope
        );

        line.setAttribute(
            "x2",
            120 + room.width
        );

        line.setAttribute(
            "y2",
            105 + room.height
        );

        line.setAttribute(
            "class",
            "room-selection"
        );

        roomEditLayer.appendChild(line);


        /*
           Griff für Schräge
        */

        const handle =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        handle.setAttribute(
            "cx",
            120 + room.width
        );

        handle.setAttribute(
            "cy",
            105 + room.height
        );

        handle.setAttribute(
            "r",
            "9"
        );

        handle.setAttribute(
            "class",
            "room-handle"
        );

        handle.dataset.roomHandle =
            "bottomRight";

        roomEditLayer.appendChild(handle);

    }


    if (selectedRoomObject === "leftWall") {

        const handle =
            createRoomHandle(
                120,
                105 + room.height - room.slope,
                "leftBottom"
            );

        roomEditLayer.appendChild(handle);

    }


    if (selectedRoomObject === "rightWall") {

        const handle =
            createRoomHandle(
                120 + room.width,
                105 + room.height,
                "rightBottom"
            );

        roomEditLayer.appendChild(handle);

    }

}


function createRoomHandle(x, y, type) {

    const handle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

    handle.setAttribute(
        "cx",
        x
    );

    handle.setAttribute(
        "cy",
        y
    );

    handle.setAttribute(
        "r",
        "9"
    );

    handle.setAttribute(
        "class",
        "room-handle"
    );

    handle.dataset.roomHandle =
        type;

    return handle;
}


/* =========================================================
   MÖBEL RENDERN
========================================================= */

function renderFurniture() {

    furnitureLayer.innerHTML = "";

    furniture.forEach(item => {

        const group =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );

        group.classList.add("furniture");

        group.dataset.id =
            item.id;

        group.setAttribute(
            "transform",
            getFurnitureTransform(item)
        );


        /*
           Grundkörper
        */

        const rect =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
            );

        rect.setAttribute(
            "x",
            0
        );

        rect.setAttribute(
            "y",
            0
        );

        rect.setAttribute(
            "width",
            item.width
        );

        rect.setAttribute(
            "height",
            item.height
        );

        rect.setAttribute(
            "rx",
            getRadius(item.type)
        );

        rect.setAttribute(
            "fill",
            furnitureTypes[item.type]?.fill ||
            "#607889"
        );

        rect.setAttribute(
            "class",
            "furniture-body"
        );

        group.appendChild(rect);


        /*
           Möbel-Details
        */

        addFurnitureDetails(
            group,
            item
        );


        /*
           Beschriftung
        */

        if (
            item.width > 65 &&
            item.height > 45
        ) {

            const text =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );

            text.setAttribute(
                "x",
                item.width / 2
            );

            text.setAttribute(
                "y",
                item.height / 2
            );

            text.setAttribute(
                "class",
                "furniture-label"
            );

            text.textContent =
                item.name;

            group.appendChild(text);

        }


        furnitureLayer.appendChild(group);

    });

}


/* =========================================================
   MÖBEL DETAILS
========================================================= */

function addFurnitureDetails(group, item) {

    const type =
        item.type;


    if (
        type === "Bett"
    ) {

        const pillow =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
            );

        pillow.setAttribute(
            "x",
            15
        );

        pillow.setAttribute(
            "y",
            12
        );

        pillow.setAttribute(
            "width",
            item.width - 30
        );

        pillow.setAttribute(
            "height",
            38
        );

        pillow.setAttribute(
            "rx",
            8
        );

        pillow.setAttribute(
            "fill",
            "#8fa5b5"
        );

        pillow.setAttribute(
            "opacity",
            ".8"
        );

        group.appendChild(pillow);

    }


    if (
        type === "Fernseher"
    ) {

        const screen =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
            );

        screen.setAttribute(
            "x",
            8
        );

        screen.setAttribute(
            "y",
            7
        );

        screen.setAttribute(
            "width",
            Math.max(10, item.width - 16)
        );

        screen.setAttribute(
            "height",
            Math.max(10, item.height - 14)
        );

        screen.setAttribute(
            "rx",
            3
        );

        screen.setAttribute(
            "fill",
            "#07111a"
        );

        screen.setAttribute(
            "stroke",
            "#7290a2"
        );

        group.appendChild(screen);

    }


    if (
        type === "Teppich"
    ) {

        const inner =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
            );

        inner.setAttribute(
            "x",
            10
        );

        inner.setAttribute(
            "y",
            10
        );

        inner.setAttribute(
            "width",
            item.width - 20
        );

        inner.setAttribute(
            "height",
            item.height - 20
        );

        inner.setAttribute(
            "rx",
            8
        );

        inner.setAttribute(
            "fill",
            "none"
        );

        inner.setAttribute(
            "stroke",
            "rgba(255,255,255,.25)"
        );

        inner.setAttribute(
            "stroke-width",
            2
        );

        group.appendChild(inner);

    }


    if (
        type === "Pflanze"
    ) {

        const pot =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
            );

        pot.setAttribute(
            "x",
            item.width / 2 - 14
        );

        pot.setAttribute(
            "y",
            item.height - 25
        );

        pot.setAttribute(
            "width",
            28
        );

        pot.setAttribute(
            "height",
            18
        );

        pot.setAttribute(
            "rx",
            3
        );

        pot.setAttribute(
            "class",
            "plant-pot"
        );

        group.appendChild(pot);


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const leaf =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "ellipse"
                );

            leaf.setAttribute(
                "cx",
                item.width / 2 +
                Math.cos(i * 1.3) * 14
            );

            leaf.setAttribute(
                "cy",
                item.height - 32 -
                Math.sin(i * 1.3) * 13
            );

            leaf.setAttribute(
                "rx",
                9
            );

            leaf.setAttribute(
                "ry",
                17
            );

            leaf.setAttribute(
                "class",
                "plant-leaf"
            );

            group.appendChild(leaf);

        }

    }


    if (
        type === "Stuhl" ||
        type === "Schreibtischstuhl" ||
        type === "Barhocker"
    ) {

        const seat =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );

        seat.setAttribute(
            "cx",
            item.width / 2
        );

        seat.setAttribute(
            "cy",
            item.height / 2
        );

        seat.setAttribute(
            "r",
            Math.min(
                item.width,
                item.height
            ) * .32
        );

        seat.setAttribute(
            "class",
            "chair-seat"
        );

        group.appendChild(seat);

    }

}


function getRadius(type) {

    if (
        type === "Teppich"
    ) {
        return 12;
    }

    if (
        type === "Pflanze"
    ) {
        return 20;
    }

    return 5;
}


/* =========================================================
   TRANSFORM
========================================================= */

function getFurnitureTransform(item) {

    const centerX =
        item.width / 2;

    const centerY =
        item.height / 2;

    return `
        translate(${item.x} ${item.y})
        rotate(${item.rotation}
        ${centerX}
        ${centerY})
    `;
}


/* =========================================================
   AUSWAHL RENDERN
========================================================= */

function renderSelection() {

    selectionLayer.innerHTML = "";

    if (!selectedId) {
        return;
    }

    const item =
        furniture.find(
            furnitureItem =>
                furnitureItem.id === selectedId
        );

    if (!item) {
        return;
    }

    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );

    group.setAttribute(
        "transform",
        getFurnitureTransform(item)
    );


    const box =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );

    box.setAttribute(
        "x",
        -5
    );

    box.setAttribute(
        "y",
        -5
    );

    box.setAttribute(
        "width",
        item.width + 10
    );

    box.setAttribute(
        "height",
        item.height + 10
    );

    box.setAttribute(
        "class",
        "selection-box"
    );

    group.appendChild(box);


    const handle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

    handle.setAttribute(
        "cx",
        item.width + 5
    );

    handle.setAttribute(
        "cy",
        item.height + 5
    );

    handle.setAttribute(
        "r",
        7
    );

    handle.setAttribute(
        "class",
        "selection-handle"
    );

    group.appendChild(handle);

    selectionLayer.appendChild(group);

}


/* =========================================================
   GESAMT RENDERN
========================================================= */

function render() {

    renderRoom();

    renderFurniture();

    renderSelection();

    updateProperties();

    updateSelectionInfo();

}


/* =========================================================
   AUSWAHL-INFO
========================================================= */

function updateSelectionInfo() {

    if (selectedId) {

        const item =
            furniture.find(
                item =>
                    item.id === selectedId
            );

        if (item) {

            selectionInfo.textContent =
                item.name;

            return;

        }

    }

    if (selectedRoomObject) {

        const names = {

            bottomWall:
                "Schräge / untere Wand",

            leftWall:
                "Linke Wand",

            rightWall:
                "Rechte Wand",

            door:
                "Tür",

            window:
                "Fenster",

            wardrobe:
                "Einbauschrank"

        };

        selectionInfo.textContent =
            names[selectedRoomObject] ||
            "Raumobjekt";

        return;
    }

    selectionInfo.textContent =
        "Nichts ausgewählt";

}


/* =========================================================
   PROPERTIES AKTUALISIEREN
========================================================= */

function updateProperties() {

    updateRoomProperties();

    if (!selectedId) {

        noSelection.classList.remove(
            "hidden"
        );

        furnitureProperties.classList.add(
            "hidden"
        );

        return;

    }


    const item =
        furniture.find(
            item =>
                item.id === selectedId
        );

    if (!item) {
        return;
    }

    noSelection.classList.add(
        "hidden"
    );

    furnitureProperties.classList.remove(
        "hidden"
    );


    document.getElementById(
        "selectedType"
    ).textContent =
        item.type;

    document.getElementById(
        "objectName"
    ).value =
        item.name;

    document.getElementById(
        "objectX"
    ).value =
        Math.round(item.x);

    document.getElementById(
        "objectY"
    ).value =
        Math.round(item.y);

    document.getElementById(
        "objectWidth"
    ).value =
        Math.round(item.width);

    document.getElementById(
        "objectHeight"
    ).value =
        Math.round(item.height);

    document.getElementById(
        "objectRotation"
    ).value =
        String(item.rotation);

}


function updateRoomProperties() {

    document.getElementById(
        "roomWidth"
    ).value =
        Math.round(room.width);

    document.getElementById(
        "roomHeight"
    ).value =
        Math.round(room.height);

    document.getElementById(
        "slopeHeight"
    ).value =
        Math.round(room.slope);

    document.getElementById(
        "doorX"
    ).value =
        Math.round(room.door.x);

    document.getElementById(
        "doorY"
    ).value =
        Math.round(room.door.y);

    document.getElementById(
        "doorWidth"
    ).value =
        Math.round(room.door.width);

    document.getElementById(
        "windowY"
    ).value =
        Math.round(room.window.y);

    document.getElementById(
        "windowHeight"
    ).value =
        Math.round(room.window.height);

}


/* =========================================================
   MÖBEL AUSWÄHLEN
========================================================= */

function selectFurniture(id) {

    selectedId = id;

    selectedRoomObject = null;

    render();

}


/* =========================================================
   RAUMOBJEKT AUSWÄHLEN
========================================================= */

function selectRoomObject(type) {

    selectedId = null;

    selectedRoomObject = type;

    render();

}


/* =========================================================
   DRAG START
========================================================= */

function startDrag(event) {

    const furnitureElement =
        event.target.closest(".furniture");

    const roomObject =
        event.target.closest(
            "[data-room-object]"
        );

    const roomHandle =
        event.target.closest(
            "[data-room-handle]"
        );

    if (roomHandle) {

        startRoomHandleDrag(
            event,
            roomHandle.dataset.roomHandle
        );

        return;
    }


    if (furnitureElement) {

        const id =
            furnitureElement.dataset.id;

        const item =
            furniture.find(
                item =>
                    item.id === id
            );

        if (!item) {
            return;
        }

        selectFurniture(id);

        const point =
            svgPoint(event);

        dragState = {

            type: "furniture",

            id,

            offsetX:
                point.x - item.x,

            offsetY:
                point.y - item.y

        };

        document.addEventListener(
            "pointermove",
            dragMove
        );

        document.addEventListener(
            "pointerup",
            endDrag,
            { once: true }
        );

        event.preventDefault();

        return;
    }


    if (roomObject) {

        const type =
            roomObject.dataset.roomObject;

        selectRoomObject(type);

        /*
           Tür und Fenster können direkt
           gezogen werden.
        */

        if (
            type === "door" ||
            type === "window"
        ) {

            const point =
                svgPoint(event);

            dragState = {

                type,

                offsetX:
                    point.x -
                    (
                        type === "door"
                            ? room.door.x
                            : 120 + room.width
                    ),

                offsetY:
                    point.y -
                    (
                        type === "door"
                            ? room.door.y
                            : room.window.y
                    )

            };

            document.addEventListener(
                "pointermove",
                dragMove
            );

            document.addEventListener(
                "pointerup",
                endDrag,
                { once: true }
            );

        }

        return;
    }


    /*
       Klick auf Raumfläche
       hebt Auswahl auf.
    */

    if (
        event.target.closest("#room")
    ) {

        selectedId = null;

        selectedRoomObject = null;

        render();

    }

}


/* =========================================================
   DRAG MOVE
========================================================= */

function dragMove(event) {

    if (!dragState) {
        return;
    }

    const point =
        svgPoint(event);


    /* Möbel */

    if (
        dragState.type === "furniture"
    ) {

        const item =
            furniture.find(
                item =>
                    item.id ===
                    dragState.id
            );

        if (!item) {
            return;
        }

        item.x =
            point.x -
            dragState.offsetX;

        item.y =
            point.y -
            dragState.offsetY;

        setFurnitureTransform(item);

        updateProperties();

        return;
    }


    /* Tür */

    if (
        dragState.type === "door"
    ) {

        room.door.x =
            clamp(
                point.x -
                dragState.offsetX,
                96,
                130
            );

        room.door.y =
            clamp(
                point.y -
                dragState.offsetY,
                110,
                750
            );

        renderRoom();

        updateRoomProperties();

        return;
    }


    /* Fenster */

    if (
        dragState.type === "window"
    ) {

        room.window.y =
            clamp(
                point.y -
                dragState.offsetY,
                110,
                room.height - room.window.height
            );

        renderRoom();

        updateRoomProperties();

        return;
    }


    /* Raumgriff */

    if (
        dragState.type === "roomHandle"
    ) {

        handleRoomResize(
            point,
            dragState.handle
        );

    }

}


/* =========================================================
   DIREKTE MÖBEL-TRANSFORM
========================================================= */

function setFurnitureTransform(item) {

    const element =
        furnitureLayer.querySelector(
            `[data-id="${item.id}"]`
        );

    if (!element) {
        return;
    }

    element.setAttribute(
        "transform",
        getFurnitureTransform(item)
    );


    /*
       Auswahl ebenfalls aktualisieren
    */

    if (
        selectedId === item.id
    ) {

        const selection =
            selectionLayer.querySelector(
                "g"
            );

        if (selection) {

            selection.setAttribute(
                "transform",
                getFurnitureTransform(item)
            );

        }

    }

}


/* =========================================================
   ROOM HANDLE DRAG
========================================================= */

function startRoomHandleDrag(
    event,
    handle
) {

    selectedId = null;

    selectedRoomObject =
        "bottomWall";

    dragState = {

        type: "roomHandle",

        handle

    };

    document.addEventListener(
        "pointermove",
        dragMove
    );

    document.addEventListener(
        "pointerup",
        endDrag,
        { once: true }
    );

    event.preventDefault();

}


function handleRoomResize(
    point,
    handle
) {

    if (
        handle === "bottomRight"
    ) {

        room.width =
            clamp(
                point.x - 120,
                400,
                850
            );

        room.height =
            clamp(
                point.y - 105,
                400,
                900
            );

        /*
           Schräge proportional behalten
        */

        room.slope =
            clamp(
                room.slope,
                0,
                room.height - 50
            );

    }


    if (
        handle === "leftBottom"
    ) {

        const target =
            point.y - 105;

        room.slope =
            clamp(
                room.height - target,
                0,
                room.height - 50
            );

    }


    renderRoom();

    updateRoomProperties();

}


/* =========================================================
   DRAG ENDE
========================================================= */

function endDrag() {

    dragState = null;

    document.removeEventListener(
        "pointermove",
        dragMove
    );

    saveTemporaryState();

    renderSelection();

}


/* =========================================================
   MÖBEL HINZUFÜGEN
========================================================= */

function addFurniture(type) {

    const definition =
        furnitureTypes[type];

    if (!definition) {
        return;
    }

    const item = {

        id: makeId("furniture"),

        name: type,

        type,

        x: 300,

        y: 300,

        width:
            definition.width,

        height:
            definition.height,

        rotation: 0

    };

    furniture.push(item);

    selectedId =
        item.id;

    selectedRoomObject = null;

    render();

}


/* =========================================================
   MÖBEL LÖSCHEN
========================================================= */

function deleteSelected() {

    if (!selectedId) {
        return;
    }

    furniture =
        furniture.filter(
            item =>
                item.id !== selectedId
        );

    selectedId = null;

    render();

}


/* =========================================================
   DREHEN
========================================================= */

function rotateSelected() {

    if (!selectedId) {
        return;
    }

    const item =
        furniture.find(
            item =>
                item.id === selectedId
        );

    if (!item) {
        return;
    }

    item.rotation =
        (item.rotation + 90) % 360;

    render();

}


/* =========================================================
   DUPLIZIEREN
========================================================= */

function duplicateSelected() {

    if (!selectedId) {
        return;
    }

    const original =
        furniture.find(
            item =>
                item.id === selectedId
        );

    if (!original) {
        return;
    }

    const copy =
        clone(original);

    copy.id =
        makeId("copy");

    copy.name =
        original.name +
        " Kopie";

    copy.x += 35;

    copy.y += 35;

    furniture.push(copy);

    selectedId =
        copy.id;

    render();

}


/* =========================================================
   MÖBEL PROPERTIES ÜBERNEHMEN
========================================================= */

function applyObjectChanges() {

    if (!selectedId) {
        return;
    }

    const item =
        furniture.find(
            item =>
                item.id === selectedId
        );

    if (!item) {
        return;
    }

    item.name =
        document.getElementById(
            "objectName"
        ).value.trim() ||
        item.type;

    item.x =
        Number(
            document.getElementById(
                "objectX"
            ).value
        );

    item.y =
        Number(
            document.getElementById(
                "objectY"
            ).value
        );

    item.width =
        clamp(
            Number(
                document.getElementById(
                    "objectWidth"
                ).value
            ),
            10,
            900
        );

    item.height =
        clamp(
            Number(
                document.getElementById(
                    "objectHeight"
                ).value
            ),
            10,
            900
        );

    item.rotation =
        Number(
            document.getElementById(
                "objectRotation"
            ).value
        ) || 0;

    render();

}


/* =========================================================
   RAUM PROPERTIES ÜBERNEHMEN
========================================================= */

function applyRoomChanges() {

    room.width =
        clamp(
            Number(
                document.getElementById(
                    "roomWidth"
                ).value
            ),
            400,
            850
        );

    room.height =
        clamp(
            Number(
                document.getElementById(
                    "roomHeight"
                ).value
            ),
            400,
            900
        );

    room.slope =
        clamp(
            Number(
                document.getElementById(
                    "slopeHeight"
                ).value
            ),
            0,
            room.height - 50
        );

    room.door.x =
        clamp(
            Number(
                document.getElementById(
                    "doorX"
                ).value
            ),
            96,
            130
        );

    room.door.y =
        clamp(
            Number(
                document.getElementById(
                    "doorY"
                ).value
            ),
            110,
            room.height - room.door.width
        );

    room.door.width =
        clamp(
            Number(
                document.getElementById(
                    "doorWidth"
                ).value
            ),
            50,
            250
        );

    room.window.y =
        clamp(
            Number(
                document.getElementById(
                    "windowY"
                ).value
            ),
            110,
            room.height -
            room.window.height
        );

    room.window.height =
        clamp(
            Number(
                document.getElementById(
                    "windowHeight"
                ).value
            ),
            60,
            Math.max(
                60,
                room.height - 100
            )
        );

    render();

}


/* =========================================================
   SPEICHERN
========================================================= */

function saveState() {

    const state = {

        version: 2,

        room:
            clone(room),

        furniture:
            clone(furniture)

    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

    showMessage(
        "Raumplanung gespeichert"
    );

}


/*
   Automatisch während des Verschiebens
   speichern, aber ohne Meldung.
*/

function saveTemporaryState() {

    const state = {

        version: 2,

        room:
            clone(room),

        furniture:
            clone(furniture)

    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

}


/* =========================================================
   LADEN
========================================================= */

function loadState(showMessageAfter = true) {

    const raw =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!raw) {

        if (showMessageAfter) {

            showMessage(
                "Keine gespeicherte Planung gefunden"
            );

        }

        return;

    }

    try {

        const state =
            JSON.parse(raw);

        if (
            state.room
        ) {

            room =
                normalizeRoom(
                    state.room
                );

        }

        if (
            Array.isArray(
                state.furniture
            )
        ) {

            furniture =
                normalizeFurniture(
                    state.furniture
                );

        }

        selectedId = null;

        selectedRoomObject = null;

        render();

        if (showMessageAfter) {

            showMessage(
                "Raumplanung geladen"
            );

        }

    } catch (error) {

        console.error(error);

        showMessage(
            "Die gespeicherte Planung konnte nicht geladen werden"
        );

    }

}


/* =========================================================
   NORMALISIEREN
========================================================= */

function normalizeRoom(value) {

    return {

        width:
            clamp(
                value.width ??
                defaultRoom.width,
                400,
                850
            ),

        height:
            clamp(
                value.height ??
                defaultRoom.height,
                400,
                900
            ),

        slope:
            clamp(
                value.slope ??
                defaultRoom.slope,
                0,
                800
            ),

        door: {

            x:
                Number(
                    value.door?.x ??
                    defaultRoom.door.x
                ),

            y:
                Number(
                    value.door?.y ??
                    defaultRoom.door.y
                ),

            width:
                Number(
                    value.door?.width ??
                    defaultRoom.door.width
                )

        },

        window: {

            y:
                Number(
                    value.window?.y ??
                    defaultRoom.window.y
                ),

            height:
                Number(
                    value.window?.height ??
                    defaultRoom.window.height
                )

        }

    };

}


function normalizeFurniture(list) {

    return list
        .filter(
            item =>
                item &&
                furnitureTypes[item.type]
        )
        .map(
            item => {

                const definition =
                    furnitureTypes[item.type];

                return {

                    id:
                        item.id ||
                        makeId("furniture"),

                    name:
                        item.name ||
                        item.type,

                    type:
                        item.type,

                    x:
                        Number(
                            item.x
                        ) || 0,

                    y:
                        Number(
                            item.y
                        ) || 0,

                    width:
                        Number(
                            item.width
                        ) ||
                        definition.width,

                    height:
                        Number(
                            item.height
                        ) ||
                        definition.height,

                    rotation:
                        Number(
                            item.rotation
                        ) || 0

                };

            }
        );

}


/* =========================================================
   RESET
========================================================= */

function resetAll() {

    const confirmed =
        window.confirm(
            "Möchtest du Raum und Möbel wirklich zurücksetzen?"
        );

    if (!confirmed) {
        return;
    }

    room =
        clone(defaultRoom);

    furniture =
        clone(defaultFurniture);

    selectedId = null;

    selectedRoomObject = null;

    localStorage.removeItem(
        STORAGE_KEY
    );

    render();

    showMessage(
        "Raum wurde zurückgesetzt"
    );

}


/* =========================================================
   NACHRICHT
========================================================= */

let messageTimer = null;

function showMessage(message) {

    clearTimeout(
        messageTimer
    );

    let element =
        document.getElementById(
            "appMessage"
        );

    if (!element) {

        element =
            document.createElement(
                "div"
            );

        element.id =
            "appMessage";

        Object.assign(
            element.style,
            {

                position: "fixed",

                bottom: "22px",

                left: "50%",

                transform:
                    "translateX(-50%)",

                background:
                    "#12283a",

                border:
                    "1px solid #28617f",

                color:
                    "#eaf8ff",

                padding:
                    "11px 18px",

                borderRadius:
                    "10px",

                fontSize:
                    "13px",

                zIndex:
                    "9999",

                boxShadow:
                    "0 8px 30px rgba(0,0,0,.4)"

            }
        );

        document.body.appendChild(
            element
        );

    }

    element.textContent =
        message;

    element.style.opacity =
        "1";

    messageTimer =
        setTimeout(
            () => {

                element.style.opacity =
                    "0";

            },
            2200
        );

}


/* =========================================================
   ROOM CLICK
========================================================= */

function handleRoomPointerDown(event) {

    const target =
        event.target;

    /*
       Schräge Wand
    */

    if (
        target.id === "wallBottom"
    ) {

        selectRoomObject(
            "bottomWall"
        );

        return;

    }


    /*
       Linke Wand
    */

    if (
        target.id === "wallLeft"
    ) {

        selectRoomObject(
            "leftWall"
        );

        return;

    }


    /*
       Rechte Wand
    */

    if (
        target.id === "wallRight"
    ) {

        selectRoomObject(
            "rightWall"
        );

        return;

    }

}


/* =========================================================
   ROOM HANDLE CLICK / DRAG
========================================================= */

roomEditLayer.addEventListener(
    "pointerdown",
    event => {

        const handle =
            event.target.closest(
                "[data-room-handle]"
            );

        if (!handle) {
            return;
        }

        startRoomHandleDrag(
            event,
            handle.dataset.roomHandle
        );

    }
);


/* =========================================================
   EVENTS
========================================================= */

svg.addEventListener(
    "pointerdown",
    event => {

        handleRoomPointerDown(
            event
        );

        startDrag(
            event
        );

    }
);


/*
   Möbel hinzufügen
*/

document
    .querySelectorAll(
        "[data-add]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    addFurniture(
                        button.dataset.add
                    );

                }
            );

        }
    );


/*
   Buttons
*/

document
    .getElementById("saveBtn")
    .addEventListener(
        "click",
        saveState
    );


document
    .getElementById("loadBtn")
    .addEventListener(
        "click",
        () => loadState(true)
    );


document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        resetAll
    );


document
    .getElementById("applyObjectBtn")
    .addEventListener(
        "click",
        applyObjectChanges
    );


document
    .getElementById("applyRoomBtn")
    .addEventListener(
        "click",
        applyRoomChanges
    );


document
    .getElementById("deleteBtn")
    .addEventListener(
        "click",
        deleteSelected
    );


document
    .getElementById("rotateBtn")
    .addEventListener(
        "click",
        rotateSelected
    );


document
    .getElementById("duplicateBtn")
    .addEventListener(
        "click",
        duplicateSelected
    );


/* =========================================================
   TASTATUR
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const tag =
            document.activeElement?.tagName;

        /*
           Keine Tastaturbefehle,
           wenn gerade ein Eingabefeld benutzt wird.
        */

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
        ) {

            return;

        }


        if (
            event.key.toLowerCase() === "r"
        ) {

            rotateSelected();

        }


        if (
            event.key === "Delete"
        ) {

            deleteSelected();

        }


        if (
            event.key === "Escape"
        ) {

            selectedId = null;

            selectedRoomObject = null;

            render();

        }

    }
);


/* =========================================================
   INIT
========================================================= */

function init() {

    /*
       Gespeicherte Daten laden,
       falls vorhanden.
    */

    const raw =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (raw) {

        loadState(false);

    } else {

        render();

    }

}


/* =========================================================
   START
========================================================= */

init();
