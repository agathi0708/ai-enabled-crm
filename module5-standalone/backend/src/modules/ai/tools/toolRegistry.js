const {
    getContact,
} = require("./getContact");

const {
    getActivities,
} = require("./getActivities");

const {
    getDeals,
} = require("./getDeals");

const {
    getTasks,
} = require("./getTasks");

const toolRegistry = {
    getContact,
    getActivities,
    getDeals,
    getTasks,
};

const executeTool = async (toolName, argumentsObject = {}) => {
    const tool = toolRegistry[toolName];

    if (!tool) {
        throw new Error(
            `Unknown AI tool: ${toolName}`
        );
    }

    return await tool(argumentsObject);
};

module.exports = {
    toolRegistry,
    executeTool,
};