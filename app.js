const express = require('express')
const {MongoClient,ObjectID} =  require('mongodb')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const app = express()

app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({extended: true}))

const url =  "mongodb://localhost:27017"
const database = "collect_test"

const client = new MongoClient (url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
client.connect((error,client)=>{
    if(error){
        console.log("gagal")
    }
    console.log("berhasil")
})
const db = client.db(database)



const PORT = 8000
const sekarang = () => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0");
    let yyyy = today.getFullYear();
    today = `${yyyy}-${mm}-${dd}`;
    return today;
  };

//mengambil data berdasarkan id 
app.post('/getUser',(req,res) => {
    id = req.body.id
    console.log(id)
    db.collection('user') 
    .find({_id: ObjectID(id)})
    .toArray((error,result)=>{
        console.log(result)
        if(result.length > 0){
            res.send({
                data:result,
                status:200,
            })
        }else{
            res.send({
                msg:"not found",
                status:500,
            })
        }
        
    })
})

//menambahkan data kedalam db

app.post('/register',(req,res) => {
    nama = req.body.nama;
    username = req.body.username;
    email = req.body.email;
    noHp = req.body.noHp;
    profile = "",
    tglRegis = sekarang()
    db.collection('user') 
    .find({username: username})
    .toArray((error,result)=>{
        console.log(result)
        if(result.length > 0){
            res.send({
                msg:"username sudah tersedia",
                status:500,
            })
        }else{
            db.collection('user').insertOne({
                nama:nama,
                username:username,
                email:email,
                noHP:noHp,
                profile:"",
                tglRegis:tglRegis
                },
                (error,result) => {
                    if(error){
                        res.send({
                            msg:"Gagal menambahkan data",
                            status:500,
                        })
                    }
                    token = jwt.sign({_username : username},process.env.TOKEN_RAHASIA)
                    
                    res.send({
                        token: token,
                        msg:"Berhasil menambahkan data",
                        status:200,
                    })
                }
                
            )
        }
        
    })

    
})

//edit data by id
app.post('/updateUser',(req,res) => {
    id = req.body.id
    nama = req.body.nama
    username = req.body.username
    email = req.body.email
    noHp = req.body.noHP
    token = req.body.token
    const verifikasi = jwt.verify(token,process.env.TOKEN_RAHASIA)
    const updatePromise = db.collection('user').updateOne(
        {
            username:verifikasi._username
        },
        {
            $set:{
                nama:nama,
                username:username,
                email:email,
                noHp:noHp
            },
        }
    );
    updatePromise.then((result) => {
        res.send({
            msg:"Berhasil merubah data",
            status:200,
        })
    }).catch((e) => {
        res.send({
            msg:"Gagal merubah data",
            status:500,
        })
        console.log(e)
    })
    
    
})


app.listen(PORT, () => {
     console.log("Server running")
})