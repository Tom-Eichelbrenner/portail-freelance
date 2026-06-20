-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- users: each user sees only their own row
CREATE POLICY "users_own" ON users
  FOR ALL USING (id = auth.uid());

-- workspaces: owner only
CREATE POLICY "workspaces_owner" ON workspaces
  FOR ALL USING (user_id = auth.uid());

-- clients, projects, files, messages: scoped to the workspace owner
CREATE POLICY "clients_via_workspace" ON clients
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
  );

CREATE POLICY "projects_via_workspace" ON projects
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
  );

CREATE POLICY "files_via_workspace" ON files
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
  );

CREATE POLICY "messages_via_workspace" ON messages
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
  );
