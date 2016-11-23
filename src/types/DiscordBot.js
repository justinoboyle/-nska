export default mongoose.model('DiscordBot', {
    inviter: String,
    botid: String,
    hasPermissions: Boolean
});