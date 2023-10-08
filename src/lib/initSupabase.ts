import { createClient } from "@supabase/supabase-js";
import localforage from "localforage";

const supapaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supapaseUrl, supabaseKey, {
  global: { fetch: fetch.bind(globalThis) },
  auth: {
    // @ts-ignore
    storage: localforage,
    persistSession: true,
  },
});

localforage.config({
  name: "supabase",
  storeName: "auth",
});

export default supabase;