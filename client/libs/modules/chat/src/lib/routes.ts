import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { permissionGuard } from '@ethelpms/shared/core';
import { CHAT_FEATURE_KEY, chatReducer } from './store/chat.reducer';
import { ChatEffects } from './store/chat.effects';

export const chatRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState(CHAT_FEATURE_KEY, chatReducer),
      provideEffects([ChatEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/room-list/room-list.component'),
        data: { permission: 'chat.rooms.read' },
        canActivate: [permissionGuard],
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/room-create/room-create.component'),
        data: { permission: 'chat.rooms.create' },
        canActivate: [permissionGuard],
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/room-detail/room-detail.component'),
        data: { permission: 'chat.rooms.read' },
        canActivate: [permissionGuard],
      },
      {
        path: ':id/thread/:messageId',
        loadComponent: () => import('./pages/message-thread/message-thread.component'),
        data: { permission: 'chat.messages.read' },
        canActivate: [permissionGuard],
      },
    ],
  },
];
