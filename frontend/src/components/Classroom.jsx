import React from "react";
import { useGLTF } from "@react-three/drei";

const Classroom = () => {
  const { scene } = useGLTF("/models/classroom.glb");

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, 0, 0]}
      rotation={[0, Math.PI, 0]} 
    />
  );
};

export default Classroom;
