"use strict";


/* =========================================================
   KONSTANTEN
========================================================= */

const STORAGE_KEY = "meinRaumplaner_github_v5";

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
        wall: "left",
        x: 0,
        y: 300,
        width: 130
    },

    window: {
        wall: "right",
        x: 0,
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


function svgElement(
    tag,
    attributes = {}
) {

    const element =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            tag
        );

    Object.entries(
        attributes
    ).forEach(
        ([key, value]) => {

            element.setAttribute(
                key,
                value
            );
        }
    );

    return element;
}


/* =========================================================
   SVG
========================================================= */

const svg =
    document.getElementById(
        "roomSvg"
    );

const roomCanvas =
    document.getElementById(
        "roomCanvas"
    );

const floor =
    document.getElementById(
        "floor"
    );

const wallTop =
    document.getElementById(
        "wallTop"
    );

const wallLeft =
    document.getElementById(
        "wallLeft"
    );

const wallRight =
    document.getElementById(
        "wallRight"
    );

const wallBottom =
    document.getElementById(
        "wallBottom"
    );

const doorObject =
    document.getElementById(
        "doorObject"
    );

const windowObject =
    document.getElementById(
        "windowObject"
    );

const furnitureLayer =
    document.getElementById(
        "furnitureLayer"
    );

const selectionLayer =
    document.getElementById(
        "selectionLayer"
    );

const roomEditLayer =
    document.getElementById(
        "roomEditLayer"
    );


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


