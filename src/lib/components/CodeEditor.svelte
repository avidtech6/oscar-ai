<script lang="ts">
	export let value = '';
	export let language = 'javascript';
	export let placeholder = '// Write your code here...';
	export let label = '';
	export let disabled = false;
	export let showLineNumbers = true;
	
	let isFocused = false;
	
	const languages = [
		{ value: 'javascript', label: 'JavaScript' },
		{ value: 'typescript', label: 'TypeScript' },
		{ value: 'python', label: 'Python' },
		{ value: 'html', label: 'HTML' },
		{ value: 'css', label: 'CSS' },
		{ value: 'json', label: 'JSON' },
		{ value: 'markdown', label: 'Markdown' },
		{ value: 'sql', label: 'SQL' },
		{ value: 'bash', label: 'Bash' },
	];
	
	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
	}
	
	function insertSnippet(snippet: string) {
		const textarea = document.querySelector('.code-textarea') as HTMLTextAreaElement;
		if (!textarea) return;
		
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		
		const before = value.substring(0, start);
		const after = value.substring(end);
		value = before + snippet + after;
		
		textarea.focus();
		setTimeout(() => {
			textarea.selectionStart = start + snippet.length;
			textarea.selectionEnd = start + snippet.length;
		}, 0);
	}
	
	function formatCode() {
		// Simple formatting based on language
		if (language === 'json') {
			try {
				const parsed = JSON.parse(value);
				value = JSON.stringify(parsed, null, 2);
			} catch {
				// Invalid JSON, do nothing
			}
		}
	}
	
	function getLanguageIcon(lang: string): string {
		const icons: Record<string, string> = {
			javascript: '🟨',
			typescript: '🔷',
			python: '🐍',
			html: '🌐',
			css: '🎨',
			json: '📋',
			markdown: '📝',
			sql: '🗄️',
			bash: '💻',
		};
		return icons[lang] || '📄';
	}
</script>

<div class="code-editor" class:focused={isFocused} class:disabled={disabled}>
	{#if label}
		<label class="editor-label">{label}</label>
	{/if}
	
	<div class="editor-toolbar">
		<div class="toolbar-group">
			<select bind:value={language} class="language-select">
				{#each languages as lang}
					<option value={lang.value}>
						{getLanguageIcon(lang.value)} {lang.label}
					</option>
				{/each}
			</select>
		</div>
		
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => insertSnippet('function example() {\n  // TODO: implement\n}')} title="Insert Function">
				ƒ()
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertSnippet('if (condition) {\n  // code\n}')} title="Insert If Statement">
				if
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertSnippet('for (let i = 0; i < length; i++) {\n  // code\n}')} title="Insert For Loop">
				for
			</button>
		</div>
		
		<div class="toolbar-group">
			<button type="button" class="toolbar-button" on:click={() => insertSnippet('// TODO: ')} title="Insert TODO">
				✅ TODO
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertSnippet('// FIXME: ')} title="Insert FIXME">
				🔧 FIXME
			</button>
			<button type="button" class="toolbar-button" on:click={() => insertSnippet('console.log();')} title="Insert Console Log">
				log()
			</button>
		</div>
		
		<div class="toolbar-group">
			<button 
				type="button" 
				class="toolbar-button {showLineNumbers ? 'active' : ''}" 
				on:click={() => showLineNumbers = !showLineNumbers}
				title="Toggle Line Numbers"
			>
				{showLineNumbers ? '1️⃣ Hide' : '1️⃣ Show'}
			</button>
			<button type="button" class="toolbar-button" on:click={formatCode} title="Format Code">
				✨ Format
			</button>
		</div>
	</div>
	
	<div class="editor-content">
		{#if showLineNumbers}
			<div class="line-numbers">
				{#each Array.from({ length: value.split('\n').length }) as _, i}
					<div class="line-number">{i + 1}</div>
				{/each}
			</div>
		{/if}
		
		<textarea 
			class="code-textarea"
			bind:value
			on:input={handleInput}
			on:focus={() => isFocused = true}
			on:blur={() => isFocused = false}
			placeholder={placeholder}
			disabled={disabled}
			spellcheck="false"
			data-language={language}
		/>
	</div>
	
	<div class="editor-footer">
		<div class="language-info">
			<span class="language-icon">{getLanguageIcon(language)}</span>
			<span class="language-name">{language.toUpperCase()}</span>
		</div>
		
		<div class="character-count">
			{#if value}
				{value.length} characters, {value.split('\n').length} lines
			{:else}
				0 characters, 0 lines
			{/if}
		</div>
		
		<div class="editor-hint">
			Use Ctrl+Space for autocomplete, Ctrl+S to save
		</div>
	</div>
</div>

<style>
	.code-editor {
		background: #1e1e1e;
		border: 1px solid #374151;
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.2s ease;
	}
	
	.code-editor.focused {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.code-editor.disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	
	.editor-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #d1d5db;
		padding: 0.75rem 1rem 0.5rem;
		border-bottom: 1px solid #374151;
		background: #2d2d2d;
	}
	
	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #374151;
		background: #2d2d2d;
	}
	
	.toolbar-group {
		display: flex;
		gap: 0.25rem;
		padding-right: 0.75rem;
		border-right: 1px solid #4b5563;
	}
	
	.toolbar-group:last-child {
		border-right: none;
	}
	
	.toolbar-button {
		background: #374151;
		border: 1px solid #4b5563;
		border-radius: 4px;
		padding: 0.375rem 0.5rem;
		font-size: 0.75rem;
		color: #d1d5db;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}
	
	.toolbar-button:hover {
		background: #4b5563;
		border-color: #6b7280;
	}
	
	.toolbar-button.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}
	
	.toolbar-button:active {
		background: #1f2937;
	}
	
	.language-select {
		background: #374151;
		border: 1px solid #4b5563;
		border-radius: 4px;
		padding: 0.375rem 0.5rem;
		font-size: 0.75rem;
		color: #d1d5db;
		cursor: pointer;
		min-width: 140px;
		font-family: inherit;
	}
	
	.language-select:focus {
		outline: none;
		border-color: #3b82f6;
	}
	
	.editor-content {
		display: flex;
		min-height: 200px;
		position: relative;
	}
	
	.line-numbers {
		background: #2d2d2d;
		color: #6b7280;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.75rem;
		line-height: 1.5;
		padding: 1rem 0.5rem;
		text-align: right;
		user-select: none;
		border-right: 1px solid #374151;
		min-width: 40px;
	}
	
	.line-number {
		padding: 0 0.25rem;
	}
	
	.code-textarea {
		flex: 1;
		min-height: 200px;
		padding: 1rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #d1d5db;
		background: transparent;
		border: none;
		outline: none;
		resize: vertical;
		tab-size: 2;
		white-space: pre;
		overflow-wrap: normal;
		overflow-x: auto;
	}
	
	.code-textarea:focus {
		outline: none;
	}
	
	.code-textarea::placeholder {
		color: #6b7280;
	}
	
	.editor-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		border-top: 1px solid #374151;
		background: #2d2d2d;
		font-size: 0.75rem;
		color: #9ca3af;
	}
	
	.language-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.language-icon {
		font-size: 1rem;
	}
	
	.language-name {
		font-weight: 500;
		color: #d1d5db;
	}
	
	.character-count {
		font-weight: 500;
	}
	
	.editor-hint {
		font-style: italic;
	}
</style>