"use strict";


/* =========================================================
   KONSTANTEN
========================================================= */

const STORAGE_KEY = "meinRaumplaner_github_v4";

const ROOM_OFFSET = 100;

const MIN_ROOM_WIDTH = 300;
const MAX_ROOM_WIDTH = 2400;

const MIN_ROOM_HEIGHT = 300;
const MAX_ROOM_HEIGHT = 2400;


/* =========================================================
   MÖBELTYPEN
========================================================= */

const furnitureTypes = {

    Bett: {
        width: 290,
        height: 130,
        fill: "#63788b"
    },

    Einbauschrank: {
        width: 560,
        height: 75,
        fill: "#536879"
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
        id: "bed-1",
        type: "Bett",
        name: "Bett",
        x: 535,
        y: 190,
        width: 290,
        height: 130,
        rotation: 0
    },

    {
        id: "built-in-wardrobe-1",
        type: "Einbauschrank",
        name: "Einbauschrank",
        x: 235,
        y: 682,
        width: 560,
        height: 75,
        rotation: 10
    },

    {
        id: "shelf-1",
        type: "Regal",
        name: "Regal",
        x: 187,
        y: 317,
        width: 85,
        height: 145,
        rotation: 0
    },

    {
        id: "rug-1",
        type: "Teppich",
        name: "Teppich",
        x: 460,
        y: 465,
        width: 320,
        height: 230,
        rotation: 0
    },

    {
        id: "tv-1",
        type: "TV-Schrank",
        name: "TV-Schrank",
        x: 212,
        y: 582,
        width: 155,
        height: 55,
        rotation: 0
    },

    {
        id: "desk-1",
        type: "Schreibtisch",
        name: "Schreibtisch",
        x: 690,
        y: 492,
        width: 125,
        height: 205,
        rotation: 0
    }
];


/* =========================================================
   STATUS
========================================================= */

let room = clone(defaultRoom);

let furniture = clone(defaultFurniture);

let selectedId = null;

let selectedRoomObject = null;

let dragState = null;


/* =========================================================
   HILFSFUNKTIONEN
========================================================= */

function clone(value) {

    return JSON.parse(
        JSON.stringify(value)
    );
}


function makeId(prefix = "object") {

    return (
        prefix +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 7)
    );
}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


/* =========================================================
   SVG
========================================================= */

const svg = document.getElementById("roomSvg");

const roomCanvas =
    document.getElementById("roomCanvas");

const roomViewport =
    document.getElementById("roomViewport");

const floor =
    document.getElementById("floor");

const wallTop =
    document.getElementById("wallTop");

const wallLeft =
    document.getElementById("wallLeft");

const wallRight =
    document.getElementById("wallRight");

const wallBottom =
    document.getElementById("wallBottom");

const doorObject =
    document.getElementById("doorObject");

const windowObject =
    document.getElementById("windowObject");

const furnitureLayer =
    document.getElementById("furnitureLayer");

const selectionLayer =
    document.getElementById("selectionLayer");

const roomEditLayer =
    document.getElementById("roomEditLayer");


/* =========================================================
   KOORDINATEN
========================================================= */

function getRoomGeometry() {

    const left =
        ROOM_OFFSET;

    const top =
        ROOM_OFFSET;

    const right =
        ROOM_OFFSET +
        room.width;

    const bottomLeft =
        ROOM_OFFSET +
        room.height -
        room.slope;

    const bottomRight =
        ROOM_OFFSET +
        room.height;

    return {
        left,
        top,
        right,
        bottomLeft,
        bottomRight
    };
}


/* =========================================================
   SVG-GRÖSSE
========================================================= */

function updateSvgSize() {

    const padding = 180;

    const width =
        Math.max(
            1100,
            ROOM_OFFSET +
            room.width +
            padding
        );

    const height =
        Math.max(
            1100,
            ROOM_OFFSET +
            room.height +
            padding
        );

    svg.setAttribute(
        "width",
        width
    );

    svg.setAttribute(
        "height",
        height
    );

    svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );

    roomCanvas.style.width =
        `${width}px`;

    roomCanvas.style.height =
        `${height}px`;

    document
        .getElementById("svgBackground")
        .setAttribute(
            "width",
            width
        );

    document
        .getElementById("svgBackground")
        .setAttribute(
            "height",
            height
        );

    document
        .getElementById("svgGrid")
        .setAttribute(
            "width",
            width
        );

    document
        .getElementById("svgGrid")
        .setAttribute(
            "height",
            height
        );
}


