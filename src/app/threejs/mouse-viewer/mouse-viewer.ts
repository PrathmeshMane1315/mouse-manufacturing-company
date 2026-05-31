import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-mouse-viewer',
  standalone: true,
  templateUrl: './mouse-viewer.html',
  styleUrl: './mouse-viewer.scss'
})
export class MouseViewerComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;
  
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  
  private mouseGroup!: THREE.Group; 
  private interactiveGroup!: THREE.Group; 
  
  private animationFrameId!: number;

  private windowHalfX = 0;
  private windowHalfY = 0;
  private mouseX = 0;
  private mouseY = 0;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger); 

      this.ngZone.runOutsideAngular(() => {
        this.initThreeJs();
      });
    }
  }

  private initThreeJs(): void {
    const container = this.canvasContainer.nativeElement;
    
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 10); 

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; 
    container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const rimLight = new THREE.SpotLight(0x00d2ff, 30, 100, Math.PI / 4, 1);
    rimLight.position.set(-5, 5, -5);
    rimLight.lookAt(0, 0, 0);
    this.scene.add(rimLight);

    this.loadRealMouseModel();
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX - this.windowHalfX) * 0.001;
    this.mouseY = (event.clientY - this.windowHalfY) * 0.001;
  }

  private loadRealMouseModel(): void {
    this.mouseGroup = new THREE.Group();
    this.interactiveGroup = new THREE.Group(); 
    
    this.mouseGroup.add(this.interactiveGroup);
    this.scene.add(this.mouseGroup);

    const loader = new GLTFLoader();

    loader.load(
      'gaming-mouse.glb', 
      (gltf) => {
        const model = gltf.scene;
        
        const isMobile = window.innerWidth < 768;
        
        const startScale = isMobile ? 9 : 17;
        model.scale.set(startScale, startScale, startScale);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); 

        model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.interactiveGroup.add(model);
        
        const startX = isMobile ? 0 : 4.5;
        const startY = isMobile ? -2.8 : -0.2; 
        
        this.mouseGroup.position.set(startX, startY, 0); 
        this.mouseGroup.rotation.set(0.6, -0.8, 0); 

        this.setupScrollAnimation(model, isMobile);
        this.animate();
      },
      (xhr) => {},
      (error) => console.error('Error loading 3D model:', error)
    );
  }

  private setupScrollAnimation(model: THREE.Group, isMobile: boolean): void {
    const overallBox = new THREE.Box3().setFromObject(model);
    const overallCenter = new THREE.Vector3();
    overallBox.getCenter(overallCenter);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        // 🎯 Lenis ke sath sync karne ke liye 1.5 perfectly optimized speed hai
        scrub: 1.5 
      }
    });

    // 1. ROTATION
    tl.to(this.mouseGroup.rotation, {
      x: 0.2, 
      y: Math.PI * 2, 
      z: 0, 
      duration: 1, 
      ease: "none", // Strict Linear
    }, 0);

    // 2. POSITION & ZOOM 
    tl.to(this.mouseGroup.position, {
      z: isMobile ? 6.0 : 8.0,      
      x: isMobile ? -2.5 : -6.5,    
      y: isMobile ? -1.0 : -0.5,
      duration: 0.7, 
      ease: "none", // 🎯 FIX: 'power2.out' hatakar 'none' kiya taaki fast jhatka na lage
    }, 0);

    // 3. PARTS EXPLODE
    model.traverse((child: any) => {
      if (child.isMesh) {
        const childBox = new THREE.Box3().setFromObject(child);
        const childCenter = new THREE.Vector3();
        childBox.getCenter(childCenter);

        const direction = childCenter.clone().sub(overallCenter).normalize();
        if (direction.length() === 0) direction.set(0, 1, 0);

        const explodeDistance = 3.5; 

        tl.to(child.position, {
          x: child.position.x + (direction.x * explodeDistance),
          y: child.position.y + (direction.y * explodeDistance),
          z: child.position.z + (direction.z * explodeDistance),
          duration: 0.7, 
          ease: "none", // 🎯 FIX: 'none' se tukde ekdum smooth bikhrenge scroll ke sath
        }, 0);
      }
    });

    // 4. Smooth Vanish (Scale 0)
    tl.to(this.mouseGroup.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.3, 
      ease: "none" // 🎯 FIX: Pura linear fade-out
    }, 0.7); 
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    const time = Date.now() * 0.001;
    
    if (this.interactiveGroup) {
      this.interactiveGroup.rotation.y += 0.05 * (this.mouseX * 1.5 - this.interactiveGroup.rotation.y);
      this.interactiveGroup.rotation.x += 0.05 * (this.mouseY * 1.5 - this.interactiveGroup.rotation.x);
      this.interactiveGroup.position.y = Math.sin(time * 1.5) * 0.15;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.mouseGroup && this.interactiveGroup.children.length > 0) {
      const isMobile = window.innerWidth < 768;
      
      const currentScale = isMobile ? 9 : 17;
      const startX = isMobile ? 0 : 4.5;
      const startY = isMobile ? -2.8 : -0.2;

      this.interactiveGroup.children[0].scale.set(currentScale, currentScale, currentScale);
      this.mouseGroup.scale.set(1, 1, 1);

      if (window.scrollY < 50) {
        this.mouseGroup.position.set(startX, startY, 0);
      }

      ScrollTrigger.refresh();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onWindowResize.bind(this));
      document.removeEventListener('mousemove', this.onMouseMove.bind(this));
      cancelAnimationFrame(this.animationFrameId);
      this.renderer?.dispose();
    }
  }
}