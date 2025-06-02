import "~/styles/globals.css";
import "~/styles/preflight.css";
import "@mantine/core/styles.css";
// import "@mantine/form/styles.css";
import "@mantine/dates/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";
import SessionProvider from "./_components/SessionProvider";
import theme from "~/styles/MantineTheme";
import { SideNav } from "./_components/SideNav";

export const metadata: Metadata = {
  title: "Smart Trader X",
  description: "App for efficiently managing your trading",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <TRPCReactProvider>
          <MantineProvider theme={theme}>
            <SessionProvider session={session}>
              <main className="text-main flex flex-col bg-[#F1F6F9]">
                <div className="flex min-h-screen">
                  <SideNav />
                  <div className="flex w-full flex-col items-center justify-center">
                    {children}
                  </div>
                </div>
              </main>
            </SessionProvider>
          </MantineProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
