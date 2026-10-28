import { Routes } from '@angular/router';
import { authGuard, moduleGuard } from '@ethelpms/shared/core';

export const routes: Routes = [
  // ── Auth pages (auth-layout: centered card) ──────────────────────────
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component'),
    children: [
      {
        path: 'login',
        loadComponent: () => import('@ethelpms/modules/identity').then(m => m.LoginComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('@ethelpms/modules/identity').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('@ethelpms/modules/identity').then(m => m.ResetPasswordComponent)
      },
      {
        path: 'setup-password',
        loadComponent: () => import('@ethelpms/modules/identity').then(m => m.SetupPasswordComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // ── Authenticated pages (main-layout: sidebar + topbar + content) ────
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component'),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component')
      },
      {
        path: 'unauthorized',
        loadComponent: () => import('./pages/unauthorized/unauthorized.component')
      },
      {
        path: 'module-not-available',
        loadComponent: () => import('./pages/module-not-available/module-not-available.component')
      },

      // ── Phase 0A/0B: Identity module ─────────────────────────────────
      {
        path: 'users',
        loadChildren: () => import('@ethelpms/modules/identity').then(m => m.userRoutes)
      },
      {
        path: 'roles',
        loadChildren: () => import('@ethelpms/modules/identity').then(m => m.roleRoutes)
      },
      {
        path: 'offices',
        loadChildren: () => import('@ethelpms/modules/identity').then(m => m.officeRoutes)
      },
      {
        path: 'locations',
        loadChildren: () => import('@ethelpms/modules/identity').then(m => m.locationRoutes)
      },
      {
        path: 'settings/organization',
        loadComponent: () => import('@ethelpms/modules/identity').then(m => m.OrganizationSettingsComponent)
      },

      // ── Phase 2: Projects module ─────────────────────────────────────
      {
        path: 'projects',
        canActivate: [moduleGuard('projects')],
        loadChildren: () => import('@ethelpms/modules/projects').then(m => m.projectRoutes)
      },

      // ── Phase 3: Planning module ─────────────────────────────────────
      {
        path: 'planning',
        canActivate: [moduleGuard('planning')],
        loadChildren: () => import('@ethelpms/modules/planning').then(m => m.planningRoutes)
      },

      // ── Phase 4: Reporting module ────────────────────────────────────
      {
        path: 'reporting',
        canActivate: [moduleGuard('reporting')],
        loadChildren: () => import('@ethelpms/modules/reporting').then(m => m.reportingRoutes)
      },

      // ── Phase 5: MEAL module ─────────────────────────────────────────
      {
        path: 'meal',
        canActivate: [moduleGuard('meal')],
        loadChildren: () => import('@ethelpms/modules/meal').then(m => m.mealRoutes)
      },

      // ── Phase 6: Participants module ─────────────────────────────────
      {
        path: 'participants',
        canActivate: [moduleGuard('participants')],
        loadChildren: () => import('@ethelpms/modules/participants').then(m => m.participantRoutes)
      },

      // ── Phase 7A: Procurement module ─────────────────────────────────
      {
        path: 'procurement',
        canActivate: [moduleGuard('procurement')],
        loadChildren: () => import('@ethelpms/modules/procurement').then(m => m.procurementRoutes)
      },

      // ── Phase 7B: Fund Accounting module ─────────────────────────────
      {
        path: 'finance',
        canActivate: [moduleGuard('fund-accounting')],
        loadChildren: () => import('@ethelpms/modules/fund-accounting').then(m => m.fundAccountingRoutes)
      },

      // ── Phase 7C: Assets module ──────────────────────────────────────
      {
        path: 'assets',
        canActivate: [moduleGuard('assets')],
        loadChildren: () => import('@ethelpms/modules/assets').then(m => m.assetRoutes)
      },

      // ── Phase 8A: Training module ────────────────────────────────────
      {
        path: 'training',
        canActivate: [moduleGuard('training')],
        loadChildren: () => import('@ethelpms/modules/training').then(m => m.trainingRoutes)
      },

      // ── Phase 8B: Tasks module ───────────────────────────────────────
      {
        path: 'tasks',
        canActivate: [moduleGuard('tasks')],
        loadChildren: () => import('@ethelpms/modules/tasks').then(m => m.taskRoutes)
      },

      // ── Phase 8C: Risk module ────────────────────────────────────────
      {
        path: 'risk',
        canActivate: [moduleGuard('risk')],
        loadChildren: () => import('@ethelpms/modules/risk').then(m => m.riskRoutes)
      },

      // ── Phase 8D: Donors module ──────────────────────────────────────
      {
        path: 'donors',
        canActivate: [moduleGuard('donors')],
        loadChildren: () => import('@ethelpms/modules/donors').then(m => m.donorRoutes)
      },

      // ── Phase 9A: Chat module ────────────────────────────────────────
      {
        path: 'chat',
        canActivate: [moduleGuard('chat')],
        loadChildren: () => import('@ethelpms/modules/chat').then(m => m.chatRoutes)
      },

      // ── Phase 9B: Notifications module ───────────────────────────────
      {
        path: 'notifications',
        canActivate: [moduleGuard('notifications')],
        loadChildren: () => import('@ethelpms/modules/notifications').then(m => m.notificationRoutes)
      },

      // ── Phase 9C: Documents module ───────────────────────────────────
      {
        path: 'documents',
        canActivate: [moduleGuard('documents')],
        loadChildren: () => import('@ethelpms/modules/documents').then(m => m.documentRoutes)
      },

      // ── Phase 9D: Feedback module ────────────────────────────────────
      {
        path: 'feedback',
        canActivate: [moduleGuard('feedback')],
        loadChildren: () => import('@ethelpms/modules/feedback').then(m => m.feedbackRoutes)
      },

      // ── Phase 10A: Dashboards module ─────────────────────────────────
      {
        path: 'dashboards',
        canActivate: [moduleGuard('dashboards')],
        loadChildren: () => import('@ethelpms/modules/dashboards').then(m => m.dashboardRoutes)
      },

      // ── Phase 10B: Settings module ───────────────────────────────────
      {
        path: 'settings',
        canActivate: [moduleGuard('settings')],
        loadChildren: () => import('@ethelpms/modules/settings').then(m => m.settingsRoutes)
      },

      // ── Phase 10C: Knowledge Base module ─────────────────────────────
      {
        path: 'knowledge',
        canActivate: [moduleGuard('knowledge')],
        loadChildren: () => import('@ethelpms/modules/knowledge').then(m => m.knowledgeRoutes)
      },

      // ── Phase 10D: Partnerships module ───────────────────────────────
      {
        path: 'partnerships',
        canActivate: [moduleGuard('partnerships')],
        loadChildren: () => import('@ethelpms/modules/partnerships').then(m => m.partnershipRoutes)
      },

      // ── Phase 10E: System Reports module ─────────────────────────────
      {
        path: 'reports',
        canActivate: [moduleGuard('reports')],
        loadChildren: () => import('@ethelpms/modules/reports').then(m => m.reportRoutes)
      },

      // ── Phase 10F: Import/Export module ──────────────────────────────
      {
        path: 'import-export',
        canActivate: [moduleGuard('import-export')],
        loadChildren: () => import('@ethelpms/modules/import-export').then(m => m.importExportRoutes)
      },
    ]
  },

  // ── Wildcard fallback ────────────────────────────────────────────────
  { path: '**', redirectTo: 'auth/login' }
];
