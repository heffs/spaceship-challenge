import { useKeyboardControls } from "@react-three/drei";
import useGame from "./gameState/useGame";
import { useRef, useEffect, useState } from "react";
import { xyz } from "./helpers";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import Ship from "./models/Ship";
import * as THREE from "three";
import { actualThrust } from "./utils";
import { SUN_OFFSET } from "./constants";
import { usePageVisibility } from "./usePageVisibility";

const cameraPositions = [
    { name: "behind", position: new THREE.Vector3(0, 5, -45) },
    { name: "default", position: new THREE.Vector3(0, 30, -50) },
    { name: "high rear", position: new THREE.Vector3(0, 90, -55) },
    { name: "rear left", position: new THREE.Vector3(30, 30, -25) },
    { name: "rear right", position: new THREE.Vector3(-30, 30, -25) },
    { name: "left", position: new THREE.Vector3(40, -6, 0) },
    { name: "top", position: new THREE.Vector3(0, 70, -5) },
    { name: "right", position: new THREE.Vector3(-40, -6, 0) },
    { name: "front", position: new THREE.Vector3(0, 0, 40) },
    { name: "low rear", position: new THREE.Vector3(0, -60, -45) },
]

export default function Player() {
    const [subscribeKeys, getKeys] = useKeyboardControls();
    const cameraToShip = useRef(new THREE.Vector3(0, 20, -45));
    const [smoothedCameraPosition] = useState(() => new THREE.Vector3())
    const [smoothedCameraTarget] = useState(() => new THREE.Vector3())
    const [yawLeftActive, setYawLeftActive] = useState(false);
    const [yawRightActive, setYawRightActive] = useState(false);
    const [rollLeftActive, setRollLeftActive] = useState(false);
    const [rollRightActive, setRollRightActive] = useState(false);

    const isPageVisible = usePageVisibility();

    const shipRigidBodyRef = useRef();
    const directionalLightRef = useRef();
    const shadowCameraHelperRef = useRef();
    const { scene } = useThree();

    // Shadow camera helper
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
    const setShipMainThrust = useGame((state) => state.setShipMainThrust);
    const shipMainThrust = useGame((state) => state.shipMainThrust);

    useEffect(() => {
        const handleKeyDown = (event) => {
            let cameraIndex = useGame.getState().cameraIndex;
            switch (event.code) {
                case "KeyC":
                    useGame.setState({ cameraIndex: (cameraIndex - 1  + cameraPositions.length) % cameraPositions.length });
                    break;
                case "KeyV":
                    useGame.setState({ cameraIndex: (cameraIndex + 1) % cameraPositions.length });
                    break;
                case "KeyK":
                    const showInstruments = useGame.getState().showInstruments;
                    useGame.setState({ showInstruments: !showInstruments });
                    break;
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    /**
     * useFrame
     */
    useFrame((state, delta) => {
        if (!shipRigidBodyRef.current || !isPageVisible) return;

        const clampedDelta = Math.min(delta, 0.033);

        const shipPosition = shipRigidBodyRef.current.translation();

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
        const impulseStrength = 1200 * clampedDelta;
        const torqueStrength = 900 * clampedDelta;

        setYawLeftActive(false);
        setYawRightActive(false);
        setRollLeftActive(false);
        setRollRightActive(false);

        if (pitch_up) {
            torque.x -= torqueStrength;
        }
        if (pitch_down) {
            torque.x += torqueStrength;
        }
        if (yaw_left) {
            torque.y += torqueStrength;
            setYawLeftActive(true);
        }
        if (yaw_right) {
            torque.y -= torqueStrength;
            setYawRightActive(true);
        }
        if (roll_left) {
            torque.z -= torqueStrength;
            setRollLeftActive(true);
        }
        if (roll_right) {
            torque.z += torqueStrength;
            setRollRightActive(true);
        }
        if (thrust_increase) {
            if (shipMainThrust < 1) {
                setShipMainThrust(shipMainThrust + 0.3 * clampedDelta);
            }
        }
        if (thrust_decrease) {
            if (shipMainThrust > 0) {
                setShipMainThrust(shipMainThrust - 0.3 * clampedDelta);
            }
        }

        // Control main thrust based on altitude
        const altitude = shipPosition.y;

        impulse.y += impulseStrength * actualThrust(shipMainThrust, altitude);

        // Translate local torque to world torque
        const localTorque = new THREE.Vector3(torque.x, torque.y, torque.z);
        const rotation = shipRigidBodyRef.current.rotation();
        const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
        const worldTorque = localTorque.applyQuaternion(quaternion);

        // Translate local impulse to world impulse
        const localImpulse = new THREE.Vector3(impulse.x, impulse.y, impulse.z);
        const worldImpulse = localImpulse.applyQuaternion(quaternion);

        shipRigidBodyRef.current.applyImpulse(worldImpulse);
        shipRigidBodyRef.current.applyTorqueImpulse(worldTorque);


        // Update directional light position and look at the ship
        if (directionalLightRef.current) {
            directionalLightRef.current.position.set(
                shipPosition.x + SUN_OFFSET.x,
                shipPosition.y + SUN_OFFSET.y,
                shipPosition.z + SUN_OFFSET.z);
            directionalLightRef.current.target.position.set(shipPosition.x, shipPosition.y, shipPosition.z);
            directionalLightRef.current.target.updateMatrixWorld();
        }

        /**
         * Camera
        */
        const bodyPosition = shipRigidBodyRef.current.translation()
        const bodyRotation = shipRigidBodyRef.current.rotation()
        // Rotate camera offset by ship rotation
        const cameraQuaternion = new THREE.Quaternion(bodyRotation.x, bodyRotation.y, bodyRotation.z, bodyRotation.w);
        const cameraIndex = useGame.getState().cameraIndex;
        const cameraOffset = cameraPositions[cameraIndex].position.clone().applyQuaternion(cameraQuaternion);

        // Offset camera position from ship body
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

        smoothedCameraPosition.lerp(cameraPosition, 10 * clampedDelta)
        smoothedCameraTarget.lerp(cameraTarget, 10 * clampedDelta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.up.copy(shipUp)
        state.camera.lookAt(smoothedCameraTarget)

        useGame.setState({
            cameraPosition: cameraPosition,
            cameraOrientation: cameraQuaternion,
            playerPosition: shipPosition,
            playerRotation: shipRigidBodyRef.current.rotation(),
            playerVelocity: shipRigidBodyRef.current.linvel(),
        });
    });

    return (
        <>
            <group>
                {/* <CameraControls ref={cameraControlsRef} smoothTime={2.0} /> */}
                <directionalLight
                    ref={directionalLightRef}
                    position={[0, 20, 0]}
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
                <ambientLight intensity={0.1} color={0xebb18d} />
                <RigidBody ref={shipRigidBodyRef} canSleep={false} colliders={false} position={[0, 100, 0]} linearDamping={0.01} angularDamping={0.1}  >
                    <CuboidCollider args={[3, 4.5, 3.2]} position={[0, 0.75, 0]} /> {/* Main body */}
                    <CuboidCollider args={[2, 1, 2.4]} position={[0, -4.75, 0.25]} /> {/* Crew section */}
                    <CuboidCollider args={[3.1, 0.8, 3.1]} position={[0, -6.55, -0.6]} rotation={[0, Math.PI / 4, 0]} /> {/* Landing gear */}
                    <CuboidCollider args={[1.1, 2.1, 2.4]} position={[-4.5, -0.15, 0]} /> {/* Port thrusters */}
                    <CuboidCollider args={[1.1, 2.1, 2.4]} position={[4.5, -0.15, 0]} /> {/* Starboard thrusters */}
                    <Ship castShadow receiveShadow yawLeftActive={yawLeftActive} yawRightActive={yawRightActive} rollLeftActive={rollLeftActive} rollRightActive={rollRightActive} />
                </RigidBody>
            </group>
        </>
    );
}
