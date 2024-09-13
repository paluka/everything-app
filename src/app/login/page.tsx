// src/app/login/page.tsx

"use client";

import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Footer from "../components/footer/footer";

const LoginPage = () => {
  const [providers, setProviders] = useState<Record<string, any>>({});

  useEffect(() => {
    async function fetchProviders() {
      const providerslist = await getProviders();

      if (providerslist) {
        setProviders(providerslist);
      }
    }

    fetchProviders();
  }, []);

  return (
    <div>
      <h1>Login</h1>

      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.name}>
            <button
              onClick={() => signIn(provider.id, { callbackUrl: "/profile" })}
            >
              Sign in with {provider.name}
            </button>
          </div>
        ))}
      <Footer />
    </div>
  );
};

export default LoginPage;
