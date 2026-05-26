import Groq from "groq-sdk"
import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function getContext() {
  const [{ data: transactions }, { data: bills }, { data: insights }] = await Promise.all([
    supabase.from("transactions").select("*"),
    supabase.from("bills").select("*").eq("paid", false),
    supabase.from("insights").select("*"),
  ])

  const receita = transactions
    ?.filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0) ?? 0

  const despesas = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0) ?? 0

  return { receita, despesas, fluxo: receita - despesas, bills, insights }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    const context = await getContext()

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Você é a IA do SAVRA, um sistema de gestão financeira empresarial.
Responda sempre em português, de forma direta e objetiva, em no máximo 3 linhas.
Dados atuais da empresa:
- Receita do mês: R$ ${context.receita.toLocaleString("pt-BR")}
- Despesas do mês: R$ ${context.despesas.toLocaleString("pt-BR")}
- Fluxo de caixa: R$ ${context.fluxo.toLocaleString("pt-BR")}
- Contas a pagar: ${JSON.stringify(context.bills)}
- Insights: ${JSON.stringify(context.insights)}`,
        },
        { role: "user", content: message },
      ],
    })

    const text = completion.choices[0].message.content ?? ""
    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("ERRO NA IA:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}