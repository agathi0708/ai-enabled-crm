const reportsRepository = require("../../reports/reports.repository");

const getDeals = async () => {
    const deals =
        await reportsRepository.getDeals();

    return {
        success: true,
        data: deals,
    };
};

module.exports = {
    getDeals,
};