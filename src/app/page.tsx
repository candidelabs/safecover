"use client";

import Footer from "@/components/footer";
import HomeButton from "@/components/home-button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col h-min-screen justify-between">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex mx-12">
          <div className="flex flex-col justify-center  gap-3 flex-1 ">
            <h2 className="text-3xl font-bold text-primary font-roboto-mono">
              Welcome to Safe Cover
            </h2>
            <p className="font-light font-roboto-mono">
              Secure your Safe Account using trusted contacts
              <br/>or your own backup accounts, like hardware wallets.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-12">
            <HomeButton
              label="OWNERS"
              title="PROTECT MY ACCOUNT"
              description="Activate Safe Account Recovery to protect your account."
              href="/protect-account"
              onClick={() => console.log("Protect account")}
            />
            <HomeButton
              label="ANYONE"
              title="RECOVER AN ACCOUNT"
              description="Ask for recovery if you lost access to your account."
              onClick={() => console.log("Protect account")}
              href="/ask-recovery"
            />
            <HomeButton
              label="OWNERS AND GUARDIANS"
              title="MANAGE RECOVERY"
              description="Approve ongoing requests and manage guardians permissions."
              href="/manage-recovery/dashboard"
              onClick={() => console.log("Protect account")}
            />
            <HomeButton
              label="OWNERS AND GUARDIANS"
              title="CANCEL RECOVERY"
              description="Cancel a request if there's no need to recover the account."
              onClick={() => console.log("Protect account")}
              href="/manage-recovery"
            />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