/* =========================================================
   RAUM RENDERN
========================================================= */

function renderRoom() {

    const g =
        getRoomGeometry();

    const floorPoints =
        [
            `${g.left},${g.top}`,
            `${g.right},${g.top}`,
            `${g.right},${g.bottomRight}`,
            `${g.left},${g.bottomLeft}`
        ].join(" ");

    floor.setAttribute(
        "points",
        floorPoints
    );


    /* -------------------------
       OBERWAND
    ------------------------- */

    wallTop.setAttribute(
        "points",
        [
            `${g.left},${g.top - 25}`,
            `${g.right},${g.top - 25}`,
            `${g.right},${g.top}`,
            `${g.left},${g.top}`
        ].join(" ")
    );


    /* -------------------------
       LINKE WAND
    ------------------------- */

    wallLeft.setAttribute(
        "points",
        [
            `${g.left - 25},${g.top - 25}`,
            `${g.left},${g.top - 25}`,
            `${g.left},${g.bottomLeft}`,
            `${g.left - 25},${g.bottomLeft + 25}`
        ].join(" ")
    );


    /* -------------------------
       RECHTE WAND
    ------------------------- */

    wallRight.setAttribute(
        "points",
        [
            `${g.right},${g.top}`,
            `${g.right + 25},${g.top - 25}`,
            `${g.right + 25},${g.bottomRight + 25}`,
            `${g.right},${g.bottomRight}`
        ].join(" ")
    );


    /* -------------------------
       UNTERE SCHRÄGE
    ------------------------- */

    wallBottom.setAttribute(
        "points",
        [
            `${g.left},${g.bottomLeft}`,
            `${g.right},${g.bottomRight}`,
            `${g.right + 25},${g.bottomRight + 25}`,
            `${g.left - 25},${g.bottomLeft + 25}`
        ].join(" ")
    );
}


/* =========================================================
   TÜR
========================================================= */

function renderDoor() {

    const g =
        getRoomGeometry();

    const x =
        g.left;

    const y =
        g.top +
        room.door.y;

    const width =
        room.door.width;


    document
        .getElementById("doorFrameTop")
        .setAttribute(
            "x1",
            x
        );

    document
        .getElementById("doorFrameTop")
        .setAttribute(
            "y1",
            y
        );

    document
        .getElementById("doorFrameTop")
        .setAttribute(
            "x2",
            x
        );

    document
        .getElementById("doorFrameTop")
        .setAttribute(
            "y2",
            y + width
        );


    document
        .getElementById("doorFrameBottom")
        .setAttribute(
            "x1",
            x - 2
        );

    document
        .getElementById("doorFrameBottom")
        .setAttribute(
            "y1",
            y
        );

    document
        .getElementById("doorFrameBottom")
        .setAttribute(
            "x2",
            x + 8
        );

    document
        .getElementById("doorFrameBottom")
        .setAttribute(
            "y2",
            y
        );


    const leaf =
        document.getElementById(
            "doorLeaf"
        );

    leaf.setAttribute(
        "x1",
        x
    );

    leaf.setAttribute(
        "y1",
        y
    );

    leaf.setAttribute(
        "x2",
        x + width
    );

    leaf.setAttribute(
        "y2",
        y
    );


    const arc =
        document.getElementById(
            "doorArc"
        );

    arc.setAttribute(
        "d",
        `
        M ${x} ${y}
        A ${width} ${width}
        0 0 1
        ${x + width} ${y + width}
        `
    );


    const label =
        document.getElementById(
            "doorLabel"
        );

    label.setAttribute(
        "x",
        x + width / 2
    );

    label.setAttribute(
        "y",
        y - 15
    );

    label.setAttribute(
        "text-anchor",
        "middle"
    );
}


/* =========================================================
   FENSTER
========================================================= */

