const leads = [
    // Mock lead data for Module 5 development
    ...Array.from({ length: 74 }, (_, index) => ({
        id: index + 1,
        status: "active",
    })),
];

const deals = [
    {
        id: 1,
        title: "Enterprise CRM License",
        stage: "proposal",
        value: 250000,
    },
    {
        id: 2,
        title: "Cloud Migration",
        stage: "negotiation",
        value: 180000,
    },
    {
        id: 3,
        title: "Support Contract",
        stage: "qualified",
        value: 120000,
    },
    {
        id: 4,
        title: "Marketing Platform",
        stage: "won",
        value: 95000,
    },
    {
        id: 5,
        title: "Analytics Solution",
        stage: "lost",
        value: 75000,
    },
];

const getDeals = async () => {
    return deals;
};

const getLeads = async () => {
    return leads;
};

const performanceData = [
    {
        month: "January",
        leads: 42,
        deals: 18,
        wonDeals: 6,
        revenue: 95000,
    },
    {
        month: "February",
        leads: 48,
        deals: 21,
        wonDeals: 7,
        revenue: 110000,
    },
    {
        month: "March",
        leads: 55,
        deals: 24,
        wonDeals: 8,
        revenue: 125000,
    },
    {
        month: "April",
        leads: 61,
        deals: 27,
        wonDeals: 9,
        revenue: 138000,
    },
    {
        month: "May",
        leads: 68,
        deals: 30,
        wonDeals: 11,
        revenue: 152000,
    },
    {
        month: "June",
        leads: 74,
        deals: 34,
        wonDeals: 13,
        revenue: 175000,
    },
];

const getPerformanceData = async () => {
    return performanceData;
};

module.exports = {
    getDeals,
    getLeads,
    getPerformanceData,
};