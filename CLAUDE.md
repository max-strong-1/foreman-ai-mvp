# CLAUDE.md - AI Assistant Guide for Foreman AI MVP

## Repository Overview

**Project Name:** Foreman AI MVP - MileStone Trucks Chatbot
**Repository:** max-strong-1/foreman-ai-mvp
**Purpose:** N8N workflow configurations for an AI-powered sales and support chatbot for MilestoneTrucks.com
**Integration:** Eleven Labs voice interface with OpenAI GPT-4.1-mini and Perplexity AI for information retrieval

## Codebase Structure

```
foreman-ai-mvp/
├── milestone-chatbot-workflow.json       # Original workflow configuration
├── milestone-chatbot-workflow-v2.json    # Updated workflow with improved formatting
└── CLAUDE.md                             # This file
```

### File Descriptions

1. **milestone-chatbot-workflow.json**
   - Original N8N workflow configuration
   - Status: Active (`"active": true`)
   - Version ID: `updated-version`
   - Primary workflow file currently in use

2. **milestone-chatbot-workflow-v2.json**
   - Updated version with improved JSON formatting
   - Status: Inactive (`"active": false`)
   - Version ID: `9536a20e-7ebd-4eaa-b8a5-3b38df1799f1`
   - Enhanced version for future deployment

## Technical Architecture

### Workflow Components

The N8N workflow consists of 7 interconnected nodes:

#### 1. Webhook Node (Entry Point)
- **Type:** `n8n-nodes-base.webhook`
- **Method:** POST
- **Path:** `/milestone-chatbot`
- **Webhook ID:** `5a57f0ba-c0b6-4d11-8386-9058166dcf13`
- **Purpose:** Receives incoming requests from Eleven Labs voice interface

#### 2. Format Input for AI (Data Transformation)
- **Type:** `n8n-nodes-base.code`
- **Purpose:** Extracts and normalizes input from various payload formats
- **Input Sources:**
  - `$input.item.json.input`
  - `$input.item.json.body?.input`
  - `$input.item.json.message`
- **Output:** `{ chatInput: string }`

#### 3. AI Agent (Core Intelligence)
- **Type:** `@n8n/n8n-nodes-langchain.agent`
- **System Role:** MilestoneTrucks.com AI Sales & Support Agent
- **Key Directives:**
  - Exclusive representation of MilestoneTrucks.com
  - No competitor mentions or comparisons
  - Product guidance (gravel, soil, aggregates)
  - Order assistance and FAQ support
  - Perplexity integration for real-time data

#### 4. Simple Memory (Conversation Context)
- **Type:** `@n8n/n8n-nodes-langchain.memoryBufferWindow`
- **Purpose:** Maintains conversation history for contextual responses
- **Connection:** AI memory interface to AI Agent

#### 5. Perplexity Tool (Knowledge Retrieval)
- **Type:** `n8n-nodes-base.perplexityTool`
- **Purpose:** Retrieves information exclusively from MilestoneTrucks.com
- **Credentials:** `s3rJt8GKeSsy51z5` (Perplexity account)
- **Restriction:** Only queries MilestoneTrucks.com domain

#### 6. OpenAI Chat Model (Language Model)
- **Type:** `@n8n/n8n-nodes-langchain.lmChatOpenAi`
- **Model:** `gpt-4.1-mini`
- **Credentials:** `cjHuEnteDna9sVWw` (OpenAi account 6)
- **Purpose:** Powers the conversational AI capabilities

#### 7. Format Response for Eleven Labs (Output Transformation)
- **Type:** `n8n-nodes-base.code`
- **Purpose:** Formats AI response for Eleven Labs voice synthesis
- **Fallback Message:** "I apologize, but I encountered an error processing your request."
- **Output:** `{ response: string }`

#### 8. Respond to Webhook (Exit Point)
- **Type:** `n8n-nodes-base.respondToWebhook`
- **Format:** JSON
- **Purpose:** Returns formatted response to caller

### Data Flow

