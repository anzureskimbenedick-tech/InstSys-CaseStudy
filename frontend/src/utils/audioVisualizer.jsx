import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";

export default function AudioVisualizer({ toggleHolo, toggleMic, audioStream }) {
  const mountRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    console.log("AudioVisualizer mounted");
    if (!mountRef.current || mountRef.current.hasChildNodes()) return;

    const current = mountRef.current;
    const width = current.clientWidth;
    const height = current.clientHeight;

    let analyser = audioStream?.analyser;
    let dataArray = audioStream?.dataArray;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(100, width / height, 0.1, 1000);
    camera.position.z = 200;
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    current.appendChild(renderer.domElement);

    const handleResize = () => {
      const w = current.clientWidth;
      const h = current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    const light = new THREE.DirectionalLight("#ffffff", 1);
    light.position.set(50, 100, 50);
    const ambient = new THREE.AmbientLight("#ffffff", 0.2);
    scene.add(light, ambient);

    const geometry = new THREE.IcosahedronGeometry(130, 2);
    const material = new THREE.MeshLambertMaterial({
      wireframe: true,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    if (audioStream) {
      console.log("AudioStream detected", audioStream);
      const bufferLength = audioStream.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      setIsSpeaking((prev) => !prev);
      console.log("dataArray created with length:", bufferLength);
    }
    console.log("speaking:", isSpeaking);

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Always rotate
      sphere.rotation.x += 0.002;
      sphere.rotation.y += 0.002;

      // Audio-based updates
      let analyser = audioStream?.analyser;
      let dataArray = audioStream?.dataArray;

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);

        const avg =
          dataArray.reduce((a, b) => a + b, 0) / dataArray.length || 0;
        const scale = 1 + avg / 1000;
        sphere.scale.set(scale, scale, scale);

        const rotationSpeed = 0.001 + avg / 5000;
        sphere.rotation.x += rotationSpeed;
        sphere.rotation.y += rotationSpeed;
        if (avg > 0) setIsSpeaking(true);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      console.log("AudioVisualizer unmounting");
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && current.contains(renderer.domElement))
        current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [audioStream]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // start off-screen & invisible
      animate={{ opacity: 1, y: 0 }} // fade and slide up into view
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ opacity: 0 }} // prevents flash before motion kicks in
      className="flex flex-row w-screen h-screen p-2"
    >
      {/* Toggle Button (top-right) */}
      <button
        onClick={() => {
          toggleHolo();
          toggleMic();
        }}
        title="exit"
        className="fixed top-5 right-5 w-[3vw] rounded-full aspect-square bg-gray-500/30 shadow-black/40 shadow-lg hover:scale-102 duration-300 cursor-pointer"
      >
        <img src="./ico/white-cross.svg" alt="" />
      </button>

      {/* Main 3D scene area */}
      <div className="flex rounded-2xl flex-grow" ref={mountRef}></div>
    </motion.div>
  );
}
