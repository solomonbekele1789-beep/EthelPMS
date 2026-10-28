import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnDestroy {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);

  private subscription: Subscription | null = null;
  private hasView = false;

  @Input()
  set appHasRole(role: string) {
    this.subscription?.unsubscribe();
    this.subscription = this.permissionService.roles$.subscribe(() => {
      this.updateView(role);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateView(role: string): void {
    const hasRole = this.permissionService.hasRole(role);

    if (hasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
