const buildLeadScoringPrompt = (contact) => {
    return `
You are an AI lead scoring assistant for a CRM system.

Analyze the following contact information and determine
the likelihood that this lead will convert into a customer.

Contact Information:
Name: ${contact.name}
Company: ${contact.company}
Job Title: ${contact.jobTitle}
Status: ${contact.status}
Interactions: ${contact.interactions}
Days Since Last Contact: ${contact.lastContactDays}
Potential Deal Value: ₹${contact.dealValue}

Evaluate the lead based on:
- Lead qualification status
- Engagement and number of interactions
- Recency of contact
- Potential deal value

Return ONLY valid JSON.

The JSON must have exactly these fields:

{
  "score": 0,
  "rationale": "Short explanation of why this score was given."
}

Rules:
- score must be a number between 0 and 100.
- rationale must be a concise string.
- Do not include markdown.
- Do not include code fences.
- Do not include any text before or after the JSON.
- Do not invent information that is not provided.
`;
};

module.exports = {
    buildLeadScoringPrompt,
};