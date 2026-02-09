"use client";

import "../../page.css";
import { GoogleSvg } from "@/assets/icons";
import Logo from "@/components/reusables/Logo";
import BetterInput from "@/components/reusables/BetterInput/BetterInput";
import { customToast, validatePassword } from "@/utils/utilities";
import { useSignIn, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";


export default function Page() {
  
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useSignIn();
  const { isSignedIn } = useUser();
  const router = useRouter();

  
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const googleButtonRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    if (isSignedIn) {
      router.replace("/home");
    }
  }, [isSignedIn, router]);

  // Live password validation on input change
  useEffect(() => {
    if (password.trim().length === 0) return;
    const message = validatePassword(password);
    setError(message !== true ? message : "");
  }, [password]);


  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && loginButtonRef.current) {
        loginButtonRef.current.click();
      }
    };
    document.addEventListener("keypress", handleKeyPress);
    return () => document.removeEventListener("keypress", handleKeyPress);
  }, []);


  const handleOAuthSignIn = async (
    strategy: "oauth_google" | "oauth_facebook" | "oauth_apple"
  ) => {
    setLoading(true);
    customToast("Signing In", "creating");
    const url = window.location.origin;
    try {
      await signIn?.authenticateWithRedirect({
        strategy,
        redirectUrl: `${url}/auth/sign-up/continue`,
        redirectUrlComplete: `${url}/me`,
      });
    } catch (err) {
      console.error(`Error during ${strategy} Sign-In:`, err);
      customToast("Failed, Try Again", "fail");
      setLoading(false);
    }
  };

  // Handles regular username/password sign-in
  const handleRegularSignIn = async () => {
    const trimmedUsername = username.trim();
    const trimmedPass = password.trim();

    const message = validatePassword(trimmedPass);
    if (message !== true) {
      setError(message);
      customToast("Failed, Try Again", "fail");
      return;
    }

    setError("");
    setLoading(true);
    customToast("Signing In", "creating");

    try {
      // Attempt sign-in with Clerk
      const response = await signIn?.create({
        identifier: trimmedUsername,
        password: trimmedPass,
      });

      if (response?.status === "complete") {
        window.location.href = `${window.location.origin}/me`;
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      customToast("Failed, Try Again", "fail");
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-flow register">
      <div className="inner-card">
        <div className="auth-left">
          <Image
            src={"/images/collage_horror.jpg"}
            width={1920}
            height={1080}
            alt="collage of movies"
          />
        </div>

        <div className="auth-right">
          <div className="rs-inner">
            <Logo />
            <h1>Login</h1>
            <p className="has-account center-text title-text">
              Don't have an account?
              <Link href={"/auth/sign-up"}>
                <span> Sign Up</span>
              </Link>
            </p>

            <div className="socials-options">
              <button
                ref={googleButtonRef}
                onClick={() => handleOAuthSignIn("oauth_google")}
                className="btn btn-google"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="spinning-loader o" />
                ) : (
                  <GoogleSvg />
                )}
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <span className="span-separator">or</span>
            <div className="form-container">
              {error && <p className="error-message">{error}</p>}
              <BetterInput
                name="username"
                value={username}
                classList=""
                placeholder="Username"
                onchange={setUsername}
                type="text"
              />
              <BetterInput
                name="password"
                value={password}
                classList=""
                placeholder="Password"
                onchange={setPassword}
                type="password"
              />
              <p className="has-account right-text title-text">
                <Link href={"/auth/reset"}>
                  <span>Forgot password?</span>
                </Link>
              </p>

              <div className="btn-container less">
                <button
                  ref={loginButtonRef}
                  type="button"
                  className={`continue auth-flow-btn ${
                    loading ? "loading" : ""
                  }`}
                  onClick={handleRegularSignIn}
                  disabled={loading}
                >
                  {loading ? <Loader2 /> : "Login"}
                </button>
              </div>
            </div>

            {/* Clerk CAPTCHA container */}
            <div id="clerk-captcha" />
          </div>
        </div>
      </div>
    </div>
  );
}
