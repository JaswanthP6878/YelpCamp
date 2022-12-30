const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors} = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "conenction error"));
db.once("open", () => {
    console.log("Database Connected!");
})

const Campground = require('../models/campground');
const sample = array => array[Math.floor(Math.random() * array.length)];
const seeddb = async () =>{
    await Campground.deleteMany({});
    for(let i = 0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*30) + 10;
        const camp = new Campground({
            author: '63adb4a016abbdcb07c87f15',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/y8Ngwq34_Ak',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos perspiciatis consectetur nesciunt similique veniam! Minima quaerat, nesciunt ratione perspiciatis, similique inventore vitae, ducimus cum et necessitatibus rem accusamus soluta quas.',
            price
        })
        await camp.save();
    }
}
seeddb().then(() => {
    mongoose.connection.close();
})