"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginModal({ isOpen, setIsOpen }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const loginWithEmail = async () => {
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (!error) {
      setSent(true);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-150"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Zaloguj się
              </Dialog.Title>

              {/* Google login */}
              <button
                onClick={loginWithGoogle}
                className="w-full border rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
                Kontynuuj z Google
              </button>

              <div className="text-center text-sm text-gray-400 my-4">lub</div>

              {!sent ? (
                <>
                  <input
                    type="email"
                    placeholder="Twój e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mb-3"
                  />

                  <button
                    onClick={loginWithEmail}
                    className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
                  >
                    Wyślij link logowania
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  Link logowania został wysłany na Twój e-mail.
                </p>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}