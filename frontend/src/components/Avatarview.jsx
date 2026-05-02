import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const Avatar = ({ transcript, gloss, sentences, glossSentences }) => {
  const group = useRef();
  const { scene } = useGLTF("/animations/avatar.glb");
  const mixerRef = useRef(null);
  const clipsRef = useRef({});
  const loaderRef = useRef(new GLTFLoader());
  const [, setIsPreloading] = useState(false);
  const [, setPreloadProgress] = useState(0);
  const isPlayingRef = useRef(false);
  const filteredWords = new Set([
    // Articles
    'a', 'an', 'the',
    // Helping verbs
    'am', 'is', 'are', 'was', 'were', 'be', 'being', 'been',
    'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing',
    'will', 'would', 'shall', 'should', 'may', 'might', 'must',
    'can', 'could',
    // Prepositions
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'up', 'down', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'than', 'that', 'then', 'these',
    'those', 'through', 'until', 'unto', 'upon', 'with', 'without',
    'after', 'before', 'above', 'below', 'between', 'during',
    'without', 'within',
    // Conjunctions
    'and', 'or', 'but', 'so', 'for', 'nor', 'yet',
    // Common stop words
    'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them',
    'my', 'his', 'her', 'its', 'our', 'their',
    'what', 'which', 'who', 'whom', 'whose',
    'this', 'that', 'these', 'those',
    'is', 'are', 'was', 'were',
    'been', 'being',
    'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing',
    'will', 'would', 'shall', 'should', 'may', 'might', 'must',
    'can', 'could',
    'just', 'but', 'not', 'very', 'too',
    'get', 'gets', 'getting', 'got',
    'make', 'makes', 'making', 'made'
  ]);

  const loadAnimation = (url, name) => {
    return new Promise((resolve) => {
      if (clipsRef.current[name]) {
        resolve(true);
        return;
      }
      
      loaderRef.current.load(url, (gltf) => {
        if (gltf.animations && gltf.animations.length > 0) {
          const clip = gltf.animations[0];
          clip.name = name;
          clipsRef.current[name] = clip;
          console.log(`✅ Loaded: ${name}`);
          resolve(true);
        } else {
          console.log(`⚠️ No animation in: ${name}`);
          resolve(false);
        }
      }, undefined, () => {
        console.log(`❌ Not found: ${name}`);
        resolve(false);
      });
    });
  };
  const filterTranscript = (text) => {
    if (!text || text.length === 0) return [];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '') 
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const filteredWordsArray = words.filter(word => !filteredWords.has(word));
    
    console.log("\n📝 Original transcript:", text);
    console.log("🎯 Filtered words (sign language only):", filteredWordsArray.join(" → "));
    console.log(`🗑️ Removed ${words.length - filteredWordsArray.length} words (helping verbs, articles, prepositions, etc.)\n`);
    
    return filteredWordsArray;
  };

  const preloadAllAnimations = async (words) => {
    setIsPreloading(true);
    setPreloadProgress(0);
    const lettersNeeded = new Set();
    
    for (const word of words) {
     
      const wordLoaded = await loadAnimation(`/animations/${word}.glb`, `${word}_clip`);
      
      if (!wordLoaded) {
        
        const letters = word.split('');
        for (const letter of letters) {
          lettersNeeded.add(letter);
        }
      }
    }
    
    setPreloadProgress(50);
    
    if (lettersNeeded.size > 0) {
      console.log(`\n📦 Preloading ${lettersNeeded.size} letters...`);
      const letterPromises = Array.from(lettersNeeded).map(letter => 
        loadAnimation(`/alphabet/${letter}.glb`, `${letter}_clip`)
      );
      await Promise.all(letterPromises);
    }
    
    setPreloadProgress(100);
    setIsPreloading(false);
    
    console.log(`\n✅ Preload complete! Words: ${words.length}, Letters: ${lettersNeeded.size}\n`);
  };

  const playAnimation = (clipName) => {
    return new Promise((resolve) => {
      if (!mixerRef.current) {
        resolve();
        return;
      }
      
      const clip = clipsRef.current[clipName];
      if (!clip) {
        resolve();
        return;
      }

      mixerRef.current.stopAllAction();
      
      const action = mixerRef.current.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
      
      const duration = clip.duration * 1000;
      
      const onFinished = (e) => {
        if (e.action === action) {
          mixerRef.current.removeEventListener('finished', onFinished);
          resolve();
        }
      };
      
      mixerRef.current.addEventListener('finished', onFinished);
      
      setTimeout(() => {
        if (mixerRef.current) {
          mixerRef.current.removeEventListener('finished', onFinished);
        }
        resolve();
      }, duration + 50);
    });
  };

 

  const processWord = async (word, hasWordAnimation) => {
    if (hasWordAnimation) {
      console.log(`🎬 Signing word: "${word}"`);
      await playAnimation(`${word}_clip`);
      await new Promise(resolve => setTimeout(resolve, 150));
    } else {
      console.log(`🔤 Spelling word: "${word}"`);
      const letters = word.split('');
      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        console.log(`  Letter ${i+1}/${letters.length}: "${letter}"`);
        
        if (clipsRef.current[`${letter}_clip`]) {
          await playAnimation(`${letter}_clip`);
          if (i < letters.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } else {
          console.log(`  ⚠️ Missing animation for letter: ${letter}`);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const processTranscriptSequence = async (transcriptText) => {
    if (!transcriptText || transcriptText.length === 0 || !mixerRef.current || isPlayingRef.current) {
      return;
    }
    
    const words = filterTranscript(transcriptText);
    
    if (words.length === 0) {
      console.log("⚠️ No content words found after filtering");
      return;
    }
    
    console.log("\n=========================================");
    console.log("Starting sign language sequence from transcript");
    console.log("Content words to sign:", words.join(" → "));
    console.log("=========================================\n");
    
    isPlayingRef.current = true;
    
    try {
      await preloadAllAnimations(words);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      for (let i = 0; i < words.length; i++) {
        if (!isPlayingRef.current) break;
        
        const word = words[i];
        const hasWordAnimation = !!clipsRef.current[`${word}_clip`];
        
        console.log(`\n📖 Word ${i+1}/${words.length}: "${word}" ${hasWordAnimation ? '(sign)' : '(spell)'}`);
        await processWord(word, hasWordAnimation);
      }
      
      console.log("\n🎉 Sequence complete! 🎉\n");
    } catch (error) {
      console.error("Error during sequence:", error);
    } finally {
      isPlayingRef.current = false;
    }
  };

  useEffect(() => {
    if (!scene) {
      console.log("Waiting for avatar model to load...");
      return;
    }
    
    console.log("Avatar model loaded, setting up animation mixer...");
    mixerRef.current = new THREE.AnimationMixer(scene);
    
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        isPlayingRef.current = false;
      }
    };
  }, [scene]);

  useEffect(() => {
    let lastTime = performance.now();
    let frameId;
    
    const animate = () => {
      const currentTime = performance.now();
      let delta = Math.min(0.033, (currentTime - lastTime) / 1000); 
      lastTime = currentTime;
      
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
      
      frameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (transcript && transcript.length > 0 && mixerRef.current && !isPlayingRef.current) {
 
      if (window.sequenceTimeout) {
        clearTimeout(window.sequenceTimeout);
      }
      
      window.sequenceTimeout = setTimeout(() => {
        processTranscriptSequence(transcript);
      }, 500);
      
      return () => {
        if (window.sequenceTimeout) {
          clearTimeout(window.sequenceTimeout);
        }
      };
    }
  }, [transcript]);

  return (
    <group
      ref={group}
      position={[-1.1, 0, -1.5]}        
      scale={1.1}
      rotation={[0, Math.PI, 0]}  
    >
      <primitive object={scene} />
    </group>
  );
};

export const AvatarWithLoader = ({ transcript, gloss, sentences, glossSentences }) => {
  
  useEffect(() => {
  
    const interval = setInterval(() => {
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      <Avatar 
        transcript={transcript} 
        gloss={gloss} 
        sentences={sentences} 
        glossSentences={glossSentences}
      />
    </>
  );
};

export default AvatarWithLoader;