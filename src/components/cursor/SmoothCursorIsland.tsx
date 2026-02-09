"use client";

import SmoothCursor from "../lightswind/smooth-cursor";

export default function SmoothCursorIsland() {
  return (
    <SmoothCursor
      size={14}
      color="blue"
      showTrail={true}
      trailLength={8}
      magneticDistance={60}
      magneticElements="[data-magnetic]"
      springConfig={{
        damping: 50,
        stiffness: 450,
        mass: 0.8,
        restDelta: 0.001,
      }}
    />
  );
}
