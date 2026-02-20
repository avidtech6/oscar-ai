<script lang="ts">
	export let selectedTemplate = null;
	export let selectedProject = undefined;
	export let generatedReport = '';
	export let safeGeneratedReport = '';
	export let copyToClipboard = () => {};
	export let downloadAsHtml = () => {};
	export let downloadAsPdf = () => {};
	export let downloadAsWord = () => {};
	export let downloadAsPlainText = () => {};
	export let startOver = () => {};
</script>

<div>
	<h2>Generated Report</h2>
	<p>{selectedTemplate?.name} - {selectedProject?.name}</p>
	<button on:click={copyToClipboard}>Copy HTML</button>
	<button on:click={downloadAsHtml}>HTML</button>
	<button on:click={downloadAsPdf}>PDF</button>
	<button on:click={downloadAsWord}>Word</button>
	<button on:click={downloadAsPlainText}>TXT</button>
	<button on:click={startOver}>New Report</button>
	
	<div>
		Report generated successfully. Export in multiple formats.
	</div>
	
	<div>
		<iframe
			srcdoc={safeGeneratedReport}
			class="w-full h-[500px] border-0"
			title="Report Preview"
		></iframe>
	</div>
</div>
