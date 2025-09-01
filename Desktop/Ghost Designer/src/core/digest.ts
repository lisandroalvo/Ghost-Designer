import { Digest } from "./types";

export function getDemoFrameDigest(): Digest {
  return {
    frameName: "Demo Frame",
    layers: [
      {
        id: "demo-layer-1",
        role: "container",
        width: 100,
        height: 50,
        bgColor: "#FF0000"
      }
    ]
  };
}
