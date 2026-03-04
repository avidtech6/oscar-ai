import { runAndLogEditorTests } from './editor-tests';

try {
	runAndLogEditorTests();
	console.log('All editor tests passed.');
} catch (error) {
	console.error('Editor tests failed:', error);
	process.exit(1);
}