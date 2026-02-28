import { supabase } from '$lib/supabase/client';
import type { Report } from '$lib/db';

export interface SupabaseReport {
	id: string;
	project_id: string;
	title: string;
	type: 'bs5837' | 'impact' | 'method';
	html_content: string;
	pdf_url: string | null;
	is_dummy: boolean;
	created_at: string;
	updated_at: string;
}

/**
 * Get all reports for a project from Supabase
 */
export async function getReports(projectId: string): Promise<Report[]> {
	try {
		const { data, error } = await supabase
			.from('reports')
			.select('*')
			.eq('project_id', projectId)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching reports from Supabase:', error);
			throw error;
		}

		return (data as SupabaseReport[]).map(mapSupabaseReportToReport);
	} catch (error) {
		console.error('Error in getReports:', error);
		return [];
	}
}

/**
 * Get a single report by ID from Supabase
 */
export async function getReport(reportId: string): Promise<Report | null> {
	try {
		const { data, error } = await supabase
			.from('reports')
			.select('*')
			.eq('id', reportId)
			.single();

		if (error) {
			console.error('Error fetching report from Supabase:', error);
			throw error;
		}

		return mapSupabaseReportToReport(data as SupabaseReport);
	} catch (error) {
		console.error('Error in getReport:', error);
		return null;
	}
}

/**
 * Save a report to Supabase
 */
export async function saveReport(report: Omit<Report, 'id' | 'generatedAt' | 'pdfBlob'> & { htmlContent: string }): Promise<string> {
	try {
		const supabaseReport: any = {
			project_id: report.projectId,
			title: report.title,
			type: report.type,
			html_content: report.htmlContent,
			pdf_url: null, // Will be populated when PDF is generated
			is_dummy: report.isDummy || false
		};

		const { data, error } = await supabase
			.from('reports')
			.insert(supabaseReport)
			.select()
			.single();

		if (error) {
			console.error('Error saving report to Supabase:', error);
			throw error;
		}

		return (data as SupabaseReport).id;
	} catch (error) {
		console.error('Error in saveReport:', error);
		throw error;
	}
}

/**
 * Update a report in Supabase
 */
export async function updateReport(reportId: string, updates: Partial<Report> & { htmlContent?: string }): Promise<void> {
	try {
		const supabaseUpdates: any = {};

		if (updates.title !== undefined) supabaseUpdates.title = updates.title;
		if (updates.type !== undefined) supabaseUpdates.type = updates.type;
		if (updates.htmlContent !== undefined) supabaseUpdates.html_content = updates.htmlContent;
		if (updates.isDummy !== undefined) supabaseUpdates.is_dummy = updates.isDummy;

		// Always update updated_at
		supabaseUpdates.updated_at = new Date().toISOString();

		const { error } = await supabase
			.from('reports')
			.update(supabaseUpdates as never)
			.eq('id', reportId);

		if (error) {
			console.error('Error updating report in Supabase:', error);
			throw error;
		}
	} catch (error) {
		console.error('Error in updateReport:', error);
		throw error;
	}
}

/**
 * Delete a report from Supabase
 */
export async function deleteReport(reportId: string): Promise<void> {
	try {
		const { error } = await supabase
			.from('reports')
			.delete()
			.eq('id', reportId);

		if (error) {
			console.error('Error deleting report from Supabase:', error);
			throw error;
		}
	} catch (error) {
		console.error('Error in deleteReport:', error);
		throw error;
	}
}

/**
 * Save report HTML to Supabase storage and get public URL
 */
export async function saveReportToStorage(
	projectId: string,
	reportId: string,
	htmlContent: string,
	fileName?: string
): Promise<string> {
	try {
		const timestamp = new Date().getTime();
		const reportFileName = fileName || `report_${reportId}_${timestamp}.html`;
		const storagePath = `projects/${projectId}/reports/${reportFileName}`;

		// Create a Blob from the HTML content
		const blob = new Blob([htmlContent], { type: 'text/html' });
		const file = new File([blob], reportFileName, { type: 'text/html' });

		// Upload to Supabase storage
		const { data, error } = await supabase.storage
			.from('reports')
			.upload(storagePath, file, {
				cacheControl: '3600',
				upsert: true
			});

		if (error) {
			console.error('Error uploading report to Supabase storage:', error);
			throw error;
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from('reports')
			.getPublicUrl(storagePath);

		return urlData.publicUrl;
	} catch (error) {
		console.error('Error in saveReportToStorage:', error);
		throw error;
	}
}

/**
 * Save report PDF to Supabase storage and get public URL
 */
export async function saveReportPdfToStorage(
	projectId: string,
	reportId: string,
	pdfBlob: Blob,
	fileName?: string
): Promise<string> {
	try {
		const timestamp = new Date().getTime();
		const pdfFileName = fileName || `report_${reportId}_${timestamp}.pdf`;
		const storagePath = `projects/${projectId}/reports/${pdfFileName}`;

		// Upload to Supabase storage
		const { data, error } = await supabase.storage
			.from('reports')
			.upload(storagePath, pdfBlob, {
				cacheControl: '3600',
				upsert: true
			});

		if (error) {
			console.error('Error uploading PDF to Supabase storage:', error);
			throw error;
		}

		// Get public URL
		const { data: urlData } = supabase.storage
			.from('reports')
			.getPublicUrl(storagePath);

		return urlData.publicUrl;
	} catch (error) {
		console.error('Error in saveReportPdfToStorage:', error);
		throw error;
	}
}

/**
 * Map Supabase report to local Report interface
 */
function mapSupabaseReportToReport(supabaseReport: SupabaseReport): Report {
	return {
		id: supabaseReport.id,
		projectId: supabaseReport.project_id,
		title: supabaseReport.title,
		type: supabaseReport.type,
		pdfBlob: new Blob(), // Empty blob - we'll need to fetch PDF separately if needed
		isDummy: supabaseReport.is_dummy,
		generatedAt: new Date(supabaseReport.created_at)
	};
}

/**
 * Map local Report to Supabase report interface
 */
function mapReportToSupabaseReport(report: Report): Partial<SupabaseReport> {
	return {
		project_id: report.projectId,
		title: report.title,
		type: report.type,
		is_dummy: report.isDummy || false
	};
}