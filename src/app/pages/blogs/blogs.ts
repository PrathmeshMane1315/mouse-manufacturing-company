import { Component, AfterViewInit, OnDestroy, PLATFORM_ID, NgZone, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

import Lenis from '@studio-freight/lenis';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, NavbarComponent, Footer],
  templateUrl: './blogs.html',
  styleUrls: ['./blogs.scss']
})
export class BlogsComponent implements AfterViewInit, OnDestroy {
  private lenis: any;
  private rafId: any;

  // ✅ MODERN ANGULAR APPROACH: Bina @Inject decorator ke direct inject kiya
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  constructor() {}

  ngAfterViewInit(): void {
    // Check if running in browser (taaki server-side rendering me error na aaye)
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        
        this.lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        const raf = (time: number) => {
          this.lenis.raf(time);
          this.rafId = requestAnimationFrame(raf); 
        };
        this.rafId = requestAnimationFrame(raf); 
        
      });
    }
  }

  ngOnDestroy(): void {
    if (this.lenis) {
      this.lenis.destroy();
    }
    // Background animation loop ko kill kiya
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}