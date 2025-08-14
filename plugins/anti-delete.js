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

// Box helper
function box(title, content) {
    const contentLines = content.split('\n');
    const maxLength = Math.max(title.length, ...contentLines.map(l => l.length));
    const line = '═'.repeat(maxLength + 4);
    const top = `╔${line}╗`;
    const header = `║  ${title.padEnd(maxLength)}  ║`;
    const sep = `╠${line}╣`;
    const body = contentLines.map(l => `║  ${l.padEnd(maxLength)}  ║`).join('\n');
    const bottom = `╚${line}╝`;
    return [top, header, sep, body, bottom].join('\n');
}

cmd({
    pattern: "antidelete1",
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

        // Function to send boxed message
        const sendBox = async (title, content) => {
            const msg = box(title, content);
            await conn.sendMessage(from, { text: msg, ...newsletterConfig }, { quoted: quotedContact });
        };

        // Status
        if (!action || action === 'status') {
            return sendBox(
                'AntiDelete Status',
                `Current Status: ${currentStatus ? '✅ ON' : '❌ OFF'}
                
Usage:
• .antidelete on  - Enable protection
• .antidelete off - Disable protection
• .antidelete status - Check current status

⚡ Powered by NOVA-TECH`
            );
        }

        // Enable
        if (action === 'on') {
            await setAnti(true);
            return sendBox(
                '✅ Anti-delete Enabled',
                `Message deletion protection is now active!

⚡ Powered by NOVA-TECH`
            );
        } 
        // Disable
        else if (action === 'off') {
            await setAnti(false);
            return sendBox(
                '❌ Anti-delete Disabled',
                `Message deletion protection has been turned off.

⚡ Powered by NOVA-TECH`
            );
        } 
        // Invalid
        else {
            return sendBox(
                '⚠️ Invalid Command',
                `Usage:
• .antidelete on  - Enable protection
• .antidelete off - Disable protection
• .antidelete status - Check current status`
            );
        }

    } catch (e) {
        console.error("Error in antidelete command:", e);
        return await sendBox(
            '❌ Error',
            'Failed to process your request. Please try again later.'
        );
    }
});
