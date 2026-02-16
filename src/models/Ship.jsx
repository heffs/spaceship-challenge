import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function Ship() {
    const model = useGLTF("./dsed-ship.glb");

    // Enable castShadow on all meshes in the model
    useEffect(() => {
        model.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                // child.receiveShadow = true;
            }
        });
    }, [model.scene]);

    return (
        <primitive object={model.scene} />
    );
}
