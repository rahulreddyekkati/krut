"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";

type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [info, setInfo] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setInfo(data.message || "If an account exists, a code was sent to that address.");
                setOtp("");
                setStep("otp");
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/verify-reset-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (res.ok) {
                setResetToken(data.resetToken);
                setError("");
                setStep("password");
            } else {
                setError(data.error || "Invalid or expired code");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resetToken, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setStep("done");
            } else {
                setError(data.error || "Failed to reset password");
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass animate-fade-in`}>
                <div className={styles.header}>
                    <h1 className="heading">Kruto Tastes</h1>
                    <p>Reset your password</p>
                </div>

                {step === "email" && (
                    <form onSubmit={handleRequestCode} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full">
                            {loading ? "Sending..." : "Send Reset Code"}
                        </button>
                        <Link href="/login" className={styles.forgotLink}>
                            Back to Login
                        </Link>
                    </form>
                )}

                {step === "otp" && (
                    <form onSubmit={handleVerifyOtp} className={styles.form}>
                        {info && <p style={{ fontSize: "0.875rem", color: "var(--secondary)", textAlign: "center" }}>{info}</p>}
                        {error && <div className={styles.error}>{error}</div>}
                        <div className={styles.inputGroup}>
                            <label htmlFor="otp">6-Digit Code</label>
                            <input
                                type="text"
                                id="otp"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary w-full">
                            {loading ? "Verifying..." : "Verify Code"}
                        </button>
                        <button
                            type="button"
                            className={styles.forgotLink}
                            style={{ background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => { setStep("email"); setError(""); }}
                        >
                            Resend code
                        </button>
                    </form>
                )}

                {step === "password" && (
                    <form onSubmit={handleResetPassword} className={styles.form}>
                        {error && <div className={styles.error}>{error}</div>}
                        <div className={styles.inputGroup}>
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full">
                            {loading ? "Saving..." : "Set New Password"}
                        </button>
                    </form>
                )}

                {step === "done" && (
                    <div className={styles.form}>
                        <p style={{ textAlign: "center", color: "var(--secondary)" }}>
                            Your password has been reset. You can now sign in with your new password.
                        </p>
                        <Link href="/login" className="btn btn-primary w-full" style={{ textAlign: "center" }}>
                            Back to Login
                        </Link>
                    </div>
                )}

                <div className={styles.footer}>
                    <p>Invite-only access system</p>
                </div>
            </div>
        </div>
    );
}
