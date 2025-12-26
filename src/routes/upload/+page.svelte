<script>
  let file = null;
  let audioUrl = "";
  let meetingType = "";
  let loading = false;
  let transcript = "";
  let error = "";
  let copied = false;

  // Summary state
  let summary = "";
  let summaryLoading = false;
  let summaryCopied = false;

  // Action items state
  let actionItems = "";
  let actionItemsLoading = false;
  let actionItemsCopied = false;

// Highlights state
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

<div class="container py-4">

  <!-- TOP CONTROLS -->
  <div class="card shadow-sm mb-4">
    <div class="card-body">

      <h4 class="mb-1">
        <i class="fa-solid fa-microphone-lines me-2"></i>
        MeetLens
      </h4>
      <p class="text-muted mb-3">
        Upload a meeting or call, choose its type, and generate a clean transcript.
      </p>

      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <label class="form-label small text-muted">
            <i class="fa-solid fa-file-audio me-1"></i>
            Audio file
          </label>
          <input type="file" accept="audio/*" class="form-control" on:change={handleFileChange} />
        </div>

        <div class="col-md-4">
          <label class="form-label small text-muted">
            <i class="fa-solid fa-tags me-1"></i>
            Meeting type
          </label>
          <select class="form-select" bind:value={meetingType} disabled={!file}>
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
          <button class="btn btn-primary w-100" disabled={loading || !file || !meetingType} on:click={uploadAudio}>
            <i class="fa-solid fa-play-circle me-2"></i>
            {loading ? "Analyzing…" : "Transcribe"}
          </button>
        </div>
      </div>

      {#if audioUrl}
        <div class="mt-3">
          <audio controls class="w-100" src={audioUrl}></audio>
        </div>
      {/if}

    </div>
  </div>

  <!-- MAIN CONTENT -->
  <div class="row g-4">

    <!-- TRANSCRIPT -->
    <div class="col-lg-7">
      <div class="card shadow-sm h-100">
        <div class="card-body">

          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5>
              <i class="fa-solid fa-file-lines me-2 text-muted"></i>
              Transcript
              <span class="badge bg-light text-muted ms-2">Editable</span>
            </h5>
            <button class="btn btn-sm btn-outline-secondary" disabled={!transcript.trim()} on:click={copyTranscript}>
              <i class={`fa-solid ${copied ? "fa-check" : "fa-copy"} me-1`}></i>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {#if loading}
            <div class="text-muted mb-2">
              <i class="fa-solid fa-spinner fa-spin me-2"></i>
              Transcribing…
            </div>
          {/if}

          <textarea
            class="form-control small"
            rows="18"
            bind:value={transcript}
            placeholder="Transcript will appear here. You can edit or add text."
          ></textarea>

        </div>
      </div>
    </div>

    <!-- SUMMARY + ACTION ITEMS -->
    <div class="col-lg-5">

      <!-- SUMMARY -->
      <div class="card shadow-sm mb-3">
        <div class="card-body">

          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5>
              <i class="fa-solid fa-brain me-2 text-muted"></i>
              Summary
            </h5>
            {#if summary}
              <button class="btn btn-sm btn-outline-secondary" on:click={copySummary}>
                <i class={`fa-solid ${summaryCopied ? "fa-check" : "fa-copy"} me-1`}></i>
                {summaryCopied ? "Copied" : "Copy"}
              </button>
            {/if}
          </div>

          {#if summaryLoading}
            <div class="text-muted small">
              <i class="fa-solid fa-spinner fa-spin me-2"></i>
              Generating summary…
            </div>
          {:else if summary}
            <p class="small">{summary}</p>
            <button class="btn btn-sm btn-outline-primary mt-2" on:click={generateSummary}>
              <i class="fa-solid fa-rotate-right me-1"></i>
              Re-summarize
            </button>
          {:else}
            <button class="btn btn-sm btn-primary" disabled={!transcript.trim()} on:click={generateSummary}>
              <i class="fa-solid fa-wand-magic-sparkles me-1"></i>
              Generate Summary
            </button>
          {/if}

        </div>
      </div>

        <!-- KEY DECISIONS -->
        <div class="card shadow-sm mb-3">
        <div class="card-body">

            <div class="d-flex justify-content-between align-items-center mb-2">
            <h5>
                <i class="fa-solid fa-gavel me-2 text-muted"></i>
                Key Decisions
            </h5>
            {#if keyDecisions}
                <button class="btn btn-sm btn-outline-secondary" on:click={copyKeyDecisions}>
                <i class={`fa-solid ${keyDecisionsCopied ? "fa-check" : "fa-copy"} me-1`}></i>
                {keyDecisionsCopied ? "Copied" : "Copy"}
                </button>
            {/if}
            </div>

            {#if keyDecisionsLoading}
            <div class="text-muted small">
                <i class="fa-solid fa-spinner fa-spin me-2"></i>
                Extracting key decisions…
            </div>
            {:else if keyDecisions}
            <pre class="small mb-0">{keyDecisions}</pre>
            <button class="btn btn-sm btn-outline-primary mt-2" on:click={generateKeyDecisions}>
                <i class="fa-solid fa-rotate-right me-1"></i>
                Re-generate
            </button>
            {:else}
            <button
                class="btn btn-sm btn-primary"
                disabled={!transcript.trim()}
                on:click={generateKeyDecisions}
            >
                <i class="fa-solid fa-gavel me-1"></i>
                Get Key Decisions
            </button>
            {/if}

        </div>
        </div>

        <!-- HIGHLIGHTS -->
<div class="card shadow-sm mb-3">
  <div class="card-body">

    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5>
        <i class="fa-solid fa-star me-2 text-muted"></i>
        Highlights
      </h5>
      {#if highlights}
        <button
          class="btn btn-sm btn-outline-secondary"
          on:click={copyHighlights}
        >
          <i class={`fa-solid ${highlightsCopied ? "fa-check" : "fa-copy"} me-1`}></i>
          {highlightsCopied ? "Copied" : "Copy"}
        </button>
      {/if}
    </div>

    {#if highlightsLoading}
      <div class="text-muted small">
        <i class="fa-solid fa-spinner fa-spin me-2"></i>
        Extracting highlights…
      </div>
    {:else if highlights}
      <pre class="small mb-0">{highlights}</pre>
      <button
        class="btn btn-sm btn-outline-primary mt-2"
        on:click={generateHighlights}
      >
        <i class="fa-solid fa-rotate-right me-1"></i>
        Re-generate
      </button>
    {:else}
      <button
        class="btn btn-sm btn-primary"
        disabled={!transcript.trim()}
        on:click={generateHighlights}
      >
        <i class="fa-solid fa-star me-1"></i>
        Get Highlights
      </button>
    {/if}

  </div>
</div>



      <!-- ACTION ITEMS -->
      <div class="card shadow-sm">
        <div class="card-body">

          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5>
              <i class="fa-solid fa-list-check me-2 text-muted"></i>
              Action Items
            </h5>
            {#if actionItems}
              <button class="btn btn-sm btn-outline-secondary" on:click={copyActionItems}>
                <i class={`fa-solid ${actionItemsCopied ? "fa-check" : "fa-copy"} me-1`}></i>
                {actionItemsCopied ? "Copied" : "Copy"}
              </button>
            {/if}
          </div>

          {#if actionItemsLoading}
            <div class="text-muted small">
              <i class="fa-solid fa-spinner fa-spin me-2"></i>
              Extracting action items…
            </div>
          {:else if actionItems}
            <pre class="small mb-0">{actionItems}</pre>
            <button class="btn btn-sm btn-outline-primary mt-2" on:click={generateActionItems}>
              <i class="fa-solid fa-rotate-right me-1"></i>
              Re-generate
            </button>
          {:else}
            <button class="btn btn-sm btn-primary" disabled={!transcript.trim()} on:click={generateActionItems}>
              <i class="fa-solid fa-check-circle me-1"></i>
              Get Action Items
            </button>
          {/if}

        </div>
      </div>

    </div>

  </div>

  {#if error}
    <div class="alert alert-danger mt-4">
      <i class="fa-solid fa-triangle-exclamation me-2"></i>
      {error}
    </div>
  {/if}

</div>
