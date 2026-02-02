
import Image from "next/image";
import SignIn from "./components/authentication/Signin";


export default function Home() {
  
  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-6  bg-zinc-50 font-sans dark:bg-black">
      <h1 className="font-heading tracking-tight  text-4xl font-bold">
        Tambo Sentinel
      </h1>
      <Image src="/logo.png" alt="Cat Pic " width={300} height={100} />
      <div>
        <SignIn/>
        
      </div>
    </div>
  );
}
