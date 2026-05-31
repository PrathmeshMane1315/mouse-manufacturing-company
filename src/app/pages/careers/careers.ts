import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

import Lenis from '@studio-freight/lenis';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, NavbarComponent, Footer],
  templateUrl: './careers.html',
  styleUrls: ['./careers.scss']
})
export class Careers implements AfterViewInit, OnDestroy {
  private lenis: any;

  // Angular ko batane ke liye ki hum Browser mein hain
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    // Ye check ensure karega ki SSR par error na aaye
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        
        // Lenis Smooth Scroll wapas aa gaya!
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
        
      });
    }
  }

  ngOnDestroy(): void {
    if (this.lenis) {
      this.lenis.destroy();
    }
  }
}