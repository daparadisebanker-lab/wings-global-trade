"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex w-full justify-center rounded-md bg-brown-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brown-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Signing in..." : children}
    </button>
  );
}
