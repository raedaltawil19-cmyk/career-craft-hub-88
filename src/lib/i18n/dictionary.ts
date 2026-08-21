import { LANGUAGES, type Bundle, type Language } from "./types";

import common from "./ns/common";
import nav from "./ns/nav";
import landing from "./ns/landing";
import dashboard from "./ns/dashboard";
import cv from "./ns/cv";
import jobs from "./ns/jobs";
import applications from "./ns/applications";
import add from "./ns/add";
import tailor from "./ns/tailor";
import profile from "./ns/profile";
import notifications from "./ns/notifications";

const namespaces: Record<string, Bundle> = {
  common,
  nav,
  landing,
  dashboard,
  cv,
  jobs,
  applications,
  add,
  tailor,
  profile,
  notifications,
};

function build(): Record<Language, Record<string, string>> {
  const out = {} as Record<Language, Record<string, string>>;
  for (const { code } of LANGUAGES) {
    const table: Record<string, string> = {};
    for (const [ns, bundle] of Object.entries(namespaces)) {
      for (const [key, value] of Object.entries(bundle[code] ?? {})) {
        table[`${ns}.${key}`] = value;
      }
    }
    out[code] = table;
  }
  return out;
}

export const dictionary = build();
