<script>
  /* Script logic remains untouched as requested */
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

  let keyDecisions = "";
  let keyDecisionsLoading = false;
  let keyDecisionsCopied = false;

  // Tone state
  let toneResult = null;
  let toneLoading = false;
  let toneError = "";

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

  async function analyzeTone() {
    if (!transcript || transcript.trim().length < 20) return;
    toneLoading = true;
    toneError = "";
    toneResult = null;
    try {
      const res = await fetch("/api/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, meetingType })
      });
      if (!res.ok) throw new Error("Tone analysis failed");
      toneResult = await res.json();
    } catch (err) {
      console.error(err);
      toneError = "Unable to analyze tone";
    } finally {
      toneLoading = false;
    }
  }

  // Helper for Generate All
  function generateAllInsights() {
    analyzeTone();
    generateSummary();
    generateKeyDecisions();
    generateActionItems();
  }

    // ===== Speaker rename + editable transcript (ADDED) =====
  let speakerMap = {}; // { SPEAKER_00: "CEO" }
  let activeSpeakerId = null;
  let tempSpeakerName = "";

  let editableTranscript = "";

  // Extract speaker IDs
  $: speakerIds = Array.from(
    new Set(
      (transcript.match(/Speaker\s+(SPEAKER_\d+)/g) || [])
        .map(s => s.replace("Speaker ", ""))
    )
  );

  // Init mapping
  $: {
    speakerIds.forEach(id => {
      if (!speakerMap[id]) speakerMap[id] = id;
    });
  }

  // Sync editable transcript when transcript changes
  $: if (transcript) {
    editableTranscript = transcript.replace(
      /Speaker\s+(SPEAKER_\d+)/g,
      (_, id) => `Speaker ${speakerMap[id] || id}`
    );
  }

  // 🔒 Restore locked speaker IDs on edit
  function handleTranscriptEdit(e) {
    let value = e.target.value;

    speakerIds.forEach(id => {
      const safeLabel = `Speaker ${speakerMap[id] || id}`;
      const lockedLabel = `Speaker ${id}`;
      value = value.replaceAll(safeLabel, lockedLabel);
    });

    transcript = value; // internal stays clean
    editableTranscript = value.replace(
      /Speaker\s+(SPEAKER_\d+)/g,
      (_, id) => `Speaker ${speakerMap[id] || id}`
    );
  }

  function openSpeakerModal(id) {
    activeSpeakerId = id;
    tempSpeakerName = speakerMap[id] === id ? "" : speakerMap[id];
    new bootstrap.Modal(
      document.getElementById("speakerModal")
    ).show();
  }

  function saveSpeakerName() {
    if (activeSpeakerId) {
      speakerMap[activeSpeakerId] =
        tempSpeakerName.trim() || activeSpeakerId;
    }
    activeSpeakerId = null;
    tempSpeakerName = "";
  }

</script>

