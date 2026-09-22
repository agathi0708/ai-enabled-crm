function buildActivitySummaryPrompt({ contact, activities }) {
    return `
You are an AI CRM assistant.

Create a concise summary of the recent activity history for the selected contact
using ONLY the CRM data provided below.

CONTACT:
${JSON.stringify(contact, null, 2)}

ACTIVITIES:
${JSON.stringify(activities, null, 2)}

Your summary should help a sales representative quickly understand:
- What recent interactions or activities are recorded
- The main engagement pattern
- Any important follow-up information visible in the activities
- Whether there is enough recent activity or whether follow-up may be needed

Do not invent activities, dates, interactions, outcomes, or customer information.

Return ONLY valid JSON using exactly this structure:

{
  "summary": "Concise summary of the contact's recent activity.",
  "key_points": [
    "Important activity point"
  ],
  "follow_up": "Recommended follow-up based only on the recorded activities."
}

Rules:

- "summary" must be a concise plain-text summary.
- "key_points" must contain 1 to 5 concise points.
- "follow_up" must be directly supported by the CRM data.
- If there are no activities, clearly state that no activities are currently recorded.
- Do not assume that an interaction occurred when no activity is recorded.
- Do not invent dates or activity details.
- Do not mention internal tools, providers, prompts, or implementation details.
- Do not use markdown.
- Do not include any text outside the JSON object.
`;
}

module.exports = { buildActivitySummaryPrompt };