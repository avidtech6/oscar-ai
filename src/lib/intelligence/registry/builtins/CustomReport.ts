/**
 * Custom Report (Phase 1)
 * 
 * Built‑in report type definition for user‑defined custom reports.
 */

import { createReportTypeDefinition } from '../ReportTypeDefinition';

export const CustomReport = createReportTypeDefinition(
	'custom',
	'Custom Report',
	'Flexible report template for user‑defined content and structure',
	[
		'title_page',
		'introduction',
		'methodology',
		'findings',
		'conclusions',
		'recommendations',
		'appendices'
	],
	[
		'executive_summary',
		'background',
		'data_sources',
		'limitations',
		'acknowledgements',
		'glossary'
	],
	[
		'user_defined_section_1',
		'user_defined_section_2',
		'user_defined_section_3'
	],
	[],
	[
		'Follow user‑provided structure and formatting guidelines.',
		'Ensure all user‑defined sections are clearly labeled.',
		'Maintain consistent styling across custom content.'
	],
	[
		'Allow maximum flexibility for user‑defined sections.',
		'Provide clear guidance on how to extend the template.',
		'Ensure the report can be validated even with custom structure.',
		'Support integration with other report types via adapters.'
	],
	'1.0.0'
);

export default CustomReport;