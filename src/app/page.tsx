"use client";

import Footer from "@/components/footer";
import HomeButton from "@/components/home-button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-6 flex w-full max-w-6xl flex-col gap-8 py-12 lg:mx-12 lg:flex-row lg:items-start">
          <div className="flex flex-1 flex-col justify-center gap-3">
            <h1 className="text-3xl font-bold text-primary font-roboto-mono">
              Welcome to Safe Cover
            </h1>
            <p className="font-light font-roboto-mono">
              Protect or recover your Safe account.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <HomeButton
              label="SAFE OWNER"
              title="SET UP RECOVERY"
              description="Add guardians, threshold, and delay period."
              href="/protect-account"
            />
            <HomeButton
              label="SAFE OWNER"
              title="START RECOVERY REQUEST"
              description="Create a recovery request and share it with guardians."
              href="/ask-recovery"
            />
          </div>
        </div>
      </div>
      <div className="mx-6 mb-8 flex justify-center lg:mx-12">
        <div className="w-full max-w-3xl rounded-lg border border-primary/20 bg-content-background px-4 py-3 text-sm font-roboto-mono opacity-80">
          Active request:
          {" "}
          <Link
            href="/manage-recovery/dashboard"
            className="text-primary underline hover:no-underline"
          >
            Manage and approve
          </Link>
          {" "}
          |
          {" "}
          <Link
            href="/manage-recovery"
            className="text-primary underline hover:no-underline"
          >
            Cancel request
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
