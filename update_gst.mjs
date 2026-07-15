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
    const raw = await sanityClient.fetch(`*[_type == "product"][0]`);
    console.log(`Sample product keys:`, Object.keys(raw));
    console.log(`Sample product:`, JSON.stringify(raw, null, 2));
    
    // Also let's check unique subcategory strings if they exist
    const subcats = await sanityClient.fetch(`array::unique(*[_type == "product"].subcategory)`);
    console.log("Subcategories:", subcats);

  } catch (err) {
    console.error(err);
  }
}

run();
