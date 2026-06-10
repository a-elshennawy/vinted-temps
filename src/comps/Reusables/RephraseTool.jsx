import { useState } from "react";
import { CiRedo } from "react-icons/ci";
import BtnLoader from "./UI/BtnLoader";
import { FaCheck, FaCopy } from "react-icons/fa";
import useMobile from "../Hooks/useMobile";

// const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function RephraseTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const isMobile = useMobile();

  const rephrase = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setError("");
    setCopied(false);

    try {
      const response = await fetch(
        "https://vinted-rephrase.ahmedshennawy997.workers.dev",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({ text: input }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Something went wrong");
      }

      setOutput(data.rephrased);
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
      <div className="rephraseTool">
        <div>
          <div className="originalReply">
            <textarea
              placeholder="Paste the reply you want to rephrase..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
              cols={isMobile ? 30 : 50}
            />
          </div>

          <div className="actions py-2">
            <button
              onClick={rephrase}
              disabled={loading || !input.trim()}
              className={loading || !input.trim() ? "disabledBtn" : ""}
            >
              {loading ? (
                <>
                  Rephrasing <BtnLoader />
                </>
              ) : (
                <>
                  <CiRedo /> rephrase
                </>
              )}
            </button>
            {(input || output) && <button onClick={clear}>Clear</button>}
          </div>

          {error && <div className="error p-1 my-1">{error}</div>}

          {output && (
            <div className="outputDev p-2">
              <div className="header">
                <h5>rephrased</h5>
                <button onClick={copyToClipboard}>
                  {copied ? (
                    <>
                      copied
                      <FaCheck color="var(--white)" />
                    </>
                  ) : (
                    <>
                      copy
                      <FaCopy color="var(--white)" />
                    </>
                  )}
                </button>
              </div>
              <div className="line my-1"></div>
              <div>{output}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
