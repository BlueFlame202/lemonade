import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Torus3D: React.FC = () => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Ensure mountRef.current is not null
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth / 4, window.innerHeight / 4);
        renderer.setClearColor(0xffffff); // Set background color to white

        mountRef.current.appendChild(renderer.domElement);

        const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0000,   // Base color
            metalness: 0.2,    // Semi-metallic
            roughness: 0.1,    // Fairly smooth surface
        });
        const torus = new THREE.Mesh(geometry, material);
        torus.castShadow = true;
        torus.receiveShadow = true;
        scene.add(torus);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(0.4, 0.4, 2);
        pointLight.castShadow = true;
        scene.add(pointLight);

        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            torus.rotation.x += 0.01;
            torus.rotation.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();

        // Clean up on component unmount
        return () => {
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100%' }}></div>;
};

export default Torus3D;