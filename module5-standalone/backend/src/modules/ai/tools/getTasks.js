const getTasks = async ({ contactId }) => {
    // Temporary task data for Module 5 development.
    // This will later be connected to Module 4's
    // real task repository.

    const tasks = [
        {
            id: 1,
            contactId: 1,
            title: "Follow up on CRM proposal",
            status: "pending",
            dueInDays: 2,
        },
        {
            id: 2,
            contactId: 1,
            title: "Schedule implementation discussion",
            status: "pending",
            dueInDays: 5,
        },
        {
            id: 3,
            contactId: 2,
            title: "Send product information",
            status: "completed",
            dueInDays: 0,
        },
        {
            id: 4,
            contactId: 3,
            title: "Follow up on contract negotiation",
            status: "pending",
            dueInDays: 1,
        },
    ];

    const contactTasks = tasks.filter(
        (task) =>
            task.contactId === Number(contactId)
    );

    return {
        success: true,
        data: contactTasks,
    };
};

module.exports = {
    getTasks,
};