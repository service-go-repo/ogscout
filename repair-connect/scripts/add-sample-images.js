// Script to add sample images to existing quotations for testing
const { MongoClient, ObjectId } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repair-connect'

// Sample car damage images (using placeholder images)
const sampleImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', // Car dent
  'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=300&fit=crop', // Car scratch
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop', // Car bumper damage
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', // Car paint damage
  'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop', // Car interior damage
]

async function addSampleImages() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db()
    const quotationsCollection = db.collection('quotations')
    
    // Find all quotations
    const quotations = await quotationsCollection.find({}).toArray()
    console.log(`Found ${quotations.length} quotations`)
    
    for (const quotation of quotations) {
      // Add sample images to damage descriptions
      const updatedDamageDescription = quotation.damageDescription.map((damage, index) => {
        // Add 1-3 random sample images to each damage description
        const numImages = Math.floor(Math.random() * 3) + 1
        const selectedImages = []
        
        for (let i = 0; i < numImages; i++) {
          const randomIndex = Math.floor(Math.random() * sampleImages.length)
          selectedImages.push(sampleImages[randomIndex])
        }
        
        return {
          ...damage,
          images: selectedImages
        }
      })
      
      // Update the quotation
      await quotationsCollection.updateOne(
        { _id: quotation._id },
        { 
          $set: { 
            damageDescription: updatedDamageDescription,
            updatedAt: new Date()
          } 
        }
      )
      
      console.log(`Updated quotation ${quotation._id} with ${updatedDamageDescription.reduce((total, damage) => total + damage.images.length, 0)} images`)
    }
    
    console.log('Sample images added successfully!')
    
  } catch (error) {
    console.error('Error adding sample images:', error)
  } finally {
    await client.close()
  }
}

// Run the script
if (require.main === module) {
  addSampleImages()
}

module.exports = { addSampleImages }
