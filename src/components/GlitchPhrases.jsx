import { useEffect, useState } from 'react'

const PHRASES = [
  'LLZ Tweaks. Competitive Starts Here.',
  'LLZ Tweaks. Precision. Performance. Victory.',
  'Every Optimization Has a Purpose.',
  'Elite Performance Solutions.',
  'Built for Competitive Players.'
]

function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function GlitchPhrases() {
  const [order] = useState(() => shuffle(PHRASES))
  const [index, setIndex] = useState(0)
  const [glitching, setGlitching] = useState(true)

  useEffect(() => {
    const settle = setTimeout(() => setGlitching(false), 500)
    const interval = setInterval(() => {
      setGlitching(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % order.length)
        setGlitching(false)
      }, 480)
    }, 3600)
    return () => {
      clearTimeout(settle)
      clearInterval(interval)
    }
  }, [order.length])

  const text = order[index]

  return (
    <div className="glitch-wrap">
      <p className={'glitch-text' + (glitching ? ' glitching' : '')} data-text={text}>
        {text}
      </p>
    </div>
  )
}
