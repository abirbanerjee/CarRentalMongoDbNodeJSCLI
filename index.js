
const functs = require('./mongoFunctions')
const readline = require('readline');
const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
});
let selectedCarID, custPhone, fromDate, toDate;

async function menu(){
    console.log('Welcome to fleet car rental');
    console.log('Choose what you want to do from the menu:');
    console.log(`
    1. Book a car.
    2. Find your existing bookings.
    3. Modify your data.
    4. Admin module.
    5. Exit.`);
    rl.question('>',async (ans)=>{
        switch(ans){
            case '1':
                const lctns = await functs.lctns();
                console.table(lctns);
                rl.question('Enter your location to start:',async (ans)=>{
                    console.log('Your location is:', lctns[parseInt(ans)]);
                    avlaibleCars = await functs.avlbl(lctns[parseInt(ans)]);
                    console.log(`Available cars in ${lctns[parseInt(ans)]}:`);
                    console.table(avlaibleCars);
                    rl.question('Select the car you want to book:',(ans)=>{
                        console.log(`You selected the ${avlaibleCars[ans].year} ${avlaibleCars[ans].color} ${avlaibleCars[ans].car_make} ${avlaibleCars[ans].car_model}.
                        `);
                        selectedCarID = avlaibleCars[ans].id;
                        rl.question('Enter your phone number:',async (ans)=>
                        {
                            console.log('Mobile number:',ans);
                            custPhone = ans;
                            const cust = await functs.srchCust(ans);
                            if(cust=='NEW')
                                {
                                    console.log('You are a new cutomer. Enter your details.');
                                    custPhone = ans;
                                    rl.question('Enter your first name, last name and email(optional) seperated by space: ',async (ans)=>
                                    {
                                        userDetails = ans.split(' ');
                                        const created = await functs.newCust(userDetails, custPhone);
                                        rl.question("Enter booking start date(dd-mm-yyyy):",(ans)=>{
                                            fromDate=ans;
                                            rl.question("Enter booking end date(dd-mm-yyyy):",async (ans)=>{
                                                toDate=ans;
                                                await functs.newBooking(selectedCarID, custPhone, fromDate,toDate);
                                                console.log('Booking received');
                                                menu();
                                            });
                                        });
                                    })
                                }
                            else
                                {
                                    console.log('Welcome ',cust.first_name, cust.last_name);
                                    rl.question("Enter booking start date(dd-mm-yyyy):",(ans)=>{
                                        fromDate=ans;
                                        rl.question("Enter booking end date(dd-mm-yyyy):",async (ans)=>{
                                            toDate=ans;
                                            await functs.newBooking(selectedCarID, custPhone, fromDate,toDate);
                                            console.log('Booking received.');
                                            menu();
                                        });
                                    });
                                }
                            
                        });
                    });
                });
                break;
            case '2':
                rl.question('Enter your phone number:',async(ans)=>{
                    const aggregatedList = await functs.srchBooking();
                    let bookingSummary=[];
                    aggregatedList.forEach(item=>{
                        let bookingDetails={};
                        if(item.Customer[0].phone === ans){     
                        bookingDetails.Name = item.Customer[0].first_name + ' '+ item.Customer[0].last_name;
                        bookingDetails.Car = item.Car[0].car_make + ' '+ item.Car[0].car_model;
                        bookingDetails.from = item.from;
                        bookingDetails.to = item.to;
                        bookingDetails.booked_on = item._id.getTimestamp();
                        bookingSummary.push(bookingDetails);
                    };
                    })
                    console.table(bookingSummary);
                    rl.question("Enter booking number to modify, or 'x' to go back to previous screen: ",(ans)=>{
                        if(ans==='x')
                        menu();
                        else{
                            console.log(`Your about to modify boking no ${aggregatedList[ans]._id}`)
                        }
                    })
                });
                
                break;
            case '3':
                rl.question('Enter your phone number:',async (ans)=>
                {
                    custPhone = ans;
                    const customer = await functs.srchCust(ans);
                    console.table(customer);
                    rl.question('Change (f)irst name, (l)ast name, (e)mail id or (p)hone number:',async (ans)=>
                    {
                        switch(ans){
                            case 'f':
                                rl.question("Enter new fisrst name:",async (fname)=>{
                                   await functs.updateCustomer('first_name',custPhone,fname);
                                   console.log('updated');
                                   menu();
                                });
                               
                            case 'l':
                                rl.question("Enter new last name:",async (lname)=>{
                                    await functs.updateCustomer('last_name',custPhone,lname);
                                    console.log('updated');
                                    menu();
                                 }); 
                                 
                                 case 'e':
                                    rl.question("Enter new email id:",async (email)=>{
                                        await functs.updateCustomer('email',custPhone,email);
                                        console.log('updated');
                                        menu();
                                     }); 
                                
                                case 'p':
                                    rl.question("Enter new email id:",async (phone)=>{
                                        await functs.updateCustomer('email',custPhone,phone);
                                        console.log('updated');
                                        menu();
                                     }); 
                                
                            }

                    });
                });
                break;
            case '4':
                
                rl.stdoutMuted = true;

                rl.question('Password: ', async function(password) {
                    rl.stdoutMuted = false;
                  if(password === 'admin')
                  {
                   console.log('\nWelcome admin.');
                   console.log('All bookings:');
                   const aggregatedList = await functs.srchBooking();
                   let bookingSummary=[];
                   aggregatedList.forEach(item=>{
                       let bookingDetails={};   
                       bookingDetails.Name = item.Customer[0].first_name + ' '+ item.Customer[0].last_name;
                       bookingDetails.Car = item.Car[0].car_make + ' '+ item.Car[0].car_model;
                       bookingDetails.from = item.from;
                       bookingDetails.to = item.to;
                       bookingDetails.booked_on = item._id.getTimestamp();
                       bookingSummary.push(bookingDetails);
                   })
                   console.table(bookingSummary);
                  }
                else
                    {
                        console.log('Wrong password');
                        menu();
                    }
                });
                
                rl._writeToOutput = function _writeToOutput(stringToWrite) {
                  if (rl.stdoutMuted)
                    rl.output.write("*");
                  else
                    rl.output.write(stringToWrite);
                };
                
                break;
            case '5':
                console.log('Goodbye');
                rl.close();
                break;
            default:
                menu();
        }
    })
   // rl.close();
}

menu();

