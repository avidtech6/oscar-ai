import type { EventType, SemanticEvent } from '$lib/stores/semanticContext';

export interface AIResponse {
	content: string;
	timestamp: number;
	metadata?: {
		itemId?: string;
		collectionId?: string;
		actionDetected?: boolean;
	};
}

export interface ExtractionResult {
	events: Omit<SemanticEvent, 'id' | 'timestamp'>[];
	updatedContent?: string;
}

// Patterns that indicate meaningful actions
const ACTION_PATTERNS: Array<{
	type: EventType;
	keywords: string[];
	descriptionTemplate: (target: string, details?: string) => string;
}> = [
	{
		type: 'update_note',
		keywords: ['updated', 'edited', 'modified', 'changed', 'rewrote', 'rephrased', 'added to', 'removed from'],
		descriptionTemplate: (target, details) => `Updated “${target}”${details ? ` — ${details}` : ''}`
	},
	{
		type: 'summarise_voice_note',
		keywords: ['summarised', 'summarized', 'recap', 'summary of', 'voice note', 'transcription'],
		descriptionTemplate: (target) => `Summarised voice note “${target}”`
	},
	{
		type: 'add_items_to_project',
		keywords: ['added to project', 'added to collection', 'moved to project', 'assigned to'],
		descriptionTemplate: (target, details) => `Added items to project “${target}”${details ? ` (${details})` : ''}`
	},
	{
		type: 'create_new_note',
		keywords: ['created', 'new note', 'new file', 'new document', 'started a note'],
		descriptionTemplate: (target) => `Created new note “${target}”`
	},
	{
		type: 'rewrite_text',
		keywords: ['rewritten', 'rephrased', 'paraphrased', 'restructured', 'reorganized'],
		descriptionTemplate: (target, details) => `Rewrote “${target}”${details ? ` — ${details}` : ''}`
	},
	{
		type: 'organise_collection',
		keywords: ['organised', 'organized', 'sorted', 'grouped', 'categorized', 'arranged'],
		descriptionTemplate: (target, details) => `Organised collection “${target}”${details ? ` by ${details}` : ''}`
	},
	{
		type: 'tag_items',
		keywords: ['tagged', 'labeled', 'categorized', 'marked as'],
		descriptionTemplate: (target, details) => `Tagged “${target}”${details ? ` with ${details}` : ''}`
	},
	{
		type: 'rename_items',
		keywords: ['renamed', 'changed title', 'renamed to'],
		descriptionTemplate: (target, details) => `Renamed “${target}”${details ? ` to ${details}` : ''}`
	},
	{
		type: 'delete_items',
		keywords: ['deleted', 'removed', 'trashed', 'discarded'],
		descriptionTemplate: (target) => `Deleted “${target}”`
	},
	{
		type: 'move_items',
		keywords: ['moved', 'relocated', 'transferred'],
		descriptionTemplate: (target, details) => `Moved “${target}”${details ? ` to ${details}` : ''}`
	},
	{
		type: 'extract_key_points',
		keywords: ['extracted', 'key points', 'main ideas', 'bullet points'],
		descriptionTemplate: (target) => `Extracted key points from “${target}”`
	},
	{
		type: 'generate_report',
		keywords: ['generated report', 'created report', 'produced summary'],
		descriptionTemplate: (target) => `Generated report for “${target}”`
	},
	{
		type: 'classify_items',
		keywords: ['classified', 'categorized', 'sorted into'],
		descriptionTemplate: (target, details) => `Classified “${target}”${details ? ` as ${details}` : ''}`
	},
	{
		type: 'merge_items',
		keywords: ['merged', 'combined', 'joined'],
		descriptionTemplate: (target, details) => `Merged items${details ? ` (${details})` : ''}`
	},
	{
		type: 'split_items',
		keywords: ['split', 'divided', 'separated'],
		descriptionTemplate: (target, details) => `Split “${target}”${details ? ` into ${details}` : ''}`
	},
	{
		type: 'translate_text',
		keywords: ['translated', 'converted to language'],
		descriptionTemplate: (target, details) => `Translated “${target}”${details ? ` to ${details}` : ''}`
	},
	{
		type: 'format_document',
		keywords: ['formatted', 'styled', 'applied layout'],
		descriptionTemplate: (target, details) => `Formatted “${target}”${details ? ` (${details})` : ''}`
	},
	{
		type: 'extract_metadata',
		keywords: ['extracted metadata', 'identified details', 'parsed information'],
		descriptionTemplate: (target) => `Extracted metadata from “${target}”`
	},
	{
		type: 'generate_title',
		keywords: ['generated title', 'suggested title', 'created heading'],
		descriptionTemplate: (target) => `Generated title for “${target}”`
	}
];

