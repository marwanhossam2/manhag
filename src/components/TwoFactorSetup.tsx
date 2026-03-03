"use client";

import { useState } from "react";
import QRCode from "qrcode";

export function TwoFactorSetup() {
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "setup" | "verified">("idle");

  const handleGenerate = async () => {
    const res = await fetch("/api/auth/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });

    if (res.ok) {
      const data = await res.json();
      const qrCodeUrl = await QRCode.toDataURL(data.secret);
      setQrCode(qrCodeUrl);
      setStatus("setup");
    }
  };

  const handleVerify = async () => {
    const res = await fetch("/api/auth/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", token }),
    });

    if (res.ok) {
      setStatus("verified");
    } else {
      alert("Invalid 2FA token");
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-2xl font-bold mb-4">Two-Factor Authentication</h3>

      {status === "idle" && (
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enable 2FA
        </button>
      )}

      {status === "setup" && (
        <div className="space-y-4">
          <p>Scan the QR code below with your Authenticator app (e.g., Google Authenticator, Authy).</p>
          <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />

          <div>
            <label className="block text-sm font-medium">Verification Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="border px-3 py-2 rounded w-48 mt-1"
            />
          </div>

          <button
            onClick={handleVerify}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Verify & Enable
          </button>
        </div>
      )}

      {status === "verified" && (
        <p className="text-green-600 font-bold">2FA is successfully enabled on your account.</p>
      )}
    </div>
  );
}
