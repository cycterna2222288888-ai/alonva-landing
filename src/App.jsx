import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const NAV_LINKS = [
  { label: 'Решения', href: '#solutions' },
  { label: 'Показатели', href: '#stats' },
  { label: 'Применение', href: '#usecases' },
  { label: 'Контакты', href: '#contacts' },
]

const OBJECT_TYPES = [
  'Спортивный комплекс',
  'Профессиональный клуб',
  'Фитнес-студия',
  'Киберспортивная арена',
  'Другое',
]

/* ---------------------------------- Иконки ---------------------------------- */

function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 12.5L9.5 18L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconMeshCube(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" {...props}>
      <path d="M24 5L41 14.5V33.5L24 43L7 33.5V14.5L24 5Z" strokeWidth="1.3" />
      <path d="M24 5V24M24 24L41 14.5M24 24L7 14.5M24 24V43" strokeWidth="1" opacity="0.45" />
      <circle cx="24" cy="24" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconTennisMesh(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" {...props}>
      <circle cx="24" cy="24" r="18" strokeWidth="1.3" />
      <path d="M24 6C15 12.5 15 35.5 24 42" strokeWidth="1" opacity="0.5" />
      <path d="M24 6C33 12.5 33 35.5 24 42" strokeWidth="1" opacity="0.5" />
      <path d="M6 24H42" strokeWidth="1" opacity="0.3" />
      <circle cx="24" cy="24" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ------------------------------- Данные секций ------------------------------- */

const PRODUCTS_ACCENT = '#2f7dff'

const PRODUCTS = [
  {
    index: '01',
    title: 'IT-инфраструктура спортивных объектов',
    description: 'Серверные мощности, сетевая архитектура, системы видеотрансляций и хранения данных.',
  },
  {
    index: '02',
    title: 'Спортивное оборудование',
    description: 'Умные тренажёры, датчики движения, системы электронного тайминга.',
  },
  {
    index: '03',
    title: 'Программное обеспечение',
    description: 'Софт для аналитики нагрузок, трекинга результатов и менеджмента объектов.',
  },
  {
    index: '04',
    title: 'Комплексная интеграция',
    description: 'Проект под ключ — от поставки оборудования до запуска и сопровождения ПО.',
  },
]

const STATS_TABS = [
  {
    id: 'facilities',
    label: 'Для спортивных комплексов',
    stats: [
      { value: '99.9%', label: 'Аптайм инженерных систем' },
      { value: '<2мс', label: 'Задержка передачи данных' },
      { value: '50+', label: 'Реализованных объектов' },
      { value: '24/7', label: 'Мониторинг и поддержка' },
    ],
  },
  {
    id: 'teams',
    label: 'Для профессиональных команд',
    stats: [
      { value: '10k+', label: 'Точек данных в секунду' },
      { value: '40%', label: 'Рост эффективности тренировок' },
      { value: '15', label: 'Профессиональных клубов доверяют' },
      { value: '<50мс', label: 'Задержка видеоаналитики' },
    ],
  },
]

const USE_CASES_ACCENT = '#39ff8f'

const USE_CASES = [
  {
    title: 'Теннисные академии и корты',
    description: 'Электронный тайминг, автоматическая разметка, аналитика ударов в реальном времени.',
  },
  {
    title: 'Футбольные стадионы',
    description: 'IT-инфраструктура трансляций, системы позиционирования игроков, инженерные сети.',
  },
  {
    title: 'Фитнес-кластеры нового поколения',
    description: 'Умные тренажёры, биометрия участников, единая аналитическая панель клуба.',
  },
  {
    title: 'Киберспортивные арены',
    description: 'Низкая задержка сети, серверная инфраструктура турниров, продакшн трансляций.',
  },
]

/* ---------------------------- Анимационные варианты --------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ---------------------------------- 3D-сцена ---------------------------------- */

function useMouseParallax() {
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handlePointerMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  return mouse
}

function TechSphere({ mouse }) {
  const groupRef = useRef(null)
  const coreLightRef = useRef(null)
  const coreMaterialRef = useRef(null)
  const blueLightRef = useRef(null)
  const greenLightRef = useRef(null)

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return

    const t = state.clock.getElapsedTime()

    group.position.y = Math.sin(t * 0.6) * 0.18
    group.rotation.y += delta * 0.12
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, mouse.current.y * 0.15, 0.04)
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -mouse.current.x * 0.1, 0.04)
    group.position.x = THREE.MathUtils.lerp(group.position.x, mouse.current.x * 0.35, 0.03)

    const pulse = 1.3 + Math.sin(t * 1.8) * 0.85
    if (coreLightRef.current) coreLightRef.current.intensity = pulse
    if (coreMaterialRef.current) coreMaterialRef.current.emissiveIntensity = pulse * 0.7

    if (blueLightRef.current) {
      blueLightRef.current.position.x = 3.2 + mouse.current.x * 1.6
      blueLightRef.current.position.y = 2 + mouse.current.y * 1.1
    }
    if (greenLightRef.current) {
      greenLightRef.current.position.x = -3.2 - mouse.current.x * 1.6
      greenLightRef.current.position.y = -1.6 - mouse.current.y * 1.1
    }
  })

  return (
    <group ref={groupRef}>
      <mesh scale={0.62} castShadow>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color="#052e1f"
          emissive="#39ff8f"
          emissiveIntensity={1.3}
          roughness={0.3}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={coreLightRef} color="#39ff8f" intensity={1.3} distance={4.2} decay={2} />

      <mesh>
        <sphereGeometry args={[1.35, 128, 128]} />
        <meshPhysicalMaterial
          color="#0a0e14"
          roughness={0.35}
          metalness={0}
          transmission={0.9}
          thickness={2.2}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.08}
          attenuationColor="#0f2a22"
          attenuationDistance={1.1}
          envMapIntensity={1.5}
        />
      </mesh>

      <mesh scale={1.42} rotation={[0.3, 0.2, 0]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color="#4fb2ff" wireframe transparent opacity={0.16} />
      </mesh>

      <pointLight ref={blueLightRef} position={[3.2, 2, 2]} intensity={2.2} color="#2f7dff" distance={9} />
      <pointLight ref={greenLightRef} position={[-3.2, -1.6, 2]} intensity={1.8} color="#39ff8f" distance={9} />
    </group>
  )
}

