import { Routes } from '@angular/router';

// 🏠 Home
import { HomeComponent } from './pages/home/home';

// 🖱️ Products Section
import { Products } from './pages/products/products';
import { GamingMouse } from './pages/gaming-mouse/gaming-mouse';
import { OfficeMouse } from './pages/office-mouse/office-mouse';
import { WirelessMouse } from './pages/wireless-mouse/wireless-mouse';

// ⚙️ Core Information
import { Technology } from './pages/technology/technology';
import { Manufacturing } from './pages/manufacturing/manufacturing';
import { Certifications } from './pages/certifications/certifications';

// 🏢 Company & Others
import { AboutComponent } from './pages/about/about';
import { Careers } from './pages/careers/careers';
import { BlogsComponent } from './pages/blogs/blogs'; // ✅ Fix: BlogsComponent ka sahi import
import { Contact } from './pages/contact/contact';

// 🚀 Main Routes Array (Sirf ek hi baar hona chahiye)
export const routes: Routes = [
  // 🏠 Home Page
  { path: '', component: HomeComponent },
  
  // 🖱️ Products Section
  { path: 'products', component: Products },
  { path: 'products/gaming-mouse', component: GamingMouse },
  { path: 'products/office-mouse', component: OfficeMouse },
  { path: 'products/wireless-mouse', component: WirelessMouse },
  
  // ⚙️ Core Information
  { path: 'technology', component: Technology },
  { path: 'manufacturing', component: Manufacturing },
  { path: 'certifications', component: Certifications },
  
  // 🏢 Company & Others
  { path: 'about', component: AboutComponent },
  { path: 'careers', component: Careers },
  { path: 'blogs', component: BlogsComponent }, // ✅ Fix: Yahan BlogsComponent use kiya
  { path: 'contact', component: Contact },

  // 🚨 404 Fallback (Koi galat URL daale toh home par bhej do)
  { path: '**', redirectTo: '' }
];