```
Webhook (Eleven Labs)
  ↓
Format Input for AI (Extract & normalize input)
  ↓
AI Agent (Process with context)
  ↓ ↑
  ├─ Simple Memory (Conversation history)
  ├─ Perplexity Tool (MilestoneTrucks.com data)
  └─ OpenAI Chat Model (GPT-4.1-mini)
  ↓
Format Response for Eleven Labs (Prepare voice response)
  ↓
Respond to Webhook (Return JSON)
```

## Development Workflows

### Git Branching Strategy

- **Main Branch:** Not explicitly set in current config
- **Feature Branches:** Use pattern `claude/claude-md-{session-id}`
- **Current Branch:** `claude/claude-md-mi753uy8e041cipk-011mLd1WyvKGyfXt68GA3swk`

### Git Operations Guidelines

#### Pushing Changes
```bash
# Always use -u flag for new branches
git push -u origin <branch-name>

# Branch naming: MUST start with 'claude/' and end with session ID
# Otherwise push will fail with 403 error

# Retry logic for network failures:
# - Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
```

#### Fetching/Pulling Changes
```bash
# Prefer fetching specific branches
git fetch origin <branch-name>

# Use same retry logic for network failures
git pull origin <branch-name>
```

### Commit Message Conventions

Recent commits follow this pattern:
- Clear, descriptive messages
- Focus on the "what" and "why"
- Examples:
  - "Add improved N8N workflow configuration with better JSON formatting"
  - "Add complete N8N workflow configuration for Eleven Labs chatbot integration"

## Key Conventions for AI Assistants

### 1. File Modification Guidelines

**CRITICAL:** This repository contains N8N workflow JSON files. When modifying:

- **Preserve JSON Structure:** Maintain exact node IDs, connection references, and type versions
- **Credential IDs:** Never modify credential IDs unless explicitly updating integrations
- **Node Connections:** Verify all connection objects remain valid after changes
- **Version Control:** Update `versionId` when making significant workflow changes
- **Active Status:** Be cautious when changing `"active": true/false` flags

### 2. Workflow Versioning

When creating new workflow versions:

1. Copy existing workflow file to a new version (e.g., `-v3.json`)
2. Update the `name` field to reflect the version
3. Generate new `versionId` (UUID format)
4. Set `"active": false` for testing versions
5. Document changes in commit message

### 3. Node Configuration Standards

**DO NOT modify these without explicit instruction:**
- Node IDs (UUIDs)
- Webhook IDs
- Credential references
- Node type versions
- Connection mappings

**Safe to modify:**
- System messages in AI Agent
- JavaScript code in Code nodes
- Node positions (for visual layout)
- Workflow name
- Tags

### 4. AI Agent System Message Guidelines

The system message defines the chatbot's behavior. When updating:

- **Maintain brand identity:** MilestoneTrucks.com exclusivity
- **Preserve restrictions:** No competitor mentions
- **Keep tone guidelines:** Knowledgeable, down-to-earth, helpful
- **Retain Perplexity instructions:** Domain-restricted queries
- **Document changes:** Explain why system message was modified

### 5. Code Node Best Practices

JavaScript code nodes use N8N's execution context:

**Input Access:**
```javascript
$input.item.json.fieldName
$input.item.json.body?.nestedField
```

**Return Format:**
```javascript
return {
  json: {
    outputField: value
  }
};
```

**Error Handling:**
- Always provide fallback values
- Include user-friendly error messages
- Consider voice interface (Eleven Labs) requirements

### 6. Testing Workflow Changes

Before committing workflow modifications:

1. **Validate JSON:** Ensure file is valid JSON
2. **Check References:** Verify all node IDs exist in connections
3. **Test Flow:** If possible, test in N8N environment
4. **Review Credentials:** Ensure credential references are valid
5. **Document Changes:** Update commit message and version notes

### 7. Credential Management

**NEVER commit actual credentials.** This repository uses credential references:

- Perplexity API: `s3rJt8GKeSsy51z5`
- OpenAI API: `cjHuEnteDna9sVWw`

These are references to credentials stored in N8N's secure credential store.

### 8. Integration Points