function ParticleField() {
  const pointsRef = useRef(null)

  const positions = useMemo(() => {
    const count = 280
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6
      arr[i * 3 + 2] = radius * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.015
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#5fd0ff" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

/* --------------------------- Скролл-орбита камеры (GSAP) ----------------------- */

function useScrollCameraOrbit() {
  const drift = useRef({ azimuth: 0, elevation: 0 })

  useEffect(() => {
    const passes = [
      { trigger: '#solutions', azimuth: -0.22, elevation: 0.05 },
      { trigger: '#usecases', azimuth: 0.22, elevation: -0.04 },
    ]

    const triggers = passes.map(({ trigger, azimuth, elevation }) =>
      ScrollTrigger.create({
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const arc = Math.sin(self.progress * Math.PI)
          drift.current.azimuth = azimuth * arc
          drift.current.elevation = elevation * arc
        },
      })
    )

    return () => triggers.forEach((trigger) => trigger.kill())
  }, [])

  return drift
}

function CameraRig() {
  const { camera } = useThree()
  const drift = useScrollCameraOrbit()
  const radius = 6.2

  useFrame(() => {
    const targetX = radius * Math.sin(drift.current.azimuth) * Math.cos(drift.current.elevation)
    const targetY = radius * Math.sin(drift.current.elevation)
    const targetZ = radius * Math.cos(drift.current.azimuth) * Math.cos(drift.current.elevation)

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Scene() {
  const mouse = useMouseParallax()
  const { viewport } = useThree()
  const responsiveScale = THREE.MathUtils.clamp(viewport.width / 8, 0.65, 1.15)

  return (
    <>
      <color attach="background" args={['#050608']} />
      <fog attach="fog" args={['#050608', 8, 18]} />

      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 6, 4]} intensity={0.6} color="#dfe9ff" castShadow shadow-mapSize={[1024, 1024]} />

      <CameraRig />

      <group scale={responsiveScale}>
        <TechSphere mouse={mouse} />
      </group>

      <ParticleField />

      <ContactShadows position={[0, -1.6, 0]} opacity={0.55} scale={10} blur={2.6} far={3} color="#000000" />

      <Environment preset="city" />
    </>
  )
}

/* ------------------------------------ Хэдер ----------------------------------- */

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between bg-[#050608]/30 px-6 py-6 backdrop-blur-md md:px-12 md:py-8"
    >
      <span className="text-xl font-bold uppercase tracking-[0.35em] text-white md:text-2xl">
        Alonva
      </span>

      <nav className="hidden items-center gap-10 lg:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm font-medium uppercase tracking-widest text-white/60 transition-colors duration-300 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a
        href="#contacts"
        className="hidden rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium uppercase tracking-widest text-white transition-all duration-300 hover:border-white/60 hover:bg-white/5 md:inline-block"
      >
        Связаться
      </a>
    </motion.header>
  )
}

/* ------------------------------------- Hero ------------------------------------ */

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.3 } },
}

const heroItem = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