function renderWindow() {

    const g =
        getRoomGeometry();

    const x =
        g.right;

    const y =
        g.top +
        room.window.y;

    const h =
        room.window.height;


    const outer =
        document.getElementById(
            "windowOuter"
        );

    outer.setAttribute(
        "x1",
        x
    );

    outer.setAttribute(
        "y1",
        y
    );

    outer.setAttribute(
        "x2",
        x
    );

    outer.setAttribute(
        "y2",
        y + h
    );


    const inner =
        document.getElementById(
            "windowInner"
        );

    inner.setAttribute(
        "x1",
        x + 2
    );

    inner.setAttribute(
        "y1",
        y
    );

    inner.setAttribute(
        "x2",
        x + 2
    );

    inner.setAttribute(
        "y2",
        y + h
    );


    const line1 =
        document.getElementById(
            "windowLine1"
        );

    line1.setAttribute(
        "x1",
        x - 18
    );

    line1.setAttribute(
        "y1",
        y
    );

    line1.setAttribute(
        "x2",
        x + 18
    );

    line1.setAttribute(
        "y2",
        y
    );


    const line2 =
        document.getElementById(
            "windowLine2"
        );

    line2.setAttribute(
        "x1",
        x - 18
    );

    line2.setAttribute(
        "y1",
        y + h
    );

    line2.setAttribute(
        "x2",
        x + 18
    );

    line2.setAttribute(
        "y2",
        y + h
    );


    const label =
        document.getElementById(
            "windowLabel"
        );

    label.setAttribute(
        "x",
        x - 28
    );

    label.setAttribute(
        "y",
        y + h / 2
    );

    label.setAttribute(
        "text-anchor",
        "middle"
    );

    label.setAttribute(
        "transform",
        `rotate(-90 ${x - 28} ${y + h / 2})`
    );
}


/* =========================================================
   MÖBEL RENDERN
========================================================= */

function renderFurniture() {

    furnitureLayer.innerHTML = "";

    furniture.forEach(
        item => {

            const group =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "g"
                );

            group.classList.add(
                "furniture-item"
            );

            group.dataset.id =
                item.id;

            group.setAttribute(
                "transform",
                getFurnitureTransform(item)
            );


            const rect =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "rect"
                );

            rect.classList.add(
                "furniture-body"
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
                item.type === "Teppich"
                    ? 8
                    : 5
            );

            rect.setAttribute(
                "fill",
                furnitureTypes[item.type]?.fill ||
                "#536879"
            );


            group.appendChild(
                rect
            );


            /* Einbauschrank bekommt Türen */

            if (
                item.type ===
                "Einbauschrank"
            ) {

                const doorWidth =
                    item.width / 4;

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    const door =
                        document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "rect"
                        );

                    door.setAttribute(
                        "x",
                        i * doorWidth + 3
                    );

                    door.setAttribute(
                        "y",
                        3
                    );

                    door.setAttribute(
                        "width",
                        doorWidth - 6
                    );

                    door.setAttribute(
                        "height",
                        Math.max(
                            10,
                            item.height - 6
                        )
                    );

                    door.setAttribute(
                        "fill",
                        "#425969"
                    );

                    door.setAttribute(
                        "stroke",
                        "#718696"
                    );

                    door.setAttribute(
                        "stroke-width",
                        "1.5"
                    );

                    group.appendChild(
                        door
                    );


                    const handle =
                        document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "line"
                        );

                    handle.setAttribute(
                        "x1",
                        i * doorWidth +
                        doorWidth -
                        10
                    );

                    handle.setAttribute(
                        "y1",
                        item.height / 2 - 6
                    );

                    handle.setAttribute(
                        "x2",
                        i * doorWidth +
                        doorWidth -
                        10
                    );

                    handle.setAttribute(
                        "y2",
                        item.height / 2 + 6
                    );

                    handle.setAttribute(
                        "stroke",
                        "#b8c6ce"
                    );

                    handle.setAttribute(
                        "stroke-width",
                        "2"
                    );

                    group.appendChild(
                        handle
                    );
                }
            }


            const text =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "text"
                );

            text.classList.add(
                "furniture-label"
            );

            text.setAttribute(
                "x",
                item.width / 2
            );

            text.setAttribute(
                "y",
                item.height / 2
            );

            text.textContent =
                item.name;


            group.appendChild(
                text
            );


            group.addEventListener(
                "pointerdown",
                event => {

                    event.stopPropagation();

                    selectFurniture(
                        item.id
                    );

                    startFurnitureDrag(
                        event,
                        item.id
                    );
                }
            );


            furnitureLayer.appendChild(
                group
            );
        }
    );
}


