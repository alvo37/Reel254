import Image from "next/image";

export default function Logo() {
  return (
    <div className="reel254-logo">
      <Image
        src={"/images/reel_logo_wide.png"}
        width={1024}
        height={1024}
        alt="reel254 logo"
      />
    </div>
  );
}
