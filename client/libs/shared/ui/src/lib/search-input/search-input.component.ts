import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <input matInput [placeholder]="placeholder" [(ngModel)]="value"
             (ngModelChange)="onInput($event)">
      @if (value) {
        <button matSuffix mat-icon-button (click)="clear()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  `,
  styles: [`.search-field { width: 100%; max-width: 400px; }`]
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() debounceMs = 300;
  @Output() search = new EventEmitter<string>();

  value = '';
  private subject = new Subject<string>();
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.subject.pipe(
      debounceTime(this.debounceMs),
      distinctUntilChanged()
    ).subscribe(term => this.search.emit(term));
  }

  onInput(value: string): void { this.subject.next(value); }
  clear(): void { this.value = ''; this.search.emit(''); }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
