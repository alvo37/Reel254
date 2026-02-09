"use client";

import "../page.css";
import "./style.css";
import React, { useEffect, useRef, useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Logo from "@/components/reusables/Logo";
import BetterInput from "@/components/reusables/BetterInput/BetterInput";

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");

  const [loading, setIsLoading] = useState(false);
  const [otpInputs, setOtpInputs] = useState(new Array(6).fill(""));

  const firstInputRef = useRef<HTMLInputElement>(null); // First OTP field focus
  const createButtonRef = useRef<HTMLButtonElement>(null); // Send code button ref
  const resetButtonRef = useRef<HTMLButtonElement>(null); // Reset password button ref

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  useEffect(() => {
    if (isSignedIn) {
    }
  }, [isSignedIn]);

  useEffect(() => {
    // Auto-focus first OTP field
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setCode(otpInputs.join(""));
  }, [otpInputs]);

  useEffect(() => {
    if (code.length === 6) {
      reset();
    }
  }, [code]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !successfulCreation) {
        createButtonRef.current?.click();
      } else if (e.key === "Enter" && successfulCreation) {
        resetButtonRef.current?.click();
      }
    };

    document.addEventListener("keypress", handleKeyPress);
    return () => document.removeEventListener("keypress", handleKeyPress);
  }, [successfulCreation]);

  if (!isLoaded) {
    return null;
  }

  // ---------- Step 1: Send reset code ----------
  async function create() {
    setIsLoading(true);
    await signIn
      ?.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      })
      .then(() => {
        setSuccessfulCreation(true);
        setError("");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
        setIsLoading(false);
      });
  }

  // ---------- Step 2: Reset password ----------
  async function reset() {
    setIsLoading(true);
    await signIn
      ?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: password.trim(),
      })
      .then((result) => {
        if (result.status === "needs_second_factor") {
          setSecondFactor(true);
          setError("");
        } else if (result.status === "complete") {
          setActive({ session: result.createdSessionId });
          setError("");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("error", err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
        setIsLoading(false);
      });
  }

  // ---------- OTP Input Handlers ----------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newValue = e.target.value;
    if (isNaN(Number(newValue))) return;
    if (newValue === "") return;

    setOtpInputs((prev) => {
      const updated = [...prev];
      updated[index] = newValue;
      return updated;
    });

    if (newValue && e.target.nextSibling) {
      const nextInput = e.target.nextSibling as HTMLInputElement;
      setTimeout(() => {
        nextInput.focus();
        nextInput.select();
      }, 10);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      setOtpInputs((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });

      if (e.currentTarget.previousSibling) {
        const prevInput = e.currentTarget.previousSibling as HTMLInputElement;
        setTimeout(() => {
          prevInput.focus();
          prevInput.select();
        }, 10);
      }
    }
  };

  // ---------- Render ----------
  return (
    <div className="auth-flow">
      <div className="inner-card">
        <div className="auth-left"></div>
        <div className="auth-right">
          <div className="rs-inner">
            <Logo />
            <h1>Forgot Password?</h1>
            <div>
              {!successfulCreation && (
                <>
                  <label htmlFor="email" className="reset-txt">
                    Please provide your email address
                  </label>
                  <BetterInput
                    type="email"
                    name="email"
                    placeholder="e.g john@doe.com"
                    onchange={setEmail}
                    classList=""
                    value={email}
                  />
                  {error && <p className="error-txt">{error}</p>}

                  <div className="btn-container">
                    <button
                      ref={createButtonRef}
                      className={`auth-flow-btn ${loading ? "loading" : ""}`}
                      onClick={create}
                    >
                      {loading ? <Loader2 /> : "Send Code"}
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Enter password + OTP */}
              {successfulCreation && (
                <>
                  <label htmlFor="password">Enter your new password</label>
                  <BetterInput
                    name="password"
                    type="password"
                    classList=""
                    value={password}
                    onchange={setPassword}
                    placeholder="New Password"
                  />

                  <label htmlFor="password" className="reset-txt">
                    Enter the code we sent to <span>{email}</span>
                  </label>

                  <div className="input-fields-container">
                    {otpInputs.map((data, i) => (
                      <input
                        key={i}
                        type="text"
                        ref={i === 0 ? firstInputRef : undefined}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        className="otp-input"
                        value={data}
                        maxLength={1}
                        onChange={(e) => handleChange(e, i)}
                        placeholder="•"
                        title={`OTP Digit ${i + 1}`}
                        aria-label={`OTP Digit ${i + 1}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    ))}
                  </div>

                  {error && <p className="error-txt">{error}</p>}

                  <div className="btn-container">
                    <button
                      ref={resetButtonRef}
                      className={`auth-flow-btn ${loading ? "loading" : ""}`}
                      onClick={reset}
                    >
                      {loading ? <Loader2 /> : "Reset"}
                    </button>
                  </div>
                </>
              )}

              {secondFactor && (
                <p>2FA is required, but this UI does not handle that</p>
              )}
            </div>
            <div id="clerk-captcha" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
