const {
    getContactById,
} = require("../ai.repository");

/**
 * AI tool: getContact
 *
 * Fetches one contact belonging to the
 * authenticated CRM user.
 */
async function getContact(
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

    const contact =
        await getContactById(
            contactId,
            ownerId
        );

    if (!contact) {
        throw new Error(
            "Contact not found"
        );
    }

    return contact;
}

module.exports = getContact;