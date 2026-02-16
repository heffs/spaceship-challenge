import { Effect } from "postprocessing";
import { EffectAttribute } from "postprocessing";
import fogFragShader from "../shaders/fogFragShader.glsl";
export default class FogEffect extends Effect {
    constructor() {
        super("FogEffect", fogFragShader, {
            attributes: EffectAttribute.DEPTH,
        });
    }
}