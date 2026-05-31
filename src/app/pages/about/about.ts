import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChildren, QueryList, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar'; 
import { Footer } from '../../shared/footer/footer'; 

import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent, Footer], 
  templateUrl: './about.html',
  styleUrls: ['./about.scss']
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  private lenis: any;
  
  @ViewChildren('scrollBlock') blocks!: QueryList<ElementRef>;

  // 1. Yahan NgZone inject kiya
  constructor(private ngZone: NgZone) {} 

  ngAfterViewInit(): void {
    // 2. Animations aur scroll ko Angular ke bahar run kiya taaki lag na ho
    this.ngZone.runOutsideAngular(() => {
      
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const raf = (time: number) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      this.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      // Hero Animation
      gsap.from('.hero-content', {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.2
      });

      // Scroll Animations
      setTimeout(() => { 
        this.blocks.forEach((block) => {
          gsap.from(block.nativeElement, {
            scrollTrigger: {
              trigger: block.nativeElement,
              start: 'top 85%', 
              toggleActions: 'play none none reverse'
            },
            y: 60,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
          });
        });
      }, 100);

    });
  }

  ngOnDestroy(): void {
    if (this.lenis) {
      this.lenis.destroy();
    }
    ScrollTrigger.getAll().forEach(t => t.kill());
    gsap.ticker.remove((time) => { this.lenis.raf(time * 1000); });
  }
}