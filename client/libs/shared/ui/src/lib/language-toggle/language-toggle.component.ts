import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [MatButtonToggleModule],
  template: `
    <mat-button-toggle-group [value]="currentLang()" (change)="switchLang($event.value)">
      <mat-button-toggle value="en">EN</mat-button-toggle>
      <mat-button-toggle value="am">&#x12A0;&#x121B;</mat-button-toggle>
    </mat-button-toggle-group>
  `
})
export class LanguageToggleComponent {
  private readonly translate = inject(TranslateService);
  readonly currentLang = signal(String(this.translate.currentLang || 'en'));

  switchLang(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    document.documentElement.setAttribute('dir', lang === 'am' ? 'ltr' : 'ltr');
    // Amharic uses LTR (Ge'ez script is left-to-right)
  }
}
