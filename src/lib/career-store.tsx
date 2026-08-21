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
  CvDoc,
  MasterCv,
  Notification,
  Suggestion,
  SuggestionState,
} from "./career-types";
import {
  demoApplications,
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
};

const initialState: WorkspaceState = {
  onboarded: false,
  masterCv: null,
  docs: [],
  applications: [],
  suggestions: [],
  notifications: demoNotifications,
  savedJobIds: [],
};

const demoState: WorkspaceState = {
  onboarded: true,
  masterCv: demoMasterCv,
  docs: demoCvDocs,
  applications: demoApplications,
  suggestions: demoSuggestions,
  notifications: demoNotifications,
  savedJobIds: ["job-1", "job-3"],
};

type Ctx = {
  state: WorkspaceState;
  jobs: typeof demoJobs;
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
    }),
    [
      state,
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
