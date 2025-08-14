const { cmd } = require('../command');
const config = require("../config");

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
  'on': "text"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;

    // List of link patterns
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
      /https?:\/\/(?:api\.whatsapp\.com|wa\.me)\/\S+/gi,
      /wa\.me\/\S+/gi,
      /https?:\/\/(?:t\.me|telegram\.me|telegram\.dog)\/\S+/gi,
      /https?:\/\/(?:www\.)?[\w-]+\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?x\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
      /https?:\/\/(?:whatsapp\.com|channel\.me)\/\S+/gi,
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?discord\.(?:com|gg)\/\S+/gi,
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
      /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?medium\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi
    ];

    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink && config.ANTI_LINK === 'true') {

      // Delete message
      try {
        await conn.sendMessage(from, { delete: m.key });
      } catch (error) {
        console.error("Failed to delete message:", error);
      }

      // Prepare line-by-line message
      const now = new Date();
      const deleteTime = now.toLocaleTimeString('en-GB', { hour12: true });
      const deleteDate = now.toLocaleDateString('en-GB');

      const msg = 
`🚨 *LINK DETECTED* 🚨
📌 User: @${sender.split('@')[0]}
📅 Date: ${deleteDate}
⏰ Time: ${deleteTime}

❌ REMOVED
💡 BY NOVA XMD`;

      // Send message with tag
      await conn.sendMessage(from, {
        text: msg,
        mentions: [sender],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363382023564830@newsletter',
            newsletterName: 'NOVA XMD ANTILINK',
            serverMessageId: 143
          }
        }
      }, { quoted: quotedContact });

      // Remove user immediately
      await conn.groupParticipantsUpdate(from, [sender], "remove");
    }

  } catch (error) {
    console.error("Anti-link error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});
