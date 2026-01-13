import { useState } from "react";

type Props = {
  onSignup: () => void;
  onClose: () => void;
};

export default function SignupModal({ onSignup, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const result = await window.api.signupFirstAdmin({ name, email, password });
    if (result.success) onSignup();
    else alert(result.error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-800 p-6 rounded-lg w-96">
        <h2 className="text-xl mb-4">Register First Admin</h2>
        <input
          className="w-full p-2 mb-2 rounded bg-slate-700"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-2 mb-2 rounded bg-slate-700"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 rounded bg-slate-700"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button className="bg-slate-600 px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-blue-600 px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
