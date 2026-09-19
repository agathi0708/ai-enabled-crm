const aiRepository = require("../ai.repository");

const getContact = async ({ contactId }) => {
    const contact =
        await aiRepository.getContactById(contactId);

    if (!contact) {
        return {
            success: false,
            message: "Contact not found",
        };
    }

    return {
        success: true,
        data: contact,
    };
};

module.exports = {
    getContact,
};