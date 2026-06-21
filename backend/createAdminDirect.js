const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "REDACTED";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Hashmi2463", salt);

        const adminUser = {
            name: "Hassan Hashmi",
            email: "hassanhashmi928@gmail.com",
            password: hashedPassword,
            role: "admin",
            userType: "admin",
            joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const databases = ["Skinzy", "skinzy", "test"];
        for (const dbName of databases) {
            try {
                const db = client.db(dbName);
                const users = db.collection("users");
                
                // Remove the old test admin if exists
                await users.deleteOne({ email: "admin@skinzy.com" });
                
                const existing = await users.findOne({ email: "hassanhashmi928@gmail.com" });
                if (existing) {
                    await users.updateOne({ email: "hassanhashmi928@gmail.com" }, { $set: { password: hashedPassword, role: "admin", userType: "admin" } });
                    console.log(`Updated admin in ${dbName}`);
                } else {
                    await users.insertOne(adminUser);
                    console.log(`Inserted admin into ${dbName}`);
                }
            } catch (e) {
                console.log(`Could not insert into ${dbName}:`, e.message);
            }
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

run();