// Noise patterns that should be ignored (simplified list)
const NOISE_PATTERNS = [
	/^okay/i,
	/^sure/i,
	/^got it/i,
	/^i understand/i,
	/^let me/i,
	/^i'll/i,
	/^here you go/i,
	/^here is/i,
	/^here are/i,
	/^done/i,
	/^completed/i,
	/^finished/i,
	/^alright/i,
	/^no problem/i,
	/^you're welcome/i,
	/^thank you/i,
	/^thanks/i,
	/^please/i,
	/^could you/i,
	/^would you/i,
	/^can you/i,
	/^do you/i,
	/^is there/i,
	/^are there/i,
	/^just a moment/i,
	/^let's see/i,
	/^hmm/i,
	/^uh/i,
	/^well/i,
	/^actually/i,
	/^basically/i,
	/^essentially/i,
	/^in other words/i,
	/^for example/i,
	/^for instance/i,
	/^as you can see/i,
	/^as mentioned/i,
	/^as per/i,
	/^according to/i,
	/^regarding/i,
	/^concerning/i,
	/^with respect to/i,
	/^in terms of/i,
	/^when it comes to/i,
	/^on the other hand/i,
	/^however/i,
	/^nevertheless/i,
	/^therefore/i,
	/^thus/i,
	/^hence/i,
	/^consequently/i,
	/^as a result/i,
	/^in conclusion/i,
	/^to sum up/i,
	/^in summary/i,
	/^overall/i,
	/^in general/i,
	/^typically/i,
	/^usually/i,
	/^often/i,
	/^sometimes/i,
	/^rarely/i,
	/^never/i,
	/^always/i,
	/^maybe/i,
	/^perhaps/i,
	/^possibly/i,
	/^probably/i,
	/^likely/i,
	/^unlikely/i,
	/^seems like/i,
	/^looks like/i,
	/^appears to be/i,
	/^might be/i,
	/^could be/i,
	/^would be/i,
	/^should be/i,
	/^must be/i,
	/^has to be/i,
	/^need to be/i,
	/^want to be/i,
	/^like to be/i,
	/^trying to/i,
	/^attempting to/i,
	/^working on/i,
	/^processing/i,
	/^analyzing/i,
	/^checking/i,
	/^verifying/i,
	/^confirming/i,
	/^validating/i,
	/^reviewing/i,
	/^evaluating/i,
	/^assessing/i,
	/^inspecting/i,
	/^examining/i,
	/^looking at/i,
	/^taking a look/i,
	/^having a look/i,
	/^glancing at/i,
	/^peeking at/i,
	/^skimming/i,
	/^scanning/i,
	/^reading through/i,
	/^going through/i,
	/^passing through/i,
	/^moving through/i,
	/^progressing through/i,
	/^advancing through/i,
	/^proceeding through/i,
	/^continuing through/i,
	/^carrying on/i,
	/^moving on/i,
	/^going on/i,
	/^coming up/i,
	/^coming next/i,
	/^up next/i,
	/^next up/i,
	/^in the meantime/i,
	/^meanwhile/i,
	/^at the same time/i,
	/^simultaneously/i,
	/^concurrently/i,
	/^parallelly/i,
	/^alongside/i,
	/^together with/i,
	/^in conjunction with/i,
	/^in collaboration with/i,
	/^in cooperation with/i,
	/^in partnership with/i,
	/^in alliance with/i,
	/^in union with/i,
	/^in unity with/i,
	/^in harmony with/i,
	/^in sync with/i,
	/^in alignment with/i,
	/^in accordance with/i,
	/^in compliance with/i,
	/^in conformity with/i,
	/^in agreement with/i,
	/^in consensus with/i,
	/^in concert with/i,
	/^in tandem with/i,
	/^hand in hand/i,
	/^side by side/i,
	/^shoulder to shoulder/i,
	/^arm in arm/i,
	/^back to back/i,
	/^face to face/i,
	/^eye to eye/i,
	/^heart to heart/i,
	/^mind to mind/i,
	/^soul to soul/i,
	/^spirit to spirit/i,
	/^energy to energy/i,
	/^vibe to vibe/i,
	/^wavelength to wavelength/i,
	/^frequency to frequency/i,
	/^channel to channel/i,
	/^stream to stream/i,
	/^flow to flow/i,
	/^current to current/i,
	/^wave to wave/i,
	/^ripple to ripple/i,
	/^echo to echo/i,
	/^resonance to resonance/i,
	/^harmony to harmony/i,
	/^melody to melody/i,
	/^rhythm to rhythm/i,
	/^beat to beat/i,
	/^pulse to pulse/i,
	/^heartbeat to heartbeat/i,
	/^breath to breath/i,
	/^life to life/i,
	/^existence to existence/i,
	/^being to being/i,
	/^presence to presence/i,
	/^essence to essence/i,
	/^core to core/i,
	/^center to center/i,
	/^middle to middle/i,
	/^heart to heart/i,
	/^soul to soul/i,
	/^spirit to spirit/i,
	/^mind to mind/i,
	/^thought to thought/i,
	/^idea to idea/i,
	/^concept to concept/i,
	/^notion to notion/i,
	/^belief to belief/i,
	/^value to value/i,
	/^principle to principle/i,
	/^standard to standard/i,
	/^criterion to criterion/i,
	/^measure to measure/i,
	/^metric to metric/i,
	/^indicator to indicator/i,
	/^signal to signal/i,
	/^sign to sign/i,
	/^symbol to symbol/i,
	/^mark to mark/i,
	/^token to token/i,
	/^emblem to emblem/i,
	/^badge to badge/i,
	/^logo to logo/i,
	/^brand to brand/i,
	/^identity to identity/i,
	/^persona to persona/i,
	/^character to character/i,
	/^role to role/i,
	/^part to part/i,
	/^piece to piece/i,
	/^fragment to fragment/i,
	/^segment to segment/i,
	/^section to section/i,
	/^portion to portion/i,
	/^share to share/i,
	/^slice to slice/i,
	/^chunk to chunk/i,
	/^block to block/i,
	/^brick to brick/i,
	/^stone to stone/i,
	/^pebble to pebble/i,
	/^grain to grain/i,
	/^speck to speck/i,
	/^particle to particle/i,
	/^atom to atom/i,
	/^molecule to molecule/i,
	/^cell to cell/i,
	/^organism to organism/i,
	/^being to being/i,
	/^creature to creature/i,
	/^animal to animal/i,
	/^plant to plant/i,
	/^tree to tree/i,
	/^flower to flower/i,
	/^leaf to leaf/i,
	/^root to root/i,
	/^stem to stem/i,
	/^branch to branch/i,
	/^twig to twig/i,
	/^trunk to trunk/i,
	/^bark to bark/i,
	/^wood to wood/i,
	/^forest to forest/i,
	/^jungle to jungle/i,
	/^desert to desert/i,
	/^ocean to ocean/i,
	/^sea to sea/i,
	/^river to river/i,
	/^lake to lake/i,
	/^pond to pond/i,
	/^stream to stream/i,
	/^brook to brook/i,
	/^creek to creek/i,
	/^waterfall to waterfall/i,
	/^rain to rain/i,
	/^snow to snow/i,
	/^ice to ice/i,
	/^fire to fire/i,
	/^earth to earth/i,
	/^air to air/i,
	/^wind to wind/i,
	/^sky to sky/i,
	/^cloud to cloud/i,
	/^sun to sun/i,
	/^moon to moon/i,
	/^star to star/i,
	/^galaxy to galaxy/i,
	/^universe to universe/i,
	/^cosmos to cosmos/i,
	/^infinity to infinity/i,
	/^eternity to eternity/i,
	/^timelessness to timelessness/i,
	/^spacelessness to spacelessness/i,
	/^formlessness to formlessness/i,
	/^emptiness to emptiness/i,
	/^void to void/i,
	/^nothingness to nothingness/i,
	/^everythingness to everythingness/i,
	/^oneness to oneness/i,
	/^wholeness to wholeness/i,
	/^completeness to completeness/i,
	/^perfection to perfection/i,
	/^divinity to divinity/i,
	/^holiness to holiness/i,
	/^sacredness to sacredness/i,
	/^blessedness to blessedness/i,
	/^grace to grace/i,
	/^mercy to mercy/i,
	/^compassion to compassion/i,
	/^love to love/i,
	/^peace to peace/i,
	/^joy to joy/i,
	/^happiness to happiness/i,
	/^bliss to bliss/i,
	/^ecstasy to ecstasy/i,
	/^nirvana to nirvana/i,
	/^enlightenment to enlightenment/i,
	/^awakening to awakening/i,
	/^realization to realization/i,
	/^understanding to understanding/i,
	/^knowledge to knowledge/i,
	/^wisdom to wisdom/i,
	/^insight to insight/i,
	/^intuition to intuition/i,
	/^instinct to instinct/i,
	/^gut feeling to gut feeling/i,
	/^hunch to hunch/i,
	/^premonition to premonition/i,
	/^prophecy to prophecy/i,
	/^prediction to prediction/i,
	/^forecast to forecast/i,
	/^outlook to outlook/i,
	/^perspective to perspective/i,
	/^viewpoint to viewpoint/i,
	/^standpoint to standpoint/i,
	/^position to position/i,
	/^stance to stance/i,
	/^attitude to attitude/i,
	/^mindset to mindset/i,
	/^mentality to mentality/i,
	/^psychology to psychology/i,
	/^behavior to behavior/i,
	/^conduct to conduct/i,
	/^demeanor to demeanor/i,
	/^disposition to disposition/i,
	/^temperament to temperament/i,
	/^personality to personality/i,
	/^character to character/i,
	/^nature to nature/i,
	/^essence to essence/i,
	/^core to core/i,
	/^heart to heart/i,
	/^soul to soul/i,
	/^spirit to spirit/i,
	/^mind to mind/i,
	/^body/i
];

