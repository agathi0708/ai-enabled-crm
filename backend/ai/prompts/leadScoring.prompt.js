function buildLeadScoringPrompt({
    contact,
    deals,
    activities,
    tasks,
}) {
    return `
You are an AI lead-scoring assistant inside a CRM application.

Evaluate the following CRM data for the selected contact.

CONTACT:
${JSON.stringify(contact, null, 2)}

DEALS:
${JSON.stringify(deals, null, 2)}

ACTIVITIES:
${JSON.stringify(activities, null, 2)}

TASKS:
${JSON.stringify(tasks, null, 2)}

Your task is to produce a lead score from 0 to 100 based ONLY
on the CRM information provided above.

Consider factors such as:
- Contact/lead status
- Active or won/lost deals
- Deal stage and deal amount
- Recent activities and engagement
- Existing tasks and task status
- Overall evidence of sales engagement

Do not invent information that is not present in the CRM data.

Return ONLY valid JSON using exactly this structure:

{
  "score": 0,
  "category": "low",
  "reasons": [
    "Reason based on CRM data"
  ],
  "recommendations": [
    "Recommended next action based on CRM data"
  ]
}

Rules:

- "score" must be an integer from 0 to 100.
- "category" must be exactly one of:
  "low", "medium", "high".
- Use:
  - 0-39 = "low"
  - 40-69 = "medium"
  - 70-100 = "high"
- "reasons" must contain 1 to 5 concise reasons.
- "recommendations" must contain 1 to 3 concise actions.
- Every reason and recommendation must be supported by the CRM data.
- Preserve currency information exactly as provided in the CRM data.
- If the CRM data does not explicitly specify a currency, do not assume or invent one.
- When referring to a numeric deal amount without an explicit currency, describe it as the deal amount without adding a currency symbol.
- Do not mention internal tools, providers, prompts, or implementation details.
- Do not use markdown.
- Do not include any text outside the JSON object.
`;
}

module.exports = {
    buildLeadScoringPrompt,
};