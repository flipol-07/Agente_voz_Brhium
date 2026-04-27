const { createHmac } = require('node:crypto');

const SESSION_COOKIE = 'brhium_voice_hub_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const APP_SESSION_SECRET = 'brhium-dev-secret';

function sign(value) {
  return createHmac('sha256', APP_SESSION_SECRET).update(value).digest('base64url');
}

function serialize(payload) {
  const base = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${base}.${sign(base)}`;
}

const user = {
  id: "user_admin",
  workspaceId: "workspace_brhium",
  role: "admin_agencia",
  email: "admin@brhium.demo",
  name: "Lucia Ramos",
  title: "Admin agencia",
};

const payload = {
  ...user,
  expiresAt: Date.now() + SESSION_TTL_MS,
};

console.log(serialize(payload));
