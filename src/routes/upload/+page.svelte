<script>
  /* Script code remains untouched as requested */
  let file = null;
  let audioUrl = "";
  let meetingType = "";
  let loading = false;
  let transcript = "";
  let error = "";
  let copied = false;

  let summary = "";
  let summaryLoading = false;
  let summaryCopied = false;

  let actionItems = "";
  let actionItemsLoading = false;
  let actionItemsCopied = false;

  let highlights = "";
  let highlightsLoading = false;
  let highlightsCopied = false;

  function handleFileChange(e) {
    file = e.target.files[0];
    meetingType = "";
    transcript = "";
    summary = "";
    actionItems = "";
    error = "";
    copied = false;
    summaryCopied = false;
    actionItemsCopied = false;
    audioUrl = file ? URL.createObjectURL(file) : "";
  }

  async function uploadAudio() {
    if (!file || !meetingType) return;
    loading = true;
    transcript = "";
    summary = "";
    actionItems = "";
    error = "";
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("meetingType", meetingType);
    try {
      const res = await fetch("/api/lemoncribe", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      transcript = data.text || "";
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function generateSummary() {
    if (!transcript.trim()) return;
    summaryLoading = true;
    summary = "";
    summaryCopied = false;
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, meetingType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Summary failed");
      summary = data.summary;
    } catch (err) {
      error = err.message;
    } finally {
      summaryLoading = false;
    }
  }

  async function generateActionItems() {
    if (!transcript.trim()) return;
    actionItemsLoading = true;
    actionItems = "";
    actionItemsCopied = false;
    try {
      const res = await fetch("/api/action-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, meetingType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action items failed");
      actionItems = data.actionItems;
    } catch (err) {
      error = err.message;
    } finally {
      actionItemsLoading = false;
    }
  }

  async function copyTranscript() {
    await navigator.clipboard.writeText(transcript);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    summaryCopied = true;
    setTimeout(() => (summaryCopied = false), 2000);
  }

  async function copyActionItems() {
    await navigator.clipboard.writeText(actionItems);
    actionItemsCopied = true;
    setTimeout(() => (actionItemsCopied = false), 2000);
  }

  let keyDecisions = "";
  let keyDecisionsLoading = false;
  let keyDecisionsCopied = false;

  async function generateKeyDecisions() {
    if (!transcript.trim()) return;
    keyDecisionsLoading = true;
    keyDecisions = "";
    keyDecisionsCopied = false;
    try {
      const res = await fetch("/api/key-decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, meetingType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Key decisions failed");
      keyDecisions = data.keyDecisions;
    } catch (err) {
      error = err.message;
    } finally {
      keyDecisionsLoading = false;
    }
  }

  async function copyKeyDecisions() {
    await navigator.clipboard.writeText(keyDecisions);
    keyDecisionsCopied = true;
    setTimeout(() => (keyDecisionsCopied = false), 2000);
  }

  async function generateHighlights() {
    if (!transcript.trim()) return;
    highlightsLoading = true;
    highlights = "";
    highlightsCopied = false;
    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, meetingType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Highlights failed");
      highlights = data.highlights;
    } catch (err) {
      error = err.message;
    } finally {
      highlightsLoading = false;
    }
  }

  async function copyHighlights() {
    await navigator.clipboard.writeText(highlights);
    highlightsCopied = true;
    setTimeout(() => (highlightsCopied = false), 2000);
  }
</script>

<div class="upload-page-wrapper">
  <div class="container py-5">
    <div class="card glass-card mb-4 mt-5">
      <div class="card-body p-4">
        <p class="text-light-muted mb-4">
          Upload a meeting or call, choose its type, and generate a clean transcript.
        </p>

        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small text-light-muted">
              <i class="fa-solid fa-file-audio me-1"></i>
              Audio file
            </label>
            <input type="file" accept="audio/*" class="form-control custom-input" on:change={handleFileChange} />
          </div>

          <div class="col-md-4">
            <label class="form-label small text-light-muted">
              <i class="fa-solid fa-tags me-1"></i>
              Meeting type
            </label>
            <select class="form-select custom-input" bind:value={meetingType}>
              <option value="" disabled>Select meeting type</option>
              <option value="sales_call">Sales Call</option>
              <option value="interview">Interview</option>
              <option value="project_meeting">Project Meeting</option>
              <option value="standup">Daily Standup</option>
              <option value="support_call">Support Call</option>
              <option value="general">General</option>
            </select>
          </div>

          <div class="col-md-4">
            <button class="btn btn-indigo-glow w-100 py-2" disabled={loading || !file || !meetingType} on:click={uploadAudio}>
              <i class="fa-solid {loading ? 'fa-spinner fa-spin' : 'fa-play-circle'} me-2"></i>
              {loading ? "Analyzing…" : "Transcribe"}
            </button>
          </div>
        </div>

        {#if audioUrl}
          <div class="mt-4 audio-player-wrapper">
            <audio controls class="w-100" src={audioUrl}></audio>
          </div>
        {/if}
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card glass-card h-100">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-white fw-bold mb-0">
                <i class="fa-solid fa-file-lines me-2 text-indigo"></i>
                Transcript
                <span class="badge badge-glass ms-2">Editable</span>
              </h5>
              <button class="btn btn-sm btn-outline-glass" disabled={!transcript.trim()} on:click={copyTranscript}>
                <i class={`fa-solid ${copied ? "fa-check" : "fa-copy"} me-1`}></i>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {#if loading}
              <div class="text-indigo mb-2 small animate-pulse">
                <i class="fa-solid fa-spinner fa-spin me-2"></i>
                AI is processing audio...
              </div>
            {/if}

            <textarea
              class="form-control custom-input small transcript-area"
              rows="20"
              bind:value={transcript}
              placeholder="Transcript will appear here. You can edit or add your transcript."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card glass-card mb-3">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-white fw-bold mb-0">
                <i class="fa-solid fa-brain me-2 text-purple"></i>
                Summary
              </h5>
              {#if summary}
                <button class="btn btn-sm btn-outline-glass" on:click={copySummary}>
                  <i class={`fa-solid ${summaryCopied ? "fa-check" : "fa-copy"} me-1`}></i>
                  {summaryCopied ? "Copied" : "Copy"}
                </button>
              {/if}
            </div>

            {#if summaryLoading}
              <div class="text-light-muted small mb-3">
                <i class="fa-solid fa-spinner fa-spin me-2 text-purple"></i>
                Generating summary…
              </div>
            {:else if summary}
              <p class="small text-light-muted leading-relaxed">{summary}</p>
              <button class="btn btn-sm btn-outline-purple w-100 mt-2" on:click={generateSummary}>
                <i class="fa-solid fa-rotate-right me-1"></i>
                Re-summarize
              </button>
            {:else}
              <button class="btn btn btn-purple-glow w-100" disabled={!transcript.trim()} on:click={generateSummary}>
                <i class="fa-solid fa-wand-magic-sparkles me-1"></i>
                Generate Summary
              </button>
            {/if}
          </div>
        </div>

        <div class="card glass-card mb-3">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-white fw-bold mb-0">
                <i class="fa-solid fa-gavel me-2 text-indigo"></i>
                Key Decisions
              </h5>
              {#if keyDecisions}
                <button class="btn btn-sm btn-outline-glass" on:click={copyKeyDecisions}>
                  <i class={`fa-solid ${keyDecisionsCopied ? "fa-check" : "fa-copy"} me-1`}></i>
                  {keyDecisionsCopied ? "Copied" : "Copy"}
                </button>
              {/if}
            </div>

            {#if keyDecisionsLoading}
              <div class="text-light-muted small mb-3">
                <i class="fa-solid fa-spinner fa-spin me-2 text-indigo"></i>
                Extracting decisions…
              </div>
            {:else if keyDecisions}
              <div class="result-box small mb-3">{keyDecisions}</div>
              <button class="btn btn-sm btn-outline-indigo w-100" on:click={generateKeyDecisions}>
                <i class="fa-solid fa-rotate-right me-1"></i>
                Re-generate
              </button>
            {:else}
              <button class="btn btn-indigo-glow w-100" disabled={!transcript.trim()} on:click={generateKeyDecisions}>
                <i class="fa-solid fa-gavel me-1"></i>
                Get Key Decisions
              </button>
            {/if}
          </div>
        </div>

        <div class="card glass-card mb-3">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-white fw-bold mb-0">
                <i class="fa-solid fa-star me-2 text-warning"></i>
                Highlights
              </h5>
              {#if highlights}
                <button class="btn btn-sm btn-outline-glass" on:click={copyHighlights}>
                  <i class={`fa-solid ${highlightsCopied ? "fa-check" : "fa-copy"} me-1`}></i>
                  {highlightsCopied ? "Copied" : "Copy"}
                </button>
              {/if}
            </div>

            {#if highlightsLoading}
              <div class="text-light-muted small mb-3">
                <i class="fa-solid fa-spinner fa-spin me-2 text-warning"></i>
                Extracting highlights…
              </div>
            {:else if highlights}
              <div class="result-box small mb-3">{highlights}</div>
              <button class="btn btn-sm btn-outline-glass w-100" on:click={generateHighlights}>
                <i class="fa-solid fa-rotate-right me-1"></i>
                Re-generate
              </button>
            {:else}
              <button class="btn btn-outline-glass w-100 text-white" disabled={!transcript.trim()} on:click={generateHighlights}>
                <i class="fa-solid fa-star me-1 text-warning"></i>
                Get Highlights
              </button>
            {/if}
          </div>
        </div>

        <div class="card glass-card">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-white fw-bold mb-0">
                <i class="fa-solid fa-list-check me-2 text-emerald"></i>
                Action Items
              </h5>
              {#if actionItems}
                <button class="btn btn-sm btn-outline-glass" on:click={copyActionItems}>
                  <i class={`fa-solid ${actionItemsCopied ? "fa-check" : "fa-copy"} me-1`}></i>
                  {actionItemsCopied ? "Copied" : "Copy"}
                </button>
              {/if}
            </div>

            {#if actionItemsLoading}
              <div class="text-light-muted small mb-3">
                <i class="fa-solid fa-spinner fa-spin me-2 text-emerald"></i>
                Extracting items…
              </div>
            {:else if actionItems}
              <div class="result-box small mb-3">{actionItems}</div>
              <button class="btn btn-sm btn-outline-emerald w-100" on:click={generateActionItems}>
                <i class="fa-solid fa-rotate-right me-1"></i>
                Re-generate
              </button>
            {:else}
              <button class="btn btn-emerald-glow w-100" disabled={!transcript.trim()} on:click={generateActionItems}>
                <i class="fa-solid fa-check-circle me-1"></i>
                Get Action Items
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>

    {#if error}
      <div class="alert custom-alert-danger mt-4 animate__animated animate__headShake">
        <i class="fa-solid fa-triangle-exclamation me-2"></i>
        {error}
      </div>
    {/if}
  </div>
</div>

<style>
  :root {
    --bg-dark: #070910;
    --bg-dark-soft: #0e111d;
    --indigo-primary: #6366f1;
    --purple-primary: #a855f7;
    --emerald-primary: #10b981;
    --border-glass: rgba(255, 255, 255, 0.1);
    --text-muted: #94a3b8;
  }

  .upload-page-wrapper {
    background-color: var(--bg-dark);
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: white;
  }

  .text-light-muted { color: var(--text-muted); }
  .text-indigo { color: var(--indigo-primary); }
  .text-purple { color: var(--purple-primary); }
  .text-emerald { color: var(--emerald-primary); }

  /* CARDS */
  .glass-card {
    background: var(--bg-dark-soft);
    border: 1px solid var(--border-glass);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  /* INPUTS */
  .custom-input {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid var(--border-glass) !important;
    color: white !important;
    border-radius: 12px;
    padding: 10px 15px;
  }
  .custom-input:focus {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: var(--indigo-primary) !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
  }
  .custom-input::placeholder { color: #475569; }

  /* TRANSCRIPT AREA */
  .transcript-area {
    resize: none;
    line-height: 1.6;
  }

  /* RESULT BOX (PRE/LISTS) */
  .result-box {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    padding: 15px;
    color: var(--text-muted);
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* BUTTONS */
  .btn-indigo-glow { background: var(--indigo-primary); color: white; border: none; border-radius: 12px; font-weight: 700; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); transition: 0.3s; }
  .btn-indigo-glow:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); color: white; }
  
  .btn-purple-glow { background: var(--purple-primary); color: white; border: none; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.2); transition: 0.3s; }
  .btn-purple-glow:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(168, 85, 247, 0.3); color: white; }

  .btn-emerald-glow { background: var(--emerald-primary); color: white; border: none; border-radius: 10px; font-weight: 600; transition: 0.3s; }
  .btn-emerald-glow:hover:not(:disabled) { transform: translateY(-1px); background: #059669; color: white; }

  .btn-outline-glass { background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); color: var(--text-muted); border-radius: 8px; transition: 0.2s; }
  .btn-outline-glass:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: white; border-color: white; }

  .btn-outline-indigo { border: 1px solid var(--indigo-primary); color: var(--indigo-primary); border-radius: 10px; }
  .btn-outline-indigo:hover { background: var(--indigo-primary); color: white; }

  .btn-outline-purple { border: 1px solid var(--purple-primary); color: var(--purple-primary); border-radius: 10px; }
  .btn-outline-purple:hover { background: var(--purple-primary); color: white; }

  .btn-outline-emerald { border: 1px solid var(--emerald-primary); color: var(--emerald-primary); border-radius: 10px; }
  .btn-outline-emerald:hover { background: var(--emerald-primary); color: white; }

  /* BADGE */
  .badge-glass { background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); color: var(--indigo-primary); font-weight: 600; }

  /* AUDIO PLAYER */
  audio::-webkit-media-controls-panel { background-color: #1e293b; }
  audio::-webkit-media-controls-current-time-display, 
  audio::-webkit-media-controls-time-remaining-display { color: #ffffff; }

  /* ALERT */
  .custom-alert-danger {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    border-radius: 12px;
    padding: 15px;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
  .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>