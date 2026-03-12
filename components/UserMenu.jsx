"use client";

import { Menu } from "@headlessui/react";
import { supabase } from "@/lib/supabaseClient";

export default function UserMenu({ user }) {
  const logout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  const avatar =
    user.user_metadata?.avatar_url ||
    user.email?.charAt(0).toUpperCase();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        {typeof avatar === "string" && avatar.startsWith("http") ? (
          <img src={avatar} className="rounded-full" />
        ) : (
          avatar
        )}
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
        <Menu.Item>
          {({ active }) => (
            <button
              className={`w-full text-left px-4 py-2 ${
                active ? "bg-gray-100" : ""
              }`}
            >
              Moje konto
            </button>
          )}
        </Menu.Item>

        <Menu.Item>
          {({ active }) => (
            <button
              onClick={logout}
              className={`w-full text-left px-4 py-2 ${
                active ? "bg-gray-100" : ""
              }`}
            >
              Wyloguj
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
}