function getWallInfo(
    wall
) {

    const g =
        getRoomGeometry();

    return {

        top: {
            x1: g.left,
            y1: g.top,
            x2: g.right,
            y2: g.top,
            length: room.width
        },

        left: {
            x1: g.left,
            y1: g.top,
            x2: g.left,
            y2: g.bottomLeft,
            length:
                room.height -
                room.slope
        },

        right: {
            x1: g.right,
            y1: g.top,
            x2: g.right,
            y2: g.bottomRight,
            length:
                room.height
        },

        bottom: {
            x1: g.left,
            y1: g.bottomLeft,
            x2: g.right,
            y2: g.bottomRight,
            length:
                Math.sqrt(
                    room.width ** 2 +
                    room.slope ** 2
                )
        }

    }[wall];
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


    floor.setAttribute(
        "points",
        [
            `${g.left},${g.top}`,
            `${g.right},${g.top}`,
            `${g.right},${g.bottomRight}`,
            `${g.left},${g.bottomLeft}`
        ].join(" ")
    );


    wallTop.setAttribute(
        "points",
        [
            `${g.left - 25},${g.top - 25}`,
            `${g.right + 25},${g.top - 25}`,
            `${g.right},${g.top}`,
            `${g.left},${g.top}`
        ].join(" ")
    );


    wallLeft.setAttribute(
        "points",
        [
            `${g.left - 25},${g.top - 25}`,
            `${g.left},${g.top}`,
            `${g.left},${g.bottomLeft}`,
            `${g.left - 25},${g.bottomLeft + 25}`
        ].join(" ")
    );


    wallRight.setAttribute(
        "points",
        [
            `${g.right},${g.top}`,
            `${g.right + 25},${g.top - 25}`,
            `${g.right + 25},${g.bottomRight + 25}`,
            `${g.right},${g.bottomRight}`
        ].join(" ")
    );


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

    const wall =
        room.door.wall ||
        "left";

    const width =
        room.door.width;

    let x;
    let y;
    let rotation = 0;

    if (wall === "left") {

        x = g.left;
        y = g.top + room.door.y;
        rotation = 0;

    } else if (wall === "right") {

        x = g.right;
        y = g.top + room.door.y;
        rotation = 180;

    } else if (wall === "top") {

        x = g.left + room.door.x;
        y = g.top;
        rotation = 90;

    } else {

        x = g.left + room.door.x;
        y = g.bottomLeft;
        rotation =
            Math.atan2(
                room.slope,
                room.width
            ) *
            180 /
            Math.PI +
            90;
    }


    doorObject.setAttribute(
        "transform",
        `translate(${x} ${y}) rotate(${rotation})`
    );


    const frameTop =
        document.getElementById(
            "doorFrameTop"
        );

    frameTop.setAttribute(
        "x1",
        0
    );

    frameTop.setAttribute(
        "y1",
        0
    );

    frameTop.setAttribute(
        "x2",
        0
    );

    frameTop.setAttribute(
        "y2",
        width
    );


    const frameBottom =
        document.getElementById(
            "doorFrameBottom"
        );

    frameBottom.setAttribute(
        "x1",
        0
    );

    frameBottom.setAttribute(
        "y1",
        0
    );

    frameBottom.setAttribute(
        "x2",
        10
    );

    frameBottom.setAttribute(
        "y2",
        0
    );


    const leaf =
        document.getElementById(
            "doorLeaf"
        );

    leaf.setAttribute(
        "x1",
        0
    );

    leaf.setAttribute(
        "y1",
        0
    );

    leaf.setAttribute(
        "x2",
        width
    );

    leaf.setAttribute(
        "y2",
        0
    );


    const arc =
        document.getElementById(
            "doorArc"
        );

    arc.setAttribute(
        "d",
        `
        M 0 0
        A ${width} ${width}
        0 0 1
        ${width} ${width}
        `
    );


    const label =
        document.getElementById(
            "doorLabel"
        );

    label.setAttribute(
        "x",
        width / 2
    );

    label.setAttribute(
        "y",
        -15
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

    const wall =
        room.window.wall ||
        "right";

    const h =
        room.window.height;

    let x;
    let y;
    let rotation = 0;


    if (wall === "right") {

        x = g.right;
        y = g.top + room.window.y;
        rotation = 0;

    } else if (wall === "left") {

        x = g.left;
        y = g.top + room.window.y;
        rotation = 180;

    } else if (wall === "top") {

        x = g.left + room.window.x;
        y = g.top;
        rotation = 90;

    } else {

        x = g.left + room.window.x;
        y = g.bottomLeft;
        rotation =
            Math.atan2(
                room.slope,
                room.width
            ) *
            180 /
            Math.PI +
            90;
    }


    windowObject.setAttribute(
        "transform",
        `translate(${x} ${y}) rotate(${rotation})`
    );


    const outer =
        document.getElementById(
            "windowOuter"
        );

    outer.setAttribute(
        "x1",
        0
    );

    outer.setAttribute(
        "y1",
        0
    );

    outer.setAttribute(
        "x2",
        0
    );

    outer.setAttribute(
        "y2",
        h
    );


    const inner =
        document.getElementById(
            "windowInner"
        );

    inner.setAttribute(
        "x1",
        2
    );

    inner.setAttribute(
        "y1",
        0
    );

    inner.setAttribute(
        "x2",
        2
    );

    inner.setAttribute(
        "y2",
        h
    );


    const line1 =
        document.getElementById(
            "windowLine1"
        );

    line1.setAttribute(
        "x1",
        -18
    );

    line1.setAttribute(
        "y1",
        0
    );

    line1.setAttribute(
        "x2",
        18
    );

    line1.setAttribute(
        "y2",
        0
    );


    const line2 =
        document.getElementById(
            "windowLine2"
        );

    line2.setAttribute(
        "x1",
        -18
    );

    line2.setAttribute(
        "y1",
        h
    );

    line2.setAttribute(
        "x2",
        18
    );

    line2.setAttribute(
        "y2",
        h
    );


    const label =
        document.getElementById(
            "windowLabel"
        );

    label.setAttribute(
        "x",
        -28
    );

    label.setAttribute(
        "y",
        h / 2
    );

    label.setAttribute(
        "text-anchor",
        "middle"
    );

    label.setAttribute(
        "transform",
        `rotate(-90 -28 ${h / 2})`
    );
}


/* =========================================================
   MÖBEL DETAILS
========================================================= */

function addFurnitureDetails(
    group,
    item
) {

    const w = item.width;
    const h = item.height;


    /* BETT */

    if (item.type === "Bett") {

        group.appendChild(
            svgElement(
                "rect",
                {
                    x: 5,
                    y: 5,
                    width: w - 10,
                    height: 30,
                    rx: 7,
                    fill: "#71879a"
                }
            )
        );

        group.appendChild(
            svgElement(
                "rect",
                {
                    x: 12,
                    y: 42,
                    width: w - 24,
                    height: h - 50,
                    rx: 12,
                    fill: "#7e94a5"
                }
            )
        );

        group.appendChild(
            svgElement(
                "line",
                {
                    x1: 15,
                    y1: h / 2,
                    x2: w - 15,
                    y2: h / 2,
                    class: "furniture-detail"
                }
            )
        );
    }


    /* EINBAUSCHRANK */

    else if (item.type === "Einbauschrank") {

        const doorWidth =
            w / 4;

        group.appendChild(
            svgElement(
                "rect",
                {
                    x: 3,
                    y: 3,
                    width: w - 6,
                    height: h - 6,
                    rx: 4,
                    fill: "#35495a"
                }
            )
        );

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const x =
                i * doorWidth + 4;

            group.appendChild(
                svgElement(
                    "rect",
                    {
                        x,
                        y: 5,
                        width: doorWidth - 8,
                        height: h - 10,
                        rx: 2,
                        fill: "#425969",
                        stroke: "#718696",
                        "stroke-width": 1.5
                    }
                )
            );

            group.appendChild(
                svgElement(
                    "line",
                    {
                        x1:
                            x +
                            doorWidth -
                            14,

                        y1:
                            h / 2 -
                            7,

                        x2:
                            x +
                            doorWidth -
                            14,

                        y2:
                            h / 2 +
                            7,

                        stroke: "#d3dfe5",
                        "stroke-width": 2.5,
                        "stroke-linecap": "round"
                    }
                )
            );
        }
    }


    /* KLEIDERSCHRANK */

    else if (
        item.type === "Kleiderschrank" ||
        item.type === "Schrank"
    ) {

        const half =
            w / 2;

        group.appendChild(
            svgElement(
                "line",
                {
                    x1: half,
                    y1: 5,
                    x2: half,
                    y2: h - 5,
                    class: "furniture-detail"
                }
            )
        );

        group.appendChild(
            svgElement(
                "circle",
                {
                    cx: half - 7,
                    cy: h / 2,
                    r: 2.5,
                    fill: "#d2c3a7"
                }
            )
        );

        group.appendChild(
            svgElement(
                "circle",
                {
                    cx: half + 7,
                    cy: h / 2,
                    r: 2.5,
                    fill: "#d2c3a7"
                }
            )
        );
    }


    /* KOMMODE */

    else if (item.type === "Kommode") {

        const drawerHeight =
            h / 3;

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            group.appendChild(
                svgElement(
                    "rect",
                    {
                        x: 8,
                        y:
                            i *
                            drawerHeight +
                            7,

                        width:
                            w - 16,

                        height:
                            drawerHeight -
                            10,

                        rx: 3,

                        fill: "rgba(0,0,0,0.10)",

                        stroke:
                            "rgba(255,255,255,0.18)"
                    }
                )
            );
        }
    }


    /* SOFA */

    else if (item.type === "Sofa") {

        group.appendChild(
            svgElement(
                "rect",
                {
                    x: 5,
                    y: 5,
                    width: w - 10,
                    height: 25,
                    rx: 10,
                    fill: "#718696"
                }
            )
        );

        group.appendChild(
            svgElement(
                "line",
                {
                    x1: w / 2,
                    y1: 34,
                    x2: w / 2,
                    y2: h - 8,
                    class: "furniture-detail"
                }
            )
        );
    }


    /* SESSEL / HOCKER */

    else if (
        item.type === "Sessel" ||
        item.type === "Hocker"
    ) {

        group.appendChild(
            svgElement(
                "rect",
                {
                    x: 7,
                    y: 7,
                    width: w - 14,
                    height: 20,
                    rx: 8,
                    fill: "rgba(255,255,255,0.12)"
                }
            )
        );
    }


    /* TISCHE */

    else if (
        item.type === "Tisch" ||
        item.type === "Esstisch" ||
        item.type === "Couchtisch"
    ) {

        group.appendChild(
            svgElement(
                "rect",
                {
                    x: 7,
                    y: 7,
                    width: w - 14,
                    height: h - 14,
                    rx: 8,
                    fill: "rgba(0,0,0,0.10)",
                    stroke: "rgba(255,255,255,0.18)"
                }
            )
        );

        group.appendChild(
            svgElement(
                "circle",
                {
                    cx: w / 2,
                    cy: h / 2,
                    r: Math.min(w, h) * 0.09,
                    fill: "rgba(255,255,255,0.15)"
                }
            )
        );
    }


    /* STÜHLE */

    else if (
        item.type === "Stuhl" ||
        item.type === "Schreibtischstuhl" ||
        item.type === "Barhocker"
    ) {

        group.appendChild(
            svgElement(
                "circle",
                {
                    cx: w / 2,
                    cy: h / 2,
                    r: Math.min(w, h) * 0.24,
                    fill: "rgba(255,255,255,0.13)"
                }
            )
        );

        group.appendChild(
            svgElement(
                "circle",
                {
                    cx: w / 2,
                    cy: h / 2,
                    r: Math.min(w, h) * 0.08,
                    fill: "rgba(255,255,255,0.25)"
                }
            )
        );
    }


    /* TV */

    else if (item.type === "Fernseher") {

        group.appendChild(
            svgElement(
                "rect",
                {
                    x: 8,
                    y: 7,
                    width: w - 16,
                    height: h - 14,
                    rx: 4,
                    fill: "#080f16",
                    stroke: "#718696",
                    "stroke-width": 2
                }
            )
        );

        group.appendChild(
            svgElement(
                "line",
                {
                    x1: w / 2 - 12,
                    y1: h - 3,
                    x2: w / 2 + 12,
                    y2: h - 3,
                    stroke: "#b4c5cf",
                    "stroke-width": 3
                }
            )
        );
    }


    /* REGAL */

    else if (
        item.type === "Regal" ||
        item.type === "Bücherregal"
    ) {

        const shelves = 4;

        for (
            let i = 1;
            i < shelves;
            i++
        ) {

            const y =
                h *
                i /
                shelves;

            group.appendChild(
                svgElement(
                    "line",
                    {
                        x1: 7,
                        y1: y,
                        x2: w - 7,
                        y2: y,
                        class: "furniture-detail"
                    }
                )
            );
        }
    }


    /* WANDBREGAL */

    else if (
        item.type === "Wandregal"
    ) {

        group.appendChild(
            svgElement(
                "line",
                {
                    x1: 10,
                    y1: h / 2,
                    x2: w - 10,
                    y2: h / 2,
                    stroke: "#c7a77a",
                    "stroke-width": 3
                }
            )
        );
    }


    /* TEPPICH */

    else if (item.type === "Teppich") {

        group.appendChild(
            svgElement(
                "rect",
                {
                    x: 10,
                    y: 10,
                    width: w - 20,
                    height: h - 20,
                    rx: 12,
                    fill: "none",
                    stroke: "rgba(255,255,255,0.18)",
                    "stroke-width": 3,
                    "stroke-dasharray": "10 6"
                }
            )
        );
    }


    /* PFLANZE */

    else if (item.type === "Pflanze") {

        group.appendChild(
            svgElement(
                "circle",
                {
                    cx: w / 2,
                    cy: h * 0.72,
                    r: Math.min(w, h) * 0.22,
                    fill: "#7b573e"
                }
            )
        );

        const leaves = [
            [-12, -14],
            [12, -18],
            [-18, 4],
            [18, 5],
            [0, -30]
        ];

        leaves.forEach(
            ([dx, dy]) => {

                group.appendChild(
                    svgElement(
                        "ellipse",
                        {
                            cx: w / 2 + dx,
                            cy: h * 0.55 + dy,
                            rx: 8,
                            ry: 16,
                            fill: "#5d9a70",
                            transform:
                                `rotate(${dx * 2} ${w / 2 + dx} ${h * 0.55 + dy})`
                        }
                    )
                );
            }
        );
    }


    /* STEHLAMPE */

    else if (
        item.type === "Stehlampe"
    ) {

        group.appendChild(
            svgElement(
                "path",
                {
                    d:
                        `M ${w * 0.25} 25
                         L ${w * 0.75} 25
                         L ${w * 0.62} 50
                         L ${w * 0.38} 50 Z`,
                    fill: "#d5bd8b"
                }
            )
        );

        group.appendChild(
            svgElement(
                "line",
                {
                    x1: w / 2,
                    y1: 50,
                    x2: w / 2,
                    y2: h - 15,
                    stroke: "#bda878",
                    "stroke-width": 4
                }
            )
        );

        group.appendChild(
            svgElement(
                "line",
                {
                    x1: 8,
                    y1: h - 8,
                    x2: w - 8,
                    y2: h - 8,
                    stroke: "#bda878",
                    "stroke-width": 4
                }
            )
        );
    }


    /* MÜLLEIMER */

    else if (
        item.type === "Mülleimer"
    ) {

        group.appendChild(
            svgElement(
                "path",
                {
                    d:
                        `M 8 15
                         L ${w - 8} 15
                         L ${w - 13} ${h - 8}
                         L 13 ${h - 8} Z`,
                    fill: "rgba(0,0,0,0.12)"
                }
            )
        );

        group.appendChild(
            svgElement(
                "line",
                {
                    x1: 10,
                    y1: 12,
                    x2: w - 10,
                    y2: 12,
                    stroke: "#b8c6ce",
                    "stroke-width": 3
                }
            )
        );
    }
}


