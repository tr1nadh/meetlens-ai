<script>
  import { 
    summaryStore, 
    actionItemsStore, 
    highlightsStore, 
    keyDecisionsStore, 
    toneResultStore, 
    meetingTypeStore,
    fileDetailsStore 
  } from '$lib/store.js';
  import { fade, fly } from 'svelte/transition';
  import ShareReport from '../ShareReport.svelte';

  // Reactive store values
  $: summary = $summaryStore;
  $: actionItems = $actionItemsStore;
  $: highlights = $highlightsStore;
  $: decisions = $keyDecisionsStore;
  $: tone = $toneResultStore;
  $: meetingType = $meetingTypeStore;
  $: details = $fileDetailsStore;

  function printReport() {
    window.print();
  }
</script>

<div id="analysis-dashboard" class="report-wrapper mt-5" in:fade>
  <div class="report-container">
    <header class="report-header">
      <div class="header-content">
        <span class="badge no-print">Intelligence Report</span>
        
        <h1 class="fw-bold text-uppercase mt-2 mb-2">{details.meeting_type || meetingType || 'General Meeting'} Analysis</h1>
        
        <div class="metadata-row">
          <p class="timestamp">
            <i class="fa-regular fa-calendar-check me-2"></i>
            Generated: {new Date().toLocaleDateString()}
          </p>
          {#if details.name}
            <span class="meta-divider">|</span>
            <p class="timestamp"><i class="fa-solid fa-file-audio me-2"></i>{details.name}</p>
          {/if}
          {#if details.duration}
            <span class="meta-divider">|</span>
            <p class="timestamp"><i class="fa-solid fa-clock me-2"></i>{details.duration}</p>
          {/if}
          {#if details.rep_id && details.rep_id !== "0"}
            <span class="meta-divider">|</span>
            <p class="timestamp">ID: #{details.rep_id}</p>
          {/if}
        </div>
      </div>

      <div class="row no-print">
          <div class="col-12">
              <ShareReport {summary} {actionItems} />
          </div>
      </div>
    </header>

    <div class="report-grid">
      
      <section class="grid-item glass-card" in:fly={{ y: 20, delay: 100 }}>
        <h3><i class="fa-solid fa-chart-line"></i> Tone & Sentiment</h3>
        {#if tone}
          <div class="tone-content">
            <div class="sentiment-tag {tone.sentiment}">{tone.sentiment}</div>
            <p class="summary-para">{tone.summary}</p>
            <div class="emotions-wrap">
              {#each tone.emotions as emotion}
                <span class="emotion-chip">{emotion}</span>
              {/each}
            </div>
            {#if tone.riskSignals?.length > 0}
              <div class="risk-section">
                <span class="risk-label">Risk Signals:</span>
                <ul class="risk-list">
                  {#each tone.riskSignals as risk}
                    <li>{risk}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {:else}
          <div class="empty-state">No tone analysis data found.</div>
        {/if}
      </section>

      <section class="grid-item glass-card" in:fly={{ y: 20, delay: 200 }}>
        <h3><i class="fa-solid fa-align-left"></i> Executive Summary</h3>
        {#if summary}
          <p class="summary-para">{summary}</p>
        {:else}
          <p class="empty-state">No summary available.</p>
        {/if}
      </section>

      <section class="grid-item glass-card" in:fly={{ y: 20, delay: 300 }}>
        <h3><i class="fa-solid fa-circle-check"></i> Key Decisions</h3>
        {#if decisions?.length > 0}
          <ul class="decision-list">
            {#each decisions as item}
              <li>
                <div class="decision-text">{item.decision}</div>
                <div class="decision-meta">
                  <span class="maker">By: {item.decisionMaker}</span>
                  <span class="conf-pill {item.confidenceLevel.toLowerCase()}">
                    {item.confidenceLevel} Confidence
                  </span>
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="empty-state">No decisions detected.</p>
        {/if}
      </section>

      <section class="grid-item glass-card" in:fly={{ y: 20, delay: 400 }}>
        <h3><i class="fa-solid fa-clipboard-list"></i> Action Items</h3>
        {#if actionItems?.length > 0}
          <div class="action-stack">
            {#each actionItems as item}
              <div class="action-pill">
                <div class="action-main">
                  <span class="owner-tag">{item.owner}</span>
                  <span class="task-text">{item.task}</span>
                </div>
                {#if item.deadline}
                  <div class="deadline"><i class="fa-regular fa-clock me-1"></i> {item.deadline}</div>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <p class="empty-state">No action items found.</p>
        {/if}
      </section>

      <section class="grid-item full-width glass-card" in:fly={{ y: 20, delay: 500 }}>
        <h3><i class="fa-solid fa-stars"></i> Notable Highlights</h3>
        <div class="highlights-content">
          {#if highlights}
            <div class="styled-list">
              {@html highlights.replace(/\n/g, '<br>')}
            </div>
          {:else}
            <p class="empty-state">No highlights to display.</p>
          {/if}
        </div>
      </section>

    </div>
  </div>
</div>

<style>
  /* --- GLOBAL THEME (WEB) --- */
  :global(body) {
    background-color: #020617;
    background-image: 
      radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.3) 0, transparent 50%), 
      radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.2) 0, transparent 50%);
    background-attachment: fixed;
    margin: 0;
    min-height: 100vh;
  }

  .report-wrapper {
    font-family: 'Inter', system-ui, sans-serif;
    color: #e2e8f0;
  }

  .report-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 60px 24px;
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 48px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* --- TITLES --- */
  .screen-title { 
    font-size: 2.8rem; 
    margin: 8px 0; 
    font-weight: 900; 
    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block;
  }

  .print-title {
    display: none;
  }

  .metadata-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .meta-divider {
    color: rgba(255,255,255,0.1);
    font-size: 0.9rem;
  }

  .badge { 
    background: rgba(99, 102, 241, 0.15); 
    color: #818cf8;
    padding: 6px 14px; 
    border-radius: 30px; 
    font-size: 0.75rem; 
    font-weight: 700; 
    text-transform: uppercase; 
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .timestamp { color: #64748b; font-size: 0.95rem; margin: 0; }

  /* --- BENTO GRID --- */
  .report-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .grid-item { padding: 32px; display: flex; flex-direction: column; }
  .full-width { grid-column: span 2; }

  .glass-card {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 28px;
  }

  h3 { 
    font-size: 1.1rem; 
    color: #818cf8; 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    margin: 0 0 20px 0; 
    font-weight: 700;
  }

  .sentiment-tag { 
    display: inline-block; padding: 5px 14px; border-radius: 10px; 
    font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin-bottom: 16px;
  }
  .sentiment-tag.positive { background: rgba(16, 185, 129, 0.15); color: #34d399; }
  .sentiment-tag.negative { background: rgba(239, 68, 68, 0.15); color: #f87171; }
  .sentiment-tag.neutral { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }

  .emotion-chip { background: rgba(255, 255, 255, 0.05); padding: 5px 12px; border-radius: 10px; font-size: 0.8rem; color: #94a3b8; margin: 4px; display: inline-block; }
  .summary-para { line-height: 1.7; color: #cbd5e1; font-size: 1rem; }
  
  .decision-list li { 
    background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: 16px; 
    margin-bottom: 12px; border-left: 4px solid #6366f1; list-style: none;
  }

  .action-pill { 
    background: rgba(99, 102, 241, 0.05); padding: 14px 18px; border-radius: 16px; 
    border: 1px solid rgba(99, 102, 241, 0.1); margin-bottom: 10px;
  }

  .owner-tag { background: #6366f1; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; margin-right: 10px; }

  /* --- MOBILE RESPONSIVE --- */
  @media (max-width: 900px) {
    .report-grid { grid-template-columns: 1fr; }
    .full-width { grid-column: span 1; }
    .report-header { flex-direction: column; align-items: flex-start; gap: 24px; }
  }
</style>