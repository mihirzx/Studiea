// Decorative right-side panel for the auth landing: four floating shapes, one per
// Studiea AI agent. Each drifts slowly, glows in its color on hover, and reveals
// its agent name. Purely visual — hidden from assistive tech.

// Per-shape geometry. Circle/squircle use border-radius; blob uses an asymmetric
// radius; hexagon uses a clip-path.
const GEOMETRY = {
  circle:   { borderRadius: '9999px' },
  squircle: { borderRadius: '30%' },
  blob:     { borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%' },
  hexagon:  { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' },
};

const AGENTS = [
  {
    name: 'Notetaker',
    role: 'Transcribes every lesson',
    shape: 'circle',
    color: '#14b8a6',
    glow: 'rgba(20,184,166,0.45)',
    anim: 'animate-float-1',
    position: 'left-[14%] top-[16%]',
    size: 'h-24 w-24',
  },
  {
    name: 'HW Generator',
    role: 'Builds assignments',
    shape: 'squircle',
    color: '#2563eb',
    glow: 'rgba(37,99,235,0.45)',
    anim: 'animate-float-2',
    position: 'right-[16%] top-[22%]',
    size: 'h-28 w-28',
  },
  {
    name: 'Grader',
    role: 'Scores with feedback',
    shape: 'blob',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.45)',
    anim: 'animate-float-3',
    position: 'left-[22%] bottom-[18%]',
    size: 'h-28 w-28',
  },
  {
    name: 'Study Buddy',
    role: 'Tutors each student',
    shape: 'hexagon',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.50)',
    anim: 'animate-float-4',
    position: 'right-[18%] bottom-[16%]',
    size: 'h-24 w-24',
  },
];

function FloatingAgent({ agent }) {
  // Outer wrapper owns the float animation (transform); the inner group owns the
  // hover transform/glow so the two never fight over `transform`.
  return (
    <div className={`absolute ${agent.position} ${agent.anim}`}>
      <div
        className="group relative flex flex-col items-center transition-transform duration-300 hover:scale-110"
        style={{ '--glow': agent.glow }}
      >
        <div
          className={`${agent.size} cursor-pointer transition-shadow duration-500 hover:shadow-[0_0_45px_6px_var(--glow)]`}
          style={{
            ...GEOMETRY[agent.shape],
            background: `linear-gradient(140deg, ${agent.color} 0%, ${agent.color}cc 100%)`,
          }}
        />
        <div className="pointer-events-none absolute top-full mt-3 whitespace-nowrap text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="text-sm font-semibold text-gray-800">{agent.name}</p>
          <p className="text-xs text-gray-400">{agent.role}</p>
        </div>
      </div>
    </div>
  );
}

function AgentShowcase() {
  return (
    <div className="relative h-full w-full overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-[14%] z-10 px-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-800">
          Four AI agents. One classroom.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
          Studiea turns each lesson into assignments, feedback, and a personal tutor —
          automatically.
        </p>
      </div>

      {AGENTS.map((agent) => (
        <FloatingAgent key={agent.name} agent={agent} />
      ))}
    </div>
  );
}

export default AgentShowcase;
