import { writable } from 'svelte/store';

export interface IntelligencePanelState {
	expanded: boolean;
	activeTab: 'phases' | 'workflows' | 'reports' | 'integration';
	selectedPhase: string | null;
	searchQuery: string;
	sectionExpanded: {
		phases: boolean;
		workflows: boolean;
		engines: boolean;
		integration: boolean;
	};
}

function createIntelligenceStore() {
	const { subscribe, set, update } = writable<IntelligencePanelState>({
		expanded: true,
		activeTab: 'phases',
		selectedPhase: null,
		searchQuery: '',
		sectionExpanded: {
			phases: true,
			workflows: true,
			engines: true,
			integration: true
		}
	});

	function togglePanel() {
		update(state => ({
			...state,
			expanded: !state.expanded
		}));
	}

	function toggleExpand() {
		togglePanel();
	}

	function togglePhaseSelection(phaseId: string) {
		update(state => ({
			...state,
			selectedPhase: state.selectedPhase === phaseId ? null : phaseId
		}));
	}

	function setActiveTab(tab: 'phases' | 'workflows' | 'reports' | 'integration') {
		update(state => ({
			...state,
			activeTab: tab
		}));
	}

	function setSelectedPhase(phaseId: string | null) {
		update(state => ({
			...state,
			selectedPhase: phaseId
		}));
	}

	function setSearchQuery(query: string) {
		update(state => ({
			...state,
			searchQuery: query
		}));
	}

	function toggleSection(section: keyof IntelligencePanelState['sectionExpanded']) {
		update(state => ({
			...state,
			sectionExpanded: {
				...state.sectionExpanded,
				[section]: !state.sectionExpanded[section]
			}
		}));
	}

	function setSectionExpanded(section: keyof IntelligencePanelState['sectionExpanded'], expanded: boolean) {
		update(state => ({
			...state,
			sectionExpanded: {
				...state.sectionExpanded,
				[section]: expanded
			}
		}));
	}

	return {
		subscribe,
		togglePanel,
		toggleExpand,
		setActiveTab,
		setSelectedPhase,
		togglePhaseSelection,
		setSearchQuery,
		toggleSection,
		setSectionExpanded
	};
}

export const intelligenceStore = createIntelligenceStore();