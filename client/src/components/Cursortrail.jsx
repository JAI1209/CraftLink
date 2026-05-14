import { useEffect, useRef } from "react";

const CursorTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H, animId;
    let mouse = { x: -999, y: -999 };
    let isHovering = false;
    let particles = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const lerp = (a, b, t) => a + (b - a) * t;

    const spawnParticle = (x, y) => {
      const hover = isHovering;
      const angle = Math.random() * Math.PI * 2;
      const speed = hover ? Math.random() * 2.5 + 1 : Math.random() * 1.8 + 0.4;
      const size  = hover ? Math.random() * 3   + 1.5 : Math.random() * 2.5 + 1;
      const life  = hover ? Math.random() * 40  + 30  : Math.random() * 55  + 35;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed * (hover ? 1.4 : 0.7) + (Math.random() - 0.5) * 0.8,
        vy: Math.sin(angle) * speed * (hover ? 1.4 : 0.7) + (Math.random() - 0.5) * 0.8 - 0.5,
        size,
        life,
        maxLife: life,
        hover,
        tail: [],
      });
    };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      isHovering = !!(
        el &&
        el.tagName !== "CANVAS" &&
        (el.tagName === "BUTTON" ||
          el.tagName === "A"      ||
          el.tagName === "INPUT"  ||
          el.closest("button, a, [role='button'], nav, .logo-wrapper"))
      );
      for (let i = 0; i < 3; i++) spawnParticle(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", onMove);

    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.tail.unshift({ x: p.x, y: p.y });
        if (p.tail.length > 12) p.tail.pop();

        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.018;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life--;

        if (p.life <= 0) { particles.splice(i, 1); continue; }

        const t = p.life / p.maxLife;

        /* ── tail stroke ── */
        if (p.tail.length > 1) {
          for (let j = 0; j < p.tail.length - 1; j++) {
            const tj = (p.tail.length - 1 - j) / (p.tail.length - 1);
            const alpha = t * tj * 0.6;
            const w     = p.size * tj * t * 0.7;
            ctx.beginPath();
            ctx.moveTo(p.tail[j].x, p.tail[j].y);
            ctx.lineTo(p.tail[j + 1].x, p.tail[j + 1].y);
            ctx.strokeStyle = p.hover
              ? `rgba(255,255,255,${alpha})`
              : `rgba(${lerp(100, 180, t)},${lerp(200, 255, t)},0,${alpha})`;
            ctx.lineWidth = w;
            ctx.lineCap  = "round";
            ctx.stroke();
          }
        }

        /* ── radial glow dot ── */
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (1 + t));
        if (p.hover) {
          grd.addColorStop(0,   `rgba(255,255,255,${t * 0.9})`);
          grd.addColorStop(0.5, `rgba(220,240,255,${t * 0.4})`);
          grd.addColorStop(1,   `rgba(180,220,255,0)`);
        } else {
          grd.addColorStop(0,   `rgba(200,255,0,${t * 0.95})`);
          grd.addColorStop(0.4, `rgba(130,220,0,${t * 0.5})`);
          grd.addColorStop(1,   `rgba(80,180,0,0)`);
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.5 + t * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default CursorTrail;