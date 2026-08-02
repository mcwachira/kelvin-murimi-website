import type {
  Capability,
  CaseStudy,
  Education,
  Experience,
  Language,
  Post,
  SiteSettings,
  SkillCategory,
} from './types'

export const fallbackSettings: SiteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  name: 'Kelvin Murimi',
  tagline: 'MEL & Business Intelligence',
  heroHeadline: 'Turning field data into decisions that move programmes forward.',
  heroSubcopy:
    'MEL and Business Intelligence professional with 5+ years across humanitarian, public health, and agricultural development. I design monitoring systems, build BI dashboards, and translate raw field data into the evidence that programme teams actually use.',
  statusBoard: {
    label: 'STATUS BOARD — KELVIN MURIMI',
    statusText: 'Available for remote roles',
    stats: [
      { label: 'Years in MEL & data analysis', value: '5+', barLevel: 5 },
      { label: 'Counties covered in field research', value: 'Multi', barLevel: 4 },
      { label: 'BI platforms shipped dashboards on', value: '3', barLevel: 3 },
      { label: 'Remote delivery', value: '2yr+', barLevel: 5 },
      { label: 'Community members reached, single project', value: '1,000+', barLevel: 5 },
    ],
  },
  contact: {
    email: 'kelvinmurimi181@gmail.com',
    phone: '+254703565172',
    linkedinUrl: 'https://www.linkedin.com/in/kelvin-murimi/',
  },
  location: 'Nairobi, Kenya',
  availability: 'Available for remote roles',
  seo: {
    metaTitle: 'Kelvin Murimi — MEL & Business Intelligence',
    metaDescription:
      'Monitoring, Evaluation & Learning and Business Intelligence professional in Nairobi, Kenya, available for remote roles.',
  },
}

export const fallbackExperience: Experience[] = [
  {
    _id: 'exp-1',
    _type: 'experience',
    title: 'Freelance Data Analyst',
    organization: 'Independent',
    startDate: '2026-01-01',
    isCurrent: true,
    order: 1,
    bullets: [
      'Delivering remote BI dashboards and data pipelines for US-based NGO and private-sector clients, with a focus on Power BI and SQL.',
      'Supporting M&E design, tool development, and reporting for humanitarian-adjacent programmes on a contract basis.',
      'Building reusable data models and documentation frameworks so clients can sustain analysis independently.',
    ],
  },
  {
    _id: 'exp-2',
    _type: 'experience',
    title: 'Monitoring and Evaluation Assistant',
    organization: 'The Fred Hollows Foundation',
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    order: 2,
    bullets: [
      'Led trachoma case investigations (TT verification) feeding directly into the SAFE strategy, coordinating field teams across multiple counties.',
      'Designed and administered KIIs and FGDs to diagnose referral system drop-off, producing evidence used in county-level programme design.',
      'Managed data quality across Kobo Toolbox and ODK Collect collection cycles, reducing form error rates and improving indicator completeness.',
    ],
  },
  {
    _id: 'exp-3',
    _type: 'experience',
    title: 'Business Intelligence Analyst',
    organization: 'Sustainable Management Services / ECOM Agroindustrial',
    startDate: '2020-01-01',
    endDate: '2022-12-31',
    order: 3,
    bullets: [
      'Built Power BI and Tableau dashboards tracking supply chain KPIs across agricultural commodity flows in East Africa.',
      'Wrote SQL and Python pipelines to clean and integrate data from multiple upstream systems into a single analytical layer.',
      'Presented findings to senior management, translating complex data patterns into actionable supply chain recommendations.',
    ],
  },
  {
    _id: 'exp-4',
    _type: 'experience',
    title: 'Volunteer Research Assistant',
    organization: 'Fundi Kipusa CBO',
    startDate: '2016-01-01',
    endDate: '2020-12-31',
    order: 4,
    bullets: [
      'Supported community health research in Nairobi informal settlements, conducting household surveys and qualitative interviews.',
      'Assisted with data entry, cleaning, and basic analysis using Excel and SPSS, producing summary reports for programme planning.',
      'Contributed to stakeholder feedback sessions, helping translate community perspectives into programme adjustments.',
    ],
  },
]

