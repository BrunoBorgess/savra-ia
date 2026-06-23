import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

// GET /api/contas — lista todas as contas com filtros opcionais
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let query = supabase
    .from("bills")
    .select("*")
    .order("due_date", { ascending: true })

  if (status === "paid") query = query.eq("paid", true)
  if (status === "unpaid") query = query.eq("paid", false)
  if (search) query = query.ilike("name", `%${search}%`)
  if (from) query = query.gte("due_date", from)
  if (to) query = query.lte("due_date", to)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/contas — cria uma nova conta
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, amount, due_date } = body

  if (!name || !amount || !due_date) {
    return NextResponse.json({ error: "Campos obrigatórios: name, amount, due_date" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("bills")
    .insert({ name, amount: Number(amount), due_date, paid: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}