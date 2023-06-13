const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const cors = require('cors')
const mysql = require('mysql2')

app.use(cors())
app.use(express.json())

const mapBankCode = {
  '004' : 'kbank',
  '006' : 'ktb',
  '014' : 'scb',
  '025' : 'bay'
}

async function careteDBPool (config,query) {
  const pool = await mysql.createPool(config)
  const promisePool = pool.promise()
  const [ rows , fields ] = await promisePool.query(query)
  pool.end()
  if(!!rows) return rows
}

app.post('/getBindAccount' , async (req,res) => {

  const coopAccountQuery = `SELECT * FROM gcbindaccount WHERE member_no = ${req.body.member_no} AND bank_code = ${req.body.bank_code} ORDER BY id_bindaccount DESC`

  const coopAccount = await careteDBPool({
    host : '43.229.79.117',
    user : 'root',
    password : '@Egat2020',
    port : 3307,
    database : 'mobile_egat'
  },coopAccountQuery)

  const bankAccountQuery = `SELECT * FROM bindaccount${mapBankCode[req.body.bank_code]} WHERE member_no = ${req.body.member_no} AND coop_key = 'egat' ORDER BY ba_date DESC`

  const bankAccount = await careteDBPool({
    host : '43.229.79.117',
    user : 'root',
    password : '@Egat2020',
    port : 3307,
    database : 'api'
  },bankAccountQuery)

  const result = {
    coopAccount : coopAccount,
    bankAccount : bankAccount
  }

  res.json(result)
})

app.post('/updateBindBankAccount' , async (req,res) => {

  const status = '1'

  const coopAccountQuery = `UPDATE gcbindaccount SET bindaccount_status = '${status}', deptaccount_no_bank = '${req.body.bank_account_no}',update_date = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}' WHERE sigma_key = '${req.body.bind_sigma_key}'`

  // COOP DB CONNECTION
  const coopAccount = await careteDBPool({
    host : '43.229.79.117',
    user : 'root',
    password : '@Egat2020',
    port : 3307,
    database : 'mobile_egat'
  },coopAccountQuery)

  const bankAccountQuery = `UPDATE bindaccount${mapBankCode[req.body.bind_bank_code]} SET ba_status = '${status}', account_no = '${req.body.bank_account_no}', update_date = '${new Date().toISOString().slice(0, 19).replace('T', ' ')}' WHERE sigma_key = '${req.body.bind_sigma_key}'`

  //BANK DB CONNECTION 
  const bankAccount = await careteDBPool({
    host : '43.229.79.117',
    user : 'root',
    password : '@Egat2020',
    port : 3307,
    database : 'api'
  },bankAccountQuery)

  res.status(200).json({status : "SUCCESSFULLY!!"})
  
})

app.post('/cancelBindBankAccount' , async (req,res) => {

  const status = '-9'

  const coopAccountQuery = `UPDATE gcbindaccount SET bindaccount_status = '${status}' WHERE member_no = '${req.body.member_no}' AND bank_code = '${req.body.bind_bank_code}'`

  // COOP DB CONNECTION
  const coopAccount = await careteDBPool({
    host : '43.229.79.117',
    user : 'root',
    password : '@Egat2020',
    port : 3307,
    database : 'mobile_egat'
  },coopAccountQuery)

  const bankAccountQuery = `UPDATE bindaccount${mapBankCode[req.body.bind_bank_code]} SET ba_status = '${status}' WHERE member_no = '${req.body.member_no}'`
  
  //BANK DB CONNECTION 
  const bankAccount = await careteDBPool({
    host : '43.229.79.117',
    user : 'root',
    password : '@Egat2020',
    port : 3307,
    database : 'api'
  },bankAccountQuery)

  res.status(200).json({status : "SUCCESSFULLY!!"})
  
})

app.get('/', async (req, res) => {
  res.end()
});


app.listen(port, () => {})