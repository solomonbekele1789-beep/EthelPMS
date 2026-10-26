// Pages (for lazy loading in app.routes.ts)
export { default as LoginComponent } from './lib/pages/login/login.component';
export { default as SetupPasswordComponent } from './lib/pages/setup-password/setup-password.component';
export { default as ForgotPasswordComponent } from './lib/pages/forgot-password/forgot-password.component';
export { default as ResetPasswordComponent } from './lib/pages/reset-password/reset-password.component';
export { default as OrganizationSettingsComponent } from './lib/pages/organization-settings/organization-settings.component';

// Routes
export { userRoutes, roleRoutes, officeRoutes, locationRoutes } from './lib/routes';

// Services (for use by other modules if needed)
export { UserService } from './lib/services/user.service';
export { RoleService } from './lib/services/role.service';
export { OfficeService } from './lib/services/office.service';
export { LocationService } from './lib/services/location.service';
export { OrganizationService } from './lib/services/organization.service';

// Models
export * from './lib/models/user.model';
export * from './lib/models/role.model';
export * from './lib/models/office.model';
export * from './lib/models/location.model';
export * from './lib/models/organization.model';
