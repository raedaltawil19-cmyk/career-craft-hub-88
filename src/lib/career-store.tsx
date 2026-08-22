import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Application,
  ApplicationStatus,
  CareerSuggestion,
  CvTemplateId,
  CvDoc,
  MasterCv,
  Notification,
  Suggestion,
  SuggestionState,
} from "./career-types";
import {
  demoApplications,
  demoCareerSuggestions,
  demoCvDocs,
  demoJobs,
  demoMasterCv,
  demoNotifications,
  demoSuggestions,
} from "./career-data";

type WorkspaceState = {
  onboarded: boolean;
  masterCv: MasterCv | null;
  docs: CvDoc[];
  applications: Application[];
  suggestions: Suggestion[];
  notifications: Notification[];
  savedJobIds: string[];
  template: CvTemplateId;
};

const initialState: WorkspaceState = {
  onboarded: false,
  masterCv: null,
  docs: [],
  applications: [],
  suggestions: [],
  notifications: demoNotifications,
  savedJobIds: [],
  template: "editorial",
};

const demoState: WorkspaceState = {
  onboarded: true,
  masterCv: demoMasterCv,
  docs: demoCvDocs,
  applications: demoApplications,
  suggestions: demoSuggestions,
  notifications: demoNotifications,
  savedJobIds: ["job-1", "job-3"],
  template: "editorial",
};

type Ctx = {
  state: WorkspaceState;
  jobs: typeof demoJobs;
  careers: CareerSuggestion[];
  setTemplate: (template: CvTemplateId) => void;
  applySuggestion: (id: string, text: string) => void;
  loadDemo: () => void;
  reset: () => void;
  createMasterCv: (cv: MasterCv) => void;
  updateMasterCv: (patch: Partial<MasterCv>) => void;
  setSuggestionState: (id: string, next: SuggestionState) => void;
  acceptAllSuggestions: () => void;
  addApplication: (app: Application) => void;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  setApplicationStatus: (id: string, status: ApplicationStatus) => void;
  toggleSavedJob: (jobId: string) => void;
  addTailoredCv: (doc: CvDoc) => void;
  duplicateCv: (id: string, copyLabel: string) => string;
  deleteCv: (id: string) => void;
  updateCvDoc: (id: string, patch: Partial<CvDoc>) => void;
  markAllNotificationsRead: () => void;
};

const WorkspaceContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "smartcv:workspace:v1";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as WorkspaceState) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const loadDemo = useCallback(() => setState(demoState), []);
  const reset = useCallback(() => setState(initialState), []);

  const createMasterCv = useCallback((cv: MasterCv) => {
    setState((s) => ({
      ...s,
      onboarded: true,
      masterCv: { ...cv, updatedAt: new Date().toISOString() },
      suggestions: s.suggestions.length ? s.suggestions : demoSuggestions,
      docs: s.docs.some((d) => d.kind === "master")
        ? s.docs
        : [
            { id: "cv-master", name: "Master CV", kind: "master", updatedAt: "just now", score: 72 },
            ...s.docs,
          ],
    }));
  }, []);

  const updateMasterCv = useCallback((patch: Partial<MasterCv>) => {
    setState((s) =>
      s.masterCv
        ? {
            ...s,
            masterCv: { ...s.masterCv, ...patch, updatedAt: new Date().toISOString() },
          }
        : s,
    );
  }, []);

  const setTemplate = useCallback((template: CvTemplateId) => {
    setState((s) => ({
      ...s,
      template,
      masterCv: s.masterCv ? { ...s.masterCv, template } : s.masterCv,
    }));
  }, []);

  /** Replace the original wording with the approved (possibly edited) text. */
  const applySuggestion = useCallback((id: string, text: string) => {
    setState((s) => {
      const suggestion = s.suggestions.find((x) => x.id === id);
      const suggestions = s.suggestions.map((x) =>
        x.id === id ? { ...x, after: text, state: "accepted" as SuggestionState } : x,
      );
      if (!suggestion || !s.masterCv) return { ...s, suggestions };
      const before = suggestion.before;
      const cv = s.masterCv;
      const masterCv: MasterCv = {
        ...cv,
        summary: cv.summary === before ? text : cv.summary,
        experience: cv.experience.map((e) => ({
          ...e,
          bullets: e.bullets.map((b) => (b === before ? text : b)),
        })),
        updatedAt: new Date().toISOString(),
      };
      return { ...s, suggestions, masterCv };
    });
  }, []);

  const setSuggestionState = useCallback((id: string, next: SuggestionState) => {
    setState((s) => ({
      ...s,
      suggestions: s.suggestions.map((x) => (x.id === id ? { ...x, state: next } : x)),
    }));
  }, []);

  const acceptAllSuggestions = useCallback(() => {
    setState((s) => ({
      ...s,
      suggestions: s.suggestions.map((x) =>
        x.state === "pending" ? { ...x, state: "accepted" } : x,
      ),
    }));
  }, []);

  const addApplication = useCallback((app: Application) => {
    setState((s) => ({ ...s, applications: [app, ...s.applications] }));
  }, []);

  const updateApplication = useCallback((id: string, patch: Partial<Application>) => {
    setState((s) => ({
      ...s,
      applications: s.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const setApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    setState((s) => ({
      ...s,
      applications: s.applications.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              timeline: [
                ...a.timeline,
                {
                  id: `ev-${Math.random().toString(36).slice(2, 8)}`,
                  date: new Date().toISOString().slice(0, 10),
                  label: `Status changed to ${status}`,
                },
              ],
            }
          : a,
      ),
    }));
  }, []);

  const toggleSavedJob = useCallback((jobId: string) => {
    setState((s) => ({
      ...s,
      savedJobIds: s.savedJobIds.includes(jobId)
        ? s.savedJobIds.filter((x) => x !== jobId)
        : [...s.savedJobIds, jobId],
    }));
  }, []);

  /** Duplicate one CV version. Copies are numbered: "<base> — <copyLabel> 1". */
  const duplicateCv = useCallback((id: string, copyLabel: string) => {
    const newId = `cv-${Math.random().toString(36).slice(2, 8)}`;
    setState((s) => {
      const doc = s.docs.find((d) => d.id === id);
      if (!doc) return s;
      const base = doc.baseName ?? doc.name;
      const prefix = `${base} — ${copyLabel} `;
      const used = s.docs
        .map((d) => (d.name.startsWith(prefix) ? Number(d.name.slice(prefix.length)) : 0))
        .filter((n) => Number.isFinite(n) && n > 0);
      const next = (used.length ? Math.max(...used) : 0) + 1;
      const copy: CvDoc = {
        ...doc,
        id: newId,
        name: `${prefix}${next}`,
        baseName: base,
        kind: "tailored",
        parentId: doc.kind === "master" ? doc.id : (doc.parentId ?? doc.id),
        createdAt: new Date().toISOString(),
        updatedAt: "just now",
        ...(doc.data
          ? { data: doc.data }
          : doc.kind === "master" && s.masterCv
            ? { data: s.masterCv }
            : {}),
      };
      const at = s.docs.findIndex((d) => d.id === id);
      const docs = [...s.docs];
      docs.splice(at + 1, 0, copy);
      return { ...s, docs };
    });
    return newId;
  }, []);

  /** Remove a version and every version derived from it. */
  const deleteCv = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      docs: s.docs.filter((d) => d.id !== id && d.parentId !== id),
    }));
  }, []);

  const updateCvDoc = useCallback((id: string, patch: Partial<CvDoc>) => {
    setState((s) => ({
      ...s,
      docs: s.docs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }, []);

  const addTailoredCv = useCallback((doc: CvDoc) => {
    setState((s) => ({ ...s, docs: [doc, ...s.docs.filter((d) => d.id !== doc.id)] }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      jobs: demoJobs,
      careers: demoCareerSuggestions,
      setTemplate,
      applySuggestion,
      loadDemo,
      reset,
      createMasterCv,
      updateMasterCv,
      setSuggestionState,
      acceptAllSuggestions,
      addApplication,
      updateApplication,
      setApplicationStatus,
      toggleSavedJob,
      addTailoredCv,
      duplicateCv,
      deleteCv,
      updateCvDoc,
      markAllNotificationsRead,
    }),
    [
      state,
      setTemplate,
      applySuggestion,
      loadDemo,
      reset,
      createMasterCv,
      updateMasterCv,
      setSuggestionState,
      acceptAllSuggestions,
      addApplication,
      updateApplication,
      setApplicationStatus,
      toggleSavedJob,
      addTailoredCv,
      markAllNotificationsRead,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