function HeroContent() {
  return (
    <motion.div
      variants={heroContainer}
      initial="hidden"
      animate="visible"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <motion.span
        variants={heroItem}
        className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-white/50 md:text-sm"
      >
        Спортивное и IT-оборудование · Программное обеспечение
      </motion.span>

      <motion.h1
        variants={heroItem}
        className="max-w-5xl text-6xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl"
      >
        Технологии
        <br />
        <span className="bg-gradient-to-r from-[#39ff8f] via-[#7fe8b0] to-[#4fb2ff] bg-clip-text text-transparent">
          для спорта
        </span>
      </motion.h1>

      <motion.p
        variants={heroItem}
        className="mt-8 max-w-xl text-base font-normal leading-relaxed text-white/60 md:text-lg"
      >
        Alonva объединяет высокопроизводительное спортивное оборудование, IT-инфраструктуру
        и программные решения в единую экосистему — под ключ, для клубов, федераций и
        частных студий.
      </motion.p>

      <motion.div variants={heroItem} className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <a
          href="#contacts"
          className="group relative overflow-hidden rounded-full bg-white px-9 py-4 text-sm font-semibold uppercase tracking-widest text-black transition-transform duration-300 hover:scale-[1.03]"
        >
          <span className="relative z-10">Запросить консультацию</span>
          <span className="absolute inset-0 -z-0 bg-gradient-to-r from-[#39ff8f] to-[#4fb2ff] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </a>

        <a
          href="#solutions"
          className="inline-flex items-center gap-2 px-6 py-4 text-sm font-medium uppercase tracking-widest text-white/70 transition-colors duration-300 hover:text-white"
        >
          Смотреть решения
          <span aria-hidden="true">→</span>
        </a>
      </motion.div>

      <motion.div
        variants={heroItem}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/30">
          Прокрутите вниз
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-9 w-5 rounded-full border border-white/20 p-1"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* --------------------------------- Общие блоки --------------------------------- */

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="mx-auto max-w-2xl text-center"
    >
      <span className="text-xs font-medium uppercase tracking-[0.4em] text-white/40">{eyebrow}</span>
      <h2 className="mt-4 text-3xl font-black uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-white/50 md:text-lg">{description}</p>
      )}
    </motion.div>
  )
}

function GroupIconBadge({ icon: Icon, accent }) {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <motion.span
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: accent }}
        animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.85, 1.05, 0.85] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Icon className="relative h-9 w-9" style={{ color: accent }} />
    </div>
  )
}

function GroupCard({ index, icon, accent, title, description }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur-xl md:p-10"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 15% 10%, ${accent}30, transparent 60%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${accent}55, 0 0 40px ${accent}22` }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[120%] skew-x-[-20deg] opacity-0 transition-all duration-[1100ms] ease-out group-hover:translate-x-[220%] group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`, filter: 'blur(12px)' }}
      />

      {index && <span className="text-xs font-medium tracking-[0.3em] text-white/30">{index}</span>}

      <GroupIconBadge icon={icon} accent={accent} />

      <h3 className="mt-6 text-xl font-semibold text-white md:text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/50 md:text-base">{description}</p>
    </motion.div>
  )
}

/* ------------------------------ Направления и решения --------------------------- */

