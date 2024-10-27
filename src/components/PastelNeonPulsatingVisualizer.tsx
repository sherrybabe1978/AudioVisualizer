// src/components/PastelNeonPulsatingVisualizer.tsx

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import styles from '../styles/PastelNeonPulsatingVisualizer.module.css';

interface PastelNeonPulsatingVisualizerProps {
  analyserNode: AnalyserNode;
}

const PastelNeonPulsatingVisualizer: React.FC<PastelNeonPulsatingVisualizerProps> = ({ analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || isSetup) return;

    console.log('Initializing PastelNeonPulsatingVisualizer');

    const canvas = canvasRef.current;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    // Set renderer to correct pixel ratio
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    // Scene and Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // Geometry and Material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2() },
        u_bass: { value: 0.0 },
        u_mid: { value: 0.0 },
        u_treble: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_bass;
        uniform float u_mid;
        uniform float u_treble;
        varying vec2 vUv;

        #define PI 3.14159265359

        vec3 pastelNeon(float t) {
          // Pastel neon color palette
          vec3 a = vec3(0.95, 0.75, 0.95);  // Soft pink
          vec3 b = vec3(0.70, 0.95, 0.95);  // Soft cyan
          vec3 c = vec3(0.95, 0.95, 0.75);  // Soft yellow
          vec3 d = vec3(0.80, 0.70, 0.95);  // Soft lavender

          return a + b * cos(2.0 * PI * (c * t + d));
        }

        float sdCircle(vec2 p, float r) {
          return length(p) - r;
        }

        void main() {
          vec2 st = (vUv * 2.0) - 1.0; // Map vUv from [0,1] to [-1,1]
          st.x *= u_resolution.x / u_resolution.y; // Correct aspect ratio

          float t = u_time * 0.5;
          
          // Create pulsating circles
          float d1 = sdCircle(st, 0.3 + 0.1 * sin(t * 2.0 + u_bass * 5.0));
          float d2 = sdCircle(st, 0.5 + 0.1 * sin(t * 1.5 + u_mid * 4.0));
          float d3 = sdCircle(st, 0.7 + 0.1 * sin(t + u_treble * 3.0));

          // Create morphing effect
          float angle = atan(st.y, st.x);
          float distortion = sin(angle * 8.0 + t * 3.0) * 0.1 * (u_bass + u_mid + u_treble);

          d1 += distortion * 0.3;
          d2 += distortion * 0.2;
          d3 += distortion * 0.1;

          // Smooth the circles
          float s1 = smoothstep(0.01, 0.0, d1);
          float s2 = smoothstep(0.01, 0.0, d2);
          float s3 = smoothstep(0.01, 0.0, d3);

          // Create pastel neon colors based on audio input
          vec3 color1 = pastelNeon(u_bass);
          vec3 color2 = pastelNeon(u_mid + 0.33);
          vec3 color3 = pastelNeon(u_treble + 0.66);

          // Mix colors for final output
          vec3 finalColor = mix(color1 * s1, color2, s2);
          finalColor = mix(finalColor, color3, s3);

          // Add glow effect
          float glow = exp(-length(st) * 2.0) * (u_bass + u_mid + u_treble) * 0.5;
          finalColor += vec3(0.9, 0.9, 1.0) * glow;

          // Softening the overall look
          finalColor = pow(finalColor, vec3(0.85));

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Handle Resize
    const resizeRenderer = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;

      renderer.setSize(width, height, false);
      renderer.setPixelRatio(pixelRatio);

      material.uniforms.u_resolution.value.set(width * pixelRatio, height * pixelRatio);

      // Update camera aspect ratio if needed
      camera.left = -width / height;
      camera.right = width / height;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', resizeRenderer);
    resizeRenderer();

    // Animation Loop
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = (time: number) => {
      requestAnimationFrame(animate);

      analyserNode.getByteFrequencyData(dataArray);

      // Calculate frequency data
      const bass = dataArray.slice(0, 8).reduce((a, b) => a + b, 0) / (8 * 255);
      const mid = dataArray.slice(8, 24).reduce((a, b) => a + b, 0) / (16 * 255);
      const treble = dataArray.slice(24).reduce((a, b) => a + b, 0) / ((bufferLength - 24) * 255);

      // Optional: Log audio data for debugging
      // console.log(`Bass: ${bass.toFixed(2)}, Mid: ${mid.toFixed(2)}, Treble: ${treble.toFixed(2)}`);

      material.uniforms.u_time.value = time * 0.001;
      material.uniforms.u_bass.value = bass;
      material.uniforms.u_mid.value = mid;
      material.uniforms.u_treble.value = treble;

      renderer.render(scene, camera);
    };

    animate(0);

    setIsSetup(true);

    return () => {
      console.log('Cleaning up PastelNeonPulsatingVisualizer');

      window.removeEventListener('resize', resizeRenderer);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [analyserNode, isSetup]);

  return <canvas ref={canvasRef} className={styles.visualizer} />;
};

export default PastelNeonPulsatingVisualizer;
