import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Classroom from "../components/Classroom";
import Avatar from "../components/Avatarview";

const ClassroomExperience = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [-1.3, 1.5, -4], fov: 60 }}
      >
        <ambientLight intensity={1.9} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
        />

        <OrbitControls
          enablePan={false}
          enableZoom={false}     
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
        />

        <Suspense fallback={null}>
          <Classroom />
          <Avatar />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ClassroomExperience;
