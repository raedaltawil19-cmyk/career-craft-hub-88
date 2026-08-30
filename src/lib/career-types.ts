export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type EducationEntry = {
  id: string;
  school: string;
  program: string;
  start: string;
  end: string;
  note?: string;
};

export type ReferenceEntry = {
  id: string;
  name: string;
  relation: string;
  company: string;
  email: string;
  phone: string;
};

export type ProjectEntry = {
  id: string;
  name: string;
  description: string;
  year: string;
};

export type MasterCv = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  languages: string[];
  tools: string[];
  certifications: string[];
  projects: ProjectEntry[];
  references?: ReferenceEntry[];
  volunteer: string[];
  updatedAt: string;
  template: CvTemplateId;
  version: number;
};

/** One approved tailoring change, applied to a copy of the source CV. */
export type TailorChange = {
  target: "summary" | "skills" | "bullet";
  before: string;
  after: string;
};

export type CvDoc = {
  id: string;
  name: string;
  kind: "master" | "tailored";
  jobId?: string;
  /** Job metadata this version was tailored for. */
  company?: string;
  jobTitle?: string;
  /** Name of the CV this version was derived from. */
  sourceName?: string;
  /** Sequential version number inside this job / source family. */
  version?: number;
  /** Approved changes that were applied when the version was created. */
  changes?: TailorChange[];
  updatedAt: string;
  score: number;
  /** Id of the CV this version was derived from. */
  parentId?: string;
  /** Base name used when numbering duplicates. */
  baseName?: string;
  createdAt?: string;
  /** Content snapshot for tailored copies; master reads from state.masterCv. */
  data?: MasterCv;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  posted: string;
  source: string;
  /** External application link. */
  applyUrl: string;
  salary?: string;
  match: number;
  matchingSkills: string[];
  gaps: string[];
  summary: string;
  responsibilities: string[];
  required: string[];
  preferred: string[];
  keywords: string[];
  experienceRequirement: string;
  /** Career paths this job belongs to (see CareerSuggestion.id). */
  careerIds?: string[];
};

export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Interview"
  | "Second interview"
  | "Offer"
  | "Rejected"
  | "Withdrawn"
  | "Closed";

export type ApplicationEvent = {
  id: string;
  date: string;
  label: string;
  detail?: string;
};

export type Application = {
  id: string;
  jobId?: string;
  company: string;
  position: string;
  link: string;
  appliedDate: string;
  cvUsed: string;
  status: ApplicationStatus;
  notes: string;
  nextAction?: string;
  nextActionDate?: string;
  timeline: ApplicationEvent[];
};

export type CvTemplateId = "editorial" | "modern" | "classic" | "compact" | "minimal";

export type CareerSuggestion = {
  id: string;
  title: string;
  why: string;
  transferable: string[];
  openings: number;
  match: number;
};

export type SuggestionState = "pending" | "accepted" | "rejected";

export type Suggestion = {
  id: string;
  section: string;
  issue: string;
  severity: "high" | "medium" | "low";
  rationale: string;
  before: string;
  after: string;
  state: SuggestionState;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "job" | "application" | "ai" | "system";
  read: boolean;
};
