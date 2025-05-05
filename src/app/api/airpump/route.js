import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/_lib/mongodb';

// GET handler to retrieve air pump activations for a specific hive
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const hiveId = searchParams.get('hiveId');
  const email = searchParams.get('email');
  
  console.log(`GET request for hiveId: ${hiveId}, email: ${email}`);
  
  if (!hiveId || !email) {
    console.error("Missing required parameters:", { hiveId, email });
    return NextResponse.json({ error: 'Missing hiveId or email parameter' }, { status: 400 });
  }
  
  try {
    console.log("Connecting to database");
    const db = await connectToDatabase();
    console.log("Connected to database successfully");
    
    let activations = [];
    
    // APPROACH 1: Try to get activations from dedicated collection first
    console.log("Checking air_pump_activations collection");
    const airPumpCollection = db.collection('air_pump_activations');
    
    try {
      const dedicatedActivations = await airPumpCollection
        .find({ hiveId, email })
        .sort({ timestamp: -1 })
        .toArray();
      
      console.log(`Found ${dedicatedActivations.length} activations in dedicated collection`);
      
      if (dedicatedActivations.length > 0) {
        activations = dedicatedActivations;
      }
    } catch (dedicatedError) {
      console.error("Error fetching from dedicated collection:", dedicatedError);
    }
    
    // APPROACH 2: Try to get activations from user document as fallback
    if (activations.length === 0) {
      console.log("Checking user document for activations");
      const usersCollection = db.collection('users');
      
      try {
        // Find the user first - full document to inspect structure
        console.log(`Looking for user with email: ${email}`);
        const user = await usersCollection.findOne({ email });
        
        if (user) {
          console.log("User found, checking beehives structure");
          
          // Check the beehives structure and find the matching hive
          if (user.beehives && Array.isArray(user.beehives)) {
            // Find the matching beehive
            const matchingBeehive = user.beehives.find(beehive => beehive.id === hiveId);
            
            if (matchingBeehive) {
              console.log("Matching beehive found");
              
              // Check for activations at the beehive level
              if (matchingBeehive.airPumpActivations && Array.isArray(matchingBeehive.airPumpActivations)) {
                console.log("Found activations at beehive level");
                activations = matchingBeehive.airPumpActivations;
              } 
              // Check for nested hives structure
              else if (matchingBeehive.hives && Array.isArray(matchingBeehive.hives) && matchingBeehive.hives.length > 0) {
                console.log("Checking nested hives structure");
                
                // Find the first nested hive (or the one with matching id if available)
                const nestedHive = matchingBeehive.hives.find(h => h.id === hiveId) || matchingBeehive.hives[0];
                
                if (nestedHive && nestedHive.airPumpActivations && Array.isArray(nestedHive.airPumpActivations)) {
                  console.log("Found activations in nested hive");
                  activations = nestedHive.airPumpActivations;
                }
              }
            } else {
              console.log("No matching beehive found with id:", hiveId);
            }
          } else {
            console.log("User has no beehives or invalid structure");
          }
        } else {
          console.log("User not found:", email);
        }
      } catch (userError) {
        console.error("Error fetching from user document:", userError);
      }
    }
    
    console.log(`Found ${activations.length} total activations`);
    
    // Sort activations by most recent first
    if (activations.length > 0) {
      try {
        activations.sort((a, b) => {
          // First try to sort by timestamp if available
          if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp) - new Date(a.timestamp);
          }
          
          try {
            // Handle dates in format "DD/MM/YYYY HH:MM" or just "DD/MM/YYYY"
            const aDateParts = a.date.split(' ');
            const bDateParts = b.date.split(' ');
            
            // Parse the date portion
            const [aDay, aMonth, aYear] = aDateParts[0].split('/').map(Number);
            const [bDay, bMonth, bYear] = bDateParts[0].split('/').map(Number);
            
            // Create Date objects with the date portion
            const dateA = new Date(aYear, aMonth - 1, aDay);
            const dateB = new Date(bYear, bMonth - 1, bDay);
            
            // Add time if available
            if (aDateParts.length > 1) {
              const [aHours, aMinutes] = aDateParts[1].split(':').map(Number);
              dateA.setHours(aHours, aMinutes);
            }
            
            if (bDateParts.length > 1) {
              const [bHours, bMinutes] = bDateParts[1].split(':').map(Number);
              dateB.setHours(bHours, bMinutes);
            }
            
            // Compare the full dates including time
            if (dateB - dateA !== 0) return dateB - dateA;
            
            // If dates are identical (rare), compare by duration
            const [aHours, aMinutes, aSeconds] = a.duration.split(':').map(Number);
            const [bHours, bMinutes, bSeconds] = b.duration.split(':').map(Number);
            
            // Compare hours, then minutes, then seconds
            if (aHours !== bHours) return bHours - aHours;
            if (aMinutes !== bMinutes) return bMinutes - aMinutes;
            return bSeconds - aSeconds;
          } catch (error) {
            console.error('Error sorting activations:', error);
            // If there's an error in sorting, maintain the original order
            return 0;
          }
        });
        
        // Limit to last 10 activations
        activations = activations.slice(0, 10);
        console.log(`Limited to last 10 activations: ${activations.length}`);
      } catch (sortError) {
        console.error("Error sorting activations:", sortError);
      }
    }
    
    return NextResponse.json({ activations });
  } catch (error) {
    console.error('Error retrieving air pump activations:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve activations',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST handler to save a new air pump activation
export async function POST(request) {
  try {
    console.log("Received air pump activation request");
    
    // Parse request data
    const data = await request.json();
    console.log("Request data:", data);
    
    const { hiveId, email, username, date, duration } = data;
    
    // Validate required fields
    if (!hiveId || !email || !date || !duration) {
      console.error("Missing required fields:", { hiveId, email, date, duration });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: { hiveId: !!hiveId, email: !!email, date: !!date, duration: !!duration }
      }, { status: 400 });
    }
    
    // Connect to database
    console.log("Connecting to database");
    const db = await connectToDatabase();
    console.log("Connected to database successfully");
    
    // Create the new activation record
    const activation = {
      date,
      duration,
      hiveId,
      email,
      username: username || 'User',
      timestamp: new Date().toISOString() // Store actual timestamp for internal sorting
    };
    
    // Try different approaches to save the data
    try {
      // APPROACH 1: Try to update the user document directly
      console.log("Attempting to update user document");
      const usersCollection = db.collection('users');
      
      const userResult = await usersCollection.findOne({ email });
      console.log("User lookup result:", userResult ? "Found" : "Not found");
      
      if (userResult) {
        // User exists, update its beehives array
        console.log("Updating existing user document");
        const updateResult = await usersCollection.updateOne(
          { email, "beehives.id": hiveId },
          { 
            $push: { 
              "beehives.$.airPumpActivations": activation
            } 
          }
        );
        
        console.log("User update result:", updateResult);
        
        if (updateResult.modifiedCount > 0) {
          console.log("Successfully updated user document");
          return NextResponse.json({ 
            success: true, 
            message: 'Air pump activation saved successfully to user document',
            activation
          });
        }
      }
      
      // APPROACH 2: Store in dedicated air_pump_activations collection
      console.log("Storing in air_pump_activations collection");
      const airPumpCollection = db.collection('air_pump_activations');
      
      const insertResult = await airPumpCollection.insertOne(activation);
      console.log("Insert result:", insertResult);
      
      if (insertResult.insertedId) {
        console.log("Successfully inserted into air_pump_activations collection");
        return NextResponse.json({ 
          success: true, 
          message: 'Air pump activation saved successfully to dedicated collection',
          activation
        });
      }
      
      return NextResponse.json({ 
        error: 'Failed to save activation - all approaches failed',
        details: { email, hiveId }
      }, { status: 500 });
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return NextResponse.json({ 
        error: 'Database operation error',
        message: dbError.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving air pump activation:', error);
    return NextResponse.json({ 
      error: 'Failed to save activation',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// DELETE handler to clear air pump activations for a specific hive
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const hiveId = searchParams.get('hiveId');
  const email = searchParams.get('email');
  
  console.log(`DELETE request for hiveId: ${hiveId}, email: ${email}`);
  
  if (!hiveId || !email) {
    console.error("Missing required parameters:", { hiveId, email });
    return NextResponse.json({ error: 'Missing hiveId or email parameter' }, { status: 400 });
  }
  
  try {
    console.log("Connecting to database");
    const db = await connectToDatabase();
    console.log("Connected to database successfully");
    
    let deletionResults = { 
      dedicatedCollection: false,
      userDocument: false
    };
    
    // APPROACH 1: Delete from dedicated collection
    console.log("Deleting from air_pump_activations collection");
    const airPumpCollection = db.collection('air_pump_activations');
    
    try {
      const deletedResult = await airPumpCollection.deleteMany({ hiveId, email });
      console.log(`Deleted ${deletedResult.deletedCount} activations from dedicated collection`);
      deletionResults.dedicatedCollection = deletedResult.deletedCount > 0;
    } catch (dedicatedError) {
      console.error("Error deleting from dedicated collection:", dedicatedError);
    }
    
    // APPROACH 2: Clear activations from user document
    console.log("Clearing activations from user document");
    const usersCollection = db.collection('users');
    
    try {
      // Update the beehive in the user document to clear activations
      const updateResult = await usersCollection.updateOne(
        { email, "beehives.id": hiveId },
        { $set: { "beehives.$.airPumpActivations": [] } }
      );
      
      console.log("User update result:", updateResult);
      deletionResults.userDocument = updateResult.modifiedCount > 0;
      
      // Try to handle the nested hives structure if it exists
      if (updateResult.modifiedCount === 0) {
        console.log("Trying to clear activations from nested hives structure");
        
        // First find the user document to inspect
        const user = await usersCollection.findOne({ email });
        
        if (user && user.beehives && Array.isArray(user.beehives)) {
          // Find the matching beehive
          const matchingBeehiveIndex = user.beehives.findIndex(beehive => beehive.id === hiveId);
          
          if (matchingBeehiveIndex !== -1 && user.beehives[matchingBeehiveIndex].hives) {
            // Try to update the nested hive
            const nestedHiveIndex = user.beehives[matchingBeehiveIndex].hives.findIndex(h => h.id === hiveId);
            
            if (nestedHiveIndex !== -1) {
              const nestedUpdatePath = `beehives.${matchingBeehiveIndex}.hives.${nestedHiveIndex}.airPumpActivations`;
              
              const nestedUpdateResult = await usersCollection.updateOne(
                { email },
                { $set: { [nestedUpdatePath]: [] } }
              );
              
              console.log("Nested hive update result:", nestedUpdateResult);
              deletionResults.userDocument = nestedUpdateResult.modifiedCount > 0;
            }
          }
        }
      }
    } catch (userError) {
      console.error("Error clearing activations from user document:", userError);
    }
    
    return NextResponse.json({ 
      success: deletionResults.dedicatedCollection || deletionResults.userDocument,
      message: 'Air pump activations cleared successfully',
      details: deletionResults
    });
  } catch (error) {
    console.error('Error clearing air pump activations:', error);
    return NextResponse.json({ 
      error: 'Failed to clear activations',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 