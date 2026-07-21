"use client";
import Image from "next/image";
import "./navbar.css";
import InputContainer from "./components/InputContainer";
import NavLinks from "./components/NavLinks";
import UserButton from "./components/UserButton";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function Navbar({}) {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="nav-start nav-section">
          <Link href={`${isSignedIn ? "/me" : "/"}`} className="home-button">
            <Image
              className="reel-icon"
              src={"/images/reel_favicon.png"}
              width={256}
              height={256}
              alt="alt logo"
            />
            <span>Reel254</span>
          </Link>
        </div>
        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle navigation">
          &#9776;
        </button>
          <div className={`nav-middle ${menuOpen ? "open" : ""}`}>
            <NavLinks onClose={toggleMenu} />
          </div>
        <div className="nav-end nav-section">
          <InputContainer />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