<div class="upload-page-wrapper">
  <div class="container py-5">
    <div class="card glass-card mb-4 mt-5">
      <div class="card-body p-4">
        <h4 class="mb-1 text-white fw-bold">
          <i class="fa-solid fa-microphone-lines me-2 text-indigo"></i>
          MeetLens
        </h4>
        <p class="text-light-muted mb-4">
          Upload audio, choose its type, and generate a clean transcript with AI insights.
        </p>

        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small text-light-muted">
              <i class="fa-solid fa-file-audio me-1"></i> Audio file
            </label>
            <div class="file-input-container">
                <input type="file" accept="audio/*" id="audio-input" class="d-none" on:change={handleFileChange} />
                <label for="audio-input" class="btn btn-indigo-glow w-100 py-2 d-flex align-items-center justify-content-center">
                    <i class="fa-solid fa-cloud-arrow-up me-2"></i>
                    {file ? file.name.substring(0, 15) + '...' : "Choose Audio"}
                </label>
            </div>
          </div>

          <div class="col-md-4">
            <label class="form-label small text-light-muted">
              <i class="fa-solid fa-tags me-1"></i> Audio type
            </label>
            <select class="form-select custom-input styled-select" bind:value={meetingType}>
              <option value="" disabled>Select audio type</option>
              <option value="sales_call" class="text-indigo">Sales Call</option>
              <option value="interview" class="text-purple">Interview</option>
              <option value="project_meeting" class="text-emerald">Project Meeting</option>
              <option value="standup" class="text-emerald">Daily Standup</option>
              <option value="support_call" class="text-indigo">Support Call</option>
              <option value="general" class="text-white">General</option>
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
          <div class="audio-sticky-footer animate-slide-up">
            <div class="container">
              <div class="audio-player-wrapper">
                <div class="d-flex align-items-center gap-3">
                  <div class="player-label d-none d-md-flex mb-0">
                    <i class="fa-solid fa-waveform-lines me-2"></i> Recording
                  </div>
                  <audio controls class="custom-audio-player flex-grow-1" src={audioUrl}></audio>
                </div>
              </div>
            </div>
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

            {#if speakerIds.length}
              <div class="mb-3 d-flex flex-wrap gap-2">
                {#each speakerIds as id}
                  <button 
                    class="btn speaker-chip" 
                    on:click={() => openSpeakerModal(id)}
                    title="Click to rename"
                  >
                    <i class="fa-solid fa-user-tag me-2"></i>
                    <span class="fw-semibold">{speakerMap[id]}</span>
                  </button>
                {/each}
              </div>
            {/if}

            <textarea
              class="form-control custom-input small transcript-area"
              rows="28"
              spellcheck="false"
              value={editableTranscript}
              on:input={handleTranscriptEdit}
              placeholder="Transcription will appear here..."
            ></textarea>

          </div>
        </div>
      </div>

      <div class="col-lg-5">
        
        <div class="row g-2 mb-4">
            <div class="col-6">
                <button class="btn btn-purple-glow w-100 py-2" disabled={!transcript.trim()} on:click={generateAllInsights}>
                    <i class="fa-solid fa-bolt-lightning me-2"></i> Generate All
                </button>
            </div>
            <div class="col-6">
                <button class="btn btn-outline-glass w-100 py-2 text-white" disabled={!transcript.trim()} data-bs-toggle="modal" data-bs-target="#shareModal">
                    <i class="fa-solid fa-share-nodes me-2"></i> Share Result
                </button>
            </div>
        </div>

        <div class="card glass-card mb-3">
          <div class="card-body p-4">
            <h5 class="text-white fw-bold mb-3">
              <i class="fa-solid fa-ear-listen me-2 text-indigo"></i>
              Tone Analysis
            </h5>

            {#if toneLoading}
              <div class="text-indigo mb-2 small animate-pulse">
                <i class="fa-solid fa-spinner fa-spin me-2"></i> Analyzing conversation...
              </div>
            {:else if toneResult}
              <div class="tone-grid mb-3">
                <div class="tone-item">
                  <span class="small text-light-muted d-block">Overall Tone</span>
                  <span class="badge badge-indigo">{toneResult.tone}</span>
                </div>
                <div class="tone-item">
                  <span class="small text-light-muted d-block">Sentiment</span>
                  <span class="text-white small fw-bold">{toneResult.sentiment}</span>
                </div>
              </div>
              <div class="result-box small mb-3 italic">"{toneResult.summary}"</div>
              
              <button class="btn btn-sm btn-outline-indigo w-100" on:click={analyzeTone}>
                <i class="fa-solid fa-rotate-right me-1"></i> Re-analyze Tone
              </button>
            {:else}
              <p class="text-light-muted small mb-3">Detect emotional landscape and confidence levels.</p>
              <button class="btn btn-sm btn-indigo-glow w-100" disabled={!transcript.trim()} on:click={analyzeTone}>
                Analyze Tone
              </button>
            {/if}
          </div>
        </div>

        <div class="card glass-card mb-3">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="text-white fw-bold mb-0"><i class="fa-solid fa-brain me-2 text-purple"></i> Summary</h5>
              {#if summary}<button class="btn btn-sm btn-outline-glass" on:click={copySummary}><i class="fa-solid {summaryCopied ? 'fa-check' : 'fa-copy'}"></i></button>{/if}
            </div>
            {#if summaryLoading}
              <div class="text-light-muted small mb-3 animate-pulse">Generating summary...</div>
            {:else if summary}
              <p class="small text-light-muted leading-relaxed">{summary}</p>
              <button class="btn btn-sm btn-outline-purple w-100 mt-2" on:click={generateSummary}>
                <i class="fa-solid fa-rotate-right me-1"></i> Re-generate Summary
              </button>
            {:else}
              <button class="btn btn-sm btn-purple-glow w-100" disabled={!transcript.trim()} on:click={generateSummary}>Generate Summary</button>
            {/if}
          </div>
        </div>

        <div class="card glass-card mb-3">
          <div class="card-body p-4">
            <h5 class="text-white fw-bold mb-3"><i class="fa-solid fa-gavel me-2 text-indigo"></i> Key Decisions</h5>
            {#if keyDecisionsLoading}
              <div class="text-light-muted small mb-3">Extracting decisions...</div>
            {:else if keyDecisions}
              <div class="result-box small mb-3">{keyDecisions}</div>
              <button class="btn btn-sm btn-outline-indigo w-100" on:click={generateKeyDecisions}>
                <i class="fa-solid fa-rotate-right me-1"></i> Re-extract Decisions
              </button>
            {:else}
              <button class="btn btn-sm btn-outline-indigo w-100" disabled={!transcript.trim()} on:click={generateKeyDecisions}>Get Key Decisions</button>
            {/if}
          </div>
        </div>

        <div class="card glass-card">
          <div class="card-body p-4">
            <h5 class="text-white fw-bold mb-3"><i class="fa-solid fa-list-check me-2 text-emerald"></i> Action Items</h5>
            {#if actionItemsLoading}
              <div class="text-light-muted small mb-3">Extracting items...</div>
            {:else if actionItems}
              <div class="result-box small mb-3">{actionItems}</div>
              <button class="btn btn-sm btn-outline-emerald w-100" on:click={generateActionItems}>
                <i class="fa-solid fa-rotate-right me-1"></i> Re-extract Items
              </button>
            {:else}
              <button class="btn btn-sm btn-emerald-glow w-100" disabled={!transcript.trim()} on:click={generateActionItems}>Get Action Items</button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="shareModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content glass-card p-2">
        <div class="modal-header border-0">
          <h5 class="modal-title text-white fw-bold">Share Report</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="text-light-muted small mb-3">Enter the email address where you'd like to send this transcription and analysis.</p>
          <div class="mb-3">
            <label class="form-label small text-light-muted">Recipient Email</label>
            <input type="email" class="form-control custom-input" placeholder="colleague@company.com" />
          </div>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-outline-glass text-white px-4" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-indigo-glow px-4">Send Result</button>
        </div>
      </div>
    </div>
  </div>

<style>
  :root {
    --bg-dark: #070910;
    --bg-dark-soft: #0e111d;
    --indigo-primary: #6366f1;
    --purple-primary: #a855f7;
    --emerald-primary: #10b981;
    --warning-primary: #f59e0b;
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
  .text-warning { color: var(--warning-primary); }

  /* CARDS */
  .glass-card {
    background: var(--bg-dark-soft) !important;
    border: 1px solid var(--border-glass) !important;
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
    border-color: var(--indigo-primary) !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
  }

  /* Styled Dropdown Options */
  .styled-select option {
    background-color: #111827;
    color: white;
    padding: 10px;
  }

  /* TRANSCRIPT AREA */
  .transcript-area { resize: none; line-height: 1.6; }

  /* RESULT BOXES */
  .result-box {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border-glass);
    border-radius: 12px;
    padding: 15px;
    color: var(--text-muted);
    white-space: pre-wrap;
  }

.speaker-chip {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(99, 102, 241, 0.3); /* Subtle Indigo Border */
  color: #e2e8f0;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.speaker-chip i {
  color: #6366f1; /* Indigo icon */
  font-size: 0.75rem;
}

.speaker-chip:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

/* Custom Scrollbar Styling for the Textarea */
.transcript-area {
  resize: none;
  line-height: 1.8;
  font-family: 'Inter', sans-serif; /* Cleaner font for long reading */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: var(--indigo-primary) transparent; /* Firefox */
}

/* Webkit browsers (Chrome, Edge, Safari) */
.transcript-area::-webkit-scrollbar {
  width: 6px; /* Very thin for a sleek look */
}

.transcript-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02); /* Nearly invisible track */
  border-radius: 10px;
}

.transcript-area::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, var(--indigo-primary), var(--purple-primary));
  border-radius: 10px;
  border: 2px solid transparent; /* Creates padding effect */
}

.transcript-area::-webkit-scrollbar-thumb:hover {
  background: var(--indigo-primary);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.5); /* Glowing effect on hover */
}

/* Optional: Smooth fade-in for the text */
.transcript-area {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.speaker-chip:active {
  transform: translateY(0);
}

/* Sticky Footer Container */
.audio-sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px 0;
  background: linear-gradient(to top, var(--bg-dark) 40%, transparent);
  z-index: 1050; /* Above modals and other content */
  pointer-events: none; /* Let clicks pass through the gradient background */
}

/* The Player Box */
.audio-player-wrapper {
  pointer-events: auto; /* Enable clicks for the player itself */
  background: rgba(14, 17, 29, 0.8); /* Match glass-card background */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  padding: 12px 20px;
  border-radius: 20px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
}

.player-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--indigo-primary);
  font-weight: 800;
  white-space: nowrap;
}

