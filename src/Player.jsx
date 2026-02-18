import { useKeyboardControls, CameraControls } from "@react-three/drei";
import useGame from "./gameState/useGame";
import { useRef, useEffect, useState } from "react";
import { xyz } from "./helpers";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import Ship from "./models/Ship";
import * as THREE from "three";
import { rotateVectorByQuaternion } from "./utils";

const cameraPositions = [
    { name: "default", position: new THREE.Vector3(0, 20, -25) },
    { name: "far", position: new THREE.Vector3(0, 60, -80) },
    { name: "top", position: new THREE.Vector3(0, 70, -5) },
    { name: "rear left", position: new THREE.Vector3(-30, 30, -25) },
    { name: "rear right", position: new THREE.Vector3(30, 30, -25) },
    { name: "behind", position: new THREE.Vector3(0, 5, -45) },
]

export default function Player() {
    const [subscribeKeys, getKeys] = useKeyboardControls();
    const cameraToShip = useRef(new THREE.Vector3(0, 20, -45));
    const [smoothedCameraPosition] = useState(() => new THREE.Vector3())
    const [smoothedCameraTarget] = useState(() => new THREE.Vector3())
    const [currentCameraPosition, setCurrentCameraPosition] = useState(0);
    const [cameraJustChanged, setCameraJustChanged] = useState(false);
    const shipRigidBodyRef = useRef();
    const cameraControlsRef = useRef();
    const directionalLightRef = useRef();
    const shadowCameraHelperRef = useRef();
    const { scene } = useThree();

    // Create camera helper for shadow camera
    // useEffect(() => {
    //     if (directionalLightRef.current && directionalLightRef.current.shadow) {
    //         const helper = new CameraHelper(directionalLightRef.current.shadow.camera);
    //         helper.visible = true;
    //         scene.add(helper);
    //         shadowCameraHelperRef.current = helper;

    //         return () => {
    //             if (shadowCameraHelperRef.current) {
    //                 scene.remove(shadowCameraHelperRef.current);
    //                 shadowCameraHelperRef.current.dispose();
    //             }
    //         };
    //     }
    // }, [scene]);

    const start = useGame((state) => state.start);
    const crash = useGame((state) => state.crash);
    const quit = useGame((state) => state.quit);
    const restart = useGame((state) => state.restart);
    const setPlayerPosition = useGame((state) => state.setPlayerPosition);

    /**
     * useFrame
     */
    useFrame((state, delta) => {
        if (!shipRigidBodyRef.current) return;

        const shipPosition = shipRigidBodyRef.current.translation();

        // Update player position in store
        setPlayerPosition({ x: shipPosition.x, y: shipPosition.y, z: shipPosition.z });


        // Handle keyboard input
        const {
            pitch_up,
            pitch_down,
            yaw_left,
            yaw_right,
            roll_left,
            roll_right,
            thrust_increase,
            thrust_decrease,
            camera_next,
            camera_previous,
        } = getKeys();

        // Initialise impulse and torque
        const impulse = xyz(0, 0, 0);
        const torque = xyz(0, 0, 0);

        // Set impulse and torque strengths
        const impulseStrength = 1500 * delta;
        const torqueStrength = 800 * delta;

        if (pitch_up) {
            torque.x -= torqueStrength;
        }
        if (pitch_down) {
            torque.x += torqueStrength;
        }
        if (yaw_left) {
            torque.y += torqueStrength;
        }
        if (yaw_right) {
            torque.y -= torqueStrength;
        }
        if (roll_left) {
            torque.z -= torqueStrength;
        }
        if (roll_right) {
            torque.z += torqueStrength;
        }
        if (thrust_increase) {
            impulse.y += impulseStrength;

        }
        if (thrust_decrease) {
            impulse.y -= impulseStrength;
            console.log(shipRigidBodyRef.current.rotation());
        }

        if (camera_next) {
            if (cameraJustChanged) {
                setCameraJustChanged(false);
                return;
            }
            setCurrentCameraPosition((currentCameraPosition + 1) % cameraPositions.length);
            setCameraJustChanged(true);
        } else if (camera_previous) {
            if (cameraJustChanged) {
                setCameraJustChanged(false);
                return;
            }
            setCurrentCameraPosition((currentCameraPosition - 1 + cameraPositions.length) % cameraPositions.length);
            setCameraJustChanged(true);
        }

        // Translate local torque to world torque
        const localTorque = new THREE.Vector3(torque.x, torque.y, torque.z);
        const rotation = shipRigidBodyRef.current.rotation();
        const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
        const worldTorque = localTorque.applyQuaternion(quaternion);

        // Translate local impulse to world impulse
        const localImpulse = new THREE.Vector3(impulse.x, impulse.y, impulse.z);
        const worldImpulse = localImpulse.applyQuaternion(quaternion);

        // Only apply impulses once the rigid body ref is available
        if (shipRigidBodyRef.current) {
            shipRigidBodyRef.current.applyImpulse(worldImpulse);
            shipRigidBodyRef.current.applyTorqueImpulse(worldTorque);
        }

        // Update camera position
        // if (cameraControlsRef.current) {
        //     const newCameraPosition = new THREE.Vector3(
        //         shipPosition.x + cameraToShip.current.x,
        //         shipPosition.y + cameraToShip.current.y,
        //         shipPosition.z + cameraToShip.current.z,
        //     );
        //     cameraControlsRef.current.setLookAt(
        //         newCameraPosition.x, newCameraPosition.y, newCameraPosition.z, 
        //         shipPosition.x, shipPosition.y, shipPosition.z);
        // }

        // Update directional light position and look at the ship
        if (directionalLightRef.current) {
            directionalLightRef.current.position.set(shipPosition.x + 10, shipPosition.y + 10, shipPosition.z + 10);
            directionalLightRef.current.target.position.set(shipPosition.x, shipPosition.y, shipPosition.z);
            directionalLightRef.current.target.updateMatrixWorld();
        }

        /**
         * Camera
         * Rotate camera position by ship rotation
        */
        const bodyPosition = shipRigidBodyRef.current.translation()
        const bodyRotation = shipRigidBodyRef.current.rotation()
        const cameraQuaternion = new THREE.Quaternion(bodyRotation.x, bodyRotation.y, bodyRotation.z, bodyRotation.w);
        // const cameraOffset = rotateVectorByQuaternion(cameraPositions[currentCameraPosition].position, bodyRotation);
        const cameraOffset = cameraPositions[currentCameraPosition].position.clone().applyQuaternion(cameraQuaternion);

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.x += cameraOffset.x;
        cameraPosition.y += cameraOffset.y;
        cameraPosition.z += cameraOffset.z;

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 5.0;

        // Calculate ship's up vector in world space
        const shipUp = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraQuaternion);

        smoothedCameraPosition.lerp(cameraPosition, 10 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 10 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.up.copy(shipUp)
        state.camera.lookAt(smoothedCameraTarget)
    });

    // useEffect((state) => {
    //     cameraControlsRef.current.addEventListener("control", () => {
    //         // console.log("control");
    //         const cameraPosition = cameraControlsRef.current.getPosition();
    //         const shipPosition = shipRigidBodyRef.current.translation();
    //         cameraToShip.current = new THREE.Vector3(
    //             cameraPosition.x - shipPosition.x,
    //             cameraPosition.y - shipPosition.y,
    //             cameraPosition.z - shipPosition.z,
    //         );
    //         // console.log(cameraToShip);
    //     });
    // }, []);

    return (
        <>
            <group>
                {/* <CameraControls ref={cameraControlsRef} smoothTime={2.0} /> */}
                <directionalLight
                    ref={directionalLightRef}
                    position={[10, 10, 10]}
                    intensity={4}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-left={-32}
                    shadow-camera-right={32}
                    shadow-camera-top={32}
                    shadow-camera-bottom={-32}
                    shadow-camera-near={0.1}
                    shadow-camera-far={500}
                />
                <RigidBody ref={shipRigidBodyRef} canSleep={false} colliders={false} position={[0, 280, 0]}  >
                    <CuboidCollider args={[3, 4.5, 3.2]} position={[0, 6, -1]} />
                    <CuboidCollider args={[2, 1, 2.4]} position={[0, 0.5, -0.75]} />
                    <CuboidCollider args={[3.1, 0.6, 3.1]} position={[0, -1.2, -1.6]} rotation={[0, Math.PI / 4, 0]} />
                    <CuboidCollider args={[1.1, 2.1, 2.4]} position={[-4.5, 5.1, -1]} />
                    <CuboidCollider args={[1.1, 2.1, 2.4]} position={[4.5, 5.1, -1]} />
                    <Ship castShadow receiveShadow />
                </RigidBody>
            </group>
        </>
    );
}
