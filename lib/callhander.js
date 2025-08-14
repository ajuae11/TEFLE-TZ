const settingsManager = require('./settingsmanager'); // Essential to get live settings

/**
 * Handles incoming WhatsApp calls, rejects them, and sends a warning message.
 * @param {import('@whiskeysockets/baileys').WASocket} conn Baileys WhatsApp connection object.
 */
module.exports = (conn) => {
    conn.ev.on('call', async (callData) => {
        if (!settingsManager.getSetting('ANTICALL')) {
            console.log("[ANTICALL] Call received but feature is OFF. Ignoring.");
            return;
        }

        for (const call of callData) {
            if (call.status === 'offer') {
                const callerId = call.from;

                // Reject the call
                await conn.rejectCall(call.id, callerId);

                // Send forwarded-style warning message
                await conn.sendMessage(callerId, {
                    text: `🚫 *Auto Call Blocker Engaged!*\n\n📵 Calling this bot is not allowed.\n\n⚠️ Further attempts may result in an *automatic block*. Kindly use normal commands instead.`,
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 999,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363382023564830@newsletter',
                            newsletterName: 'nova-xmd'
                        }
                    }
                });

                console.log(`[ANTICALL] Rejected call from: ${callerId}`);
            }
        }
    });

    console.log("[ANTICALL] Call handler loaded.");
};
    