function ProductsSection() {
  return (
    <section id="solutions" className="relative z-10 bg-[#050608]/90 px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Направления и решения"
          title="Экосистема под ключ"
          description="Четыре направления, которые складываются в единую инфраструктуру спортивного объекта."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 md:grid-cols-2"
        >
          {PRODUCTS.map((product) => (
            <GroupCard
              key={product.index}
              index={product.index}
              icon={IconMeshCube}
              accent={PRODUCTS_ACCENT}
              title={product.title}
              description={product.description}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------ Технологии в цифрах ----------------------------- */

function StatsTabs({ tabs, activeId, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors duration-300 sm:text-sm ${
            activeId === tab.id ? 'text-black' : 'text-white/60 hover:text-white'
          }`}
        >
          {activeId === tab.id && (
            <motion.span
              layoutId="stats-tab-pill"
              className="absolute inset-0 rounded-full bg-white"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

function StatsSection() {
  const [activeId, setActiveId] = useState(STATS_TABS[0].id)
  const activeTab = STATS_TABS.find((tab) => tab.id === activeId)

  return (
    <section id="stats" className="relative z-10 border-t border-white/5 bg-[#050608]/90 px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Технологии в цифрах"
          title="Измеримый результат"
          description="Показатели инфраструктуры, которые чувствуют и спортсмены, и инженеры."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mt-10 flex justify-center"
        >
          <StatsTabs tabs={STATS_TABS} activeId={activeId} onChange={setActiveId} />
        </motion.div>

        <div className="relative mt-16 min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
            >
              {activeTab.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-4xl font-black text-transparent sm:text-5xl md:text-6xl">
                    {stat.value}
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-widest text-white/40 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- Сферы применения ------------------------------ */

function UseCasesSection() {
  return (
    <section id="usecases" className="relative z-10 border-t border-white/5 bg-[#050608]/90 px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Где это работает"
          title="Сферы применения"
          description="От корта до киберспортивной арены — платформа адаптируется под задачи объекта."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-6 md:grid-cols-2"
        >
          {USE_CASES.map((useCase) => (
            <GroupCard
              key={useCase.title}
              icon={IconTennisMesh}
              accent={USE_CASES_ACCENT}
              title={useCase.title}
              description={useCase.description}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------ CTA-форма --------------------------------- */

function ContactSection() {
  const [form, setForm] = useState({ name: '', contact: '', objectType: OBJECT_TYPES[0] })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (form.name.trim().length < 2 || form.contact.trim().length < 5) {
      setError('Проверьте, пожалуйста, имя и контакт для связи')
      return
    }

    setError('')
    setStatus('sending')

    window.setTimeout(() => {
      setStatus('success')
    }, 900)
  }

  return (
    <section id="contacts" className="relative z-10 border-t border-white/5 bg-[#050608]/95 px-6 py-28 md:px-12 md:py-40">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Свяжитесь с нами"
          title="Обсудим ваш проект"
          description="Оставьте заявку — подберём конфигурацию оборудования и ПО под задачи вашего объекта."
        />

        <motion.form
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          onSubmit={handleSubmit}
          className="mt-14"
        >
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-16 text-center backdrop-blur-xl"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#39ff8f]/15 text-[#39ff8f]">
                  <IconCheck className="h-6 w-6" />
                </span>
                <p className="text-lg font-semibold text-white">Заявка отправлена</p>
                <p className="max-w-xs text-sm text-white/50">Мы свяжемся с вами в ближайшее рабочее время.</p>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }} className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-white/40">Имя</span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="Как к вам обращаться"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white outline-none backdrop-blur-xl transition-colors duration-300 placeholder:text-white/30 focus:border-[#39ff8f]/50"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-white/40">Телефон / Telegram</span>
                  <input
                    type="text"
                    required
                    value={form.contact}
                    onChange={handleChange('contact')}
                    placeholder="+374 __ ___ ___ или @username"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white outline-none backdrop-blur-xl transition-colors duration-300 placeholder:text-white/30 focus:border-[#39ff8f]/50"
                  />
                </label>

                <label className="relative flex flex-col gap-2 sm:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-white/40">Тип объекта</span>
                  <select
                    value={form.objectType}
                    onChange={handleChange('objectType')}
                    className="appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white outline-none backdrop-blur-xl transition-colors duration-300 focus:border-[#39ff8f]/50"
                  >
                    {OBJECT_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-[#0a0e14] text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="pointer-events-none absolute bottom-4 right-5 h-4 w-4 text-white/40"
                  >
                    <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </label>

                {error && <p className="text-sm text-[#ff5f5f] sm:col-span-2">{error}</p>}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="group relative overflow-hidden rounded-full bg-white px-9 py-4 text-sm font-semibold uppercase tracking-widest text-black transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  <span className="relative z-10">{status === 'sending' ? 'Отправляем…' : 'Отправить запрос'}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#39ff8f] to-[#4fb2ff] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </section>
  )
}

/* -------------------------------------- Футер ------------------------------------ */

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#050608] px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <span className="text-lg font-bold uppercase tracking-[0.35em] text-white">Alonva</span>

        <nav className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-widest text-white/40 transition-colors duration-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-1 text-xs text-white/40 md:items-end">
          <a
            href="https://alonva.am"
            className="tracking-widest text-white/60 transition-colors duration-300 hover:text-white"
          >
            alonva.am
          </a>
          <span>© {new Date().getFullYear()} Alonva. Технологии для спорта.</span>
        </div>
      </div>
    </footer>
  )
}

/* ------------------------------------- App -------------------------------------- */

export default function App() {
  return (
    <div className="relative w-full overflow-x-hidden bg-[#050608] font-sans">
      <div className="fixed inset-0 z-0">
        <Canvas
          shadows
          dpr={[1, 1.8]}
          camera={{ position: [0, 0, 6.2], fov: 42 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none fixed inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,0.65)_75%)]" />

      <Header />

      <main className="relative z-10">
        <HeroContent />
        <ProductsSection />
        <StatsSection />
        <UseCasesSection />
        <ContactSection />
        <Footer />
      </main>
    </div>
  )
}
