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
  volunteer: string[];
  updatedAt: string;
  template: CvTemplateId;
  version: number;
};

export type CvDoc = {
  id: string;
  name: string;
  kind: "master" | "tailored";
  jobId?: string;
  updatedAt: string;
  score: number;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  posted: string;
  source: string;
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
