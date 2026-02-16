import { useKeyboardControls, CameraControls } from "@react-three/drei";
import useGame from "./gameState/useGame";
import { useRef, useEffect, useState } from "react";
import { xyz } from "./helpers";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import Ship from "./models/Ship";
import * as THREE from "three";
import { CameraHelper } from "three";

export default function Player() {
    const [subscribeKeys, getKeys] = useKeyboardControls();
    const cameraToShip = useRef(new THREE.Vector3(0, 20, -45));
    const [smoothedCameraTarget] = useState(new THREE.Vector3(0, 0, 0));

    const shipRigidBodyRef = useRef();
    const cameraControlsRef = useRef();
    const directionalLightRef = useRef();
    const shadowCameraHelperRef = useRef();
    const { scene } = useThree();

    // Create camera helper for shadow camera
    useEffect(() => {
        if (directionalLightRef.current && directionalLightRef.current.shadow) {
            const helper = new CameraHelper(directionalLightRef.current.shadow.camera);
            helper.visible = true;
            scene.add(helper);
            shadowCameraHelperRef.current = helper;

            return () => {
                if (shadowCameraHelperRef.current) {
                    scene.remove(shadowCameraHelperRef.current);
                    shadowCameraHelperRef.current.dispose();
                }
            };
        }
    }, [scene]);

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
        } = getKeys();

        // Initialise impulse and torque
        const impulse = xyz(0, 0, 0);
        const torque = xyz(0, 0, 0);

        // Set impulse and torque strengths
        const impulseStrength = 800 * delta;
        const torqueStrength = 500 * delta;

        if (pitch_up) {
            console.log("pitch up");
            torque.x -= torqueStrength;
        }
        if (pitch_down) {
            console.log("pitch down");
            torque.x += torqueStrength;
        }
        if (yaw_left) {
            console.log("yaw left");
            torque.y += torqueStrength;
        }
        if (yaw_right) {
            console.log("yaw right");
            torque.y -= torqueStrength;
        }
        if (roll_left) {
            console.log("roll left");
            torque.z -= torqueStrength;
        }
        if (roll_right) {
            console.log("roll right");
            torque.z += torqueStrength;
        }
        if (thrust_increase) {
            console.log("thrust increase");
            impulse.y += impulseStrength;

        }
        if (thrust_decrease) {
            console.log("thrust decrease");
            impulse.y -= impulseStrength;
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
        if (cameraControlsRef.current) {
            const newCameraPosition = new THREE.Vector3(
                shipPosition.x + cameraToShip.current.x,
                shipPosition.y + cameraToShip.current.y,
                shipPosition.z + cameraToShip.current.z,
            );
            smoothedCameraTarget.lerp(shipPosition, 0.03);
            cameraControlsRef.current.setLookAt(newCameraPosition.x, newCameraPosition.y, newCameraPosition.z, smoothedCameraTarget.x, smoothedCameraTarget.y, smoothedCameraTarget.z);
        }

        // Update directional light position and look at the ship
        if (directionalLightRef.current) {
            directionalLightRef.current.position.set(shipPosition.x + 10, shipPosition.y + 10, shipPosition.z + 10);
            directionalLightRef.current.target.position.set(shipPosition.x, shipPosition.y, shipPosition.z);
            directionalLightRef.current.target.updateMatrixWorld();
        }
    });

    useEffect(() => {
        cameraControlsRef.current.addEventListener("control", () => {
            const cameraPosition = cameraControlsRef.current.getPosition();
            const shipPosition = shipRigidBodyRef.current.translation();
            cameraToShip.current = new THREE.Vector3(
                cameraPosition.x - shipPosition.x,
                cameraPosition.y - shipPosition.y,
                cameraPosition.z - shipPosition.z,
            );
            // console.log(cameraToShip);
        });
    }, []);

    return (
        <>
            <CameraControls ref={cameraControlsRef} />
            <directionalLight
                ref={directionalLightRef}
                position={[10, 10, 10]}
                intensity={4}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
                shadow-camera-near={0.1}
                shadow-camera-far={500}
            />
            <RigidBody ref={shipRigidBodyRef} canSleep={false} colliders={false}  >
                <CuboidCollider args={[3, 4.5, 3.2]} position={[0, 6, -1]} />
                <Ship castShadow receiveShadow />
            </RigidBody>
        </>
    );
}
