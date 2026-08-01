const MERIDIANS = [0, 30, 60, 90, 120, 150]
const LATITUDES = [
  { rotate: 90, scale: 1, offset: 0 },
  { rotate: 90, scale: 0.82, offset: -32 },
  { rotate: 90, scale: 0.82, offset: 32 },
  { rotate: 90, scale: 0.5, offset: -58 },
  { rotate: 90, scale: 0.5, offset: 58 }
]

export default function HoloGlobe() {
  return (
    <div className="globe-scene">
      <div className="globe-glow" />
      <div className="globe-sphere">
        {MERIDIANS.map((deg) => (
          <div key={`m-${deg}`} className="globe-ring" style={{ transform: `rotateY(${deg}deg)` }} />
        ))}
        {LATITUDES.map((lat, i) => (
          <div
            key={`l-${i}`}
            className="globe-ring"
            style={{ transform: `translateY(${lat.offset}px) rotateX(${lat.rotate}deg) scale(${lat.scale})` }}
          />
        ))}
      </div>
      <div className="globe-scan" />
      <div className="globe-shadow" />
    </div>
  )
}
