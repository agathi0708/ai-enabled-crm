require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `AI CRM Module 5 backend running on port ${PORT}`
    );

    console.log(
        "AI providers configured:",
        {
            primary: Boolean(
                process.env.AI_PRIMARY_API_KEY
            ),
            secondary: Boolean(
                process.env.AI_SECONDARY_API_KEY
            ),
            tertiary: Boolean(
                process.env.AI_TERTIARY_API_KEY
            ),
        }
    );
});