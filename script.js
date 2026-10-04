/* =========================================================
   MEIN RAUMPLANER
   Interaktiver SVG-Raumplaner
========================================================= */


/* =========================================================
   KONSTANTEN
========================================================= */

const STORAGE_KEY = "meinRaumplaner_github_v3";

const ROOM_OFFSET_X = 100;
const ROOM_OFFSET_Y = 100;

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
   DOM
========================================================= */

const roomSvg = document.getElementById("roomSvg");

const roomCanvas = document.getElementById("roomCanvas");

const roomViewport = document.getElementById("roomViewport");

const svgBackground = document.getElementById("svgBackground");

const grid = document.getElementById("grid");

const floor = document.getElementById("floor");

const wallTop = document.getElementById("wallTop");

const wallLeft = document.getElementById("wallLeft");

const wallRight = document.getElementById("wallRight");

const wallBottom = document.getElementById("wallBottom");

const roofSlope = document.getElementById("roofSlope");

const doorObject = document.getElementById("doorObject");

const windowObject = document.getElementById("windowObject");

const builtInWardrobe = document.getElementById("builtInWardrobe");

const furnitureLayer = document.getElementById("furnitureLayer");

const selectionLayer = document.getElementById("selectionLayer");

const roomEditLayer = document.getElementById("roomEditLayer");


/* =========================================================
   HILFSFUNKTIONEN
========================================================= */

function clone(value) {

    return JSON.parse(
        JSON.stringify(value)
    );

}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


