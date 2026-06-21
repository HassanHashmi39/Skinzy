const fs = require('fs');

async function testUpload() {
    try {
        // Create a dummy image
        const buffer = Buffer.alloc(100 * 1024, 0); // 100kb dummy buffer
        
        // Use standard Node 18+ fetch with FormData
        const formData = new FormData();
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('image', blob, 'test.jpg');

        console.log("Sending POST to HF...");
        const response = await fetch('https://hassanhashmi39-skinzy.hf.space/api/diagnose', {
            method: 'POST',
            body: formData,
        });

        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response:", text);
    } catch (err) {
        console.error("Error:", err);
    }
}

testUpload();
