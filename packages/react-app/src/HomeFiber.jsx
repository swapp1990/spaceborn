import * as THREE from 'three'
import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber'
import { Reflector, CameraShake, OrbitControls, useTexture, Stars } from '@react-three/drei'
import { KernelSize } from 'postprocessing'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import "./homefiber.scss"
import { ReactComponent as Gear1 } from "./assets/loot1.svg";
import { ReactComponent as Gear2 } from "./assets/loot2.svg";
import { ReactComponent as Gear3 } from "./assets/loot3.svg";
import { useHistory } from "react-router-dom";

function Triangle({ color, ...props }) {
    const ref = useRef()
    const [r] = useState(() => Math.random() * 10000)
    useFrame((_) => (ref.current.position.y = -1.75 + Math.sin(_.clock.elapsedTime + r) / 10))
    const { paths: [path] } = useLoader(SVGLoader, '/triangle.svg') // prettier-ignore
    const geom = useMemo(() => SVGLoader.pointsToStroke(path.subPaths[0].getPoints(), path.userData.style), [])
    return (
        <group ref={ref}>
            <mesh geometry={geom} {...props}>
                <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
        </group>
    )
}

function Rig({ children }) {
    const ref = useRef()
    const vec = new THREE.Vector3()
    const { camera, mouse } = useThree()
    useFrame(() => {
        camera.position.lerp(vec.set(mouse.x * 2, 0, 3.5), 0.05)
        ref.current.position.lerp(vec.set(mouse.x * 1, mouse.y * 0.1, 0), 0.1)
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, (-mouse.x * Math.PI) / 20, 0.1)
    })
    return <group ref={ref}>{children}</group>
}

function Ground(props) {
    const [floor, normal] = useTexture(['/SurfaceImperfections003_1K_var1.jpg', '/SurfaceImperfections003_1K_Normal.jpg'])
    return (
        <Reflector resolution={1024} args={[8, 8]} {...props}>
            {(Material, props) => <Material color="#f0f0f0" metalness={0} roughnessMap={floor} normalMap={normal} normalScale={[2, 2]} {...props} />}
        </Reflector>
    )
}

export default function HomeFiber() {
    const [showCanvas, setShowCanvas] = useState(true);
    const history = useHistory();

    function onExplore() {
        // console.log("onExplore")
        if (showCanvas) {
            setShowCanvas(false);
        }
    }

    function onPlayDemo() {
        history.push("/app");
    }

    function onBack() {
        setShowCanvas(true);
    }

    const scrollContent = <div className="scrollContent">
        <div className="section1">
            <p>
                <b>Spaceborn</b> is the first game using open-source game engine being built to create open, forkable smart
                contracts enabling rapid development and experimentation when it comes to crypto-based next-gen games. The
                first game lets you create a Player NFT and claim randomized & unique "loot" inspired single gears which are
                minted and stored on blockchain and will be used throughout the Moonshot Sci-fi Metaverse games created by
                devs from the open-source community.
            </p>
            <p className="warning">
                Moonshot Gears are not easy to mint. You need to play the game and win them. Careful! You might even lose
                your loot during your adventures if you don't take good care of them.
            </p>
        </div>
        <div className="examples">
            <div className="cardsTitle">
                <p>Example Moonshot Gears NFT</p>
            </div>
            <div className="cards">
                <Gear1 />
                <Gear2 />
                <Gear3 />
            </div>
        </div>
        <div className="section2">
            <p>
                <b>Spaceborn</b> is the first game using open-source game engine being built to create open, forkable smart
                contracts enabling rapid development and experimentation when it comes to crypto-based next-gen games. The
                first game lets you create a Player NFT and claim randomized & unique "loot" inspired single gears which are
                minted and stored on blockchain and will be used throughout the Moonshot Sci-fi Metaverse games created by
                devs from the open-source community.
            </p>
            <p>
                <b>Spaceborn</b> is the first game using open-source game engine being built to create open, forkable smart
                contracts enabling rapid development and experimentation when it comes to crypto-based next-gen games. The
                first game lets you create a Player NFT and claim randomized & unique "loot" inspired single gears which are
                minted and stored on blockchain and will be used throughout the Moonshot Sci-fi Metaverse games created by
                devs from the open-source community.
            </p>
            <p>
                <b>Spaceborn</b> is the first game using open-source game engine being built to create open, forkable smart
                contracts enabling rapid development and experimentation when it comes to crypto-based next-gen games. The
                first game lets you create a Player NFT and claim randomized & unique "loot" inspired single gears which are
                minted and stored on blockchain and will be used throughout the Moonshot Sci-fi Metaverse games created by
                devs from the open-source community.
            </p>
        </div>
    </div>

    return (
        <div className="body">
            {showCanvas && <div className="titleObj">
                <div className="title">
                    <img src="Spaceborn.png" width="500px"></img>
                </div>
                <div className="subtitle">
                    Humanity finally reached the stars. The ones who survived out there called themselves Spaceborn. This is there story ...
                </div>
                <div className="info">
                    <button className="infoBtn" onClick={() => onExplore()}>More Info</button>
                    <button className="infoBtn" onClick={() => onPlayDemo()}>Play Demo</button>
                </div>
            </div>}
            {!showCanvas && <div className="titleObj2">
                <div className="title">
                    <img src="Spaceborn.png" width="400px"></img>
                </div>
                <div className="menu">
                    <button className="infoBtn" onClick={() => onBack()}>Back</button>
                    <button className="infoBtn" onClick={() => onPlayDemo()}>Play Demo</button>
                </div>
                {scrollContent}
            </div>}
            <div className="canvas" style={{ backgroundImage: "url('/bg_lights.png')" }}>
                <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 15] }}>
                    <ambientLight />
                    <Suspense fallback={null}>
                        {showCanvas && <Rig>
                            <Triangle color="#FF52FF" scale={0.013} position={[3, -1, -1]} rotation={[0, 0, Math.PI / 3]} />
                            <Triangle color="#FE1E77" scale={0.011} position={[5, 0, -2]} rotation={[0, 0, Math.PI / 3]} />
                            <Triangle color="#FFD630" scale={0.009} position={[1, 0, -2]} rotation={[0, 0, Math.PI / 3]} />
                            <Ground mirror={1} blur={[500, 100]} mixBlur={12} mixStrength={1.5} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[2, -1, -2]} scale={1.3} />
                        </Rig>}
                        <EffectComposer multisampling={8}>
                            <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.3} intensity={0.2} />
                            <Bloom kernelSize={KernelSize.HUGE} luminanceThreshold={0} luminanceSmoothing={0} intensity={0.5} />
                        </EffectComposer>
                    </Suspense>

                    <Stars radius={500} depth={50} count={1000} factor={10} />
                    <CameraShake yawFrequency={0.2} pitchFrequency={0.2} rollFrequency={0.2} />
                </Canvas>
            </div>

            {/* <a href="https://github.com/drcmda/learnwithjason" className="top-left" children="Github" />
            <a href="https://twitter.com/0xca0a" className="top-right" children="Twitter" />
            <a href="https://github.com/pmndrs/react-three-fiber" className="bottom-left" children="@react-three/fiber" /> */}
        </div>
    )
}
