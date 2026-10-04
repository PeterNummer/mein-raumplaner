"use strict";


/* =========================================================
   MEIN RAUMPLANER
   GitHub Pages / reine Browser-Version
========================================================= */


/* =========================================================
   ELEMENTE
========================================================= */

const svg = document.getElementById("roomSvg");

const furnitureLayer =
    document.getElementById("furnitureLayer");

const selectionLayer =
    document.getElementById("selectionLayer");

const propertiesContent =
    document.getElementById("propertiesContent");

const selectionInfo =
    document.getElementById("selectionInfo");

const statusText =
    document.getElementById("statusText");


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
   MÖBELDATEN
========================================================= */

let furniture = [];

let selectedId = null;

let nextId = 1;


/* =========================================================
   DRAGGING
========================================================= */

let dragState = null;


/* =========================================================
   STANDARDMÖBEL
========================================================= */

const defaultFurniture = [

    {
        id: "f1",
        type: "Bett",
        x: 535,
        y: 190,
        width: 290,
        height: 130,
        rotation: 0
    },

    {
        id: "f2",
        type: "Regal",
        x: 187,
        y: 317,
        width: 85,
        height: 145,
        rotation: 0
    },

    {
        id: "f3",
        type: "Teppich",
        x: 460,
        y: 465,
        width: 320,
        height: 230,
        rotation: 0
    },

    {
        id: "f4",
        type: "TV-Schrank",
        x: 212,
        y: 582,
        width: 155,
        height: 55,
        rotation: 0
    },

    {
        id: "f5",
        type: "Schreibtisch",
        x: 690,
        y: 492,
        width: 125,
        height: 205,
        rotation: 0
    }

];


/* =========================================================
   HILFSFUNKTIONEN
========================================================= */

function createId() {

    return "f" + Date.now() + "_" + Math.random()
        .toString(36)
        .substring(2, 8);

}


function getFurniture(id) {

    return furniture.find(item => item.id === id);

}


function setStatus(text) {

    statusText.textContent = text;

}


/* =========================================================
   SVG ELEMENT
========================================================= */

