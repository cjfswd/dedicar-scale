import Image from "next/image";
import { Home2 } from "@/components/client/home";
import ClientWrapper from "@/components/client/client-wrapper";

export default function Home() {
  return (
    <main className="w-full flex min-h-screen flex-col items-center justify-between">
      <ClientWrapper>
        <Home2 />
      </ClientWrapper>
    </main>
  );
}
