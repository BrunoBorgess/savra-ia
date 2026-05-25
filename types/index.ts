export type Transaction = {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  date: string
  created_at: string
}

export type Bill = {
  id: string
  name: string
  amount: number
  due_date: string
  paid: boolean
  created_at: string
}

export type Insight = {
  id: string
  title: string
  description: string
  saving: number
  created_at: string
}