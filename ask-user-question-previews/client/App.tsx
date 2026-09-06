import DOMPurify from "dompurify";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { type Question, useAgentSocket } from "./useAgentSocket";

export function App() {
  const { log, pending, status, busy, connected, submit, answer } =
    useAgentSocket("ws://localhost:3001/ws");

  const [prompt, setPrompt] = useState(
    "Help me brand a new SaaS product. Walk me through the key decisions (colors, typography, vibe) and show me visual options for each.",
  );

  // Auto-scroll the sidebar as log entries arrive.
  const logRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  return (
    <main
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        fontFamily: "system-ui",
      }}
    >
      <GlobalStyles />

      {/* Left: running conversation log. */}
      <aside
        ref={logRef}
        className="md"
        style={{
          borderRight: "1px solid #eee",
          padding: 16,
          overflowY: "auto",
          lineHeight: 1.5,
          fontSize: 14,
          background: "#fafafa",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Conversation</h2>
        {log.length === 0 && (
          <p style={{ color: "#999" }}>Responses appear here.</p>
        )}
        <LogView log={log} />
      </aside>

      {/* Center: prompt, status, and either the current question or the final result. */}
      <section style={{ padding: 24, overflowY: "auto" }}>
        <h1 style={{ marginTop: 0 }}>AskUserQuestion previews</h1>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          style={{ width: "100%", fontFamily: "inherit", fontSize: 14 }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <button onClick={() => submit(prompt)} disabled={busy || !connected}>
            {busy ? "Running..." : "Run"}
          </button>
          {!connected && (
            <span style={{ color: "#c00", fontSize: 13 }}>
              disconnected (retrying...)
            </span>
          )}
          {status && <StatusLine text={status} />}
        </div>

        {pending ? (
          <QuestionView q={pending.question} onPick={answer} />
        ) : busy ? (
          <Placeholder>Waiting for the next question...</Placeholder>
        ) : log.length > 0 ? (
          <div className="md" style={{ marginTop: 24, lineHeight: 1.6, maxWidth: 800 }}>
            <LogView log={log} />
          </div>
        ) : null}
      </section>
    </main>
  );
}

// -----------------------------------------------------------------------------
// QuestionView: renders one AskUserQuestion as a grid of preview cards.
// opt.preview is a Claude-generated HTML fragment, rendered with
// dangerouslySetInnerHTML and sanitized via DOMPurify.
// The SDK already strips <script> and <style> tags before the callback sees
// the preview; sanitizing again in the client is defense in depth.
// -----------------------------------------------------------------------------

function QuestionView({
  q,
  onPick,
}: {
  q: Question;
  onPick: (label: string) => void;
}) {
  const [other, setOther] = useState("");

  // Sanitize each option's preview HTML once when the question changes,
  // not on every render or keystroke. Options without a preview get null.
  const sanitized = useMemo(
    () => q.options.map((o) => (o.preview ? DOMPurify.sanitize(o.preview) : null)),
    [q.options],
  );

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      {/* q.header and q.question come from the AskUserQuestion tool call. */}
      <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase" }}>
        {q.header}
      </div>
      <h3 style={{ marginTop: 4 }}>{q.question}</h3>

      {/* Each option renders as a clickable card. Clicking sends opt.label
          back to the server, which returns it to the SDK as the user's answer. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        {q.options.map((opt, i) => (
          <button
            key={opt.label}
            onClick={() => onPick(opt.label)}
            style={{
              textAlign: "left",
              padding: 16,
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <strong>{opt.label}</strong>
            <p style={{ margin: "4px 0 12px", color: "#666", fontSize: 13 }}>
              {opt.description}
            </p>
            {/* Render the HTML preview if present. This is the key part of the
                demo: opt.preview contains a Claude-generated HTML fragment
                (color swatches, type specimens, sample UI, etc.). */}
            {sanitized[i] && (
              <div
                style={{
                  border: "1px dashed #eee",
                  padding: 12,
                  borderRadius: 4,
                }}
                dangerouslySetInnerHTML={{ __html: sanitized[i]! }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Free-text input so the user can type a custom answer instead of
          picking one of the predefined options. The typed text becomes the
          answer value sent back to the SDK. */}
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <input
          value={other}
          onChange={(e) => setOther(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && other.trim()) onPick(other.trim());
          }}
          placeholder="None of these? Type your own answer..."
          style={{ flex: 1, padding: 8, fontSize: 14, fontFamily: "inherit" }}
        />
        <button disabled={!other.trim()} onClick={() => onPick(other.trim())}>
          Send
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Layout helpers below. None of this is specific to the AskUserQuestion feature.
// -----------------------------------------------------------------------------

const LogView = memo(function LogView({ log }: { log: string[] }) {
  return (
    <>
      {log.map((entry, i) =>
        entry.startsWith("→ ") || entry.startsWith("— ") ? (
          <div key={i} style={{ color: "#888", fontSize: 12, margin: "6px 0" }}>
            {entry}
          </div>
        ) : (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
            {entry}
          </ReactMarkdown>
        ),
      )}
    </>
  );
});

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 40,
        padding: 40,
        border: "2px dashed #ddd",
        borderRadius: 8,
        color: "#999",
        textAlign: "center",
      }}
    >
      {children}
    </div>
  );
}

function StatusLine({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#666",
        fontSize: 13,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#4f46e5",
          animation: "pulse 1.2s ease-in-out infinite",
        }}
      />
      {text}
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      body { margin: 0; }
      .md table { border-collapse: collapse; margin: 12px 0; font-size: 13px; }
      .md th, .md td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
      .md th { background: #f6f6f6; }
      .md hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
      .md h1, .md h2, .md h3 { margin: 12px 0 6px; }
      .md p { margin: 6px 0; }
      .md pre { background: #f6f6f6; padding: 12px; border-radius: 4px; overflow-x: auto; }
      .md code { font-size: 0.9em; }
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.1); }
      }
    `}</style>
  );
}
