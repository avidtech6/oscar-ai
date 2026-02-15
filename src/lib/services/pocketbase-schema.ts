// Oscar AI - PocketBase Schema
// This file defines the PocketBase collections/schema

export const schema = {
    collections: [
        {
            name: 'users',
            type: 'auth',
            system: true,
            schema: [
                {
                    name: 'styleProfileId',
                    type: 'relation',
                    required: false,
                    unique: false,
                    collectionId: 'userStyleProfiles'
                }
            ]
        },
        {
            name: 'userStyleProfiles',
            type: 'base',
            schema: [
                { name: 'tone', type: 'text' },
                { name: 'structure', type: 'text' },
                { name: 'formattingRules', type: 'text' },
                { name: 'vocabulary', type: 'text' },
                { name: 'typicalPhrases', type: 'text' },
                { name: 'sectionOrder', type: 'text' },
                { name: 'recommendationsStyle', type: 'text' },
                { name: 'defectsStyle', type: 'text' },
                { name: 'disclaimers', type: 'text' },
                { name: 'examples', type: 'json' },
                { name: 'userId', type: 'relation', required: true, unique: true, collectionId: 'users' }
            ]
        },
        {
            name: 'projects',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'description', type: 'text' },
                { name: 'location', type: 'text' },
                { name: 'client', type: 'text' },
                { name: 'userId', type: 'relation', required: true, collectionId: 'users' }
            ],
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            createRule: '@request.auth.id != ""',
            updateRule: '@request.auth.id = userId',
            deleteRule: '@request.auth.id = userId'
        },
        {
            name: 'trees',
            type: 'base',
            schema: [
                { name: 'projectId', type: 'relation', required: true, collectionId: 'projects' },
                { name: 'number', type: 'text', required: true },
                { name: 'species', type: 'text' },
                { name: 'scientificName', type: 'text' },
                { name: 'DBH', type: 'number' },
                { name: 'height', type: 'number' },
                { name: 'age', type: 'text' },
                { name: 'category', type: 'text' },
                { name: 'condition', type: 'text' },
                { name: 'defects', type: 'text' },
                { name: 'recommendations', type: 'text' },
                { name: 'notes', type: 'text' },
                { name: 'aiInsights', type: 'text' }
            ],
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            createRule: '@request.auth.id != ""',
            updateRule: '@request.auth.id != ""',
            deleteRule: '@request.auth.id != ""'
        },
        {
            name: 'notes',
            type: 'base',
            schema: [
                { name: 'projectId', type: 'relation', required: true, collectionId: 'projects' },
                { name: 'treeId', type: 'relation', required: false, collectionId: 'trees' },
                { name: 'title', type: 'text', required: true },
                { name: 'content', type: 'text' },
                { name: 'type', type: 'select', options: { values: ['general', 'field', 'voice'] } }
            ],
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            createRule: '@request.auth.id != ""',
            updateRule: '@request.auth.id != ""',
            deleteRule: '@request.auth.id != ""'
        },
        {
            name: 'photos',
            type: 'base',
            schema: [
                { name: 'projectId', type: 'relation', required: true, collectionId: 'projects' },
                { name: 'treeId', type: 'relation', required: false, collectionId: 'trees' },
                { name: 'file', type: 'file', required: true, maxSize: 10000000, mimeTypes: ['image/*'] },
                { name: 'caption', type: 'text' }
            ],
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            createRule: '@request.auth.id != ""',
            updateRule: '@request.auth.id != ""',
            deleteRule: '@request.auth.id != ""'
        },
        {
            name: 'voiceNotes',
            type: 'base',
            schema: [
                { name: 'projectId', type: 'relation', required: true, collectionId: 'projects' },
                { name: 'treeId', type: 'relation', required: false, collectionId: 'trees' },
                { name: 'audioFile', type: 'file', required: true, maxSize: 50000000, mimeTypes: ['audio/*'] },
                { name: 'transcript', type: 'text' }
            ],
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            createRule: '@request.auth.id != ""',
            updateRule: '@request.auth.id != ""',
            deleteRule: '@request.auth.id != ""'
        },
        {
            name: 'reports',
            type: 'base',
            schema: [
                { name: 'projectId', type: 'relation', required: true, collectionId: 'projects' },
                { name: 'title', type: 'text', required: true },
                { name: 'type', type: 'select', options: { values: ['bs5837', 'impact', 'method', 'condition'] } },
                { name: 'pdfFile', type: 'file', required: true, maxSize: 50000000 },
                { name: 'htmlSnapshot', type: 'text' },
                { name: 'metadata', type: 'json' }
            ],
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            createRule: '@request.auth.id != ""',
            updateRule: '@request.auth.id != ""',
            deleteRule: '@request.auth.id != ""'
        },
        {
            name: 'blogPosts',
            type: 'base',
            schema: [
                { name: 'projectId', type: 'relation', required: true, collectionId: 'projects' },
                { name: 'title', type: 'text', required: true },
                { name: 'subtitle', type: 'text' },
                { name: 'bodyHTML', type: 'text' },
                { name: 'tags', type: 'json' },
                { name: 'aiDrafts', type: 'json' },
                { name: 'status', type: 'select', options: { values: ['draft', 'published'] } }
            ],
            listRule: '@request.auth.id != ""',
            viewRule: '@request.auth.id != ""',
            createRule: '@request.auth.id != ""',
            updateRule: '@request.auth.id != ""',
            deleteRule: '@request.auth.id != ""'
        }
    ]
};
