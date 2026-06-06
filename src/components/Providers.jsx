"use client";
import { Grommet, grommet } from "grommet";
import { ApolloProvider } from "@apollo/client/react";
import { SessionProvider } from "next-auth/react";
import { client } from "@/lib/apollo-client";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <Grommet theme={grommet} full>
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </Grommet>
    </SessionProvider>
  );
}
