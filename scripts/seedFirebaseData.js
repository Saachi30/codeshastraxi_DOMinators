// scripts/seedFirebaseData.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read the service account file
const serviceAccountPath = join(__dirname, 'firebase-service-account.json');
let serviceAccount;

try {
  const data = await readFile(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(data);
} catch (error) {
  console.error(`Error reading service account file: ${error.message}`);
  console.error(`Make sure you've placed the firebase-service-account.json file in the scripts directory.`);
  process.exit(1);
}

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Seed dummy data
async function seedData() {
  try {
    // Create dummy users
    const users = [
      {
        id: 'user1',
        name: 'Rajesh Kumar',
        phoneNumber: '8369978723',
        address: 'Village Sundarpur, District Mehsana',
        voterId: 'UTH4567890',
        pollingCenterId: 'center1',
        createdAt: FieldValue.serverTimestamp()
      },
      {
        id: 'user2',
        name: 'Priya Singh',
        phoneNumber: '9876543211',
        address: 'Village Chandpur, District Patan',
        voterId: 'UTH4567891',
        pollingCenterId: 'center2',
        createdAt: FieldValue.serverTimestamp()
      }
    ];

    // Create dummy polling centers
    const pollingCenters = [
      {
        id: 'center1',
        name: 'Sundarpur Primary School',
        address: 'Near Village Panchayat, Sundarpur',
        district: 'Mehsana',
        openTime: '8:00 AM',
        closeTime: '6:00 PM',
        coordinates: {
          latitude: 23.4567,
          longitude: 72.8765
        }
      },
      {
        id: 'center2',
        name: 'Chandpur Community Hall',
        address: 'Main Road, Chandpur',
        district: 'Patan',
        openTime: '8:00 AM',
        closeTime: '6:00 PM',
        coordinates: {
          latitude: 23.7890,
          longitude: 72.5432
        }
      }
    ];

    // Create dummy elections
    const elections = [
      {
        id: 'election1',
        name: 'Gram Panchayat Election 2025',
        type: 'local',
        date: 'May 15, 2025',
        startTime: '8:00 AM',
        endTime: '6:00 PM',
        isActive: true,
        candidates: [
          { id: 'candidate1', name: 'Mohan Patel', party: 'Independent' },
          { id: 'candidate2', name: 'Lata Sharma', party: 'Independent' }
        ]
      },
      {
        id: 'election2',
        name: 'District Council Election 2025',
        type: 'district',
        date: 'June 10, 2025',
        startTime: '8:00 AM',
        endTime: '6:00 PM',
        isActive: true,
        candidates: [
          { id: 'candidate3', name: 'Ramesh Joshi', party: 'Party A' },
          { id: 'candidate4', name: 'Sunita Verma', party: 'Party B' }
        ]
      }
    ];

    // Batch write users
    const usersRef = db.collection('users');
    for (const user of users) {
      const { id, ...userData } = user;
      await usersRef.doc(id).set(userData);
    }

    // Batch write polling centers
    const centersRef = db.collection('pollingCenters');
    for (const center of pollingCenters) {
      const { id, ...centerData } = center;
      await centersRef.doc(id).set(centerData);
    }

    // Batch write elections
    const electionsRef = db.collection('elections');
    for (const election of elections) {
      const { id, ...electionData } = election;
      await electionsRef.doc(id).set(electionData);
    }

    console.log('Seed data successfully added to Firestore!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });