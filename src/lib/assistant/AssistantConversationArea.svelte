<script lang="ts">
  import OneBubbleConfirmation from './OneBubbleConfirmation.svelte';
</script>

<div class="conversation-area">
  <div class="message assistant">
    <div class="avatar">🤖</div>
    <div class="content">
      <strong>Oscar AI</strong>
      <p>Hello! I'm your global assistant. I can help you with notes, reports, tasks, and more.</p>
    </div>
  </div>
  <!-- One‑bubble confirmation (if any) -->
  <OneBubbleConfirmation />
</div>

<style>
  .conversation-area {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    max-height: 300px;
  }
  .message {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  .message.assistant .avatar {
    font-size: 24px;
  }
  .message .content {
    background: #f1f8ff;
    padding: 12px 16px;
    border-radius: 12px;
    max-width: 80%;
  }
  .message.assistant .content {
    background: #f1f8ff;
  }
</style>