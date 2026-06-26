import { useEffect, useMemo, useRef, useState } from "react";

const assets = {
  storefrontNight: "/assets/storefront-night.jpg",
  silverCar: "/assets/silver-car-side.jpg",
  storefrontDay: "/assets/storefront-day.jpg",
  storefrontBlue: "/assets/storefront-blue-hour.jpg",
  whiteCar: "/assets/white-car-sticker.jpg",
  carVideo: "/assets/car-detail-scroll.mp4",
  storage: "/assets/storage-racing-boxes.jpg",
  marzocco: "/assets/marzocco-bar.jpg",
  portafilter: "/assets/portafilter-dose.jpg",
  silvia: "/assets/silvia-magazine.jpg",
  espresso: "/assets/espresso-pull.jpg",
  icedBar: "/assets/iced-coffee-bar.jpg",
  door: "/assets/door-decal.jpg",
  interior: "/assets/interior-flower.jpg",
  pour: "/assets/pour-over-steam.jpg",
  icedWide: "/assets/iced-coffee-glass-wide.jpg",
  modelCars: "/assets/model-car-corner.jpg",
};

const address = "山东省菏泽市牡丹区丹阳街道和平社区兴庆路和平社区综合楼北侧第一间";
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const navItems = ["garage", "coffee", "culture", "visit"];

const stats = [
  ["est.", "2025"],
  ["hours", "9:30-19:30"],
  ["pace", "slow"],
];

const menu = [
  {
    name: "pit lane americano",
    note: "clean, bright, cold track finish",
    price: "28",
  },
  {
    name: "silver vision latte",
    note: "soft milk, roasted caramel, daily driver",
    price: "32",
  },
  {
    name: "turbo hand brew",
    note: "single origin, lap-by-lap pour control",
    price: "42",
  },
  {
    name: "garage tonic coffee",
    note: "sparkling, bitter citrus, late afternoon fuel",
    price: "36",
  },
];

const gallery = [
  ["glass decal", assets.door],
  ["bar station", assets.marzocco],
  ["espresso pull", assets.espresso],
  ["model car corner", assets.modelCars],
  ["slow coffee", assets.pour],
  ["club storage", assets.storage],
];

function useScrollProgress() {
  useEffect(() => {
    let frame = 0;
    let current = -1;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        const rounded = Math.round(progress * 1000) / 1000;

        if (rounded !== current) {
          current = rounded;
          document.documentElement.style.setProperty("--scroll-progress", rounded.toString());
          document.documentElement.style.setProperty("--scroll-percent", Math.round(rounded * 100).toString());
        }
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
}

function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function useScrollVideo() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return undefined;

    let frame = 0;
    let duration = 1;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const travel = Math.max(1, rect.height - window.innerHeight);
        const progress = clamp(-rect.top / travel, 0, 1);
        const targetTime = progress * duration;

        if (Number.isFinite(targetTime) && Math.abs(video.currentTime - targetTime) > 0.035) {
          video.currentTime = targetTime;
        }

        section.style.setProperty("--film-progress", progress.toFixed(3));
      });
    };

    const onMeta = () => {
      duration = Math.max(video.duration || 1, 1);
      if (video.currentTime < 0.05) {
        video.currentTime = Math.min(0.08, duration);
      }
      setIsReady(true);
      sync();
    };

    video.load();
    video.pause();
    video.addEventListener("loadedmetadata", onMeta);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener("loadedmetadata", onMeta);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return { sectionRef, videoRef, isReady };
}

function useParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return undefined;

    let frame = 0;
    let tick = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    const particles = Array.from({ length: 70 }, (_, index) => ({
      x: (index * 97) % 1000,
      y: (index * 53) % 1000,
      size: 0.7 + ((index * 17) % 12) / 10,
      speed: 0.14 + ((index * 7) % 12) / 80,
      drift: -0.45 + ((index * 11) % 90) / 100,
      hue: index % 4 === 0 ? 9 : 38,
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const move = (event) => {
      pointerX = event.clientX / Math.max(width, 1);
      pointerY = event.clientY / Math.max(height, 1);
    };

    const draw = () => {
      const scroll = Number.parseFloat(document.documentElement.style.getPropertyValue("--scroll-progress")) || 0;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      particles.forEach((particle, index) => {
        const x = ((particle.x + scroll * 840 + pointerX * 44 + particle.drift * tick * 0.012) % 1100) - 50;
        const y = ((particle.y + tick * particle.speed + pointerY * 34 + scroll * 260) % 1100) - 50;
        const alpha = 0.1 + Math.sin(tick * 0.008 + index) * 0.05 + scroll * 0.12;

        context.beginPath();
        context.fillStyle = `hsla(${particle.hue}, 92%, 58%, ${alpha})`;
        context.shadowColor = `hsla(${particle.hue}, 100%, 55%, 0.45)`;
        context.shadowBlur = 16;
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      context.globalCompositeOperation = "source-over";
      tick += 1;
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return canvasRef;
}

function ParticleField() {
  const canvasRef = useParticleCanvas();
  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

function Nav() {
  return (
    <header className="site-nav">
      <a className="brand-pill" href="#top" aria-label="SVcoffee home">
        <span className="sv-mark">SV</span>
        <span>Svcoffee</span>
      </a>

      <nav className="nav-pill" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item} href={`#${item}`}>
            {item}
          </a>
        ))}
      </nav>

      <a className="visit-button" href="#visit">
        start a lap
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero brand-hero">
      <picture className="hero-media">
        <source media="(max-width: 760px)" srcSet={assets.storefrontNight} />
        <img
          src={assets.storefrontBlue}
          alt="SVcoffee storefront at blue hour with warm lights"
        />
      </picture>

      <div className="hero-vignette" />
      <div className="track-lines" aria-hidden="true" />

      <div className="hero-copy">
        <p className="eyebrow">silvisions coffee / svcoffee</p>
        <h1 className="hero-title brand-title">
          <span>svcoffee</span>
          <span>garage</span>
        </h1>
        <p className="hero-desc">
          coffee for people who tune cars, collect stickers, and stay a little longer after the engine cools down.
        </p>
      </div>

      <div className="hero-stat top-stat">
        <span className="divider" />
        <strong>+01</strong>
        <small>garage cafe in motion</small>
      </div>

      <div className="hero-stat bottom-stat">
        <strong>9:30</strong>
        <span className="divider reverse" />
        <small>doors open daily</small>
      </div>

      <div className="hero-sticker sticker-one">slow coffee</div>
      <div className="hero-sticker sticker-two">est.2025</div>
    </section>
  );
}

function Dashboard() {
  return (
    <section id="garage" className="dashboard-section section-pad">
      <div className="section-kicker" data-reveal>
        garage / cafe / meet point
      </div>
      <div className="dashboard-grid">
        <div className="dash-copy" data-reveal>
          <h2>built like a pit stop, brewed like a slow lap.</h2>
          <p>
            SVcoffee keeps the mood mechanical: stainless counters, car magazines, model cars, decals, and a bar
            rhythm that feels closer to a tuned garage than a quiet showroom.
          </p>
        </div>

        <div className="gauge" data-reveal aria-label="scroll-linked dashboard gauge">
          <div className="gauge-face">
            <span>0</span>
            <span>slow</span>
            <span>redline</span>
            <i />
          </div>
          <p>
            <span className="scroll-number">00</span> / 100
          </p>
        </div>

        <div className="dash-photo tall" data-reveal>
          <img src={assets.modelCars} alt="Model cars and garage collectibles inside SVcoffee" />
        </div>
        <div className="dash-photo wide" data-reveal>
          <img src={assets.silverCar} alt="Silver sports car parked outside SVcoffee" />
        </div>
      </div>
    </section>
  );
}

function CoffeeSection() {
  return (
    <section id="coffee" className="coffee-section section-pad">
      <div className="coffee-layout">
        <div className="image-stack" data-reveal>
          <img className="stack-main" src={assets.pour} alt="Barista pouring hot water over hand brew coffee" />
          <img className="stack-card" src={assets.portafilter} alt="Fresh ground coffee in a portafilter" />
        </div>

        <div className="menu-panel" data-reveal>
          <p className="section-kicker">coffee program</p>
          <h2>precision brews with garage energy.</h2>
          <div className="menu-list">
            {menu.map((item) => (
              <article className="menu-row" key={item.name}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.note}</p>
                </div>
                <strong>{item.price}</strong>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryStrip() {
  const repeated = useMemo(() => [...gallery, ...gallery], []);

  return (
    <section className="strip-section" aria-label="SVcoffee gallery">
      <div className="ticker">
        <span>track day coffee</span>
        <span>silvisions</span>
        <span>sticker culture</span>
        <span>slow bar</span>
      </div>
      <div className="photo-rail">
        {repeated.map(([label, src], index) => (
          <figure key={`${label}-${index}`} className="rail-card">
            <img src={src} alt={`${label} at SVcoffee`} loading="lazy" />
            <figcaption>{label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ScrollFilm() {
  const { sectionRef, videoRef, isReady } = useScrollVideo();

  return (
    <section
      id="top"
      ref={sectionRef}
      className={`scroll-film${isReady ? " is-video-ready" : ""}`}
      aria-label="Svcoffee opening film"
    >
      <div className="film-sticky">
        <video
          ref={videoRef}
          className="film-video"
          src={assets.carVideo}
          muted
          playsInline
          preload="auto"
        />
        <div className="film-scan" aria-hidden="true" />
        <div className="film-copy">
          <p className="section-kicker">silvisions coffee</p>
          <h1>Svcoffee</h1>
          <p>coffee, modified cars, stickers, and nights that run a little longer.</p>
        </div>
        <div className="film-readout">
          <span>silvisions</span>
          <strong>00</strong>
        </div>
        <div className="film-hint">scroll</div>
      </div>
    </section>
  );
}

function ClubSection() {
  return (
    <section id="culture" className="club-section">
      <div className="club-bg" />
      <div className="garage-road" aria-hidden="true" />
      <div className="club-content section-pad">
        <div className="club-copy" data-reveal>
          <p className="section-kicker">svcoffee culture</p>
          <h2>bring the car. stay for the cup.</h2>
          <p>
            A small cafe for people who care about fitment, lap times, old magazines, camera rolls, and a good iced
            americano under hard sunlight.
          </p>
        </div>

        <div className="club-cards">
          {stats.map(([label, value]) => (
            <article className="club-card" key={label} data-reveal>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

function VisitSection() {
  return (
    <section id="visit" className="visit-section section-pad">
      <div className="visit-photo" data-reveal>
        <img src={assets.door} alt="SVcoffee glass door decal showing hours and slow coffee slogan" />
      </div>
      <div className="visit-copy" data-reveal>
        <p className="section-kicker">visit the garage</p>
        <h2>Svcoffee</h2>
        <p>
          silvisions coffee is a compact neighborhood garage cafe: mod-car details, slow drinks, and a front door that
          feels like a pit lane entrance.
        </p>
        <div className="visit-meta">
          <span>am 9:30 - pm 7:30</span>
          <span>coffee / latte / hand brew</span>
          <span>{address}</span>
          <span>cars welcome, slow pace required</span>
        </div>
        <a className="visit-cta" href={mapUrl} target="_blank" rel="noreferrer">
          open map
        </a>
      </div>
    </section>
  );
}

export function App() {
  useScrollProgress();
  useReveal();

  return (
    <main>
      <ParticleField />
      <Nav />
      <ScrollFilm />
      <Hero />
      <Dashboard />
      <CoffeeSection />
      <GalleryStrip />
      <ClubSection />
      <VisitSection />
    </main>
  );
}
