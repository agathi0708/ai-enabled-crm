const {
    getTasksByContactId,
} = require("../ai.repository");

/**
 * AI tool: getTasks
 *
 * Fetches tasks associated with a contact
 * belonging to the authenticated CRM user.
 */
async function getTasks(
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

    const tasks =
        await getTasksByContactId(
            contactId,
            ownerId
        );

    return tasks;
}

module.exports = getTasks;