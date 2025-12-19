/**
 * N8N AI API utilities
 * Integrates commit generation and code review via n8n webhooks
 */

const N8N_BASE_URL = 'https://pumopup.app.n8n.cloud'
const N8N_AUTH_TOKEN = process.env.NEXT_PUBLIC_N8N_AUTH_TOKEN || '/dek0omQpvJLWLRPz3ataV6sM/Gu3f9bAew8wNWLZto'

// Endpoints
const COMMIT_GEN_URL = `${N8N_BASE_URL}/webhook/commit-gen`
const CODE_REVIEW_URL = `${N8N_BASE_URL}/webhook/code-review`

export interface CommitGenRequest {
    oldCode?: string
    newCode: string
    language: string
    title?: string
    description?: string
}

export interface CommitGenResponse {
    commitMessage: string
    success: boolean
    error?: string
}

export interface CodeReviewRequest {
    code: string
    language: string
    title?: string
}

export interface CodeReviewResponse {
    review: string
    success: boolean
    error?: string
}

/**
 * Generate a simple unified diff format
 */
function createSimpleDiff(oldCode: string, newCode: string, filename: string): string {
    const oldLines = oldCode.split('\n')
    const newLines = newCode.split('\n')

    let diff = `--- a/${filename}\n+++ b/${filename}\n`

    // Simple line-by-line diff
    const maxLen = Math.max(oldLines.length, newLines.length)

    for (let i = 0; i < maxLen; i++) {
        const oldLine = oldLines[i]
        const newLine = newLines[i]

        if (oldLine === undefined && newLine !== undefined) {
            diff += `+${newLine}\n`
        } else if (newLine === undefined && oldLine !== undefined) {
            diff += `-${oldLine}\n`
        } else if (oldLine !== newLine) {
            diff += `-${oldLine}\n`
            diff += `+${newLine}\n`
        } else {
            diff += ` ${oldLine}\n`
        }
    }

    return diff
}

/**
 * Generate commit message using AI
 * Compares old and new code to generate meaningful commit message
 */
export async function generateCommitMessage(request: CommitGenRequest): Promise<CommitGenResponse> {
    try {
        // Generate a clean filename
        // Use simple file name based on language extension
        const ext = request.language?.toLowerCase() || 'txt'
        const cleanTitle = request.title
            ? request.title.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).join('_').toLowerCase()
            : 'file'
        const filename = `${cleanTitle || 'file'}.${ext}`

        const diff = createSimpleDiff(request.oldCode || '', request.newCode, filename)

        const requestBody = {
            diff: diff,
            filename: filename,
        }

        const response = await fetch(COMMIT_GEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': N8N_AUTH_TOKEN,
            },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }

        const data = await response.json()

        // Handle the actual n8n response format
        // Response: { success, type, data: { commit_message }, markdown }
        if (data.success && data.data?.commit_message) {
            return { commitMessage: data.data.commit_message, success: true }
        }

        // Fallback: handle different response formats
        if (typeof data === 'string') {
            return { commitMessage: data, success: true }
        }

        if (data.commitMessage) {
            return { commitMessage: data.commitMessage, success: true }
        }

        if (data.commit_message) {
            return { commitMessage: data.commit_message, success: true }
        }

        if (data.message) {
            return { commitMessage: data.message, success: true }
        }

        if (data.output) {
            return { commitMessage: data.output, success: true }
        }

        return { commitMessage: JSON.stringify(data), success: true }
    } catch (error) {
        console.error('Commit generation error:', error)
        return {
            commitMessage: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Get AI code review for code snippet
 */
export async function getCodeReview(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    try {
        // Create a diff format (all lines as additions for code review)
        const ext = request.language?.toLowerCase() || 'txt'
        const cleanTitle = request.title
            ? request.title.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/).join('_').toLowerCase()
            : 'file'
        const filename = `${cleanTitle || 'file'}.${ext}`

        // For code review, we send the code as "all additions"
        const lines = request.code.split('\n')
        let diff = `--- /dev/null\n+++ b/${filename}\n`
        for (const line of lines) {
            diff += `+${line}\n`
        }

        const response = await fetch(CODE_REVIEW_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': N8N_AUTH_TOKEN,
            },
            body: JSON.stringify({
                diff: diff,
                filename: filename,
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }

        const data = await response.json()

        // Handle the actual n8n response format
        // Response: { success, type, data, markdown }
        // Prefer markdown as it's formatted nicely
        if (data.markdown) {
            return { review: data.markdown, success: true }
        }

        if (data.success && data.data?.issues) {
            // Format issues if present
            const issues = data.data.issues
            if (issues.length === 0) {
                return { review: '✅ No issues found. Good job!', success: true }
            }
            return { review: issues.map((i: { message: string }) => `• ${i.message}`).join('\n'), success: true }
        }

        // Fallback: handle different response formats
        if (typeof data === 'string') {
            return { review: data, success: true }
        }

        if (data.review) {
            return { review: data.review, success: true }
        }

        if (data.message) {
            return { review: data.message, success: true }
        }

        if (data.output) {
            return { review: data.output, success: true }
        }

        return { review: JSON.stringify(data), success: true }
    } catch (error) {
        console.error('Code review error:', error)
        return {
            review: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}
