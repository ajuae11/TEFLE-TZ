const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

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

// Watermark text only
const NEWSLETTER_CONFIG = {
    watermark: '> POWERED BY NOVW TECH'
};

function getMessageType(message) {
    if (!message) return 'Unknown';
    
    const type = Object.keys(message)[0];
    const typeMap = {
        conversation: 'Text',
        imageMessage: 'Image',
        videoMessage: 'Video',
        audioMessage: 'Audio',
        documentMessage: 'Document',
        stickerMessage: 'Sticker',
        extendedTextMessage: 'Text with Link',
        contactMessage: 'Contact',
        locationMessage: 'Location'
    };
    
    return typeMap[type] || type.replace('Message', '') || 'Unknown';
}

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    try {
        const messageContent = mek.message?.conversation 
            || mek.message?.extendedTextMessage?.text
            || mek.message?.imageMessage?.caption
            || mek.message?.videoMessage?.caption
            || mek.message?.documentMessage?.caption
            || '🚫 Content unavailable (may be media without caption)';
        
        const fullMessage = `
${deleteInfo}

📝 *Message Content:*
${messageContent}

${NEWSLETTER_CONFIG.watermark}`;

        const mentionedJids = isGroup 
            ? [update.key.participant, mek.key.participant].filter(Boolean) 
            : [update.key.remoteJid].filter(Boolean);

        // Send text only with quoted contact
        await conn.sendMessage(
            jid,
            { text: fullMessage },
            { quoted: quotedContact }
        );
    } catch (error) {
        console.error('Error in DeletedText:', error);
    }
};

const DeletedMedia = async (conn, mek, jid, deleteInfo) => {
    try {
        const antideletedmek = structuredClone(mek.message);
        const messageType = Object.keys(antideletedmek)[0];
        
        const mediaTypes = {
            imageMessage: { type: 'image', key: 'imageMessage' },
            videoMessage: { type: 'video', key: 'videoMessage' },
            audioMessage: { type: 'audio', key: 'audioMessage' },
            documentMessage: { type: 'document', key: 'documentMessage' },
            stickerMessage: { type: 'sticker', key: 'stickerMessage' }
        };

        const currentType = mediaTypes[messageType];
        
        if (currentType) {
            const caption = `
${deleteInfo}

${NEWSLETTER_CONFIG.watermark}`;

            if (antideletedmek[currentType.key]?.url) {
                await conn.sendMessage(
                    jid, 
                    { [currentType.type]: { url: antideletedmek[currentType.key].url }, caption: caption },
                    { quoted: quotedContact }
                );
            } else {
                await conn.sendMessage(
                    jid,
                    { text: caption },
                    { quoted: quotedContact }
                );
            }
        } else {
            antideletedmek[messageType].contextInfo = {
                stanzaId: mek.key.id,
                participant: mek.sender,
                quotedMessage: mek.message
            };
            await conn.relayMessage(jid, antideletedmek, {});
        }
    } catch (error) {
        console.error('Error in DeletedMedia:', error);
    }
};

const AntiDelete = async (conn, updates) => {
    try {
        for (const update of updates) {
            if (update.update.message === null) {
                const store = await loadMessage(update.key.id);

                if (store && store.message) {
                    const mek = store.message;
                    const isGroup = isJidGroup(store.jid);
                    const antiDeleteStatus = await getAnti();
                    if (!antiDeleteStatus) continue;

                    const deleteTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                    const deleteDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

                    let deleteInfo, jid;
                    if (isGroup) {
                        const groupMetadata = await conn.groupMetadata(store.jid);
                        const groupName = groupMetadata.subject;
                        const sender = mek.key.participant?.split('@')[0] || 'Unknown';
                        const deleter = update.key.participant?.split('@')[0] || 'Unknown';

                        deleteInfo = `*🗑️ NOVA TECH ANTIDELETE 🗑️*
📅 DATE: ${deleteDate}
⏰ TIME: ${deleteTime}
👤 SENDER: @${sender}
👥 GROUP: ${groupName}
🗑️ DELETED BY: @${deleter}
📌 MESSAGE TYPE: ${getMessageType(mek.message)}`;
                        
                        jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : store.jid;
                    } else {
                        const senderNumber = mek.key.remoteJid?.split('@')[0] || 'Unknown';
                        
                        deleteInfo = `*🗑️ NOVA TECH ANTIDELETE 🗑️*
📅 DATE: ${deleteDate}
⏰ TIME: ${deleteTime}
📱 SENDER: @${senderNumber}
📌 MESSAGE TYPE: ${getMessageType(mek.message)}`;
                        
                        jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : update.key.remoteJid;
                    }

                    deleteInfo += `\n\n${NEWSLETTER_CONFIG.watermark}`;

                    if (mek.message?.conversation || mek.message?.extendedTextMessage || 
                        mek.message?.imageMessage?.caption || mek.message?.videoMessage?.caption) {
                        await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
                    } else {
                        await DeletedMedia(conn, mek, jid, deleteInfo);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in AntiDelete:', error);
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
    quotedContact
};
