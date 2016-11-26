export default mongoose.model('UserInfo', {
    id: String,
    username: String,
    discriminator: String,
    avatar: String,
    bot: Boolean,
    lastLookup: Number
});