export type SessionRole = "staff" | "admin" | null;

export type Session = {
  role: SessionRole;
  userId?: number;
  email?: string;
};

let currentSession: Session = {
  role: null,
};

export function getSession(): Session {
  return currentSession;
}

export function setAdminSession(user: { id: number; email: string }) {
  currentSession = {
    role: "admin",
    userId: user.id,
    email: user.email,
  };
}

export function setStaffSession(user: { id: number; email: string }) {
  currentSession = {
    role: "staff",
    userId: user.id,
    email: user.email,
  };
}

export function clearSession() {
  currentSession = {
    role: null,
  };
}
