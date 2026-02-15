import axios from "axios";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function main() {
    console.log("=== Telegram Webhook Setup ===");
    console.log("This script will set your Telegram Bot Webhook to your public URL.");
    console.log("");

    const botToken = await question("Enter your Telegram Bot Token: ");
    const publicUrl = await question("Enter your Public Tunnel URL (e.g. https://xyz.loca.lt): ");

    if (!botToken || !publicUrl) {
        console.error("Error: Bot Token and Public URL are required.");
        process.exit(1);
    }

    // Ensure URL has no trailing slash
    const cleanUrl = publicUrl.replace(/\/$/, "");
    const webhookUrl = `${cleanUrl}/webhook/telegram/${botToken}`;

    console.log(`\nSetting webhook to: ${webhookUrl}`);

    try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/setWebhook`, {
            url: webhookUrl
        });

        console.log("\n✅ Success! Telegram response:");
        console.log(response.data);
    } catch (error: any) {
        console.error("\n❌ Failed to set webhook:");
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    } finally {
        rl.close();
    }
}

main();
