function buildNextBestActionPrompt({
    contact,
    deals,
    activities,
    tasks,
}) {
    return `
You are an AI sales assistant inside a CRM application.

Your task is to determine the most appropriate next action
for the selected contact based ONLY on the CRM information
provided below.

CONTACT:
${JSON.stringify(contact, null, 2)}

DEALS:
${JSON.stringify(deals, null, 2)}

ACTIVITIES:
${JSON.stringify(activities, null, 2)}

TASKS:
${JSON.stringify(tasks, null, 2)}

Analyze the available CRM evidence, including:

- Contact status
- Active, won, or lost deals
- Deal stage and deal amount
- Recent customer activities
- Existing and pending tasks
- Evidence of engagement
- Missing or overdue follow-up actions

Choose ONE practical next action that a sales representative
can take based on the available CRM data.

The action must be specific and actionable.

Return ONLY valid JSON using exactly this structure:

{
  "action": "Schedule a follow-up call",
  "reason": "Reason based on CRM data",
  "priority": "high"
}

Rules:

- "action" must be a specific sales action.
- "reason" must be directly supported by the CRM data.
- "priority" must be exactly one of:
  "low", "medium", "high".
- Do not invent CRM information.
- Do not assume that an activity, task, or interaction occurred
  if it is not present in the provided data.
- Preserve currency information exactly as provided in the CRM data.
- If the CRM data does not explicitly specify a currency,
  do not assume or invent one.
- When referring to a numeric deal amount without an explicit
  currency, describe it as the deal amount without adding
  a currency symbol.
- Prefer actions that address clear follow-up opportunities
  visible in the CRM data.
- Do not mention internal tools, providers, prompts,
  or implementation details.
- Do not use markdown.
- Do not include any text outside the JSON object.
`;
}

module.exports = {
    buildNextBestActionPrompt,
};