import { useState } from "react";
import Home from "./pages/Home";
import Debate from "./pages/Debate";
import type { DebateInfo } from "./lib/api";

export default function App() {
  const [debate, setDebate] = useState<DebateInfo | null>(null);

  return debate ? (
    <Debate debate={debate} onExit={() => setDebate(null)} />
  ) : (
    <Home onStart={setDebate} />
  );
}
