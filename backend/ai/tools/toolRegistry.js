const getContact = require("./getContact");
const getActivities = require("./getActivities");
const getDeals = require("./getDeals");
const getTasks = require("./getTasks");

/**
 * Controlled CRM tools available to
 * the AI assistant.
 *
 * The assistant can select a tool by name,
 * but every tool still receives the
 * authenticated owner ID from the backend.
 */
const toolRegistry = {
    getContact,
    getActivities,
    getDeals,
    getTasks,
};

function getTool(toolName) {
    return toolRegistry[toolName];
}

function getAvailableToolNames() {
    return Object.keys(toolRegistry);
}

module.exports = {
    toolRegistry,
    getTool,
    getAvailableToolNames,
};