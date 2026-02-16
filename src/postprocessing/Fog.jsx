import FogEffect from "./FogEffect";

export default function Fog() {
    const effect = new FogEffect();

    return (
        <primitive object={effect} />
    )
}
