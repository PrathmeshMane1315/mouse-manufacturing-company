import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

// 🎯 Components Import
import { MouseViewerComponent } from '../../threejs/mouse-viewer/mouse-viewer';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer'; // Footer Import

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MouseViewerComponent, NavbarComponent, Footer], // Footer added here
  templateUrl: './home.html', 
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('cursorGlow', { static: true }) cursorGlow!: ElementRef<HTMLDivElement>;
  @ViewChild('particlesContainer', { static: true }) particlesContainer!: ElementRef<HTMLDivElement>;
  
  @ViewChild('reveal1', { static: true }) reveal1!: ElementRef<HTMLDivElement>;
  @ViewChild('reveal2', { static: true }) reveal2!: ElementRef<HTMLDivElement>;
  @ViewChild('reveal3', { static: true }) reveal3!: ElementRef<HTMLParagraphElement>;
  @ViewChild('reveal4', { static: true }) reveal4!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private lenis!: Lenis;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      gsap.registerPlugin(ScrollTrigger);

      this.ngZone.runOutsideAngular(() => {
        this.initSmoothScroll();
        this.initParticles();
        this.initTextReveal();
        
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
      });
    }
  }

  private initSmoothScroll(): void {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
  }

  private onMouseMove(e: MouseEvent): void {
    gsap.to(this.cursorGlow.nativeElement, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.8,
      ease: "power3.out"
    });
  }

  private initTextReveal(): void {
    gsap.set([this.reveal1.nativeElement, this.reveal2.nativeElement], { y: 120, opacity: 0 });
    gsap.set(this.reveal3.nativeElement, { y: 40, opacity: 0 });
    gsap.set(this.reveal4.nativeElement, { y: 40, opacity: 0 });

    const tl = gsap.timeline({ delay: 0.3 });

    tl.to([this.reveal1.nativeElement, this.reveal2.nativeElement], {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out"
    })
    .to(this.reveal3.nativeElement, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out"
    }, "-=0.8")
    .to(this.reveal4.nativeElement, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out"
    }, "-=0.8");
  }

  private initParticles(): void {
    const container = this.particlesContainer.nativeElement;
    const particleCount = window.innerWidth < 768 ? 20 : 40;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      
      particle.style.position = 'absolute';
      particle.style.width = Math.random() * 3 + 'px';
      particle.style.height = particle.style.width;
      particle.style.backgroundColor = 'rgba(255, 255, 255, ' + (Math.random() * 0.3 + 0.1) + ')';
      particle.style.borderRadius = '50%';
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.top = Math.random() * 100 + 'vh';
      
      container.appendChild(particle);

      gsap.to(particle, {
        y: `-=${Math.random() * 200 + 100}`,
        x: `+=${Math.random() * 50 - 25}`,
        opacity: 0,
        duration: Math.random() * 5 + 5,
        repeat: -1,
        ease: "none",
        delay: Math.random() * 5
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('mousemove', this.onMouseMove.bind(this));
      if (this.lenis) {
        this.lenis.destroy();
      }
    }
  }
}