export const fallbackEducation: Education[] = [
  {
    _id: 'edu-1',
    _type: 'education',
    degree: 'BSc Information Science',
    institution: 'Technical University of Kenya',
    order: 1,
  },
]

export const fallbackLanguages: Language[] = [
  { _id: 'lang-1', _type: 'language', name: 'English', level: 'FLUENT', order: 1 },
  { _id: 'lang-2', _type: 'language', name: 'Swahili', level: 'NATIVE', order: 2 },
]

export const fallbackSkills: SkillCategory[] = [
  {
    _id: 'skill-1',
    _type: 'skillCategory',
    title: 'Monitoring & Evaluation',
    order: 1,
    skills: [
      'Data Quality Assessments',
      'Survey Design',
      'Indicator Tracking',
      'Impact Evaluation',
      'Program Evaluation',
      'Stakeholder Reporting',
    ],
  },
  {
    _id: 'skill-2',
    _type: 'skillCategory',
    title: 'Field & Research Methods',
    order: 2,
    skills: [
      'KIIs & FGDs',
      'Kobo Toolbox',
      'ODK Collect',
      'Qualitative Analysis',
    ],
  },
  {
    _id: 'skill-3',
    _type: 'skillCategory',
    title: 'Quantitative Analysis',
    order: 3,
    skills: [
      'SPSS',
      'Excel',
      'Regression analysis',
      'Statistical testing',
      'Sampling',
    ],
  },
  {
    _id: 'skill-4',
    _type: 'skillCategory',
    title: 'Data & Business Intelligence',
    order: 4,
    skills: [
      'Power BI',
      'SQL',
      'Python',
      'R',
      'Tableau',
      'Apache Superset',
      'DHIS2',
      'Dataiku',
    ],
  },
  {
    _id: 'skill-5',
    _type: 'skillCategory',
    title: 'Collaboration & Delivery',
    order: 5,
    skills: [
      'SharePoint',
      'Microsoft Teams',
      'Microsoft Excel',
      'Zoom',
      'Remote Client Delivery',
    ],
  },
]

export const fallbackCapabilities: Capability[] = [
  {
    _id: 'cap-1',
    _type: 'capability',
    order: 1,
    title: 'Monitoring & Data Quality',
    description:
      'Designing and running DQA, indicator tracking, and evaluation frameworks that actually catch the variance. Field-proven across public health and humanitarian programmes.',
  },
  {
    _id: 'cap-2',
    _type: 'capability',
    order: 2,
    title: 'Dashboards & BI',
    description:
      'Building actionable Power BI, Tableau, and Apache Superset dashboards from messy, multi-source data. The deliverable is a decision tool, not a chart dump.',
  },
  {
    _id: 'cap-3',
    _type: 'capability',
    order: 3,
    title: 'Remote Delivery',
    description:
      'Two-plus years delivering for US-based clients asynchronously — clear documentation, disciplined communication, on-time outputs across time zones.',
  },
]

const paragraph = (text: string) => [
  { _type: 'block' as const, _key: 'k', style: 'normal' as const, children: [{ _type: 'span' as const, text }] },
]

