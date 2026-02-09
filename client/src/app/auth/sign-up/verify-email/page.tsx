"use client";

import "./verify.css";
import "../../page.css";
import { useEffect, useRef, useState } from "react";
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { customToast } from "@/utils/utilities";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Logo from "@/components/reusables/Logo";
import Image from "next/image";

export default function Page() {
  const [otpInputs, setOtpInputs] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [loading, setIsLoading] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const { user, isSignedIn } = useUser(); // Access current user info

  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
    } else if (signUp && signUp?.status !== "missing_requirements") {
    }
  }, [signUp, router, signIn, user, isSignedIn]);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // Combine OTP digits whenever otpInputs array changes
  useEffect(() => {
    setCode(otpInputs.join(""));
  }, [otpInputs]);

  useEffect(() => {
    if (code.length === 6) {
      handleVerification();
    }
  }, [code]);

  const handleVerification = async () => {
    const code = otpInputs.join("");
    setIsLoading(true);

    if (code.length < 6) {
      setError("Please enter a 6-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      await signUp?.attemptEmailAddressVerification({ code });
      window.location.href = `${window.location.origin}/me`;
      customToast("Email verified! Welcome.", "success");
    } catch (err: any) {
      setError(
        err.errors ? err.errors[0]?.message : "Invalid code. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newValue = e.target.value;

    if (isNaN(Number(newValue))) return;
    if (newValue === "") return;

    setOtpInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[index] = newValue;
      return updatedInputs;
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
      setOtpInputs((prevInputs) => {
        const updatedInputs = [...prevInputs];
        updatedInputs[index] = "";
        return updatedInputs;
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

  return (
    <div className="auth-flow">
      <div className="inner-card continue">
        <div className="auth-left">
          <Image
            src={"/images/collage_marvel.jpg"}
            width={1920}
            height={1080}
            alt="collage of movies"
          />
        </div>
        <div className="auth-right">
          <div className="rs-inner">
            <Logo />
            <h1>Please check your email</h1>
            <p className="title-text">
              We've sent a code to <span>{signUp?.emailAddress}</span>
            </p>
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
                />
              ))}
            </div>
            <div className="btn-container">
              <button
                disabled={loading || code.length !== 6}
                onClick={handleVerification}
                className={`auth-flow-btn ${
                  code.length === 6 ? "active" : "inactive"
                }`}
              >
                {loading ? <Loader2 /> : <span>Verify</span>}{" "}
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div id="clerk-captcha" />
          </div>
        </div>
      </div>
    </div>
  );
}
