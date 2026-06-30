const REMOTE_DB_URL = process.env.SUPABASE_URL;
const REMOTE_DB_KEY = process.env.SUPABASE_KEY;
const REMOTE_TABLE = process.env.SUPABASE_TABLE || "ratings";
const useRemoteDb = Boolean(REMOTE_DB_URL && REMOTE_DB_KEY);

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && Object.keys(req.body).length > 0) {
      return resolve(req.body);
    }

    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function fetchRemoteRatings() {
  if (!useRemoteDb) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY are required.");
  }

  // CATATAN: Jika data sudah sangat banyak, disarankan mengganti query ini 
  // dengan Supabase RPC (Stored Procedure) untuk menghitung AVG dan COUNT di database.
  const url = `${REMOTE_DB_URL}/rest/v1/${REMOTE_TABLE}?select=rating,email,comment,created_at&order=created_at.desc`;
  const response = await fetch(url, {
    headers: {
      apikey: REMOTE_DB_KEY,
      Authorization: `Bearer ${REMOTE_DB_KEY}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Remote DB fetch failed: ${response.status}`);
  }

  const rows = await response.json();
  const count = rows.length;
  const sum = rows.reduce((total, row) => total + Number(row.rating || 0), 0);
  const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;
  
  return {
    count,
    average,
    comments: rows.map(row => ({
      rating: Number(row.rating || 0),
      email: row.email || "Anonymous",
      comment: row.comment || "",
      created_at: row.created_at || null
    }))
  };
}

async function postRemoteRating(payload) {
  if (!useRemoteDb) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY are required.");
  }

  const url = `${REMOTE_DB_URL}/rest/v1/${REMOTE_TABLE}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: REMOTE_DB_KEY,
      Authorization: `Bearer ${REMOTE_DB_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation" // Mengembalikan data yang diinsert
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Remote DB save failed: ${response.status} ${errorBody}`);
  }

  return response.json();
}

module.exports = async (req, res) => {
  try {
    if (!useRemoteDb) {
      return res.status(500).json({ error: "Remote database credentials are not configured." });
    }

    // 1. PENANGANAN GET
    if (req.method === "GET") {
      const data = await fetchRemoteRatings();
      return res.status(200).json(data);
    }

    // 2. PENANGANAN POST
    if (req.method === "POST") {
      const body = await parseRequestBody(req);
      const rating = Number(body.rating);
      const email = typeof body.email === "string" ? body.email.trim() : "";
      const comment = typeof body.comment === "string" ? body.comment.trim() : "";

      // PERBAIKAN VALIDASI: Memastikan input adalah angka valid antara 1 - 5
      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
      }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "A valid email address is required." });
      }
      if (!comment || comment.length < 3) {
        return res.status(400).json({ error: "Please add a short comment with your rating." });
      }

      const savedData = await postRemoteRating({ rating, email, comment });
      
      // Mengembalikan data asli dari DB agar client tahu ID atau created_at nya
      return res.status(200).json({ 
        message: "Rating saved to remote DB.", 
        data: savedData[0] || savedData 
      });
    }

    // 3. METHOD TIDAK DIIZINKAN
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to process rating request." });
  }
};