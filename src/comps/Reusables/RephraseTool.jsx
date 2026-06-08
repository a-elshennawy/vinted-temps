import { useState } from "react";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function RephraseTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const rephrase = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setError("");
    setCopied(false);

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are a customer support assistant for a shipping and delivery company called Vinted. Your only job is to rephrase the reply the agent gives you. Keep the same meaning and information, but make it sound more professional, clear, and friendly. Return only the rephrased text with no explanations, no options, no extra commentary.",
              },
              {
                role: "user",
                content: input,
              },
            ],
            temperature: 0.5,
            max_tokens: 512,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Something went wrong");
      }

      setOutput(data.choices[0].message.content.trim());
    } catch (err) {
      setError(err.message || "Failed to rephrase. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <>
      <h3>coming soon, i guess</h3>
    </>
    // <div className="rephraseTool">
    //   <div>
    //     {/* Input */}
    //     <div>
    //       <label>Original Reply</label>
    //       <textarea
    //         placeholder="Paste the reply you want to rephrase..."
    //         value={input}
    //         onChange={(e) => setInput(e.target.value)}
    //         rows={5}
    //       />
    //       <div>{input.length} characters</div>
    //     </div>

    //     {/* Actions */}
    //     <div>
    //       <button onClick={rephrase} disabled={loading || !input.trim()}>
    //         {loading ? (
    //           <span>
    //             <span />
    //             Rephrasing...
    //           </span>
    //         ) : (
    //           "↻ Rephrase"
    //         )}
    //       </button>
    //       {(input || output) && <button onClick={clear}>Clear</button>}
    //     </div>

    //     {/* Error */}
    //     {error && <div>⚠ {error}</div>}

    //     {/* Output */}
    //     {output && (
    //       <div>
    //         <div>
    //           <label>Rephrased</label>
    //           <button onClick={copyToClipboard}>
    //             {copied ? "✓ Copied!" : "Copy"}
    //           </button>
    //         </div>
    //         <div>{output}</div>
    //       </div>
    //     )}
    //   </div>
    // </div>
  );
}
