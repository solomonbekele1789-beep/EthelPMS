-- =============================================================
-- 1019: Chat module permissions
-- =============================================================

INSERT INTO identity.permissions (id, code, module, resource, action, display_name)
VALUES
    (gen_random_uuid(), 'chat.rooms.create',   'chat', 'rooms',    'create', 'Create chat rooms and channels'),
    (gen_random_uuid(), 'chat.rooms.read',     'chat', 'rooms',    'read',   'View chat rooms and conversations'),
    (gen_random_uuid(), 'chat.rooms.manage',   'chat', 'rooms',    'manage', 'Manage chat room participants and settings'),
    (gen_random_uuid(), 'chat.messages.send',  'chat', 'messages', 'send',   'Send chat messages'),
    (gen_random_uuid(), 'chat.messages.edit',  'chat', 'messages', 'edit',   'Edit own chat messages'),
    (gen_random_uuid(), 'chat.messages.delete','chat', 'messages', 'delete', 'Delete chat messages')
ON CONFLICT DO NOTHING;
