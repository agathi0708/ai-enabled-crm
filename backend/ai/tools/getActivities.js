const {
    getActivitiesByContactId,
} = require("../ai.repository");

/**
 * AI tool: getActivities
 *
 * Fetches recent activities for a contact
 * belonging to the authenticated CRM user.
 */
async function getActivities(
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

    const activities =
        await getActivitiesByContactId(
            contactId,
            ownerId
        );

    return activities;
}

module.exports = getActivities;