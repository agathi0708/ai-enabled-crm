const aiRepository = require("../ai.repository");

const getActivities = async ({ contactId }) => {
    const activities =
        await aiRepository.getActivitiesByContactId(
            contactId
        );

    return {
        success: true,
        data: activities,
    };
};

module.exports = {
    getActivities,
};