function createId(prefix = "item") {

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


/* =========================================================
   RAUMGEOMETRIE
========================================================= */

function getRoomPoints() {

    const left = ROOM_OFFSET_X;

    const top = ROOM_OFFSET_Y;

    const right =
        left +
        room.width;

    const bottomLeft =
        top +
        room.height -
        room.slope;

    const bottomRight =
        top +
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

/*
    Wichtig:

    Die SVG bleibt immer groß genug für den Raum.

    Dadurch kann der Raum bei größeren Abmessungen
    über den sichtbaren Bereich hinausgehen.

    Der äußere .room-viewport übernimmt dann
    automatisch das horizontale und vertikale Scrollen.
*/

function updateSvgSize() {

    const padding = 180;

    const width =
        Math.max(
            1100,
            ROOM_OFFSET_X +
            room.width +
            padding
        );

    const height =
        Math.max(
            1100,
            ROOM_OFFSET_Y +
            room.height +
            padding
        );


    roomSvg.setAttribute(
        "width",
        width
    );

    roomSvg.setAttribute(
        "height",
        height
    );

    roomSvg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    svgBackground.setAttribute(
        "width",
        width
    );

    svgBackground.setAttribute(
        "height",
        height
    );


    grid.setAttribute(
        "width",
        width
    );

    grid.setAttribute(
        "height",
        height
    );


    /*
        Die Canvas-Fläche ist etwas größer als
        die SVG, damit nichts am Rand abgeschnitten wird.
    */

    roomCanvas.style.width =
        `${width + 40}px`;

    roomCanvas.style.height =
        `${height + 40}px`;

}


/* =========================================================
   RAUM DARSTELLEN
========================================================= */

function renderRoom() {

    const p = getRoomPoints();


    /* Boden */

    floor.setAttribute(
        "points",
        [
            `${p.left},${p.top}`,
            `${p.right},${p.top}`,
            `${p.right},${p.bottomRight}`,
            `${p.left},${p.bottomLeft}`
        ].join(" ")
    );


    /* Obere Wand */

    wallTop.setAttribute(
        "points",
        [
            `${p.left - 20},${p.top - 25}`,
            `${p.right + 20},${p.top - 25}`,
            `${p.right},${p.top}`,
            `${p.left},${p.top}`
        ].join(" ")
    );


    /* Linke Wand */

    wallLeft.setAttribute(
        "points",
        [
            `${p.left - 20},${p.top - 25}`,
            `${p.left},${p.top}`,
            `${p.left},${p.bottomLeft}`,
            `${p.left - 20},${p.bottomLeft + 25}`
        ].join(" ")
    );


    /* Rechte Wand */

    wallRight.setAttribute(
        "points",
        [
            `${p.right},${p.top}`,
            `${p.right + 20},${p.top - 25}`,
            `${p.right + 20},${p.bottomRight + 25}`,
            `${p.right},${p.bottomRight}`
        ].join(" ")
    );


    /*
        KOMPLETTE SCHRÄGE UNTERE WAND
    */

    wallBottom.setAttribute(
        "points",
        [
            `${p.left},${p.bottomLeft}`,
            `${p.right},${p.bottomRight}`,
            `${p.right + 20},${p.bottomRight + 25}`,
            `${p.left - 20},${p.bottomLeft + 25}`
        ].join(" ")
    );


    /* Dachschräge */

    const roofHeight =
        Math.max(
            70,
            room.slope * 0.45
        );


    roofSlope.setAttribute(
        "points",
        [
            `${p.left},${p.top}`,
            `${p.right},${p.top}`,
            `${p.right},${p.top + roofHeight}`,
            `${p.left},${p.top + roofHeight * 0.2}`
        ].join(" ")
    );


    /*
        Ganz wichtig:
        Größe erst nach der Raumgeometrie aktualisieren.
    */

    updateSvgSize();

}


/* =========================================================
   TÜR
========================================================= */

function renderDoor() {

    const p = getRoomPoints();

    const x =
        p.left -
        1;

    const y =
        p.top +
        room.door.y;

    const h =
        room.door.width;


    const doorFrame =
        document.getElementById("doorFrame");

    const doorLeaf =
        document.getElementById("doorLeaf");

    const doorArc =
        document.getElementById("doorArc");

    const doorLabel =
        document.getElementById("doorLabel");


    doorFrame.setAttribute(
        "x1",
        x
    );

    doorFrame.setAttribute(
        "y1",
        y
    );

    doorFrame.setAttribute(
        "x2",
        x
    );

    doorFrame.setAttribute(
        "y2",
        y + h
    );


    const doorDepth = 95;

    doorLeaf.setAttribute(
        "d",
        `
        M ${x} ${y}
        L ${x + doorDepth} ${y}
        L ${x} ${y + h}
        Z
        `
    );


    const arcRadius = h;

    doorArc.setAttribute(
        "d",
        `
        M ${x} ${y + h}
        A ${arcRadius} ${arcRadius}
        0 0 0
        ${x + arcRadius} ${y}
        `
    );


    doorLabel.setAttribute(
        "x",
        x + 45
    );

    doorLabel.setAttribute(
        "y",
        y + h / 2
    );

}


/* =========================================================
   FENSTER
========================================================= */

function renderWindow() {

    const p = getRoomPoints();

    const x =
        p.right;

    const y =
        p.top +
        room.window.y;

    const h =
        room.window.height;


    const windowOuter =
        document.getElementById(
            "windowOuter"
        );

    const windowInner =
        document.getElementById(
            "windowInner"
        );

    const line1 =
        document.getElementById(
            "windowLine1"
        );

    const line2 =
        document.getElementById(
            "windowLine2"
        );

    const label =
        document.getElementById(
            "windowLabel"
        );


    windowOuter.setAttribute(
        "x1",
        x + 1
    );

    windowOuter.setAttribute(
        "y1",
        y
    );

    windowOuter.setAttribute(
        "x2",
        x + 1
    );

    windowOuter.setAttribute(
        "y2",
        y + h
    );


    windowInner.setAttribute(
        "x1",
        x + 2
    );

    windowInner.setAttribute(
        "y1",
        y
    );

    windowInner.setAttribute(
        "x2",
        x + 2
    );

    windowInner.setAttribute(
        "y2",
        y + h
    );


    line1.setAttribute(
        "x1",
        x - 10
    );

    line1.setAttribute(
        "y1",
        y + h * 0.33
    );

    line1.setAttribute(
        "x2",
        x + 10
    );

    line1.setAttribute(
        "y2",
        y + h * 0.33
    );


    line2.setAttribute(
        "x1",
        x - 10
    );

    line2.setAttribute(
        "y1",
        y + h * 0.66
    );

    line2.setAttribute(
        "x2",
        x + 10
    );

    line2.setAttribute(
        "y2",
        y + h * 0.66
    );


    label.setAttribute(
        "x",
        x - 50
    );

    label.setAttribute(
        "y",
        y + h / 2
    );

}


/* =========================================================
   EINBAUSCHRANK
========================================================= */

function renderBuiltInWardrobe() {

    const p = getRoomPoints();

    const marginX = 115;

    const x1 =
        p.left +
        marginX;

    const x2 =
        p.right -
        35;

    const y1 =
        p.bottomLeft -
        55;

    const y2 =
        p.bottomRight -
        55;

    const height = 72;


    const dx =
        x2 -
        x1;

    const dy =
        y2 -
        y1;

    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const angle =
        Math.atan2(
            dy,
            dx
        );

    const angleDeg =
        angle *
        180 /
        Math.PI;


    function pointAt(
        t,
        offset = 0
    ) {

        const px =
            x1 +
            dx * t;

        const py =
            y1 +
            dy * t;

        const nx =
            -dy /
            length;

        const ny =
            dx /
            length;

        return {
            x: px + nx * offset,
            y: py + ny * offset
        };

    }


    const topLeft =
        pointAt(0, 0);

    const topRight =
        pointAt(1, 0);

    const bottomLeft =
        pointAt(0, height);

    const bottomRight =
        pointAt(1, height);


    const shadow =
        document.getElementById(
            "wardrobeShadow"
        );

    const body =
        document.getElementById(
            "wardrobeBody"
        );

    const top =
        document.getElementById(
            "wardrobeTop"
        );


    shadow.setAttribute(
        "points",
        [
            `${topLeft.x},${topLeft.y}`,
            `${topRight.x},${topRight.y}`,
            `${bottomRight.x + 4},${bottomRight.y + 4}`,
            `${bottomLeft.x + 4},${bottomLeft.y + 4}`
        ].join(" ")
    );


    body.setAttribute(
        "points",
        [
            `${topLeft.x},${topLeft.y}`,
            `${topRight.x},${topRight.y}`,
            `${bottomRight.x},${bottomRight.y}`,
            `${bottomLeft.x},${bottomLeft.y}`
        ].join(" ")
    );


    const topOffset = -13;

    const topA =
        pointAt(0, topOffset);

    const topB =
        pointAt(1, topOffset);

    const topC =
        pointAt(1, 0);

    const topD =
        pointAt(0, 0);


    top.setAttribute(
        "points",
        [
            `${topA.x},${topA.y}`,
            `${topB.x},${topB.y}`,
            `${topC.x},${topC.y}`,
            `${topD.x},${topD.y}`
        ].join(" ")
    );


    const doors = [
        "wardrobeDoor1",
        "wardrobeDoor2",
        "wardrobeDoor3",
        "wardrobeDoor4"
    ];


    const handles = [
        "wardrobeHandle1",
        "wardrobeHandle2",
        "wardrobeHandle3",
        "wardrobeHandle4"
    ];


    const doorCount = 4;


    for (
        let i = 0;
        i < doorCount;
        i++
    ) {

        const start =
            i /
            doorCount;

        const end =
            (i + 1) /
            doorCount;


        const a =
            pointAt(start, 3);

        const b =
            pointAt(end, 3);

        const c =
            pointAt(
                end,
                height - 4
            );

        const d =
            pointAt(
                start,
                height - 4
            );


        const door =
            document.getElementById(
                doors[i]
            );


        door.setAttribute(
            "points",
            [
                `${a.x},${a.y}`,
                `${b.x},${b.y}`,
                `${c.x},${c.y}`,
                `${d.x},${d.y}`
            ].join(" ")
        );


        const mid =
            pointAt(
                start +
                (end - start) *
                0.90,
                height * 0.48
            );


        const nx =
            -dy /
            length;

        const ny =
            dx /
            length;


        const hx1 =
            mid.x -
            nx * 6;

        const hy1 =
            mid.y -
            ny * 6;

        const hx2 =
            mid.x +
            nx * 6;

        const hy2 =
            mid.y +
            ny * 6;


        const handle =
            document.getElementById(
                handles[i]
            );


        handle.setAttribute(
            "x1",
            hx1
        );

        handle.setAttribute(
            "y1",
            hy1
        );

        handle.setAttribute(
            "x2",
            hx2
        );

        handle.setAttribute(
            "y2",
            hy2
        );

    }


    const label =
        document.getElementById(
            "wardrobeLabel"
        );


    const labelPoint =
        pointAt(
            0.5,
            -22
        );


    label.setAttribute(
        "x",
        labelPoint.x
    );

    label.setAttribute(
        "y",
        labelPoint.y
    );

    label.setAttribute(
        "text-anchor",
        "middle"
    );

    label.setAttribute(
        "transform",
        `rotate(${angleDeg} ${labelPoint.x} ${labelPoint.y})`
    );

}


/* =========================================================
   RAUM-AUSWAHL
========================================================= */

function renderRoomSelection() {

    roomEditLayer.innerHTML = "";


    const p =
        getRoomPoints();


    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
        );


    line.setAttribute(
        "class",
        "room-selection"
    );


    line.setAttribute(
        "points",
        [
            `${p.left},${p.top}`,
            `${p.right},${p.top}`,
            `${p.right},${p.bottomRight}`,
            `${p.left},${p.bottomLeft}`,
            `${p.left},${p.top}`
        ].join(" ")
    );


    roomEditLayer.appendChild(
        line
    );


    const resizeHandle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    resizeHandle.setAttribute(
        "class",
        "room-handle"
    );

    resizeHandle.setAttribute(
        "cx",
        p.right
    );

    resizeHandle.setAttribute(
        "cy",
        p.bottomRight
    );

    resizeHandle.setAttribute(
        "r",
        "9"
    );

    resizeHandle.dataset.handle =
        "resize";


    roomEditLayer.appendChild(
        resizeHandle
    );


    const slopeHandle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    slopeHandle.setAttribute(
        "class",
        "room-handle slope"
    );

    slopeHandle.setAttribute(
        "cx",
        p.left
    );

    slopeHandle.setAttribute(
        "cy",
        p.bottomLeft
    );

    slopeHandle.setAttribute(
        "r",
        "9"
    );

    slopeHandle.dataset.handle =
        "slope";


    roomEditLayer.appendChild(
        slopeHandle
    );

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


        group.classList.add(
            "furniture-item"
        );


        group.dataset.id =
            item.id;


        group.dataset.type =
            item.type;


        const rect =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
            );


        rect.classList.add(
            "furniture-body"
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
            6
        );


        const type =
            furnitureTypes[item.type];


        rect.setAttribute(
            "fill",
            type?.fill ||
            "#607889"
        );


        group.appendChild(
            rect
        );


        const label =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "text"
            );


        label.classList.add(
            "furniture-label"
        );


        label.setAttribute(
            "x",
            item.width / 2
        );

        label.setAttribute(
            "y",
            item.height / 2
        );


        label.textContent =
            item.name;


        group.appendChild(
            label
        );


        furnitureLayer.appendChild(
            group
        );


        setFurnitureTransform(
            group,
            item
        );

    });

}


