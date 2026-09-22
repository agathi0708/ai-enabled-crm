const {
    getDealsByContactId,
} = require("../ai.repository");

/**
 * AI tool: getDeals
 *
 * Fetches deals associated with a contact
 * belonging to the authenticated CRM user.
 */
async function getDeals(
    contactId,
    ownerId
) {
    if (!contactId) {
        throw new Error(
            "Contact ID is required"
        );
    }

    if (!ownerId) {
        throw new Error(
            "Owner ID is required"
        );
    }

    const deals =
        await getDealsByContactId(
            contactId,
            ownerId
        );

    return deals;
}

module.exports = getDeals;