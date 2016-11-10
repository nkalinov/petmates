const Conversation = require('../../models/conversation');

module.exports = () => {

    cleanOldMessages();
    setInterval(cleanOldMessages, 86400 * 1000); // check every 24h
    cleanEmptyConversations();
    setInterval(cleanEmptyConversations, 4.32e+8); // check every 5d

    // remove old messages
    function cleanOldMessages() {
        const lastTwoDays = new Date();
        lastTwoDays.setDate(lastTwoDays.getDate() - 2);

        Conversation.update({}, {
            $pull: {
                messages: {
                    added: { $lt: lastTwoDays }
                }
            }
        }, { multi: true }, (err, res) => {
            if (err)
                return console.error('[cron] Clean old messages ERROR:', err);

            console.log('[cron] Clean old messages:', res);
        });
    }

    // remove conversations with 1 or 0 members
    function cleanEmptyConversations() {
        const lastTwoDays = new Date();
        lastTwoDays.setDate(lastTwoDays.getDate() - 2);

        Conversation.remove({
            $or: [
                { members: { $size: 1 } },
                { members: { $size: 0 } }
            ]
        }, (err, res) => {
            if (err)
                return console.error('[cron] Clean empty conversations ERROR:', err);

            console.log('[cron] Clean empty conversations:', res.result);
        });
    }
};
