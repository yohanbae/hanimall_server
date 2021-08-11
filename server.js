const express = require("express")
const app = express()
require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPEAPI)

const cors = require("cors")

app.use(cors())
app.use(express.json());

app.post("/payment", cors(), async (req, res) => {
	let { amount, id, customerId, description } = req.body
	try {
		const payment = await stripe.paymentIntents.create({
			amount,
			currency: "USD",
			description: description,
			payment_method: id,
			confirm: true,
            customer: customerId
		})
		console.log("Payment", payment)
		res.json({
			message: "Payment successful",
			success: true
		})
	} catch (error) {
		console.log("Error", error)
		res.json({
			message: "Payment failed",
			success: false
		})
	}
})

app.post("/create", cors(), async(req, res) => {
    let {email, name, description} = req.body

    const data = { email, name, description }
    console.log(data)
    await stripe.customers.create(data, function (err,customer) {
        if(err){
            console.log("err: "+err);
        }
        if(customer){
            console.log("success: "+customer)
            res.send({success: true, id: customer.id})
        }else{
            console.log("Something wrong")
            res.send({success: false})
        }
    })    
})

app.post("/check", cors(), async(req, res) => {
    let {email} = req.body
    const customers = await stripe.customers.list();

    if(customers.data.find(v => v.email === email)) {
        res.send({exist: true, id: customers.data.find(v => v.email === email).id})
    }else{
        res.send({exist: false})
    }
})


app.post("/createtoken", cors(), async(req, res) => {
    var param = {};
    param.card ={
        number: '4242424242424242',
        exp_month: 2,
        exp_year:2024,
        cvc:'212'
    }

    stripe.tokens.create(param, function (err,token) {
        if(err)
        {
            console.log("err: "+err);
        }if(token)
        {
            console.log("success: "+JSON.stringify(token, null, 2));
        }else{
            console.log("Something wrong")
        }
    })
})



app.post("/read", cors(), async(req,res) => {
    let {id} = req.body
    console.log(id)

    stripe.customers.retrieve(id, function (err,customer) {
        if(err){
            console.log("err: "+err);
        }if(customer) {
            console.log("success", customer)
        }else{
            console.log("Something wrong")
        }
    })
})

app.get('/readall', cors(), async(req, res) => {
    stripe.customers.list({limit: 4},function (err,customers) {
        if(err){
            console.log("err: "+err);
        }if(customers){
            console.log("success: "+JSON.stringify(customers.data, null, 2));
        }else{
            console.log("Something wrong")
        }
    })
})

app.post("/get_payments", cors(), async(req, res) => {
    let {email} = req.body

    stripe.paymentIntents.list({}, function(err, payments) {
        if(err) {
            console.log("ERRO", err)
        }
        if(payments){
            let meme = []
            payments.data.filter(v => v.charges.data[0].receipt_email === email)
            .forEach(v => {
                let newRow = {
                    email: v.charges.data[0].receipt_email,
                    description: v.charges.data[0].description,
                    created: v.charges.data[0].created,
                }
                meme.push(newRow)
            })
            console.log(meme)
            res.send(meme)
        } else {
            console.log('something wrong')
        }
    })
})



app.listen(process.env.PORT || 4000, () => {
	console.log("Sever is listening on port 4000")
})



// var createCustomer = function () {
//     var param ={};
//     param.email ="mike@gmail.com";
//     param.name="Mike";
//     param.description ="from node";

//     stripe.customers.create(param, function (err,customer) {
//         if(err)
//         {
//             console.log("err: "+err);
//         }if(customer)
//         {
//             console.log("success: "+customer)
//         }else{
//             console.log("Something wrong")
//         }
//     })
// }

// createCustomer()
