import { Mouse } from 'lucide-react'

const RINGS = [
  { rotateX: 75, rotateY: 0, scale: 1 },
  { rotateX: 75, rotateY: 60, scale: 1 },
  { rotateX: 75, rotateY: 120, scale: 1 },
  { rotateX: 15, rotateY: 0, scale: 0.72 }
]

export default function HoloMouse() {
  return (
    <div className="precision-scene">
      <div className="precision-glow" />
      <div className="precision-orbit">
        {RINGS.map((r, i) => (
          <div
            key={i}
            className="precision-ring"
            style={{ transform: `rotateX(${r.rotateX}deg) rotateY(${r.rotateY}deg) scale(${r.scale})` }}
          />
        ))}
      </div>
      <div className="precision-mouse">
        <Mouse size={72} strokeWidth={1.1} />
      </div>
      <div className="precision-scan" />
      <div className="precision-shadow" />
    </div>
  )
}