/* Custom Audio Player Filter */
.custom-audio-player {
  height: 36px;
  filter: invert(100%) hue-rotate(180deg) brightness(1.5) contrast(0.9);
}

/* Add padding to the bottom of the wrapper so content isn't hidden by the player */
:global(.upload-page-wrapper) {
  padding-bottom: 100px;
}

/* Animation */
.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}



  /* TONE SPECIFIC */
  .tone-grid { display: flex; gap: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 15px; }
  .badge-indigo { background: var(--indigo-primary); color: white; padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; }
  .italic { font-style: italic; }

  /* BUTTONS */
  .btn-indigo-glow { background: var(--indigo-primary); color: white; border: none; border-radius: 12px; font-weight: 700; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); transition: 0.3s; }
  .btn-indigo-glow:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); color: white; }
  
  .btn-purple-glow { background: var(--purple-primary); color: white; border: none; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.2); transition: 0.3s; }
  .btn-purple-glow:hover:not(:disabled) { transform: translateY(-1px); color: white; }

  .btn-emerald-glow { background: var(--emerald-primary); color: white; border: none; border-radius: 10px; font-weight: 600; transition: 0.3s; }
  .btn-emerald-glow:hover:not(:disabled) { background: #059669; color: white; }

  .btn-outline-glass { background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); color: var(--text-muted); border-radius: 12px; transition: 0.2s; }
  .btn-outline-glass:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: white; }

  .btn-outline-indigo { border: 1px solid var(--indigo-primary); color: var(--indigo-primary); border-radius: 10px; background: transparent; }
  .btn-outline-indigo:hover { background: var(--indigo-primary); color: white; }

  .btn-outline-purple { border: 1px solid var(--purple-primary); color: var(--purple-primary); border-radius: 10px; background: transparent; }
  .btn-outline-purple:hover { background: var(--purple-primary); color: white; }

  .btn-outline-emerald { border: 1px solid var(--emerald-primary); color: var(--emerald-primary); border-radius: 10px; background: transparent; }
  .btn-outline-emerald:hover { background: var(--emerald-primary); color: white; }

  .badge-glass { background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); color: var(--indigo-primary); font-weight: 600; }

  @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
  .animate-pulse { animation: pulse 2s infinite; }
</style>

<div class="modal fade" id="speakerModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content glass-card p-3">
      <div class="modal-header border-0">
        <h5 class="modal-title text-white fw-bold">
          Rename Speaker ({activeSpeakerId})
        </h5>
        <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">
        <label class="form-label small text-light-muted">Display name</label>
        <input
          class="form-control custom-input"
          bind:value={tempSpeakerName}
          placeholder="e.g. CEO, Client" />
      </div>

      <div class="modal-footer border-0">
        <button class="btn btn-outline-glass" data-bs-dismiss="modal">Cancel</button>
        <button
          class="btn btn-indigo-glow"
          data-bs-dismiss="modal"
          on:click={saveSpeakerName}>
          Save
        </button>
      </div>
    </div>
  </div>
</div>
