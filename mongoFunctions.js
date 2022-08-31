const mongoURI = 'mongodb://localhost:27017';
const {MongoClient} =require('mongodb');
let bookingSummary=[];
module.exports = {
    lctns: async ()=>{
        const client = new MongoClient(mongoURI);
        await client.connect();
        const db = client.db('car_rental');
        const carsColl = db.collection('cars');
        const locations = await carsColl.distinct('location');
        
        client.close();
        return locations;
    },
    avlbl: async function availableCars(location){
    const client = new MongoClient(mongoURI);
    await client.connect();
    filter={'location':location};
    filter.status =1;
    const db = client.db('car_rental');
    const carsColl = db.collection('cars');
    const count = await carsColl.find(filter).toArray();
    //console.table(count);
    const available =[];
    // count.forEach(car=>{
    //     if(car.status===1)
    //         available.push(car);
    // })
    //console.table(available);
    client.close();
    return count;       
},
srchCust: async (phoneNo)=>{
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const custColl = db.collection('customers');
    const cust = await custColl.findOne({phone:phoneNo});
    client.close();
    if(cust == null)
        return 'NEW';
    else
        return cust;
},
newCust: async(userDetails, phoneNo)=>{
    let email='';
    if(userDetails[2]!=null)
        email = userDetails[2];
    const newUser = {first_name:userDetails[0], last_name:userDetails[1], email:email,phone:phoneNo};
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const custColl = db.collection('customers');
    const reply = await custColl.insertOne(newUser);
    client.close();
    return reply;
},

newBooking: async (carId,custPhone, from, to)=>{
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const carsColl = db.collection('cars');
    const car = (await carsColl.findOne({id:carId}))._id;
    const custColl = db.collection('customers');
    const customer = (await custColl.findOne({phone:custPhone}))._id;
    const bookingCollection = db.collection('bookings');
    await bookingCollection.insertOne({cust_id:customer, car_id:car, from:from, to:to});
    await carsColl.updateOne({id:carId},{$set: {status:0}});
    client.close();
    
},

srchBooking: async()=>{
    // let bookigDetails={};
    const projection = {Customer:1, Car:1, from:1, to:1, _id:1};
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const custColl = db.collection('customers');
    const bookingCollection = db.collection('bookings');
    const aggregatedList = await bookingCollection.aggregate([ { $lookup: 
        { from: 'customers', localField: 'cust_id', foreignField: '_id', as: 'Customer' } }, 
    { $lookup: { from: 'cars', localField: 'car_id', foreignField: '_id', as: 'Car' } }]).project(projection).toArray();
    client.close();
    return aggregatedList; 
},

updateCustomer : async(toModify, phoneNo, newData)=>{
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('car_rental');
    const custColl = db.collection('customers');
    let update = {};
    update[toModify]=newData;
    await custColl.updateOne({phone:phoneNo},{$set:update});
    return;
}

};