export const cv = {
  metaTitle: "CV | Brittany Perera",
  sections: {
    experience: "Experience",
    projects: "Engineering projects",
    education: "Education",
    leadership: "Leadership",
    skills: "Skills",
    languages: "Languages",
  },
  name: "Brittany Perera",
  email: "brittanykawshalya@gmail.com",
  tags: ["Python", "TypeScript", "ML", "Geospatial", "SQL"],
  roles: [
    {
      title: "AI Software Engineer",
      org: "PangeAI",
      when: "May 2026 to now",
      summary: "",
      bullets: [
        "Work with clients worldwide, acting as their forward-deployed engineer when needed, across insurance, energy, utilities, housing and infrastructure in Europe, the US, Japan, the Middle East and Central America. I take what each client needs and build it into the platform as general, robust capability that works in any region, so every client after them gets it too. Technical contact for a resort and data-centre developer.",
        "Build core parts of PangeAI's agentic geospatial platform: the analysis tools the AI agent calls for flood, hydrology, terrain, climate and infrastructure (flow paths, ponding, cut-and-fill, live river gauges), 20+ global and regional datasets in its catalogue, government flood maps served through our FastAPI tile server, and risk report export in the React map interface.",
        "Run applied computer-vision research on satellite, aerial and radar imagery (building damage, solar panels, building height, change detection) as pre-registered experiments on held-out data. My wildfire damage model on NVIDIA's C-RADIO encoder scored F1 0.987 on 853 unseen homes, ahead of GPT-5.5 vision at 0.955; a radar damage screen reached AUC 0.795 on the Morocco earthquake.",
        "Assess NVIDIA's AI stack (NIM, NeMo, Earth-2, C-RADIO) against our product, benchmark ideas and drop the weak ones with numbers, and brief leadership on where PangeAI fits.",
        "Turn research findings into use cases, delivery plans and commercial opportunities: proposals, client briefings and the call on which ideas get built and which get dropped.",
        "Drove the final sprint of our US Department of Defense (SERDP) wildfire fuels prize entry: 1 m 3D fuel maps built from public data, validated across 16 sites, with a 3D viewer and 1,129 automated tests.",
        "Built Ground Truth, PangeAI's daily satellite-image guessing game, from prototype to a production-ready app: server-side scoring and anti-cheat, worldwide leaderboards and groups, a party mode for live events, and 216 locations with no repeats for a year.",
      ],
    },
    {
      title: "Powerplant Engineer and Software Developer",
      org: "VietJet Air",
      when: "Feb 2024 to May 2026",
      summary: "",
      bullets: [
        "Built an AI-driven engine health dashboard for the airline's engine fleet, combining live data, analytics and predictive models for engineering and management.",
        "Applied machine learning that adapts to live engine data across the fleet, monitoring changes in engine degradation and predicting each engine's future status from its exhaust gas temperature (EGT) margin.",
        "Predictive maintenance for aircraft engines: modelled how much margin each wash recovers and turned it into adaptive wash schedules for ground engineers, saving fuel and cost.",
        "Shipped the tools as cloud apps and APIs with CI/CD and automated tests, and validated the models with time-based splits, scenario tests and SHAP.",
      ],
    },
    {
      title: "Private Tutor",
      org: "Oakley Tutors",
      when: "Dec 2023 to May 2026",
      summary: "",
      bullets: ["Taught A-level physics and maths, part-time and remotely."],
    },
    {
      title: "Undergraduate Researcher",
      org: "Mercedes-AMG Petronas F1",
      when: "Oct 2023 to Jun 2024",
      summary: "",
      bullets: [
        "Designed an optimised radiator for the Formula One car, combining CFD with algorithmic design optimisation.",
        "Built parametric MATLAB and Python simulations of coolant flow, heat rejection, pressure drop and aerodynamic interaction.",
        "Compared geometries and flow paths to cut mass and drag without losing cooling.",
      ],
    },
  ],
  projects: [
    {
      title: "AI-optimised group trip planner",
      org: "Personal",
      when: "",
      summary:
        "Full-stack app for deciding a trip as a group (destinations, itinerary, voting, admin), with a game-like interface, backend, database and end-to-end tests.",
    },
    {
      title: "Competitive goal tracker",
      org: "Personal",
      when: "",
      summary:
        "Full-stack app where players set goals, log progress and compete over a fixed run of days. Next.js, Postgres with Drizzle, deployed on Vercel, 269 automated tests.",
    },
    {
      title: "AI engineering workflow",
      org: "Personal",
      when: "",
      summary:
        "My own multi-agent setup for running research and engineering workstreams in parallel, with review gates, handovers and a searchable knowledge base.",
    },
    {
      title: "Free flight analysis",
      org: "University, 2020 to 2024",
      when: "",
      summary: "MATLAB modelling of aerofoil behaviour in incompressible flow.",
    },
    {
      title: "Physiological control systems",
      org: "University, 2020 to 2024",
      when: "",
      summary: "Designed an implantable NHS device to mitigate stress urinary incontinence.",
    },
    {
      title: "Walking robot",
      org: "University, 2020 to 2024",
      when: "",
      summary:
        "Designed and built a battery-powered robot that navigates terrain, using SolidWorks and 3D printing.",
    },
    {
      title: "Fabrication",
      org: "University, 2020 to 2024",
      when: "",
      summary: "Built a stainless-steel toolbox using industrial machining and welding.",
    },
  ],
  education: [
    {
      title: "MEng Engineering Science",
      org: "University of Oxford, St Edmund Hall",
      when: "Oct 2020 to Jun 2024",
      summary:
        "Master’s project: radiator optimisation for Mercedes-AMG Petronas F1. Modules: thermodynamics, control systems, chemical processes, biomechanics, imaging.",
    },
    {
      title: "A-levels",
      org: "Torquay Girls’ Grammar School",
      when: "2020",
      summary:
        "Mathematics (A), Physics (A), Chemistry (A), Extended Project (A), AS Further Mathematics (A). GCSEs: all 9s and an A* across 10 subjects.",
    },
  ],
  leadership: [
    {
      title: "St Edmund Hall President",
      org: "St Edmund Hall, Oxford",
      when: "2021 to 2022",
      summary:
        "Represented 700+ students and led a 16-person committee on rent, bursaries and policy.",
    },
    {
      title: "May Ball President",
      org: "St Edmund Hall, Oxford",
      when: "2022",
      summary:
        "Ran a 950-guest ball on a six-figure budget, including sponsorship and contractors.",
    },
    {
      title: "Fundraising Campaigner",
      org: "St Edmund Hall, Oxford",
      when: "2022",
      summary: "Raised £20,000+ from industry contacts and donors.",
    },
    {
      title: "Summer Camp Counsellor",
      org: "USA",
      when: "Jun to Aug 2022",
      summary: "Children aged 6 to 17: sports, woodwork, camping and paddle-boarding expeditions.",
    },
    {
      title: "Other",
      org: "",
      when: "",
      summary:
        "Officer Cadet, Oxford University Air Squadron. Captain, University Development Squad football. College hockey goalkeeper. Duke of Edinburgh Bronze and Silver. Built a playground at a children's hospital in Kurunegala, Sri Lanka (2018).",
    },
  ],
  skills: [
    "Python",
    "TypeScript",
    "SQL",
    "PyTorch",
    "scikit-learn",
    "Computer vision",
    "Google Earth Engine",
    "GDAL",
    "GeoPandas",
    "H3",
    "LangGraph",
    "FastAPI",
    "PostgreSQL",
    "React",
    "Mapbox GL",
    "Google Cloud",
    "Docker",
    "GitHub Actions",
    "Claude Code (agentic coding)",
    "MATLAB",
    "SolidWorks",
  ],
  languages: [
    "English (native)",
    "Sinhala (fluent)",
    "French (intermediate)",
    "German (intermediate)",
  ],
  downloadLabel: "Download PDF",
};
