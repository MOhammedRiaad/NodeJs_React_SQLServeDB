
var sql = require("mssql");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const pino = require('express-pino-logger')();
var cors = require('cors')

app.use(cors()) // Use this after the variable declaration

app.use(pino);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const config = {
    server: "localhost",
    user: "sa",
    password: "Pa$$w0rd",
    database: "Family_tree",
    port: 1433
};

/**
 * get data from Server using Node js and SQL Server Database 
 *  while using stored procedure 
 * **/

let conn = new sql.ConnectionPool(config);
let requset = new sql.Request(conn);


/**
 * open the connecttion to the server .
 */
    conn.connect(function (err) {
        if (err) {
            console.log(err);

            return;
        }
       /**
        * execute stored procedure call .
        */
       requset.execute('GetAllParents', (err, result) => {
            // ... error checks
            if(err){
                console.log(err);
                conn.close();
            }else{
            
                /**
                 * send request reult to URL .
                 */
                app.get('/api/', (req, res) => {

                    res.send({express: JSON.stringify(result)})
                });
               
                conn.close();
            }
            
            
            
        })
       
    });

   




    app.get("/api/login/post",(req ,res)=> {
        const {userName, Password} = req.query;
        console.dir(userName+Password);
        /**
         * open the connecttion to the server .
         */
        conn.connect(function (err) {
            if (err) {
                console.dir(err);

                return;
            }
            /**
             * execute stored procedure call .
             */
            requset.input('Username', sql.NVarChar(100),userName);
            requset.input("Password", sql.NVarChar(100), Password);
            requset.execute('LoginAndGetData', (err, result) => {
                console.dir(result)
                // ... error checks
                if (err) {
                    console.dir(err);
                    conn.close();
                } else {


                        res.send({express: JSON.stringify(result)})

                    conn.close();
                }
            })
        });

    });


    app.post("/api/Children/post",(req , result)=>{
        const {ChildID} = req.query;
        /**
         * open the connecttion to the server .
         */
            conn.connect(function (err) {
                if (err) {
                    console.dir(err);
        
                    return;
                }
               /**
                * execute stored procedure call .
                */
              let req = new sql.Request(conn);
                requset.input('ParentSerial', sql.Int, ChildID);
                requset.execute('GetParentChildresnByparentSerial', (err, result) => {
                    // ... error checks
                    if(err){
                        console.log(err);
                        conn.close();
                    }else{
                        app.get('/api/children/get/', (req, res) => {

                            res.send({express: JSON.stringify(result)})
                        });

                        conn.close();
                    }
                })
               
        })

      
        });

        app.get('/api/users',(req,res)=>{

            conn.connect(function (err){
                if (err){
                    console.dir(err)
                    conn.close()
                    return 
                }

                requset.execute('getalluser',(err,result)=>{
                    if(err){
                        console.dir(err)
                        conn.close()
                    }
                    res.send({express:JSON.stringify(result)})

                    conn.close()
                })
            })
        })


app.listen(port, () => console.log(`Listening on port ${port}`));
