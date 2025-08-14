const config = require('../config')
const {cmd , commands} = require('../command')
const os = require("os")
const {runtime} = require('../lib/functions')
const axios = require('axios')
const {sleep} = require('../lib/functions')
const fs = require('fs')
const path = require('path')

cmd({
    pattern: "repo",
    alias: ["sc", "script", "repository"],
    desc: "Fetch information about a GitHub repository.",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/novaxmd/NOVA-XMD';

    try {
        // Extract username and repo name from the URL
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);

        // Fetch repository details using GitHub API with axios
        const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}`);
        
        const repoData = response.data;

        // Format the repository information in new stylish format
        const formattedInfo = `
╭─〔 *IMMU MD REPOSITORY* 〕
│
├─ *📌 Repository Name:* ${repoData.name}
├─ *👑 Owner:* 𝙽𝙾𝚅𝙰-𝚇𝙼𝙳
├─ *⭐ Stars:* ${repoData.stargazers_count}
├─ *⑂ Forks:* ${repoData.forks_count}
├─ *🔗 GitHub Link:*
│   ${repoData.html_url}
│
├─ *🌐 Join Channel:*
│   https://whatsapp.com/channel/0029VawO6hgF6sn7k3SuVU3z
│
╰─ *⚡ Powered by 𝘕𝘖𝘝𝘈 𝘟𝘔𝘋*
`.trim();

        // Send an image with the formatted info as a caption
        await conn.sendMessage(from, {
            image: { url: `https://i.postimg.cc/XYxDJF5j/f4110517a32c7a53aba605b9b3808106.jpg` }, // Replace with your image URL
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: '𝗡𝗢𝗩𝗔-𝗫𝗠𝗗',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Error in repo command:", error);
        reply("❌ Sorry, something went wrong while fetching the repository information. Please try again later.");
    }
});
              
