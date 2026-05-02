import React, { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLocation } from "react-router-dom";
import Classroom from "../components/Classroom";
import AvatarWithLoader from '../components/Avatarview';

const ClassroomExperience = () => {
  const location = useLocation();
  const { transcript, gloss, sentences, glossSentences } = location.state || {};
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!loggedRef.current) {
      console.log("ClassroomExperience received:", {
        transcript: transcript?.substring(0, 50),
        gloss,
        sentencesCount: sentences?.length,
        glossSentencesCount: glossSentences?.length
      });
      loggedRef.current = true;
    }
  }, [transcript, gloss, sentences, glossSentences]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas
        shadows
        camera={{ position: [-1.3, 1.7, -4], fov: 60 }}
        style={{ background: "#111" }}
      >
        <ambientLight intensity={1.9} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={3}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={false}     
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
        />

        <Suspense fallback={null}>
          <Classroom />
          <AvatarWithLoader 
            transcript={transcript}
            gloss={gloss}
            sentences={sentences}
            glossSentences={glossSentences}
          />
        </Suspense>
      </Canvas>
      {transcript && (
        <div style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          fontSize: "20px",
          fontWeight: "bold",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "5px",
          margin: "0 auto",
          width: "fit-content",
          pointerEvents: "none",
          zIndex: 100,
          fontFamily: "monospace"
        }}>
          {transcript}
        </div>
      )}
    </div>
  );
};

export default ClassroomExperience;