import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      transaction_date,
      transaction_type,
      category,
      description,
      amount,
      input_by
    } = body;

    if (!transaction_date) {
      return Response.json(
        { ok: false, error: "transaction_date wajib diisi" },
        { status: 400 }
      );
    }

    if (!transaction_type || !["MASUK", "KELUAR"].includes(transaction_type)) {
      return Response.json(
        { ok: false, error: "transaction_type harus MASUK atau KELUAR" },
        { status: 400 }
      );
    }

    if (!category) {
      return Response.json(
        { ok: false, error: "category wajib diisi" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return Response.json(
        { ok: false, error: "amount harus lebih dari 0" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from("mosque_cash_transactions")
      .insert([
        {
          transaction_date,
          transaction_type,
          category,
          description: description || null,
          amount: Number(amount),
          input_by: input_by || null
        }
      ])
      .select();

    if (error) {
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, data }, { status: 200 });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