/* =========================================================
   MÖBEL-TRANSFORM
========================================================= */

function getFurnitureTransform(
    item
) {

    return `
        translate(${item.x} ${item.y})
        rotate(${item.rotation}
            ${item.width / 2}
            ${item.height / 2}
        )
    `;
}


function setFurnitureTransform(
    item
) {

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
}


/* =========================================================
   AUSWAHL MÖBEL
========================================================= */

function selectFurniture(
    id
) {

    selectedId = id;

    selectedRoomObject = null;

    renderSelection();

    updatePropertiesPanel();

    updateRoomObjectPanel();
}


/* =========================================================
   AUSWAHL RAUMOBJEKT
========================================================= */

function selectRoomObject(
    type
) {

    selectedId = null;

    selectedRoomObject = type;

    renderSelection();

    updatePropertiesPanel();

    updateRoomObjectPanel();
}


/* =========================================================
   AUSWAHL RENDERN
========================================================= */

function renderSelection() {

    selectionLayer.innerHTML = "";

    roomEditLayer.innerHTML = "";


    /* Möbel */

    if (selectedId) {

        const item =
            furniture.find(
                object =>
                    object.id === selectedId
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

        box.classList.add(
            "selection-box"
        );

        box.setAttribute(
            "x",
            -4
        );

        box.setAttribute(
            "y",
            -4
        );

        box.setAttribute(
            "width",
            item.width + 8
        );

        box.setAttribute(
            "height",
            item.height + 8
        );

        group.appendChild(
            box
        );


        selectionLayer.appendChild(
            group
        );

        return;
    }


    /* Raumobjekt */

    if (selectedRoomObject) {

        let target = null;

        if (
            selectedRoomObject ===
            "wall-top"
        ) {
            target = wallTop;
        }

        if (
            selectedRoomObject ===
            "wall-left"
        ) {
            target = wallLeft;
        }

        if (
            selectedRoomObject ===
            "wall-right"
        ) {
            target = wallRight;
        }

        if (
            selectedRoomObject ===
            "wall-bottom"
        ) {
            target = wallBottom;
        }

        if (
            selectedRoomObject ===
            "door"
        ) {
            target = doorObject;
        }

        if (
            selectedRoomObject ===
            "window"
        ) {
            target = windowObject;
        }

        if (!target) {
            return;
        }


        const clone =
            target.cloneNode(true);

        clone.removeAttribute(
            "id"
        );

        clone.classList.add(
            "room-selection"
        );

        clone.removeAttribute(
            "data-room-object"
        );

        selectionLayer.appendChild(
            clone
        );
    }
}


/* =========================================================
   MÖBEL DRAG
========================================================= */

function startFurnitureDrag(
    event,
    id
) {

    if (
        event.button !== 0
    ) {
        return;
    }


    const item =
        furniture.find(
            object =>
                object.id === id
        );

    if (!item) {
        return;
    }


    const point =
        getSvgPoint(event);


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
}


/* =========================================================
   RAUMOBJEKT DRAG
========================================================= */

function startRoomObjectDrag(
    event,
    type
) {

    if (
        event.button !== 0
    ) {
        return;
    }


    const point =
        getSvgPoint(event);


    dragState = {

        type: "room",

        object: type,

        startX: point.x,

        startY: point.y,

        original:
            clone(room)
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


/* =========================================================
   DRAG MOVE
========================================================= */

function dragMove(
    event
) {

    if (!dragState) {
        return;
    }


    const point =
        getSvgPoint(event);


    /* Möbel */

    if (
        dragState.type ===
        "furniture"
    ) {

        const item =
            furniture.find(
                object =>
                    object.id ===
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


        setFurnitureTransform(
            item
        );

        renderSelection();

        updatePropertiesPanel();

        return;
    }


    /* Raumobjekte */

    if (
        dragState.type ===
        "room"
    ) {

        const dx =
            point.x -
            dragState.startX;

        const dy =
            point.y -
            dragState.startY;


        if (
            dragState.object ===
            "door"
        ) {

            room.door.x =
                dragState.original.door.x +
                dx;

            room.door.y =
                dragState.original.door.y +
                dy;

            room.door.x =
                clamp(
                    room.door.x,
                    0,
                    room.width -
                    room.door.width
                );

            room.door.y =
                clamp(
                    room.door.y,
                    0,
                    room.height -
                    room.door.width
                );

            renderDoor();

            renderSelection();

            updateRoomObjectPanel();

            return;
        }


        if (
            dragState.object ===
            "window"
        ) {

            room.window.y =
                dragState.original.window.y +
                dy;

            room.window.y =
                clamp(
                    room.window.y,
                    0,
                    room.height -
                    room.window.height
                );

            renderWindow();

            renderSelection();

            updateRoomObjectPanel();

            return;
        }


        /* Wände */

        if (
            dragState.object ===
            "wall-top"
        ) {

            room.height =
                clamp(
                    dragState.original.height +
                    dy,
                    MIN_ROOM_HEIGHT,
                    MAX_ROOM_HEIGHT
                );

            render();
            return;
        }


        if (
            dragState.object ===
            "wall-bottom"
        ) {

            room.slope =
                clamp(
                    dragState.original.slope +
                    dy,
                    0,
                    Math.min(
                        500,
                        room.height - 50
                    )
                );

            render();
            return;
        }
    }
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

    saveState();
}


/* =========================================================
   SVG PUNKT
========================================================= */

function getSvgPoint(
    event
) {

    const point =
        svg.createSVGPoint();

    point.x =
        event.clientX;

    point.y =
        event.clientY;


    const matrix =
        svg.getScreenCTM();


    if (!matrix) {

        return {
            x: 0,
            y: 0
        };
    }


    const result =
        point.matrixTransform(
            matrix.inverse()
        );


    return {
        x: result.x,
        y: result.y
    };
}


/* =========================================================
   MÖBEL HINZUFÜGEN
========================================================= */

function addFurniture(
    type
) {

    const definition =
        furnitureTypes[type];


    if (!definition) {
        return;
    }


    const item = {

        id:
            makeId(
                type
                    .toLowerCase()
                    .replaceAll(
                        " ",
                        "-"
                    )
            ),

        type,

        name: type,

        x:
            ROOM_OFFSET +
            80,

        y:
            ROOM_OFFSET +
            80,

        width:
            definition.width,

        height:
            definition.height,

        rotation: 0
    };


    furniture.push(
        item
    );


    renderFurniture();

    selectFurniture(
        item.id
    );

    saveState();
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
                item.id !==
                selectedId
        );


    selectedId = null;

    render();

    updatePropertiesPanel();

    saveState();
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
            object =>
                object.id ===
                selectedId
        );


    if (!item) {
        return;
    }


    item.rotation =
        (
            item.rotation +
            90
        ) % 360;


    setFurnitureTransform(
        item
    );

    renderSelection();

    updatePropertiesPanel();

    saveState();
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
                item.id ===
                selectedId
        );


    if (!original) {
        return;
    }


    const copy =
        clone(original);


    copy.id =
        makeId(
            "furniture"
        );

    copy.name =
        `${original.name} Kopie`;

    copy.x += 35;
    copy.y += 35;


    furniture.push(
        copy
    );


    renderFurniture();

    selectFurniture(
        copy.id
    );

    saveState();
}


/* =========================================================
   MÖBEL-PANEL
========================================================= */

function updatePropertiesPanel() {

    const editor =
        document.getElementById(
            "furnitureEditor"
        );

    const empty =
        document.getElementById(
            "noFurnitureSelected"
        );


    if (!selectedId) {

        editor.style.display =
            "none";

        empty.style.display =
            "block";

        return;
    }


    const item =
        furniture.find(
            object =>
                object.id ===
                selectedId
        );


    if (!item) {

        editor.style.display =
            "none";

        empty.style.display =
            "block";

        return;
    }


    editor.style.display =
        "block";

    empty.style.display =
        "none";


    document.getElementById(
        "objectName"
    ).value =
        item.name;

    document.getElementById(
        "objectType"
    ).value =
        item.type;

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
        item.rotation;
}


/* =========================================================
   MÖBEL-ÄNDERUNGEN
========================================================= */

function applyObjectChanges() {

    if (!selectedId) {
        return;
    }


    const item =
        furniture.find(
            object =>
                object.id ===
                selectedId
        );


    if (!item) {
        return;
    }


    item.name =
        document.getElementById(
            "objectName"
        ).value ||
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
        Math.max(
            10,
            Number(
                document.getElementById(
                    "objectWidth"
                ).value
            )
        );


    item.height =
        Math.max(
            10,
            Number(
                document.getElementById(
                    "objectHeight"
                ).value
            )
        );


    item.rotation =
        Number(
            document.getElementById(
                "objectRotation"
            ).value
        );


    renderFurniture();

    renderSelection();

    updatePropertiesPanel();

    saveState();
}


/* =========================================================
   RAUM-PANEL
========================================================= */

function updateRoomPanel() {

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
}


/* =========================================================
   RAUM ÄNDERN
========================================================= */

function applyRoomChanges() {

    room.width =
        clamp(
            Number(
                document.getElementById(
                    "roomWidth"
                ).value
            ),
            MIN_ROOM_WIDTH,
            MAX_ROOM_WIDTH
        );


    room.height =
        clamp(
            Number(
                document.getElementById(
                    "roomHeight"
                ).value
            ),
            MIN_ROOM_HEIGHT,
            MAX_ROOM_HEIGHT
        );


    room.slope =
        clamp(
            Number(
                document.getElementById(
                    "slopeHeight"
                ).value
            ),
            0,
            Math.min(
                500,
                room.height - 50
            )
        );


    room.door.x =
        clamp(
            room.door.x,
            0,
            room.width -
            room.door.width
        );


    room.window.y =
        clamp(
            room.window.y,
            0,
            room.height -
            room.window.height
        );


    render();

    saveState();
}


/* =========================================================
   RAUMOBJEKT PANEL
========================================================= */

function updateRoomObjectPanel() {

    const panel =
        document.getElementById(
            "roomObjectProperties"
        );

    const wallPanel =
        document.getElementById(
            "wallProperties"
        );

    const doorPanel =
        document.getElementById(
            "doorProperties"
        );

    const windowPanel =
        document.getElementById(
            "windowProperties"
        );

    const hint =
        document.getElementById(
            "roomObjectHint"
        );


    if (!selectedRoomObject) {

        panel.style.display =
            "none";

        return;
    }


    panel.style.display =
        "block";


    wallPanel.style.display =
        "none";

    doorPanel.style.display =
        "none";

    windowPanel.style.display =
        "none";


    if (
        selectedRoomObject.startsWith(
            "wall-"
        )
    ) {

        wallPanel.style.display =
            "block";


        const g =
            getRoomGeometry();


        let x = 0;
        let y = 0;
        let length = 0;


        if (
            selectedRoomObject ===
            "wall-top"
        ) {

            x = 0;
            y = 0;
            length = room.width;

            hint.textContent =
                "Obere Wand";
        }


        if (
            selectedRoomObject ===
            "wall-left"
        ) {

            x = 0;
            y = 0;
            length = room.height -
                room.slope;

            hint.textContent =
                "Linke Wand";
        }


        if (
            selectedRoomObject ===
            "wall-right"
        ) {

            x = room.width;
            y = 0;
            length = room.height;

            hint.textContent =
                "Rechte Wand";
        }


        if (
            selectedRoomObject ===
            "wall-bottom"
        ) {

            x = 0;
            y =
                room.height -
                room.slope;

            length =
                Math.round(
                    Math.sqrt(
                        room.width ** 2 +
                        room.slope ** 2
                    )
                );

            hint.textContent =
                "Untere schräge Wand";
        }


        document.getElementById(
            "wallX"
        ).value =
            Math.round(x);

        document.getElementById(
            "wallY"
        ).value =
            Math.round(y);

        document.getElementById(
            "wallLength"
        ).value =
            Math.round(length);

        document.getElementById(
            "wallThickness"
        ).value =
            25;

        return;
    }


    if (
        selectedRoomObject ===
        "door"
    ) {

        doorPanel.style.display =
            "block";

        hint.textContent =
            "Tür";

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

        return;
    }


    if (
        selectedRoomObject ===
        "window"
    ) {

        windowPanel.style.display =
            "block";

        hint.textContent =
            "Fenster";

        document.getElementById(
            "windowY"
        ).value =
            Math.round(room.window.y);

        document.getElementById(
            "windowHeight"
        ).value =
            Math.round(room.window.height);
    }
}


/* =========================================================
   RAUMOBJEKT ÄNDERN
========================================================= */

function applyRoomObjectChanges() {

    if (!selectedRoomObject) {
        return;
    }


    /* -------------------------
       TÜR
    ------------------------- */

    if (
        selectedRoomObject ===
        "door"
    ) {

        room.door.x =
            Number(
                document.getElementById(
                    "doorX"
                ).value
            );

        room.door.y =
            Number(
                document.getElementById(
                    "doorY"
                ).value
            );

        room.door.width =
            Number(
                document.getElementById(
                    "doorWidth"
                ).value
            );


        room.door.width =
            clamp(
                room.door.width,
                40,
                300
            );


        room.door.x =
            clamp(
                room.door.x,
                0,
                room.width -
                room.door.width
            );


        room.door.y =
            clamp(
                room.door.y,
                0,
                room.height -
                room.door.width
            );


        render();

        saveState();

        return;
    }


    /* -------------------------
       FENSTER
    ------------------------- */

    if (
        selectedRoomObject ===
        "window"
    ) {

        room.window.y =
            Number(
                document.getElementById(
                    "windowY"
                ).value
            );

        room.window.height =
            clamp(
                Number(
                    document.getElementById(
                        "windowHeight"
                    ).value
                ),
                40,
                600
            );


        room.window.y =
            clamp(
                room.window.y,
                0,
                room.height -
                room.window.height
            );


        render();

        saveState();

        return;
    }


    /* -------------------------
       WAND
    ------------------------- */

    if (
        selectedRoomObject ===
        "wall-bottom"
    ) {

        const length =
            Number(
                document.getElementById(
                    "wallLength"
                ).value
            );


        if (
            Number.isFinite(length) &&
            length > 0
        ) {

            const slope =
                Math.sqrt(
                    Math.max(
                        0,
                        length ** 2 -
                        room.width ** 2
                    )
                );


            room.slope =
                clamp(
                    slope,
                    0,
                    Math.min(
                        500,
                        room.height - 50
                    )
                );
        }


        render();

        saveState();

        return;
    }


    if (
        selectedRoomObject ===
        "wall-top"
    ) {

        const length =
            Number(
                document.getElementById(
                    "wallLength"
                ).value
            );


        if (
            Number.isFinite(length)
        ) {

            room.width =
                clamp(
                    length,
                    MIN_ROOM_WIDTH,
                    MAX_ROOM_WIDTH
                );
        }


        render();

        saveState();

        return;
    }
}


/* =========================================================
   ROOM POINTER
========================================================= */

function handleRoomPointerDown(
    event
) {

    const roomObject =
        event.target.closest(
            "[data-room-object]"
        );


    if (!roomObject) {

        if (
            event.target ===
            floor
        ) {

            selectedId = null;

            selectedRoomObject =
                null;

            renderSelection();

            updatePropertiesPanel();

            updateRoomObjectPanel();
        }

        return;
    }


    const type =
        roomObject.dataset.roomObject;


    selectRoomObject(
        type
    );


    startRoomObjectDrag(
        event,
        type
    );
}


/* =========================================================
   GESAMT RENDERN
========================================================= */

function render() {

    updateSvgSize();

    renderRoom();

    renderDoor();

    renderWindow();

    renderFurniture();

    renderSelection();

    updateRoomPanel();

    updatePropertiesPanel();

    updateRoomObjectPanel();
}


/* =========================================================
   SPEICHERN
========================================================= */

function saveState() {

    const data = {

        room:
            clone(room),

        furniture:
            clone(furniture)
    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/* =========================================================
   LADEN
========================================================= */

function loadState() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        render();

        return;
    }


    try {

        const data =
            JSON.parse(
                saved
            );


        if (
            data.room
        ) {

            room =
                {
                    ...clone(defaultRoom),
                    ...data.room
                };
        }


        if (
            Array.isArray(
                data.furniture
            )
        ) {

            furniture =
                data.furniture;
        }


        selectedId =
            null;

        selectedRoomObject =
            null;


        render();

    } catch (
        error
    ) {

        console.error(
            "Fehler beim Laden:",
            error
        );

        resetAll();
    }
}


/* =========================================================
   RESET
========================================================= */

function resetAll() {

    const confirmed =
        confirm(
            "Möchtest du den Raum wirklich zurücksetzen?"
        );


    if (!confirmed) {
        return;
    }


    room =
        clone(
            defaultRoom
        );

    furniture =
        clone(
            defaultFurniture
        );


    selectedId =
        null;

    selectedRoomObject =
        null;


    localStorage.removeItem(
        STORAGE_KEY
    );


    render();
}


/* =========================================================
   EVENTS
========================================================= */


/* Möbel hinzufügen */

document
    .querySelectorAll(
        ".furniture-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    addFurniture(
                        button.dataset.type
                    );
                }
            );
        }
    );


