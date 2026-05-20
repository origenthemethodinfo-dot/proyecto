/**
 * Lightweight confetti burst using a canvas overlay.
 * @param {HTMLElement} container - element to burst from (center used)
 * @param {number} particleCount
 */
export function burstConfetti(container, particleCount = 80) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }
  const rect = container.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  const colors = ['#f97316', '#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6']
  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height / 2

  const particles = Array.from({ length: particleCount }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 6
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      gravity: 0.15 + Math.random() * 0.1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
    }
  })

  let animId
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false
    particles.forEach((p) => {
      if (p.life <= 0) return
      alive = true
      p.x += p.vx
      p.y += p.vy
      p.vy += p.gravity
      p.rotation += p.rotationSpeed
      p.life -= p.decay
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.5)
      ctx.restore()
    })
    if (alive) {
      animId = requestAnimationFrame(frame)
    } else {
      cancelAnimationFrame(animId)
      canvas.remove()
    }
  }
  frame()
}
