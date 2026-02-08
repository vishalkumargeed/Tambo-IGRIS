import SignIn from "./components/authentication/Signin"
import { PixelBlast } from "@/components/ui/pixel-blast"
import Youtube from "./components/Youtube"

export default function Home() {
  return (
    <div className="home-page relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-0 z-0 w-screen h-screen min-w-full min-h-screen"
        style={{
          width: "100vw",
          height: "100vh",
          minWidth: "100vw",
          minHeight: "100dvh",
        }}
        aria-hidden
      >
        <div className="absolute inset-0 w-full h-full" style={{ minHeight: "100vh", minWidth: "100vw" }}>
          <PixelBlast
          variant="circle"
          pixelSize={2}
          color="#f4f3f7"
          patternScale={4}
          patternDensity={1.2}
          enableRipples
          rippleSpeed={0.7}
          rippleThickness={0.11}
          rippleIntensityScale={0.9}
          speed={0.5}
          transparent={false}
          edgeFade={0.7}
        
        />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl whitespace-nowrap">
            Sentinel AI 
          </h1>
          <p className="font-sans text-base text-zinc-400 sm:text-lg whitespace-nowrap">
            Github & User Experience Designer
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <SignIn />
            <Youtube />
          </div>
        </div>
      </div>
    </div>
  )
}