/* Raumobjekte */

wallTop.addEventListener(
    "pointerdown",
    handleRoomPointerDown
);

wallLeft.addEventListener(
    "pointerdown",
    handleRoomPointerDown
);

wallRight.addEventListener(
    "pointerdown",
    handleRoomPointerDown
);

wallBottom.addEventListener(
    "pointerdown",
    handleRoomPointerDown
);

doorObject.addEventListener(
    "pointerdown",
    handleRoomPointerDown
);

windowObject.addEventListener(
    "pointerdown",
    handleRoomPointerDown
);


/* Boden */

floor.addEventListener(
    "pointerdown",
    event => {

        event.stopPropagation();

        selectedId = null;

        selectedRoomObject =
            null;

        renderSelection();

        updatePropertiesPanel();

        updateRoomObjectPanel();
    }
);


/* Raum übernehmen */

document
    .getElementById(
        "applyRoomBtn"
    )
    .addEventListener(
        "click",
        applyRoomChanges
    );


/* Raumobjekt übernehmen */

document
    .getElementById(
        "applyRoomObjectBtn"
    )
    .addEventListener(
        "click",
        applyRoomObjectChanges
    );


/* Möbel übernehmen */

document
    .getElementById(
        "applyObjectBtn"
    )
    .addEventListener(
        "click",
        applyObjectChanges
    );


