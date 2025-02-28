import prisma from '../client.js';

export async function seedHospitals () {
  const hospitals = [
    'SF General',
    'CPMC Van Ness',
    'CPMC Davies',
    'CPMC Mission Bernal',
    'Kaiser SF',
    'St. Francis',
    "St. Mary's",
    'Chinese Hospital',
    'VA Med. Center',
    'UCSF Parnassus',
  ];
  const data = {};
  for (const name of hospitals) {
    data.name = name;
    await prisma.hospital.create({ data });
  }
  console.log('Hospitals seeded successfully');
}
