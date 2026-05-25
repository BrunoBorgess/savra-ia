import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
  const { message } = await req.json()

  const context = await getContext()

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `Você é a IA do SAVRA, um sistema de gestão financeira empresarial.
Responda sempre em português, de forma direta e objetiva, em no máximo 3 linhas.
Dados atuais da empresa:
- Receita do mês: R$ ${context.receita.toLocaleString("pt-BR")}
- Despesas do mês: R$ ${context.despesas.toLocaleString("pt-BR")}
- Fluxo de caixa: R$ ${context.fluxo.toLocaleString("pt-BR")}
- Contas a pagar: ${JSON.stringify(context.bills)}
- Insights: ${JSON.stringify(context.insights)}`,
  })

  const result = await model.generateContent(message)
  const text = result.response.text()

  return NextResponse.json({ response: text })
}