/* =========================================================
   MÖBEL TRANSFORM
========================================================= */

function setFurnitureTransform(
    element,
    item
) {

    const cx =
        item.width / 2;

    const cy =
        item.height / 2;


    element.setAttribute(
        "transform",
        `translate(${item.x} ${item.y}) rotate(${item.rotation} ${cx} ${cy})`
    );

}


/* =========================================================
   MÖBEL AUSWAHL
========================================================= */

function renderSelection() {

    selectionLayer.innerHTML = "";


    if (!selectedId) {

        return;

    }


    const item =
        furniture.find(
            f =>
                f.id ===
                selectedId
        );


    if (!item) {

        return;

    }


    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );


    const rect =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );


    rect.classList.add(
        "selection-box"
    );


    rect.setAttribute(
        "x",
        item.x - 5
    );

    rect.setAttribute(
        "y",
        item.y - 5
    );

    rect.setAttribute(
        "width",
        item.width + 10
    );

    rect.setAttribute(
        "height",
        item.height + 10
    );


    group.appendChild(
        rect
    );


    const handle =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    handle.classList.add(
        "selection-handle"
    );


    handle.setAttribute(
        "cx",
        item.x +
        item.width
    );

    handle.setAttribute(
        "cy",
        item.y +
        item.height
    );

    handle.setAttribute(
        "r",
        "7"
    );


    handle.dataset.handle =
        "resize-furniture";

    handle.dataset.id =
        item.id;


    group.appendChild(
        handle
    );


    selectionLayer.appendChild(
        group
    );

}


