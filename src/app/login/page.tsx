// src/app/login/page.tsx

"use client";

import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState<Record<string, any>>({});
  const router = useRouter();

  useEffect(() => {
    async function fetchProviders() {
      const providerslist = await getProviders();

      if (providerslist) {
        setProviders(providerslist);
      }
    }

    fetchProviders();
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    // if (session) router.push("/profile");
  }, [session, status, router]);

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading message while session is being checked
  }

  return (
    <div>
      <h1>Login</h1>

      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.name}>
            <button onClick={() => signIn(provider.id, { redirect: true })}>
              Sign in with {provider.name}
            </button>
          </div>
        ))}
    </div>
  );
};

export default LoginPage;