/**
	* Extract semantic actions from an AI response.
	* Returns events that should be recorded in the semantic context store,
	* and optionally a cleaned‑up version of the content (with noise removed).
	*/
export function extractSemanticActions(response: AIResponse): ExtractionResult {
	const { content, metadata } = response;
	const events: Omit<SemanticEvent, 'id' | 'timestamp'>[] = [];
	let cleanedContent = content;

	// 1. Check for noise patterns at the start of the response
	const firstLine = content.split('\n')[0].trim();
	const isNoise = NOISE_PATTERNS.some((pattern) => pattern.test(firstLine));
	if (isNoise) {
		// Remove the noise line from cleaned content
		const lines = content.split('\n');
		cleanedContent = lines.slice(1).join('\n').trim();
	}

	// 2. Look for action patterns
	for (const pattern of ACTION_PATTERNS) {
		for (const keyword of pattern.keywords) {
			const regex = new RegExp(`\\b${keyword}\\b`, 'i');
			if (regex.test(content)) {
				// Try to extract a target (e.g., note title, collection name)
				const targetMatch = content.match(/["“]([^"”]+)["”]/);
				const target = targetMatch ? targetMatch[1] : 'unknown';

				// Try to extract details (optional)
				let details: string | undefined;
				const afterColon = content.split(':')[1];
				if (afterColon) {
					details = afterColon.trim().split('.')[0];
				}

				const summary = pattern.descriptionTemplate(target, details);
				events.push({
					type: pattern.type,
					target: metadata?.itemId || metadata?.collectionId || 'unknown',
					summary,
					metadata: {
						itemId: metadata?.itemId,
						collectionId: metadata?.collectionId,
						rawContent: content.substring(0, 200)
					}
				});
				break; // one action per pattern is enough
			}
		}
	}

	// 3. If no events were found but the response is non‑noise and contains a clear outcome,
	// we can create a generic 'note_updated' event.
	if (events.length === 0 && !isNoise && content.length > 20) {
		const hasOutcome = /(updated|added|changed|created|fixed)/i.test(content);
		if (hasOutcome) {
			events.push({
				type: 'update_note',
				target: metadata?.itemId || metadata?.collectionId || 'unknown',
				summary: 'Updated content',
				metadata: {
					itemId: metadata?.itemId,
					collectionId: metadata?.collectionId,
					rawContent: content.substring(0, 200)
				}
			});
		}
	}

	return {
		events,
		updatedContent: cleanedContent !== content ? cleanedContent : undefined
	};
}