/**
 * Same institutes as backend `config/colleges.js` — used when the API
 * is unreachable (e.g. Vercel build without REACT_APP_API_URL) so signup
 * still shows quick-pick chips + datalist.
 */
export const FALLBACK_CAMPUS_SUGGESTIONS = [
  { id: "mnit_jaipur", name: "MNIT Jaipur", city: "Jaipur" },
  { id: "lnmiit_jaipur", name: "LNMIIT Jaipur", city: "Jaipur" },
  { id: "bits_pilani", name: "BITS Pilani", city: "Pilani" },
  { id: "iit_bombay", name: "IIT Bombay", city: "Mumbai" },
  { id: "nit_trichy", name: "NIT Trichy", city: "Tiruchirappalli" },
  { id: "iiit_hyderabad", name: "IIIT Hyderabad", city: "Hyderabad" },
  { id: "iit_delhi", name: "IIT Delhi", city: "New Delhi" },
  { id: "nit_warangal", name: "NIT Warangal", city: "Warangal" },
];