/* =========================================================
   KOMPLETT RENDERN
========================================================= */

function render() {

    renderRoom();

    renderDoor();

    renderWindow();

    renderBuiltInWardrobe();

    renderFurniture();

    renderSelection();

    renderRoomSelection();

    updateProperties();

}


/* =========================================================
   SCREEN -> SVG
========================================================= */

function getSvgPoint(event) {

    const point =
        roomSvg.createSVGPoint();


    point.x =
        event.clientX;

    point.y =
        event.clientY;


    const matrix =
        roomSvg
            .getScreenCTM()
            ?.inverse();


    if (!matrix) {

        return {
            x: 0,
            y: 0
        };

    }


    return point.matrixTransform(
        matrix
    );

}


/* =========================================================
   MÖBEL AUSWÄHLEN
========================================================= */

function selectFurniture(id) {

    selectedId =
        id;

    selectedRoomObject =
        null;

    renderSelection();

    updateProperties();

}


/* =========================================================
   RAUMOBJEKT AUSWÄHLEN
========================================================= */

function selectRoomObject(type) {

    selectedRoomObject =
        type;

    selectedId =
        null;

    renderSelection();

    updateProperties();

}


/* =========================================================
   DRAG START
========================================================= */

function startDrag(event) {

    if (
        event.button !== undefined &&
        event.button !== 0
    ) {

        return;

    }


    const target =
        event.target;


    /* Möbel */

    const furnitureGroup =
        target.closest(
            ".furniture-item"
        );


    if (furnitureGroup) {

        const id =
            furnitureGroup.dataset.id;


        const item =
            furniture.find(
                f =>
                    f.id === id
            );


        if (!item) {

            return;

        }


        selectFurniture(id);


        const point =
            getSvgPoint(event);


        dragState = {

            type: "furniture",

            id,

            offsetX:
                point.x -
                item.x,

            offsetY:
                point.y -
                item.y

        };


        event.preventDefault();

        return;

    }


    /* Tür */

    const door =
        target.closest(
            '[data-room-object="door"]'
        );


    if (door) {

        selectRoomObject(
            "door"
        );


        const point =
            getSvgPoint(event);


        const p =
            getRoomPoints();


        dragState = {

            type: "door",

            offsetY:
                point.y -
                (
                    p.top +
                    room.door.y
                )

        };


        event.preventDefault();

        return;

    }


    /* Fenster */

    const window =
        target.closest(
            '[data-room-object="window"]'
        );


    if (window) {

        selectRoomObject(
            "window"
        );


        const point =
            getSvgPoint(event);


        const p =
            getRoomPoints();


        dragState = {

            type: "window",

            offsetY:
                point.y -
                (
                    p.top +
                    room.window.y
                )

        };


        event.preventDefault();

        return;

    }


    /* Raum */

    if (
        target === floor ||
        target === wallTop ||
        target === wallLeft ||
        target === wallRight ||
        target === wallBottom ||
        target === roofSlope
    ) {

        selectedRoomObject =
            "room";

        selectedId =
            null;

        renderSelection();

        updateProperties();

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
        getSvgPoint(event);


    /* Möbel */

    if (
        dragState.type ===
        "furniture"
    ) {

        const item =
            furniture.find(
                f =>
                    f.id ===
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


        const element =
            furnitureLayer.querySelector(
                `[data-id="${item.id}"]`
            );


        if (element) {

            setFurnitureTransform(
                element,
                item
            );

        }


        renderSelection();

        return;

    }


    /* Tür */

    if (
        dragState.type ===
        "door"
    ) {

        const p =
            getRoomPoints();


        const newY =
            point.y -
            p.top -
            dragState.offsetY;


        const maxY =
            room.height -
            room.door.width -
            30;


        room.door.y =
            clamp(
                newY,
                40,
                Math.max(
                    40,
                    maxY
                )
            );


        renderDoor();

        updateProperties();

        return;

    }


    /* Fenster */

    if (
        dragState.type ===
        "window"
    ) {

        const p =
            getRoomPoints();


        const newY =
            point.y -
            p.top -
            dragState.offsetY;


        const maxY =
            room.height -
            room.window.height -
            30;


        room.window.y =
            clamp(
                newY,
                40,
                Math.max(
                    40,
                    maxY
                )
            );


        renderWindow();

        updateProperties();

        return;

    }

}


/* =========================================================
   DRAG ENDE
========================================================= */

function endDrag() {

    if (!dragState) {

        return;

    }


    dragState =
        null;


    render();

}


/* =========================================================
   RAUM HANDLE DRAG
========================================================= */

function startRoomHandleDrag(event) {

    const target =
        event.target;


    if (
        !target.classList.contains(
            "room-handle"
        )
    ) {

        return;

    }


    const handle =
        target.dataset.handle;


    const point =
        getSvgPoint(event);


    dragState = {

        type: "room-resize",

        handle,

        startX:
            point.x,

        startY:
            point.y,

        startWidth:
            room.width,

        startHeight:
            room.height,

        startSlope:
            room.slope

    };


    event.preventDefault();

}


/* =========================================================
   RAUM RESIZE
========================================================= */

function handleRoomResize(event) {

    if (
        !dragState ||
        dragState.type !==
        "room-resize"
    ) {

        return;

    }


    const point =
        getSvgPoint(event);


    if (
        dragState.handle ===
        "resize"
    ) {

        const dx =
            point.x -
            dragState.startX;

        const dy =
            point.y -
            dragState.startY;


        room.width =
            clamp(
                dragState.startWidth +
                dx,
                MIN_ROOM_WIDTH,
                MAX_ROOM_WIDTH
            );


        room.height =
            clamp(
                dragState.startHeight +
                dy,
                MIN_ROOM_HEIGHT,
                MAX_ROOM_HEIGHT
            );

    }


    if (
        dragState.handle ===
        "slope"
    ) {

        const dy =
            point.y -
            dragState.startY;


        room.slope =
            clamp(
                dragState.startSlope +
                dy,
                20,
                Math.min(
                    700,
                    room.height - 100
                )
            );

    }


    renderRoom();

    renderDoor();

    renderWindow();

    renderBuiltInWardrobe();

    renderRoomSelection();

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


    /*
        Möbel werden direkt innerhalb des Raumes
        platziert.

        Hier benutzen wir absichtlich dieselben
        Koordinaten wie der vorhandene Raum.
    */

    const item = {

        id:
            createId(
                "furniture"
            ),

        type,

        name:
            type,

        x:
            ROOM_OFFSET_X +
            Math.max(
                20,
                (
                    room.width -
                    definition.width
                ) / 2
            ),

        y:
            ROOM_OFFSET_Y +
            Math.max(
                20,
                (
                    room.height -
                    definition.height
                ) / 2
            ),

        width:
            definition.width,

        height:
            definition.height,

        rotation:
            0

    };


    furniture.push(
        item
    );


    selectedId =
        item.id;

    selectedRoomObject =
        null;


    render();

}


/* =========================================================
   LÖSCHEN
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


    selectedId =
        null;


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
            f =>
                f.id ===
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
            f =>
                f.id ===
                selectedId
        );


    if (!original) {

        return;

    }


    const copy =
        clone(original);


    copy.id =
        createId(
            "furniture"
        );


    copy.name =
        `${original.name} Kopie`;


    copy.x += 35;

    copy.y += 35;


    furniture.push(
        copy
    );


    selectedId =
        copy.id;


    render();

}


/* =========================================================
   EIGENSCHAFTEN AKTUALISIEREN
========================================================= */

function updateProperties() {

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


    const nameInput =
        document.getElementById(
            "objectName"
        );


    if (!selectedId) {

        nameInput.value =
            selectedRoomObject
                ? (
                    selectedRoomObject ===
                    "room"
                        ? "Raum"
                        : selectedRoomObject ===
                          "door"
                            ? "Tür"
                            : "Fenster"
                )
                : "";


        document.getElementById(
            "objectX"
        ).value = "";

        document.getElementById(
            "objectY"
        ).value = "";

        document.getElementById(
            "objectWidth"
        ).value = "";

        document.getElementById(
            "objectHeight"
        ).value = "";

        return;

    }


    const item =
        furniture.find(
            f =>
                f.id ===
                selectedId
        );


    if (!item) {

        return;

    }


    nameInput.value =
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
        item.rotation;

}


/* =========================================================
   RAUMÄNDERUNGEN
========================================================= */

function applyRoomChanges() {

    const width =
        Number(
            document.getElementById(
                "roomWidth"
            ).value
        );


    const height =
        Number(
            document.getElementById(
                "roomHeight"
            ).value
        );


    const slope =
        Number(
            document.getElementById(
                "slopeHeight"
            ).value
        );


    const doorX =
        Number(
            document.getElementById(
                "doorX"
            ).value
        );


    const doorY =
        Number(
            document.getElementById(
                "doorY"
            ).value
        );


    const doorWidth =
        Number(
            document.getElementById(
                "doorWidth"
            ).value
        );


    const windowY =
        Number(
            document.getElementById(
                "windowY"
            ).value
        );


    const windowHeight =
        Number(
            document.getElementById(
                "windowHeight"
            ).value
        );


    if (
        Number.isFinite(width)
    ) {

        room.width =
            clamp(
                width,
                MIN_ROOM_WIDTH,
                MAX_ROOM_WIDTH
            );

    }


    if (
        Number.isFinite(height)
    ) {

        room.height =
            clamp(
                height,
                MIN_ROOM_HEIGHT,
                MAX_ROOM_HEIGHT
            );

    }


    if (
        Number.isFinite(slope)
    ) {

        room.slope =
            clamp(
                slope,
                20,
                Math.min(
                    700,
                    room.height - 100
                )
            );

    }


    if (
        Number.isFinite(doorX)
    ) {

        room.door.x =
            clamp(
                doorX,
                70,
                180
            );

    }


    if (
        Number.isFinite(doorY)
    ) {

        room.door.y =
            clamp(
                doorY,
                40,
                Math.max(
                    40,
                    room.height -
                    room.door.width -
                    30
                )
            );

    }


    if (
        Number.isFinite(doorWidth)
    ) {

        room.door.width =
            clamp(
                doorWidth,
                50,
                Math.min(
                    180,
                    room.height - 80
                )
            );

    }


    if (
        Number.isFinite(windowHeight)
    ) {

        room.window.height =
            clamp(
                windowHeight,
                50,
                Math.min(
                    500,
                    room.height - 80
                )
            );

    }


    if (
        Number.isFinite(windowY)
    ) {

        room.window.y =
            clamp(
                windowY,
                40,
                Math.max(
                    40,
                    room.height -
                    room.window.height -
                    30
                )
            );

    }


    render();

    saveState();

}


/* =========================================================
   MÖBELÄNDERUNGEN
========================================================= */

function applyObjectChanges() {

    if (!selectedId) {

        return;

    }


    const item =
        furniture.find(
            f =>
                f.id ===
                selectedId
        );


    if (!item) {

        return;

    }


    const name =
        document.getElementById(
            "objectName"
        ).value.trim();


    const x =
        Number(
            document.getElementById(
                "objectX"
            ).value
        );


    const y =
        Number(
            document.getElementById(
                "objectY"
            ).value
        );


    const width =
        Number(
            document.getElementById(
                "objectWidth"
            ).value
        );


    const height =
        Number(
            document.getElementById(
                "objectHeight"
            ).value
        );


    const rotation =
        Number(
            document.getElementById(
                "objectRotation"
            ).value
        );


    if (name) {

        item.name =
            name;

    }


    if (
        Number.isFinite(x)
    ) {

        item.x =
            x;

    }


    if (
        Number.isFinite(y)
    ) {

        item.y =
            y;

    }


    if (
        Number.isFinite(width) &&
        width > 10
    ) {

        item.width =
            width;

    }


    if (
        Number.isFinite(height) &&
        height > 10
    ) {

        item.height =
            height;

    }


    if (
        Number.isFinite(rotation)
    ) {

        item.rotation =
            (
                rotation %
                360 +
                360
            ) % 360;

    }


    render();

    saveState();

}


/* =========================================================
   SPEICHERN
========================================================= */

function saveState() {

    const data = {

        version: 3,

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

        alert(
            "Es wurde noch keine gespeicherte Raumplanung gefunden."
        );

        return;

    }


    try {

        const data =
            JSON.parse(saved);


        if (data.room) {

            room =
                clone(
                    data.room
                );

        }


        if (
            Array.isArray(
                data.furniture
            )
        ) {

            furniture =
                clone(
                    data.furniture
                );

        }


        selectedId =
            null;

        selectedRoomObject =
            null;


        render();

    }
    catch (error) {

        console.error(
            error
        );

        alert(
            "Die gespeicherte Raumplanung konnte nicht geladen werden."
        );

    }

}


/* =========================================================
   ZURÜCKSETZEN
========================================================= */

function resetAll() {

    const confirmed =
        confirm(
            "Möchtest du den Raum und alle Möbel wirklich zurücksetzen?"
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
   RAUM POINTERDOWN
========================================================= */

function handleRoomPointerDown(event) {

    if (
        event.target.classList.contains(
            "room-handle"
        )
    ) {

        startRoomHandleDrag(
            event
        );

        return;

    }


    startDrag(
        event
    );

}


/* =========================================================
   POINTER EVENTS
========================================================= */

roomSvg.addEventListener(
    "pointerdown",
    handleRoomPointerDown
);


document.addEventListener(
    "pointermove",
    event => {

        if (
            dragState?.type ===
            "room-resize"
        ) {

            handleRoomResize(
                event
            );

        }
        else {

            dragMove(
                event
            );

        }

    }
);


document.addEventListener(
    "pointerup",
    endDrag
);


document.addEventListener(
    "pointercancel",
    endDrag
);


/* =========================================================
   TASTATUR
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const tag =
            event.target.tagName;


        const isInput =
            tag === "INPUT" ||
            tag === "SELECT" ||
            tag === "TEXTAREA";


        if (isInput) {

            return;

        }


        if (
            event.key.toLowerCase() ===
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

            selectedId =
                null;

            selectedRoomObject =
                null;

            renderSelection();

            updateProperties();

        }

    }
);


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById("saveBtn")
    .addEventListener(
        "click",
        () => {

            saveState();

            alert(
                "Raumplanung gespeichert."
            );

        }
    );


document
    .getElementById("loadBtn")
    .addEventListener(
        "click",
        loadState
    );


document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        resetAll
    );


document
    .getElementById("applyRoomBtn")
    .addEventListener(
        "click",
        applyRoomChanges
    );


document
    .getElementById("applyObjectBtn")
    .addEventListener(
        "click",
        applyObjectChanges
    );


document
    .getElementById("duplicateBtn")
    .addEventListener(
        "click",
        duplicateSelected
    );


document
    .getElementById("rotateBtn")
    .addEventListener(
        "click",
        rotateSelected
    );


document
    .getElementById("deleteBtn")
    .addEventListener(
        "click",
        deleteSelected
    );


/* =========================================================
   MÖBEL-BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".furniture-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.furniture;


                addFurniture(
                    type
                );

            }
        );

    });


/* =========================================================
   TÜR / FENSTER
========================================================= */

doorObject.addEventListener(
    "pointerdown",
    event => {

        event.stopPropagation();

        startDrag(
            event
        );

    }
);


windowObject.addEventListener(
    "pointerdown",
    event => {

        event.stopPropagation();

        startDrag(
            event
        );

    }
);


/* =========================================================
   INIT
========================================================= */

function init() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (saved) {

        try {

            const data =
                JSON.parse(
                    saved
                );


            if (data.room) {

                room =
                    clone(
                        data.room
                    );

            }


            if (
                Array.isArray(
                    data.furniture
                )
            ) {

                furniture =
                    clone(
                        data.furniture
                    );

            }

        }
        catch (error) {

            console.warn(
                "Gespeicherte Daten konnten nicht geladen werden.",
                error
            );

        }

    }


    render();

}


/* =========================================================
   START
========================================================= */

init();
