export type SessionRole = "staff" | "admin";

export type Session = {
  role: SessionRole;
  userId?: number;
  email?: string;
};

let currentSession: Session = {
  role: "staff",
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

export function clearSession() {
  currentSession = {
    role: "staff",
  };
}
