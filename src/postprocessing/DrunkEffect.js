import { BlendFunction, Effect } from "postprocessing";
import drunkFragShader from "../shaders/drunkFragShader.glsl";

export default class DrunkEffect extends Effect {
    constructor({
        frequency = 2.0,
        amplitude = 0.2,
        blendFunction = BlendFunction.DARKEN,
    }) {
        super("DrunkEffect", drunkFragShader, {
            blendFunction,
            uniforms: new Map([
                ["frequency", { value: frequency }],
                ["amplitude", { value: amplitude }],
                ["offset", { value: 0 }],
            ]),
        });
    }

    update(renderer, inputBuffer, deltaTime) {
        this.uniforms.get('offset').value += 1.2 * deltaTime;
    }
}
