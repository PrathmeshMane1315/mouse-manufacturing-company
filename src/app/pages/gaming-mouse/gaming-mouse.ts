import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar'; 
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-gaming-mouse',
  standalone: true,
  imports: [NavbarComponent, Footer], 
  templateUrl: './gaming-mouse.html',
  styleUrls: ['./gaming-mouse.scss']
})
export class GamingMouse implements OnInit, AfterViewInit, OnDestroy {

  constructor() { }

  ngOnInit(): void {
    // Yahan initialization ka logic aayega
  }

  ngAfterViewInit(): void {
    // Yahan animations (GSAP) ka logic aayega
  }

  ngOnDestroy(): void {
    // Yahan cleanup ka logic aayega
  }
}