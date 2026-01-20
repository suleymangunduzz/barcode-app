export type SessionRole = "staff" | "admin" | null;

export type Session = {
  role: SessionRole;
  userId?: number;
  email?: string;
  name?: string;
};

let currentSession: Session = {
  role: null,
};

export function getSession(): Session {
  return currentSession;
}

export function setAdminSession(user: {
  id: number;
  email: string;
  name?: string;
}) {
  currentSession = {
    role: "admin",
    userId: user.id,
    email: user.email,
    name: user.name,
  };
}

export function setStaffSession(user: {
  id: number;
  email: string;
  name?: string;
}) {
  currentSession = {
    role: "staff",
    userId: user.id,
    email: user.email,
    name: user.name,
  };
}

export function clearSession() {
  currentSession = {
    role: null,
  };
}
