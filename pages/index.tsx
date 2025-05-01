import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCsvUrl(null);
    setResponse("");

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: query }),
    });

    if (!res.ok) {
      setResponse("Something went wrong");
    } else {
      const data = await res.json();
      setResponse(data.text || "");
      if (data.csvUrl) {
        setCsvUrl(data.csvUrl);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Matrixify Assistant</title>
      </Head>
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">🧠 Matrixify Assistant</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={6}
            className="w-full border p-2 rounded"
            placeholder="Describe what you want (e.g., ‘Generate product import CSV for 3 t-shirts with 3 sizes’)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>

        {response && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Response:</h2>
            <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">{response}</pre>
          </div>
        )}

        {csvUrl && (
          <a
            href={csvUrl}
            download="matrixify_template.csv"
            className="mt-4 inline-block text-blue-600 underline"
          >
            Download CSV
          </a>
        )}
      </main>
    </>
  );
}