function svgElement(tag, attributes = {}) {

    const element =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            tag
        );

    Object.entries(attributes).forEach(
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
   TRANSFORM
========================================================= */

function setFurnitureTransform(group, item) {

    group.setAttribute(
        "transform",
        `translate(${item.x} ${item.y}) rotate(${item.rotation})`
    );

}


/* =========================================================
   MÖBEL RENDERN
========================================================= */

function renderFurniture() {

    furnitureLayer.innerHTML = "";

    furniture.forEach(item => {

        const group =
            svgElement("g", {
                class: "furniture",
                "data-id": item.id
            });

        setFurnitureTransform(
            group,
            item
        );


        drawFurniture(
            group,
            item
        );


        group.addEventListener(
            "pointerdown",
            event => {

                startDrag(
                    event,
                    item.id
                );

            }
        );


        furnitureLayer.appendChild(group);

    });


    renderSelection();

}


/* =========================================================
   MÖBEL ZEICHNEN
========================================================= */

function drawFurniture(group, item) {

    const w = item.width;

    const h = item.height;

    const fill =
        furnitureTypes[item.type]?.fill ||
        "#657889";


    /* -------------------------
       BETT
    ------------------------- */

    if (item.type === "Bett") {

        group.appendChild(
            svgElement("rect", {
                x: 0,
                y: 0,
                width: w,
                height: h,
                rx: 13,
                fill: fill,
                class: "furniture-body"
            })
        );

        group.appendChild(
            svgElement("rect", {
                x: 12,
                y: 12,
                width: w - 24,
                height: 38,
                rx: 9,
                class: "bed-pillow"
            })
        );

        group.appendChild(
            svgElement("rect", {
                x: 12,
                y: 53,
                width: w - 24,
                height: h - 65,
                rx: 8,
                class: "bed-blanket"
            })
        );

        addText(
            group,
            "BETT",
            w / 2,
            h / 2 + 5
        );

        return;
    }


    /* -------------------------
       SOFA
    ------------------------- */

    if (item.type === "Sofa") {

        group.appendChild(
            svgElement("rect", {
                x: 0,
                y: 0,
                width: w,
                height: h,
                rx: 16,
                fill: fill,
                class: "furniture-body"
            })
        );

        group.appendChild(
            svgElement("rect", {
                x: 12,
                y: 12,
                width: w - 24,
                height: 30,
                rx: 9,
                class: "sofa-cushion"
            })
        );

        group.appendChild(
            svgElement("line", {
                x1: w / 2,
                y1: 48,
                x2: w / 2,
                y2: h - 10,
                class: "furniture-detail"
            })
        );

        addText(
            group,
            "SOFA",
            w / 2,
            h / 2 + 12
        );

        return;
    }


    /* -------------------------
       SESSEL
    ------------------------- */

    if (item.type === "Sessel") {

        group.appendChild(
            svgElement("rect", {
                x: 0,
                y: 0,
                width: w,
                height: h,
                rx: 17,
                fill: fill,
                class: "furniture-body"
            })
        );

        group.appendChild(
            svgElement("rect", {
                x: 13,
                y: 12,
                width: w - 26,
                height: h - 25,
                rx: 12,
                class: "sofa-cushion"
            })
        );

        addText(
            group,
            "SESSEL",
            w / 2,
            h / 2 + 4
        );

        return;
    }


    /* -------------------------
       TEPPICH
    ------------------------- */

    if (item.type === "Teppich") {

        group.appendChild(
            svgElement("rect", {
                x: 0,
                y: 0,
                width: w,
                height: h,
                rx: 14,
                fill: fill,
                class: "furniture-body"
            })
        );

        group.appendChild(
            svgElement("rect", {
                x: 12,
                y: 12,
                width: w - 24,
                height: h - 24,
                rx: 9,
                class: "rug-border"
            })
        );

        addText(
            group,
            "TEPPICH",
            w / 2,
            h / 2
        );

        return;
    }


    /* -------------------------
       PFLANZE
    ------------------------- */

    if (item.type === "Pflanze") {

        const centerX = w / 2;

        const centerY = h / 2;

        group.appendChild(
            svgElement("ellipse", {
                cx: centerX,
                cy: centerY + 13,
                rx: 17,
                ry: 13,
                class: "plant-pot"
            })
        );


        const leaves = [

            [centerX, centerY - 10, -25],
            [centerX, centerY - 17, 0],
            [centerX, centerY - 10, 25],
            [centerX - 11, centerY - 3, -45],
            [centerX + 11, centerY - 3, 45]

        ];


        leaves.forEach(
            ([cx, cy, rotation]) => {

                group.appendChild(
                    svgElement("ellipse", {
                        cx,
                        cy,
                        rx: 8,
                        ry: 22,
                        transform:
                            `rotate(${rotation} ${cx} ${cy})`,
                        class: "plant-leaf"
                    })
                );

            }
        );


        return;
    }


    /* -------------------------
       STEHLAMPE
    ------------------------- */

    if (item.type === "Stehlampe") {

        const cx = w / 2;

        group.appendChild(
            svgElement("line", {
                x1: cx,
                y1: h - 8,
                x2: cx,
                y2: 30,
                stroke: "#b4a06f",
                "stroke-width": 5
            })
        );

        group.appendChild(
            svgElement("path", {
                d:
                    `M ${cx - 20} 31
                     L ${cx + 20} 31
                     L ${cx + 13} 52
                     L ${cx - 13} 52 Z`,
                class: "lamp-shade"
            })
        );

        group.appendChild(
            svgElement("ellipse", {
                cx,
                cy: h - 6,
                rx: 22,
                ry: 6,
                fill: "#a88b58"
            })
        );

        return;
    }


    /* -------------------------
       STUHL
    ------------------------- */

    if (
        item.type === "Stuhl" ||
        item.type === "Schreibtischstuhl" ||
        item.type === "Barhocker"
    ) {

        group.appendChild(
            svgElement("rect", {
                x: 6,
                y: 6,
                width: w - 12,
                height: h - 12,
                rx: 12,
                class: "chair-seat"
            })
        );

        group.appendChild(
            svgElement("rect", {
                x: 10,
                y: 7,
                width: w - 20,
                height: 16,
                rx: 7,
                class: "chair-back"
            })
        );

        addText(
            group,
            item.type.toUpperCase(),
            w / 2,
            h / 2 + 8
        );

        return;
    }


    /* -------------------------
       REGAL / SCHRANK
    ------------------------- */

    if (
        item.type === "Regal" ||
        item.type === "Bücherregal" ||
        item.type === "Kleiderschrank" ||
        item.type === "Schrank"
    ) {

        group.appendChild(
            svgElement("rect", {
                x: 0,
                y: 0,
                width: w,
                height: h,
                rx: 5,
                fill: fill,
                class: "furniture-body"
            })
        );


        const shelfCount =
            item.type === "Kleiderschrank" ||
            item.type === "Schrank"
                ? 4
                : 5;


        for (
            let i = 1;
            i < shelfCount;
            i++
        ) {

            const y =
                h / shelfCount * i;

            group.appendChild(
                svgElement("line", {
                    x1: 8,
                    y1: y,
                    x2: w - 8,
                    y2: y,
                    class: "shelf-line"
                })
            );

        }


        addText(
            group,
            item.type.toUpperCase(),
            w / 2,
            h / 2
        );

        return;
    }


    /* -------------------------
       FERNSEHER
    ------------------------- */

    if (item.type === "Fernseher") {

        group.appendChild(
            svgElement("rect", {
                x: 0,
                y: 0,
                width: w,
                height: h - 8,
                rx: 5,
                fill: fill,
                class: "furniture-body"
            })
        );

        group.appendChild(
            svgElement("rect", {
                x: 7,
                y: 7,
                width: w - 14,
                height: h - 22,
                rx: 2,
                fill: "#08131e"
            })
        );

        group.appendChild(
            svgElement("line", {
                x1: w / 2 - 10,
                y1: h - 5,
                x2: w / 2 + 10,
                y2: h - 5,
                stroke: "#a6b5be",
                "stroke-width": 2
            })
        );

        return;
    }


    /* -------------------------
       STANDARDMÖBEL
    ------------------------- */

    group.appendChild(
        svgElement("rect", {
            x: 0,
            y: 0,
            width: w,
            height: h,
            rx: 8,
            fill: fill,
            class: "furniture-body"
        })
    );


    group.appendChild(
        svgElement("rect", {
            x: 7,
            y: 7,
            width: Math.max(0, w - 14),
            height: Math.max(0, h - 14),
            rx: 5,
            class: "furniture-detail"
        })
    );


    addText(
        group,
        item.type.toUpperCase(),
        w / 2,
        h / 2 + 4
    );

}


/* =========================================================
   TEXT
========================================================= */

function addText(
    group,
    text,
    x,
    y
) {

    const element =
        svgElement("text", {
            x,
            y,
            class: "furniture-text"
        });

    element.textContent = text;

    group.appendChild(element);

}


/* =========================================================
   AUSWAHL RENDERN
========================================================= */

function renderSelection() {

    selectionLayer.innerHTML = "";

    if (!selectedId) {

        selectionInfo.textContent =
            "Nichts ausgewählt";

        return;

    }


    const item =
        getFurniture(selectedId);


    if (!item) {

        selectedId = null;

        return;

    }


    selectionInfo.textContent =
        item.type;


    const group =
        svgElement("g", {
            transform:
                `translate(${item.x} ${item.y})
                 rotate(${item.rotation})`
        });


    group.appendChild(
        svgElement("rect", {
            x: -5,
            y: -5,
            width: item.width + 10,
            height: item.height + 10,
            rx: 5,
            class: "selection-box"
        })
    );


    const handles = [

        [-5, -5],
        [item.width, -5],
        [-5, item.height],
        [item.width, item.height]

    ];


    handles.forEach(
        ([x, y]) => {

            group.appendChild(
                svgElement("circle", {
                    cx: x,
                    cy: y,
                    r: 5,
                    class: "selection-handle"
                })
            );

        }
    );


    selectionLayer.appendChild(group);

    updateProperties();

}


/* =========================================================
   PROPERTIES
========================================================= */

function updateProperties() {

    if (!selectedId) {

        propertiesContent.innerHTML = `
            <div class="empty-properties">
                <div class="empty-icon">↖</div>

                <h3>Kein Möbel ausgewählt</h3>

                <p>
                    Klicke auf ein Möbelstück,
                    um seine Eigenschaften zu bearbeiten.
                </p>
            </div>
        `;

        return;

    }


    const item =
        getFurniture(selectedId);


    if (!item) return;


    propertiesContent.innerHTML = `

        <div class="property-group">

            <label class="property-label">
                Name
            </label>

            <input
                id="propName"
                class="property-input"
                value="${escapeHtml(item.type)}"
                disabled
            >

        </div>


        <div class="property-group">

            <label class="property-label">
                Position
            </label>

            <div class="property-row">

                <input
                    id="propX"
                    class="property-input"
                    type="number"
                    value="${Math.round(item.x)}"
                    placeholder="X"
                >

                <input
                    id="propY"
                    class="property-input"
                    type="number"
                    value="${Math.round(item.y)}"
                    placeholder="Y"
                >

            </div>

        </div>


        <div class="property-group">

            <label class="property-label">
                Größe
            </label>

            <div class="property-row">

                <input
                    id="propWidth"
                    class="property-input"
                    type="number"
                    min="10"
                    value="${Math.round(item.width)}"
                    placeholder="Breite"
                >

                <input
                    id="propHeight"
                    class="property-input"
                    type="number"
                    min="10"
                    value="${Math.round(item.height)}"
                    placeholder="Höhe"
                >

            </div>

        </div>


        <div class="property-group">

            <label class="property-label">
                Drehung
            </label>

            <select
                id="propRotation"
                class="property-select"
            >

                <option value="0"
                    ${item.rotation === 0 ? "selected" : ""}>
                    0°
                </option>

                <option value="90"
                    ${item.rotation === 90 ? "selected" : ""}>
                    90°
                </option>

                <option value="180"
                    ${item.rotation === 180 ? "selected" : ""}>
                    180°
                </option>

                <option value="270"
                    ${item.rotation === 270 ? "selected" : ""}>
                    270°
                </option>

            </select>

        </div>


        <div class="property-actions">

            <button
                id="applyProperties"
                class="property-button primary"
            >
                ✓ Änderungen übernehmen
            </button>

            <button
                id="rotateButton"
                class="property-button"
            >
                ↻ Drehen
            </button>

            <button
                id="duplicateButton"
                class="property-button"
            >
                ⧉ Duplizieren
            </button>

            <button
                id="deleteButton"
                class="property-button delete"
            >
                🗑 Löschen
            </button>

        </div>

    `;


    document
        .getElementById("applyProperties")
        .addEventListener(
            "click",
            applyProperties
        );


    document
        .getElementById("rotateButton")
        .addEventListener(
            "click",
            rotateSelected
        );


    document
        .getElementById("duplicateButton")
        .addEventListener(
            "click",
            duplicateSelected
        );


    document
        .getElementById("deleteButton")
        .addEventListener(
            "click",
            deleteSelected
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   PROPERTIES ANWENDEN
========================================================= */

function applyProperties() {

    const item =
        getFurniture(selectedId);


    if (!item) return;


    const x =
        Number(
            document.getElementById("propX").value
        );

    const y =
        Number(
            document.getElementById("propY").value
        );

    const width =
        Number(
            document.getElementById("propWidth").value
        );

    const height =
        Number(
            document.getElementById("propHeight").value
        );

    const rotation =
        Number(
            document.getElementById("propRotation").value
        );


    if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(width) ||
        !Number.isFinite(height)
    ) {

        return;

    }


    item.x = x;

    item.y = y;

    item.width =
        Math.max(10, width);

    item.height =
        Math.max(10, height);

    item.rotation = rotation;


    renderFurniture();

    saveAutomatically();

    setStatus("Änderungen übernommen");

}


/* =========================================================
   DREHEN
========================================================= */

function rotateSelected() {

    const item =
        getFurniture(selectedId);


    if (!item) return;


    item.rotation =
        (item.rotation + 90) % 360;


    renderFurniture();

    saveAutomatically();

    setStatus("Möbel gedreht");

}


/* =========================================================
   LÖSCHEN
========================================================= */

function deleteSelected() {

    if (!selectedId) return;


    furniture =
        furniture.filter(
            item => item.id !== selectedId
        );


    selectedId = null;


    renderFurniture();

    updateProperties();

    saveAutomatically();

    setStatus("Möbel gelöscht");

}


/* =========================================================
   DUPLIZIEREN
========================================================= */

function duplicateSelected() {

    const item =
        getFurniture(selectedId);


    if (!item) return;


    const copy = {

        ...item,

        id: createId(),

        x: item.x + 35,

        y: item.y + 35

    };


    furniture.push(copy);

    selectedId = copy.id;


    renderFurniture();

    saveAutomatically();

    setStatus("Möbel dupliziert");

}


/* =========================================================
   DRAG START
========================================================= */

function startDrag(event, id) {

    event.preventDefault();

    event.stopPropagation();


    const item =
        getFurniture(id);


    if (!item) return;


    selectedId = id;


    const point =
        getSvgPoint(event);


    dragState = {

        id,

        startX: point.x,

        startY: point.y,

        originalX: item.x,

        originalY: item.y

    };


    renderSelection();

    setStatus("Möbel wird verschoben");


    document.addEventListener(
        "pointermove",
        dragMove
    );


    document.addEventListener(
        "pointerup",
        stopDrag,
        { once: true }
    );

}


/* =========================================================
   DRAG MOVE
========================================================= */

function dragMove(event) {

    if (!dragState) return;


    const item =
        getFurniture(dragState.id);


    if (!item) return;


    const point =
        getSvgPoint(event);


    const dx =
        point.x -
        dragState.startX;

    const dy =
        point.y -
        dragState.startY;


    item.x =
        dragState.originalX + dx;

    item.y =
        dragState.originalY + dy;


    const group =
        furnitureLayer.querySelector(
            `[data-id="${dragState.id}"]`
        );


    if (group) {

        setFurnitureTransform(
            group,
            item
        );

    }


    updateSelectionTransform();

}


/* =========================================================
   DRAG STOP
========================================================= */

function stopDrag() {

    if (!dragState) return;


    dragState = null;


    document.removeEventListener(
        "pointermove",
        dragMove
    );


    renderSelection();

    saveAutomatically();

    setStatus("Möbel verschoben");

}


/* =========================================================
   AUSWAHL TRANSFORM
========================================================= */

function updateSelectionTransform() {

    if (!selectedId) return;


    const item =
        getFurniture(selectedId);


    const selection =
        selectionLayer.querySelector("g");


    if (
        !item ||
        !selection
    ) return;


    selection.setAttribute(
        "transform",
        `translate(${item.x} ${item.y})
         rotate(${item.rotation})`
    );

}


/* =========================================================
   SVG KOORDINATEN
========================================================= */

function getSvgPoint(event) {

    const point =
        svg.createSVGPoint();


    point.x =
        event.clientX;

    point.y =
        event.clientY;


    const matrix =
        svg
            .getScreenCTM()
            .inverse();


    return point.matrixTransform(matrix);

}


/* =========================================================
   MÖBEL HINZUFÜGEN
========================================================= */

function addFurniture(type) {

    const definition =
        furnitureTypes[type];


    if (!definition) return;


    const item = {

        id: createId(),

        type,

        x: 430,

        y: 400,

        width: definition.width,

        height: definition.height,

        rotation: 0

    };


    furniture.push(item);

    selectedId = item.id;


    renderFurniture();

    saveAutomatically();

    setStatus(
        `${type} hinzugefügt`
    );

}


/* =========================================================
   SPEICHERN
========================================================= */

const STORAGE_KEY =
    "meinRaumplaner_github_v1";


function saveData() {

    const data = {

        version: 1,

        furniture

    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );


    setStatus("Gespeichert");

}


/* =========================================================
   AUTOMATISCH SPEICHERN
========================================================= */

function saveAutomatically() {

    const data = {

        version: 1,

        furniture

    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   LADEN
========================================================= */

function loadData() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        setStatus(
            "Keine gespeicherte Planung gefunden"
        );

        return;

    }


    try {

        const data =
            JSON.parse(saved);


        if (
            !data ||
            !Array.isArray(data.furniture)
        ) {

            throw new Error(
                "Ungültige Daten"
            );

        }


        furniture =
            data.furniture;


        selectedId = null;


        renderFurniture();

        updateProperties();


        setStatus("Planung geladen");

    }
    catch (error) {

        console.error(error);

        setStatus(
            "Fehler beim Laden"
        );

    }

}


/* =========================================================
   ZURÜCKSETZEN
========================================================= */

function resetPlanner() {

    const confirmed =
        confirm(
            "Möchtest du den Raumplaner wirklich zurücksetzen?"
        );


    if (!confirmed) return;


    furniture =
        structuredClone(
            defaultFurniture
        );


    selectedId = null;


    renderFurniture();

    updateProperties();

    saveAutomatically();

    setStatus("Zurückgesetzt");

}


/* =========================================================
   EVENT LISTENER
========================================================= */


/* Möbelbuttons */

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

                addFurniture(type);

            }
        );

    });


