"use client";

import "../../page.css";
import "./continue.css";
import { useEffect, useState } from "react";
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Logo from "@/components//reusables/Logo";
import BetterInput from "@/components/reusables/BetterInput/BetterInput";
import Image from "next/image";


export default function Page() {

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useSignUp();
  const { signIn, setActive } = useSignIn();
  const { user, isSignedIn } = useUser(); // Hook to access current user and sign-in status
  const router = useRouter();


  useEffect(() => {
    if (isSignedIn) {
      router.replace("/me");
    } else if (signIn && signIn?.status !== "needs_identifier") {
      router.replace("/auth/sign-in");
    }
  }, [signUp, router, signIn, user]);

  // ===== Handlers =====

  // Handle completing the "continue sign-up" flow
  const handleContinue = async () => {
    if (!signIn || !signUp) return; // Safety check
    setIsLoading(true); // Show loading spinner

    try {
      // If first factor verification is transferable, create a session with the username
      if (signIn?.firstFactorVerification.status === "transferable") {
        const res = await signUp.create({
          transfer: true, 
          username: username,
        });

        if (res.status === "complete") {
          setActive({ session: res.createdSessionId }); 
        }
      }
      
      else if (signUp.status === "missing_requirements") {
        const res = await signUp?.update({
          username: username, // Update username
        });
        if (res.status === "complete") {
          setActive({ session: res.createdSessionId });
        }
      }

      window.location.href = `${window.location.origin}/me`;
    } catch (err: any) {
      setIsLoading(false); // Stop loading spinner
      console.error("Error completing sign-up:", err);
      setError(
        err.errors ? err.errors[0]?.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="auth-flow continue">
      <div className="inner-card ">
        <div className="auth-left">
          <Image
            src={"/images/collage_marvel2.jpg"}
            width={1920}
            height={1080}
            alt="collage of movies"
          />
        </div>

        <div className="auth-right">
          <div className="rs-inner">
            <Logo />
            <h1>Sign Up</h1>
            <p className="title-text">
              Please fill in the missing details to continue
            </p>
            
            <BetterInput
              type="text"
              placeholder="Username"
              value={username}
              onchange={setUsername}
              name="username"
            />
            <span className="span-separator"></span>
            
            {error && <p className="error-txt">{error}</p>}
            <div className="btn-container">
              <button
                disabled={isLoading || username.length < 4} // Disable if loading or username too short
                type="button"
                onClick={handleContinue}
                className={`auth-flow-btn ${
                  username.length >= 4 ? "active" : "inactive"
                } ${isLoading ? "loading" : ""}`}
              >
                {isLoading ? <Loader2 /> : <span>Continue</span>}{" "}
              </button>
            </div>
            
            <div id="clerk-captcha" />
          </div>
        </div>
      </div>
    </div>
  );
}
