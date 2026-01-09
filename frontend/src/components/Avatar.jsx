import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useFBX } from "@react-three/drei";
import * as THREE from "three";

const AvatarModel = ({ modelUrl, fbxUrl, speed = 0.5, gap = 2 }) => {
  const group = useRef();
  const { scene } = useGLTF(modelUrl);
  const fbx = useFBX(fbxUrl);
  const mixer = useRef();
  const actionRef = useRef();
  useEffect(() => {
    if (!scene) return;

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.frustumCulled = false;
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());

    if (group.current) {
      group.current.position.sub(center); 
      group.current.position.y += 0.1;    
      group.current.scale.setScalar(1.5); 
    }
  }, [scene]);
  useEffect(() => {
    if (!fbx || !scene) return;

    mixer.current = new THREE.AnimationMixer(scene);

    if (fbx.animations.length > 0) {
      const clip = fbx.animations[0];
      clip.tracks.forEach((track) => {
        track.name = track.name.replace("mixamorig:", "");
      });

      const action = mixer.current.clipAction(clip);
      action.clampWhenFinished = true;  
      action.loop = THREE.LoopOnce;      
      action.timeScale = speed;          
      actionRef.current = action;

      const playAnimation = () => {
        action.reset().play();
        setTimeout(playAnimation, clip.duration / speed * 1000 + gap * 1000);
      };

      playAnimation();
    }

    return () => mixer.current?.stopAllAction();
  }, [fbx, scene, speed, gap]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return <primitive ref={group} object={scene} />;
};

const Avatar = () => {
  return (
    <div className="w-full h-96 md:h-[28rem]">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[2, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <AvatarModel
            modelUrl="/assets/avatar.glb"
            fbxUrl="/assets/Waving.fbx"
            speed={0.5} 
            gap={2}    
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Avatar;