/* Speichern */

document
    .getElementById("saveBtn")
    .addEventListener(
        "click",
        saveData
    );


/* Laden */

document
    .getElementById("loadBtn")
    .addEventListener(
        "click",
        loadData
    );


/* Zurücksetzen */

document
    .getElementById("resetBtn")
    .addEventListener(
        "click",
        resetPlanner
    );


/* Klick auf freien Raum */

svg.addEventListener(
    "pointerdown",
    event => {

        if (
            event.target === svg ||
            event.target.closest("#room")
        ) {

            selectedId = null;

            renderSelection();

            updateProperties();

            setStatus("Bereit");

        }

    }
);


/* =========================================================
   TASTATUR
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "SELECT" ||
            event.target.tagName === "TEXTAREA"
        ) {

            return;

        }


        /* R = drehen */

        if (
            event.key.toLowerCase() === "r" &&
            selectedId
        ) {

            event.preventDefault();

            rotateSelected();

        }


        /* Delete */

        if (
            event.key === "Delete" &&
            selectedId
        ) {

            event.preventDefault();

            deleteSelected();

        }


        /* Escape */

        if (
            event.key === "Escape"
        ) {

            selectedId = null;

            renderSelection();

            updateProperties();

            setStatus("Bereit");

        }

    }
);


/* =========================================================
   START
========================================================= */

function init() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (saved) {

        try {

            const data =
                JSON.parse(saved);


            if (
                data &&
                Array.isArray(data.furniture)
            ) {

                furniture =
                    data.furniture;

            }
            else {

                furniture =
                    structuredClone(
                        defaultFurniture
                    );

            }

        }
        catch {

            furniture =
                structuredClone(
                    defaultFurniture
                );

        }

    }
    else {

        furniture =
            structuredClone(
                defaultFurniture
            );

    }


    renderFurniture();

    updateProperties();

    setStatus("Bereit");

}


/* Start */

init();