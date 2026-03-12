"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LoginModal from "./LoginModal";
import UserMenu from "./UserMenu";

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (user) {
    return <UserMenu user={user} />;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border px-4 py-2 rounded-lg hover:bg-gray-50"
      >
        Zaloguj
      </button>

      <LoginModal isOpen={open} setIsOpen={setOpen} />
    </>
  );
}