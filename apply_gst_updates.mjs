import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: "syoc9xav",
  dataset: "production",
  apiVersion: "2024-05-01",
  token: "skYYwNWZT28VCS39OqeDUNa5EFsIpUPHAuiZcTMda24icX2nSVaFeWtDSW0VVTgNNTYvq670nHXXfeIR7fkzDRcL5qfH9gxC0xSTqVbFC1Udk2vcrzNfypkzJt1ZDgDFYzWN9Fb0fUCwrOFIPV5vp7uOq9hrHwH7vaNbN3QBG8L1Iu2OiWyr",
  useCdn: false
});

async function run() {
  try {
    console.log("Starting GST update script...");

    // 1. Fetch Spices and Essential Oils
    const spices = await sanityClient.fetch(`*[_type == "product" && subcategory == "SPICES"] { _id, name, sub_total, price, gst, mrp }`);
    const oils = await sanityClient.fetch(`*[_type == "product" && subcategory == "ESSENTIAL OILS"] { _id, name, sub_total, price, gst, mrp }`);

    console.log(`Found ${spices.length} spices and ${oils.length} essential oils to update.`);

    // 2. Prepare mutations
    const mutations = [];

    for (const spice of spices) {
      if (typeof spice.sub_total === 'number') {
        const newGst = spice.sub_total * 0.05;
        const newPrice = spice.sub_total + newGst;
        
        mutations.push({
          patch: {
            id: spice._id,
            set: {
              gst: newGst,
              price: newPrice,
              mrp: newPrice
            }
          }
        });
      }
    }

    for (const oil of oils) {
      if (typeof oil.sub_total === 'number') {
        const newGst = oil.sub_total * 0.09;
        const newPrice = oil.sub_total + newGst;
        
        mutations.push({
          patch: {
            id: oil._id,
            set: {
              gst: newGst,
              price: newPrice,
              mrp: newPrice
            }
          }
        });
      }
    }

    if (mutations.length === 0) {
      console.log("No valid products found with a sub_total to update.");
      return;
    }

    // 3. Log a sample before & after for verification
    if (spices.length > 0) {
      console.log("\n--- Sample Spice Update ---");
      console.log("Before:", spices[0]);
      console.log("After:", mutations.find(m => m.patch.id === spices[0]._id).patch.set);
    }
    
    if (oils.length > 0) {
      console.log("\n--- Sample Essential Oil Update ---");
      console.log("Before:", oils[0]);
      console.log("After:", mutations.find(m => m.patch.id === oils[0]._id).patch.set);
    }

    console.log(`\nExecuting ${mutations.length} mutations...`);

    // 4. Run the transaction
    const transaction = sanityClient.transaction();
    for (const mut of mutations) {
      transaction.patch(mut.patch.id, { set: mut.patch.set });
    }
    
    await transaction.commit();
    console.log("SUCCESS! All prices updated successfully.");

  } catch (err) {
    console.error("Error running updates:", err);
  }
}

run();
