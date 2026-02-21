import * as THREE from "three";
import { interfaceColors, actualThrust } from "./utils";

function getPitchRoll(q) {
    // Convert quaternion to Three.js quaternion
    const quaternion = new THREE.Quaternion(q.x, q.y, q.z, q.w);

    // For attitude indicator, we need pitch and roll independent of yaw
    // We'll extract these from the orientation vectors directly

    // Ship's local forward vector (ship faces negative Z in Three.js)
    const localForward = new THREE.Vector3(0, 0, -1);
    // Ship's local up vector
    const localUp = new THREE.Vector3(0, 1, 0);

    // Transform to world space
    const worldForward = localForward.clone().applyQuaternion(quaternion).normalize();
    const shipUp = localUp.clone().applyQuaternion(quaternion);

    // World up vector
    const worldUp = new THREE.Vector3(0, 1, 0);

    // Calculate pitch: angle between forward vector and horizontal plane
    // Pitch is the angle the nose makes with the horizon (positive = nose up)
    const pitch = Math.asin(Math.max(-1, Math.min(1, worldForward.y)));

    // Calculate roll: bank angle around the forward vector
    // Standard flight simulator formula: roll is based on the orientation of
    // the ship's right and up vectors relative to the horizontal plane
    // This formula works for all orientations and is independent of yaw

    // Get ship's right vector (perpendicular to forward and ship's up)
    const shipRight = new THREE.Vector3().crossVectors(worldForward, shipUp).normalize();

    // Standard formula for roll (bank angle)
    // Roll = atan2(-right.y, up.y) gives the rotation around forward axis
    // Positive roll = banking right
    const roll = -Math.atan2(-shipRight.y, shipUp.y);

    return {
        pitch: pitch,  // Pitch: positive when nose up
        roll: roll     // Roll: positive when banking right
    };
}

function drawAttitudeIndicator(ctx, q, cx, cy, r) {
    const { pitch, roll } = getPitchRoll(q);

    ctx.save();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.strokeStyle = interfaceColors.brightAmber;
    ctx.lineWidth = 2;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.translate(cx, cy);
    ctx.rotate(-roll);

    const pitchScale = r * 0.8;
    ctx.translate(0, -pitch * pitchScale);

    // Ground
    ctx.fillStyle = interfaceColors.darkRed;
    ctx.fillRect(-2 * r, 0, 4 * r, 2 * r);

    // Horizon
    ctx.strokeStyle = interfaceColors.interfaceWhite;
    ctx.lineWidth = 2;
    // Above ground
    ctx.beginPath();
    ctx.moveTo(-2 * r, 0);
    ctx.lineTo(2 * r, 0);
    ctx.stroke();
    // Below ground
    ctx.beginPath();
    ctx.moveTo(-2 * r, 2 * r);
    ctx.lineTo(2 * r, 2 * r);
    ctx.stroke();

    ctx.restore();
    ctx.fillStyle = interfaceColors.brightAmber;
    ctx.textAlign = "center";
    ctx.fillText("Horizon", cx+r/2 -30, cy-r-10);
}

function drawMainThrusterIndicator(ctx, thrust, altitude, cx, cy, w, h) {
    ctx.fillStyle = interfaceColors.darkRed;
    const thrustH = h * actualThrust(thrust, altitude);
    const thrustY = cy + (h - thrustH);
    const indicatorY = cy + (h - (h * thrust));

    // Actual thrust
    ctx.fillRect(cx, thrustY, w, thrustH);

    // Frame
    ctx.strokeStyle = interfaceColors.brightAmber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + h);
    ctx.lineTo(cx + w, cy + h);
    ctx.lineTo(cx+w, cy);
    ctx.closePath();
    ctx.stroke();

    // Target thrust
    if (thrust !== actualThrust(thrust, altitude)) {
        ctx.fillStyle = interfaceColors.darkRed;
    } else {
        ctx.fillStyle = interfaceColors.interfaceGreen;
    }

    ctx.beginPath();
    ctx.moveTo(cx - 4, indicatorY);
    ctx.lineTo(cx - w * 0.5, indicatorY + w * 0.3);
    ctx.lineTo(cx - w * 0.5, indicatorY - w * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = interfaceColors.brightAmber;
    ctx.textAlign = "center";
    ctx.fillText("Main", cx + w * 0.5, cy-10);
}

function drawSpeedIndicators(ctx, velocity, cx, cy) {
    const airspeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    const vertSpeed = velocity.y;

    ctx.fillStyle = interfaceColors.brightAmber;
    ctx.textAlign = "left";
    // ctx.fillText(`Airspeed: ${airspeed.toFixed(1)} m/s`, cx, cy);
    ctx.fillText("Airspeed:", cx, cy);
    ctx.fillText("Vert. Speed: ", cx, cy + 20);
    ctx.textAlign = "right";
    ctx.fillText(airspeed.toFixed(1) + " m/s", cx + 220, cy);
    if (Math.abs(vertSpeed) < 3.0) {
        ctx.fillStyle = interfaceColors.interfaceGreen;
    } else if (vertSpeed < 0) {
        ctx.fillStyle = interfaceColors.darkRed;
    }
    ctx.fillText(vertSpeed.toFixed(1) + " m/s", cx + 220, cy + 20);
}

