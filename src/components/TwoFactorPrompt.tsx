"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import QRCode from "qrcode";

interface TwoFactorPromptProps {
  threshold?: number;
  onDismiss?: () => void;
  onEnabled?: () => void;
}

export function TwoFactorPrompt({ 
  threshold = 3, 
  onDismiss, 
  onEnabled 
}: TwoFactorPromptProps) {
  const { data: session, update } = useSession();
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"prompt" | "setup" | "verify">("prompt");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Don't show if 2FA is already enabled or not enough sign-ins
  if (!session?.user) return null;
  if (session.user.twoFactorEnabled) return null;
  if (session.user.signInCount < threshold) return null;

  const handleStartSetup = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });

      if (res.ok) {
        const data = await res.json();
        const qrCodeUrl = await QRCode.toDataURL(data.secret);
        setQrCode(qrCodeUrl);
        setStep("setup");
      } else {
        setError("Failed to generate 2FA secret");
      }
    } catch (err) {
      setError("An error occurred");
    }
    
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", token }),
      });

      if (res.ok) {
        setStep("verify");
        // Update session to reflect 2FA enabled
        await update();
        onEnabled?.();
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err) {
      setError("An error occurred");
    }

    setLoading(false);
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {step === "prompt" && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Secure Your Account
              </h2>
              <p className="text-gray-600">
                You&apos;ve signed in {session.user.signInCount} times. We recommend enabling 
                two-factor authentication to protect your account.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleStartSetup}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? "Loading..." : "Enable 2FA Now"}
              </button>
              <button
                onClick={handleDismiss}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium"
              >
                Remind Me Later
              </button>
            </div>
          </>
        )}

        {step === "setup" && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Set Up Two-Factor Authentication
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm text-center">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded" />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter the 6-digit code from your app
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}
              
              <button
                onClick={handleVerify}
                disabled={loading || token.length !== 6}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
              
              <button
                onClick={() => setStep("prompt")}
                className="w-full text-gray-500 py-2 hover:text-gray-700"
              >
                ← Go Back
              </button>
            </div>
          </>
        )}

        {step === "verify" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              2FA Enabled!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account is now protected with two-factor authentication.
            </p>
            <button
              onClick={handleDismiss}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
