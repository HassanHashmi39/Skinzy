const fs = require('fs');
const path = require('path');

// Helper to parse simple CSV
const parseCSV = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length <= 1) return [];
    
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const cols = line.split(',');
        let obj = {};
        headers.forEach((h, i) => {
            obj[h.trim()] = cols[i] ? cols[i].trim() : '';
        });
        return obj;
    });
};

const getProducts = async (req, res) => {
    try {
        const csvPath = path.join(__dirname, '..', '..', 'ml', 'model', 'metadata', 'products.csv');
        const rows = parseCSV(csvPath);
        
        const products = rows.map((row, index) => ({
            _id: `prod_${index}`,
            name: row.Name,
            category: row.Category,
            brand: row.Brand,
            price: row.Price,
            condition: row.Condition,
            tier: row.Tier,
            type: 'product',
            isActive: true,
            createdAt: new Date().toISOString()
        }));

        res.json({ products });
    } catch (error) {
        console.error("Products API Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const getRemedies = async (req, res) => {
    try {
        const csvPath = path.join(__dirname, '..', '..', 'ml', 'model', 'metadata', 'remedies.csv');
        const rows = parseCSV(csvPath);
        
        let remedies = [];
        let idCounter = 0;
        rows.forEach(row => {
            const condition = row.Condition;
            for (let i = 1; i <= 3; i++) {
                const remedyName = row[`Remedy_${i}`];
                if (remedyName) {
                    remedies.push({
                        _id: `rem_${idCounter++}`,
                        name: remedyName,
                        condition: condition,
                        type: 'remedy',
                        isActive: true,
                        createdAt: new Date().toISOString()
                    });
                }
            }
        });

        res.json({ remedies });
    } catch (error) {
        console.error("Remedies API Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, getRemedies };