function drawHeadingIndicator(ctx, q, velocity, cx, cy, r) {
    const quaternion = new THREE.Quaternion(q.x, q.y, q.z, q.w);
    const localForward = new THREE.Vector3(0, 0, -1);
    const worldForward = localForward.clone().applyQuaternion(quaternion).normalize();
    const heading = Math.atan2(worldForward.z, worldForward.x);
    const headingDegrees = heading * 180 / Math.PI;

    const velocityAngle = Math.atan2(-velocity.z, -velocity.x);
    const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
    const velocityAngleDegrees = velocityAngle * 180 / Math.PI;

    ctx.save();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();

    ctx.strokeStyle = interfaceColors.brightAmber;
    ctx.lineWidth = 2;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.9 * Math.cos(heading), r * 0.9 * Math.sin(heading));
    ctx.stroke();
    
    if (velocityMagnitude > 0.1) {
        ctx.strokeStyle = interfaceColors.darkRed;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const vr = Math.min(1.0, velocityMagnitude / 60.0);
        const velLen = r * (0.4 + 0.6 * vr) * 0.9;
        ctx.lineTo(velLen * Math.cos(velocityAngle), velLen * Math.sin(velocityAngle));
        ctx.stroke();
    }

    ctx.restore();

    ctx.fillStyle = interfaceColors.brightAmber;
    ctx.textAlign = "center";
    ctx.fillText("Heading", cx + r - 60, cy - r - 10);
    ctx.fillText(`${(headingDegrees+90).toFixed(0)}°`, cx - r + 20, cy + r + 10);
    ctx.fillStyle = interfaceColors.darkRed;
    ctx.fillText(`${(velocityAngleDegrees+90).toFixed(0)}°`, cx + r - 20, cy + r + 10);
    // ctx.fillText("Heading: " + headingDegrees.toFixed(0) + "°", cx, cy);
}

function drawHeightWarning(ctx, altitude, cx, cy, w) {
    if (altitude > 700) {
        ctx.fillStyle = interfaceColors.darkRed;
        ctx.fillRect(cx, cy, w, 20);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.fillText("MTC: Approved ceiling exceeded!", cx+ 4, cy + 16);
    } else if (altitude > 500) {
        ctx.fillStyle = interfaceColors.dullAmber;
        ctx.fillRect(cx, cy, w, 20);
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.fillText("MTC: Approaching approved ceiling", cx+ 4, cy + 16);
    }
}

function drawAltitude(ctx, altitude, cx, cy) {
    ctx.fillStyle = interfaceColors.brightAmber;
    ctx.textAlign = "left";
    ctx.fillText("Alt:", cx, cy);
    ctx.textAlign = "right";
    ctx.fillText(altitude.toFixed(1) + " m", cx + 120, cy);
}

function drawControls(ctx, w, h) {
    ctx.strokeRect(8, 8, w - 16, h - 16);

    drawKey(ctx, "Q", "Roll left", 20, 35, true);
    drawKey(ctx, "W", "Pitch down", 95, 35, true);
    drawKey(ctx, "E", "Roll right", 170, 35, true);
    drawKey(ctx, "A", "Yaw left", 20, 105, false);
    drawKey(ctx, "S", "Pitch up", 95, 105, false);
    drawKey(ctx, "D", "Yaw right", 170, 105, false);
    drawKey(ctx, "X", "Thrust decrease", 280, 35, true);
    drawKey(ctx, "Sp", "Thrust increase", 280, 105, false);
    drawKey(ctx, "C", "Prev cam", 20, 220, true);
    drawKey(ctx, "V", "Next cam", 95, 220, true);
    drawKey(ctx, "K", "Show instruments", 280, 220, true);
}

function drawKey(ctx, label, text, x, y, above=false) {
    ctx.fillStyle = interfaceColors.brightAmber;
    ctx.strokeStyle = interfaceColors.brightAmber;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, 60, 60);
    ctx.strokeRect(x, y, 60, 60);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.font = "36px Coctab";
    ctx.fillText(label, x + 8, y + 28);
    ctx.fillStyle = interfaceColors.brightAmber;
    ctx.textAlign = "left";
    ctx.font = "16px Coctab";
    const textX = x + 30 - ctx.measureText(text).width / 2;
    // const textWidth = text.length * 10;
    // const textX = x + 100 - textWidth / 2;
    const textY = above ? y - 10 : y + 80;
    ctx.fillText(text, textX, textY);

}

export { drawAttitudeIndicator, drawMainThrusterIndicator, drawSpeedIndicators, drawHeadingIndicator, drawHeightWarning, drawControls, drawAltitude };