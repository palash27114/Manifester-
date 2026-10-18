import {pool} from "../src/config/db.js"

try{
    const result=await pool.query("Select NOW() AS current_time");

console.log("Supa connected");
console.log("DB time",result.rows[0].current_time);
}
catch(error){
    console.error("DB connection failed",error.message);
    process.exitCode=1;

}
finally{
    await pool.end();
}