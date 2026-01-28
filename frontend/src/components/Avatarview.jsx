import React, { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

const Avatar = () => {
  const group = useRef();
  const { scene, animations } = useGLTF("/assets/avatar.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions && animations.length > 0) {
      const firstAnim = actions[animations[0].name];
      firstAnim?.reset().fadeIn(0.5).play();
    }
  }, [actions, animations]);

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });

  return (
    <group
      ref={group}
      position={[-1.2, 0, -1.1]}        
      scale={1}
      rotation={[0, Math.PI, 0]}  
    >
      <primitive object={scene} />
    </group>
  );
};

export default Avatar;
