const { cmd } = require('../command');
const { getAnti, setAnti } = require('../data/antidel');

// Contact message for verified context
const quotedContact = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "B.M.B VERIFIED ✅",
            vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:B.M.B VERIFIED ✅\nORG:BMB-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=255767862457:+255 767 862457\nEND:VCARD"
        }
    }
};

cmd({
    pattern: "antidelete",
    alias: ['antidel', 'del'],
    desc: "Toggle anti-delete feature",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isCreator, sender }) => {
    if (!isCreator) return reply('❌ This command is only for the bot owner');

    // Newsletter configuration
    const newsletterConfig = {
        contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363382023564830@newsletter',
                newsletterName: 'NOVA-XMD',
                serverMessageId: 143
            }
        }
    };

    try {
        const currentStatus = await getAnti();
        const action = text?.toLowerCase().trim();

        // Status
        if (!action || action === 'status') {
            const msg = `🔒 *AntiDelete Status*\n\nCurrent Status: ${currentStatus ? '✅ ON' : '❌ OFF'}\n\nCommands:\n• .antidelete on\n• .antidelete off\n• .antidelete status\n\n⚡ Powered by NOVA-TECH`;
            return await conn.sendMessage(from, { text: msg, ...newsletterConfig }, { quoted: quotedContact });
        }

        // Enable
        if (action === 'on') {
            await setAnti(true);
            const msg = '✅ *Anti-delete enabled*\n\nMessage deletion protection is now active!\n\n⚡ Powered by NOVA-TECH';
            return await conn.sendMessage(from, { text: msg, ...newsletterConfig }, { quoted: quotedContact });
        } 
        // Disable
        else if (action === 'off') {
            await setAnti(false);
            const msg = '❌ *Anti-delete disabled*\n\nMessage deletion protection has been turned off.\n\n⚡ Powered by NOVA-TECH';
            return await conn.sendMessage(from, { text: msg, ...newsletterConfig }, { quoted: quotedContact });
        } 
        // Invalid
        else {
            const msg = '⚠️ *Invalid Command*\n\nCommands:\n• .antidelete on\n• .antidelete off\n• .antidelete status';
            return await conn.sendMessage(from, { text: msg, ...newsletterConfig }, { quoted: quotedContact });
        }

    } catch (e) {
        console.error("Error in antidelete command:", e);
        const msg = '❌ *Error occurred*\n\nFailed to process your request. Please try again later.';
        return await conn.sendMessage(from, { text: msg, ...newsletterConfig }, { quoted: quotedContact });
    }
});
