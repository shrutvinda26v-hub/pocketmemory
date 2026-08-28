import { lazy, Suspense, useEffect, useState } from "react";
import { HUD } from "./ui/HUD";
import { soundscape } from "./audio/soundscape";
import { useExperience } from "./experience/store";

const Experience = lazy(() =>
  import("./experience/Experience").then((m) => ({ default: m.Experience })),
);

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    useExperience.getState().setCoarse(coarse);

    const unlock = () => {
      soundscape.unlock();
      useExperience.getState().unlockAudio();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <Experience onReady={() => setReady(true)} />
      </Suspense>
      <HUD ready={ready} />
    </>
  );
}