/* =========================================================
   MÖBEL RENDERN
========================================================= */

function renderFurniture() {

    furnitureLayer.innerHTML = "";

    furniture.forEach(
        item => {

            const group =
                svgElement(
                    "g",
                    {
                        class: "furniture-item",
                        "data-id": item.id,
                        transform:
                            getFurnitureTransform(item)
                    }
                );


            const body =
                svgElement(
                    "rect",
                    {
                        class: "furniture-body",
                        width: item.width,
                        height: item.height,
                        rx:
                            item.type === "Teppich"
                                ? 10
                                : 7,
                        fill:
                            furnitureTypes[item.type]?.fill ||
                            "#536879"
                    }
                );

            group.appendChild(
                body
            );


            addFurnitureDetails(
                group,
                item
            );


            const text =
                svgElement(
                    "text",
                    {
                        class: "furniture-label",
                        x: item.width / 2,
                        y: item.height / 2
                    }
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
   MÖBEL TRANSFORM
========================================================= */

function getFurnitureTransform(
    item
) {

    return `
        translate(${item.x} ${item.y})
        rotate(
            ${item.rotation}
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
   AUSWAHL
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
            svgElement(
                "g",
                {
                    transform:
                        getFurnitureTransform(item)
                }
            );


        const box =
            svgElement(
                "rect",
                {
                    class: "selection-box",
                    x: -4,
                    y: -4,
                    width: item.width + 8,
                    height: item.height + 8
                }
            );


        group.appendChild(
            box
        );

        selectionLayer.appendChild(
            group
        );

        return;
    }


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

        clone.removeAttribute("id");

        clone.classList.add(
            "room-selection"
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
            point.x -
            item.x,

        offsetY:
            point.y -
            item.y
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

            const wall =
                room.door.wall;


            if (
                wall === "left" ||
                wall === "right"
            ) {

                room.door.y =
                    clamp(
                        dragState.original.door.y +
                        dy,
                        0,
                        room.height -
                        room.door.width
                    );

            } else {

                room.door.x =
                    clamp(
                        dragState.original.door.x +
                        dx,
                        0,
                        room.width -
                        room.door.width
                    );
            }


            renderDoor();

            renderSelection();

            updateRoomObjectPanel();

            return;
        }


        if (
            dragState.object ===
            "window"
        ) {

            const wall =
                room.window.wall;


            if (
                wall === "left" ||
                wall === "right"
            ) {

                room.window.y =
                    clamp(
                        dragState.original.window.y +
                        dy,
                        0,
                        room.height -
                        room.window.height
                    );

            } else {

                room.window.x =
                    clamp(
                        dragState.original.window.x +
                        dx,
                        0,
                        room.width -
                        room.window.height
                    );
            }


            renderWindow();

            renderSelection();

            updateRoomObjectPanel();

            return;
        }


        if (
            dragState.object ===
            "wall-top"
        ) {

            room.width =
                clamp(
                    dragState.original.width +
                    dx,
                    MIN_ROOM_WIDTH,
                    MAX_ROOM_WIDTH
                );

            render();

            return;
        }


        if (
            dragState.object ===
            "wall-left"
        ) {

            room.height =
                clamp(
                    dragState.original.height -
                    dy,
                    MIN_ROOM_HEIGHT,
                    MAX_ROOM_HEIGHT
                );

            render();

            return;
        }


        if (
            dragState.object ===
            "wall-right"
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
            ROOM_OFFSET + 80,

        y:
            ROOM_OFFSET + 80,

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


    selectedId = null;

    render();

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
   MÖBEL PANEL
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
   MÖBEL ÄNDERN
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


    render();

    saveState();
}


/* =========================================================
   RAUM PANEL
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


        const info =
            getWallInfo(
                selectedRoomObject.replace(
                    "wall-",
                    ""
                )
            );


        document.getElementById(
            "wallX"
        ).value =
            Math.round(
                info.x1 -
                ROOM_OFFSET
            );


        document.getElementById(
            "wallY"
        ).value =
            Math.round(
                info.y1 -
                ROOM_OFFSET
            );


        document.getElementById(
            "wallLength"
        ).value =
            Math.round(
                info.length
            );


        hint.textContent =
            `Wand: ${selectedRoomObject.replace("wall-", "")}`;

        return;
    }


    if (
        selectedRoomObject ===
        "door"
    ) {

        doorPanel.style.display =
            "block";

        hint.textContent =
            "Tür bearbeiten";


        document.getElementById(
            "doorWall"
        ).value =
            room.door.wall;


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
            "Fenster bearbeiten";


        document.getElementById(
            "windowWall"
        ).value =
            room.window.wall;


        document.getElementById(
            "windowX"
        ).value =
            Math.round(room.window.x);


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

        room.door.wall =
            document.getElementById(
                "doorWall"
            ).value;


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
            clamp(
                Number(
                    document.getElementById(
                        "doorWidth"
                    ).value
                ),
                40,
                300
            );


        if (
            room.door.wall ===
            "left" ||
            room.door.wall ===
            "right"
        ) {

            room.door.y =
                clamp(
                    room.door.y,
                    0,
                    room.height -
                    room.door.width
                );

        } else {

            room.door.x =
                clamp(
                    room.door.x,
                    0,
                    room.width -
                    room.door.width
                );
        }


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

        room.window.wall =
            document.getElementById(
                "windowWall"
            ).value;


        room.window.x =
            Number(
                document.getElementById(
                    "windowX"
                ).value
            );


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


        if (
            room.window.wall ===
            "left" ||
            room.window.wall ===
            "right"
        ) {

            room.window.y =
                clamp(
                    room.window.y,
                    0,
                    room.height -
                    room.window.height
                );

        } else {

            room.window.x =
                clamp(
                    room.window.x,
                    0,
                    room.width -
                    room.window.height
                );
        }


        render();

        saveState();

        return;
    }


    /* -------------------------
       UNTERE WAND
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
            length >= room.width
        ) {

            room.slope =
                Math.sqrt(
                    Math.max(
                        0,
                        length ** 2 -
                        room.width ** 2
                    )
                );


            room.slope =
                clamp(
                    room.slope,
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


    /* -------------------------
       OBERE WAND
    ------------------------- */

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
    }
}


/* =========================================================
   RAUM POINTER
========================================================= */

function handleRoomPointerDown(
    event
) {

    const roomObject =
        event.target.closest(
            "[data-room-object]"
        );


    if (!roomObject) {
        return;
    }


    const type =
        roomObject.dataset.roomObject;


    if (type === "floor") {
        return;
    }


    selectRoomObject(
        type
    );


    startRoomObjectDrag(
        event,
        type
    );
}


/* =========================================================
   BODEN
========================================================= */

floor.addEventListener(
    "pointerdown",
    event => {

        event.stopPropagation();

        selectedId = null;

        selectedRoomObject = null;

        renderSelection();

        updatePropertiesPanel();

        updateRoomObjectPanel();
    }
);


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


        if (data.room) {

            room = {
                ...clone(defaultRoom),
                ...data.room
            };


            room.door = {
                ...clone(defaultRoom.door),
                ...(data.room.door || {})
            };


            room.window = {
                ...clone(defaultRoom.window),
                ...(data.room.window || {})
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


        selectedId = null;

        selectedRoomObject = null;


        render();

    } catch (error) {

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


    selectedId = null;

    selectedRoomObject = null;


    localStorage.removeItem(
        STORAGE_KEY
    );


    render();
}


/* =========================================================
   MÖBEL BUTTONS
========================================================= */

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


/* =========================================================
   RAUMOBJEKTE
========================================================= */

[
    wallTop,
    wallLeft,
    wallRight,
    wallBottom,
    doorObject,
    windowObject
].forEach(
    object => {

        object.addEventListener(
            "pointerdown",
            handleRoomPointerDown
        );
    }
);


/* =========================================================
   BUTTONS
========================================================= */

document
    .getElementById(
        "applyRoomBtn"
    )
    .addEventListener(
        "click",
        applyRoomChanges
    );


document
    .getElementById(
        "applyRoomObjectBtn"
    )
    .addEventListener(
        "click",
        applyRoomObjectChanges
    );


document
    .getElementById(
        "applyObjectBtn"
    )
    .addEventListener(
        "click",
        applyObjectChanges
    );


document
    .getElementById(
        "duplicateBtn"
    )
    .addEventListener(
        "click",
        duplicateSelected
    );


document
    .getElementById(
        "rotateBtn"
    )
    .addEventListener(
        "click",
        rotateSelected
    );


document
    .getElementById(
        "deleteBtn"
    )
    .addEventListener(
        "click",
        deleteSelected
    );


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


document
    .getElementById(
        "loadBtn"
    )
    .addEventListener(
        "click",
        loadState
    );


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
                active.tagName === "INPUT" ||
                active.tagName === "SELECT" ||
                active.tagName === "TEXTAREA"
            );


        if (editing) {
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

            selectedId = null;

            selectedRoomObject = null;

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