/* Duplizieren */

document
    .getElementById(
        "duplicateBtn"
    )
    .addEventListener(
        "click",
        duplicateSelected
    );


/* Drehen */

document
    .getElementById(
        "rotateBtn"
    )
    .addEventListener(
        "click",
        rotateSelected
    );


/* Löschen */

document
    .getElementById(
        "deleteBtn"
    )
    .addEventListener(
        "click",
        deleteSelected
    );


/* Speichern */

document
    .getElementById(
        "saveBtn"
    )
    .addEventListener(
        "click",
        () => {

            saveState();

            alert(
                "Grundriss wurde gespeichert."
            );
        }
    );


/* Laden */

document
    .getElementById(
        "loadBtn"
    )
    .addEventListener(
        "click",
        () => {

            loadState();
        }
    );


/* Reset */

document
    .getElementById(
        "resetBtn"
    )
    .addEventListener(
        "click",
        resetAll
    );


/* =========================================================
   TASTATUR
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const active =
            document.activeElement;

        const editing =
            active &&
            (
                active.tagName ===
                "INPUT" ||
                active.tagName ===
                "SELECT" ||
                active.tagName ===
                "TEXTAREA"
            );


        if (editing) {
            return;
        }


        if (
            event.key
                .toLowerCase() ===
            "r"
        ) {

            rotateSelected();

            return;
        }


        if (
            event.key ===
            "Delete"
        ) {

            deleteSelected();

            return;
        }


        if (
            event.key ===
            "Escape"
        ) {

            selectedId = null;

            selectedRoomObject =
                null;

            renderSelection();

            updatePropertiesPanel();

            updateRoomObjectPanel();
        }
    }
);


/* =========================================================
   INITIALISIERUNG
========================================================= */

function init() {

    loadState();

    render();
}


init();
