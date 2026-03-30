"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "@/app/login/login.module.css";

export default function InvitePage() {
    const params = useParams();
    const token = params.token as string;
    const [inviteData, setInviteData] = useState<any>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchInvite() {
            try {
                const res = await fetch(`/api/invites/${token}`);
                if (res.ok) {
                    const data = await res.json();
                    setInviteData(data);
                } else {
                    setError("This invite is invalid or has expired.");
                }
            } catch (err) {
                setError("Failed to load invite.");
            } finally {
                setLoading(false);
            }
        }
        fetchInvite();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    password,
                    name,
                    email: inviteData.email
                }),
            });

            if (res.ok) {
                router.push("/login?message=Account created successfully");
            } else {
                const data = await res.json();
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !inviteData) return <div>Loading...</div>;
    if (error && !inviteData) return <div className="container">{error}</div>;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass animate-fade-in`}>
                <div className={styles.header}>
                    <h1 className="heading">Complete Your Profile</h1>
                    <p>Welcome! You've been invited as a <strong>{inviteData.role}</strong> by {inviteData.invitedBy}.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input type="text" value={inviteData.email} disabled />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Create Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? "Activating..." : "Activate Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
