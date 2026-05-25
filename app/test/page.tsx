import { supabase } from "@/lib/supabase"

export default async function TestPage() {
  const { data, error } = await supabase.from("bills").select("*")

  if (error) {
    return <pre style={{ color: "red" }}>{JSON.stringify(error, null, 2)}</pre>
  }

  return <pre style={{ color: "green" }}>{JSON.stringify(data, null, 2)}</pre>
}