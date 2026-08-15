import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { codeInput } from '@sanity/code-input'
import { schemaTypes } from './sanity/schemaTypes'

export default defineConfig({
    name: 'default',
    title: 'Kelvin Murimi Portfolio',
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'replace-me',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    plugins: [structureTool(), codeInput()],
    schema: { types: schemaTypes },
})
