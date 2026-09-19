const contacts = [
    {
        id: 1,
        name: "Arun Kumar",
        company: "Tech Solutions",
        email: "arun@example.com",
        jobTitle: "Sales Manager",
        status: "qualified",
        interactions: 8,
        lastContactDays: 2,
        dealValue: 250000,
    },
    {
        id: 2,
        name: "Priya Sharma",
        company: "Digital Works",
        email: "priya@example.com",
        jobTitle: "Marketing Head",
        status: "new",
        interactions: 2,
        lastContactDays: 18,
        dealValue: 50000,
    },
    {
        id: 3,
        name: "Rahul Singh",
        company: "Enterprise Corp",
        email: "rahul@example.com",
        jobTitle: "CTO",
        status: "qualified",
        interactions: 12,
        lastContactDays: 1,
        dealValue: 500000,
    },
];

const getContactById = async (contactId) => {
    return contacts.find(
        (contact) => contact.id === Number(contactId)
    );
};

const getAllContacts = async () => {
    return contacts;
};

const activities = [
    {
        id: 1,
        contactId: 1,
        type: "call",
        description:
            "Discussed CRM requirements and pricing.",
        daysAgo: 2,
    },
    {
        id: 2,
        contactId: 1,
        type: "email",
        description:
            "Sent product proposal and implementation timeline.",
        daysAgo: 4,
    },
    {
        id: 3,
        contactId: 1,
        type: "meeting",
        description:
            "Demo meeting completed with the sales team.",
        daysAgo: 6,
    },
    {
        id: 4,
        contactId: 2,
        type: "email",
        description:
            "Initial product information sent.",
        daysAgo: 18,
    },
    {
        id: 5,
        contactId: 3,
        type: "meeting",
        description:
            "Discussed enterprise deployment requirements.",
        daysAgo: 1,
    },
    {
        id: 6,
        contactId: 3,
        type: "call",
        description:
            "Follow-up call regarding contract negotiation.",
        daysAgo: 2,
    },
];

const getActivitiesByContactId = async (contactId) => {
    return activities.filter(
        (activity) =>
            activity.contactId === Number(contactId)
    );
};

module.exports = {
    getContactById,
    getAllContacts,
    getActivitiesByContactId,
};