**Eleven Labs (Voice Interface):**
- Input format: Flexible (checks multiple payload locations)
- Output format: `{ response: string }`
- Error handling: Always return a response object

**MilestoneTrucks.com (Perplexity):**
- Domain-restricted queries only
- No general web searches
- Used for pricing, products, delivery info

**OpenAI GPT-4.1-mini:**
- Powers conversation logic
- Integrated with Perplexity tool
- Memory-enabled for context

## Common Modification Scenarios

### Scenario 1: Update AI Agent Behavior

**File:** `milestone-chatbot-workflow.json` or `-v2.json`
**Location:** `nodes[2].parameters.options.systemMessage`

```javascript
// Modify the system message while preserving:
// - Brand identity restrictions
// - Perplexity usage guidelines
// - Tone and voice specifications
```

### Scenario 2: Change Input/Output Formatting

**Input Formatter:** `nodes[1].parameters.jsCode`
**Output Formatter:** `nodes[6].parameters.jsCode`

Update JavaScript code to handle new payload formats or response structures.

### Scenario 3: Switch AI Model

**Location:** `nodes[5].parameters.model.value`

Current: `"gpt-4.1-mini"`
Change to another OpenAI model if needed (ensure compatibility)

### Scenario 4: Create New Workflow Version

```bash
# 1. Create new version file
cp milestone-chatbot-workflow-v2.json milestone-chatbot-workflow-v3.json

# 2. Edit new file:
#    - Update "name" field
#    - Generate new "versionId"
#    - Set "active": false
#    - Make your changes

# 3. Commit with descriptive message
git add milestone-chatbot-workflow-v3.json
git commit -m "Add v3 workflow with [your changes]"
git push -u origin claude/claude-md-[session-id]
```

## Troubleshooting Guide

### Issue: Workflow not responding

**Check:**
1. `"active": true` in the workflow file
2. Webhook path matches integration configuration
3. Credential IDs are valid in N8N instance
4. All node connections are properly mapped

### Issue: AI responses are generic/off-brand

**Check:**
1. System message in AI Agent node
2. Perplexity tool is connected and configured
3. Memory node is linked to AI Agent
4. OpenAI model is correct and accessible

### Issue: JSON parsing errors

**Check:**
1. Valid JSON syntax (use JSON validator)
2. All node IDs referenced in connections exist
3. No trailing commas or syntax errors
4. Proper escaping of special characters in strings

## Development Best Practices

1. **Always read files before modifying:** Use Read tool to understand current state
2. **Preserve structure:** N8N workflows have strict JSON schema requirements
3. **Test incrementally:** Make small changes and validate
4. **Version control:** Use meaningful branch and commit messages
5. **Document changes:** Update version IDs and add notes
6. **Respect credentials:** Never expose or modify credential IDs unnecessarily
7. **Consider integrations:** Changes affect Eleven Labs, OpenAI, and Perplexity
8. **Maintain compatibility:** Ensure N8N can parse and execute the workflow

## Repository Metadata

- **Last Updated:** November 20, 2025
- **Active Workflow:** milestone-chatbot-workflow.json
- **Latest Version:** milestone-chatbot-workflow-v2.json (inactive)
- **Platform:** N8N Workflow Automation
- **Primary Use Case:** Voice-enabled sales chatbot for materials/trucking company

## Future Development Considerations

When extending this repository:

1. **Additional Workflows:** Follow the versioning pattern established
2. **Documentation:** Create README.md for end-user documentation
3. **Testing:** Consider adding test payloads or validation scripts
4. **Environment Config:** Document environment-specific settings
5. **Deployment:** Add deployment instructions for N8N instances
6. **Monitoring:** Consider webhook logging or analytics integration
7. **Backup Strategy:** Regular exports of working configurations

## Contact & Support

For issues or questions about this workflow:
- Review N8N documentation for node types
- Check OpenAI API status for model availability
- Verify Perplexity API access and domain restrictions
- Test Eleven Labs webhook integration separately

---

*This document is maintained for AI assistants working with this repository. Keep it updated as the workflow evolves.*
