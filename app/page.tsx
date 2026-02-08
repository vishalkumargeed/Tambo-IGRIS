import SignIn from "./components/authentication/Signin"
import { PixelBlast } from "@/components/ui/pixel-blast"

export default function Home() {
  return (
    <div className="home-page relative min-h-screen overflow-hidden">
      {/* Pixel Blast background - full viewport, black canvas with circle pixels */}
      <div
        className="fixed inset-0 -z-10"
        style={{ width: "100vw", height: "100vh", minHeight: "100%", minWidth: "100%" }}
      >
        <PixelBlast
          variant="circle"
          pixelSize={2}
          color="#f4f3f7"
          patternScale={3}
          patternDensity={1.2}
          enableRipples
          rippleSpeed={0.3}
          rippleThickness={0.11}
          rippleIntensityScale={0.9}
          speed={0.4}
          transparent={false}
          edgeFade={0.7}
          className="h-full w-full"
        />
      </div>
      {/* Hero content */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Your GitHub repos and pull requests, in one place.
          </h1>
          <p className="text-base text-zinc-400 sm:text-lg">
            AI-powered PR reviews, issues, and code exploration—right where you
            work.
          </p>
          <SignIn />
        </div>
      </div>
    </div>
  )
}
