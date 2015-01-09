require('./tweetdeck-proxy').listen(process.env.PORT, function () {
    console.log('proxy up http://%s:%s', this.address().address, this.address().port);
});