export const fallbackCaseStudies: CaseStudy[] = [
  {
    _id: 'case-1',
    _type: 'caseStudy',
    caseNumber: 681,
    title: 'Trachoma Case Investigation & TT Verification',
    slug: { current: 'trachoma-case-investigation-tt-verification' },
    year: '2025',
    organization: 'Fred Hollows Foundation',
    tags: ['MEL', 'Field research', 'Data quality'],
    summary:
      'Multi-county investigation into barriers to Trichiasis Treatment uptake, feeding evidence back into the SAFE strategy roadmap.',
    approach: paragraph(
      'Coordinated field teams across multiple counties to verify trichiasis treatment cases and trace drop-off.',
    ),
    analysis: paragraph(
      'Analysed case records and interview data to surface systemic barriers to treatment uptake.',
    ),
    outcome: paragraph(
      'Feeding evidence directly back into the SAFE strategy roadmap for programme adjustment.',
    ),
    hasSampleDashboard: true,
    dashboardMock: {
      quarterlyOutputData: [
        { label: 'Q1', value: 45 },
        { label: 'Q2', value: 67 },
        { label: 'Q3', value: 82 },
        { label: 'Q4', value: 72 },
      ],
      coveragePercent: 78,
      kpis: [
        { label: 'Cases verified', value: '12,400', status: 'on-track' },
        { label: 'TT follow-up', value: '8,120', status: 'below-target' },
        { label: 'Data completeness', value: '96%', status: 'on-track' },
      ],
    },
    order: 1,
  },
  {
    _id: 'case-2',
    _type: 'caseStudy',
    caseNumber: 2,
    title: 'Referral Fallout Study',
    slug: { current: 'referral-fallout-study' },
    year: '2024',
    organization: 'Fred Hollows Foundation',
    tags: ['Research', 'Referral pathways', 'Mixed methods'],
    summary:
      'Assessment of why patients referred for eye surgery were failing to complete the referral pathway, leading to preventable blindness.',
    approach: paragraph('Combined referral registers, follow-up calls and staff interviews.'),
    analysis: paragraph('Mapped loss points and tested patterns by facility, distance and wait time.'),
    outcome: paragraph('Focused follow-up on the two stages responsible for most attrition.'),
    order: 2,
  },
  {
    _id: 'case-3',
    _type: 'caseStudy',
    caseNumber: 3,
    title: 'Remote BI & Dashboard Delivery',
    slug: { current: 'remote-bi-and-dashboard-delivery' },
    year: '2024-PRESENT',
    organization: 'Freelance',
    tags: ['Remote', 'BI', 'Reporting'],
    summary:
      'Ongoing dashboard and reporting delivery for US-based non-profit and private-sector clients working in development and health sectors.',
    approach: paragraph(
      'Ran remote discovery and agreed metric definitions with distributed owners.',
    ),
    analysis: paragraph('Built a durable model with quality checks and a concise executive view.'),
    outcome: paragraph(
      'Shorter reporting cycles, clearer ownership and one consistent source of truth.',
    ),
    order: 3,
  },
]

export const fallbackPosts: Post[] = [
  {
    _id: 'post-1',
    _type: 'post',
    title: 'What good MEL dashboards leave out',
    slug: { current: 'what-good-mel-dashboards-leave-out' },
    excerpt: 'Clarity often comes from deciding what not to put on the screen.',
    tags: ['Dashboards', 'MEL'],
    publishedAt: '2026-07-18T09:00:00Z',
    body: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'A useful dashboard is not a warehouse. It is a carefully edited interface for a recurring decision.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'b2',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Start with the meeting, the decision owner and the action that changes when an indicator moves. Only then choose the visual.',
          },
        ],
      },
    ],
  },
  {
    _id: 'post-2',
    _type: 'post',
    title: 'From field data to programme decisions',
    slug: { current: 'field-data-to-programme-decisions' },
    excerpt: 'A practical chain for keeping evidence connected to action.',
    tags: ['Field research', 'Learning'],
    publishedAt: '2026-06-04T09:00:00Z',
    body: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Data quality is not a final cleaning step. It begins with definitions that field teams can use consistently.',
          },
        ],
      },
      {
        _type: 'block',
        _key: 'b2',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'The strongest review routines make uncertainty visible and leave a short record of what changed as a result.',
          },
        ],
      },
    ],
  },
]
