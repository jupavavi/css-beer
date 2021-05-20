import "./styles.css";
import { vec3, mat4 } from "gl-matrix";

const TO_RAD = Math.PI / 180;
const ACCEL = 0.5;
const UP = [0, 1, 0];
const RIGHT = [1, 0, 0];
const UNIT_IN_PX = 100;

const createCylinder = (slices = 32, radius = 0.85, height = 3) => {
    const angleInc = 360 / slices;
    const width = 2 * Math.tan(angleInc * TO_RAD * 0.5) * radius;
    const radiusInPx = radius * UNIT_IN_PX;
    const diameterInPx = 2 * radiusInPx;
    const widthInPX = width * UNIT_IN_PX;
    const heightInPX = height * UNIT_IN_PX;
    const halfWidthInPX = widthInPX * 0.5;
    const halfHeightInPX = heightInPX * 0.5;

    const faces = Array.from({ length: slices }, (_, index) => `
        <div style="
            transform: rotateY(${angleInc * index}deg) translateZ(${radiusInPx}px);
            backface-visibility: inherit;
            position: absolute;
            top: -${halfHeightInPX}px;
            left: -${halfWidthInPX}px;
            width: ${widthInPX}px;
            height: ${heightInPX}px;
            background-image: url(./312_text.png);
            background-size: ${100 * slices}% 100%;
            background-position: ${100 * index / slices}%;
            background-repeat: no-repeat;
        "></div>
    `).join("");

    const top = `
        <div style="
            transform: translateY(${-halfHeightInPX}px) rotateX(90deg);
            backface-visibility: inherit;
            position: absolute;
            width: ${diameterInPx}px;
            height: ${diameterInPx}px;
            top: -${radiusInPx}px;
            left: -${radiusInPx}px;
            border-radius: 50% 50%;
            background-image: url(./beer-can-top.jpg);
            background-size: 116% 116%;
            background-position: 50% 50%;
        "></div>
    `;

    const bottom = `
        <div style="
            transform: translateY(${halfHeightInPX}px) rotateX(-90deg);
            backface-visibility: inherit;
            position: absolute;
            width: ${diameterInPx}px;
            height: ${diameterInPx}px;
            top: -${radiusInPx}px;
            left: -${radiusInPx}px;
            border-radius: 50% 50%;
            background-image: url(./beer-can-bottom.jpg);
            background-size: 120% 120%;
            background-position: 50% 50%;
        "></div>
    `;

    return `
        <div class="model">
            ${top}
            ${faces}
            ${bottom}
        </div>
    `;
};

const init = () => {
    document.getElementById("app").innerHTML = `
        <div class="root">
            <div class="scene"></div>
        </div>
    `;

    const root = document.querySelector(".root");
    const scene = document.querySelector(".scene");
    scene.innerHTML = createCylinder();
    const model = scene.querySelector(".model");
    const mouse = {
        down: false,
        clientX: 0,
        clientY: 0,
        screenX: 0,
        screenY: 0,
        movementX: 0,
        movementY: 0,
    };
    const rotMatX = mat4.create();
    const rotMatY = mat4.create();
    const rotMat = mat4.fromRotation([], 0.025, vec3.normalize([], [-1, 3, 0]));
    const modelMat = mat4.create();

    const onMouseDown = () => mouse.down = true;
    const onMouseUp = () => mouse.down = false;
    const onMouseMove = (e) => {
        const prevX = mouse.screenX;
        const prevY = mouse.screenY;
        mouse.clientX = e.clientX;
        mouse.clientY = e.clientY;
        mouse.screenX = e.screenX;
        mouse.screenY = e.screenY;
        mouse.movementX = mouse.screenX - prevX;
        mouse.movementY = mouse.screenY - prevY;
    };

    root.addEventListener("mousedown", onMouseDown);
    root.addEventListener("mouseup", onMouseUp);
    root.addEventListener("mouseleave", onMouseUp);
    root.addEventListener("mousemove", onMouseMove);

    const loop = () => {
        const width = scene.offsetWidth;
        const height = scene.offsetWidth;
        const scale = Math.min(width, height) / 800;
        scene.style.transform = `scale3d(${scale}, ${scale}, ${scale})`;

        if (mouse.down) {
            mat4.identity(rotMat);
            mat4.fromRotation(rotMatY, mouse.movementX * ACCEL * TO_RAD, UP);
            mat4.fromRotation(rotMatX, -mouse.movementY * ACCEL * TO_RAD, RIGHT);
            mat4.mul(rotMat, rotMat, rotMatX);
            mat4.mul(rotMat, rotMat, rotMatY);
        }
        mat4.mul(modelMat, rotMat, modelMat);
        model.style.transform = `matrix3d(${modelMat.join(",")})`;

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};


init();
