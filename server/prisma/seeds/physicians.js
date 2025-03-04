import prisma from '../client.js';

export async function seedPhysician (first, last, hospitalName) {
  const data = {};
  data.firstName = first;
  data.lastName = last;
  data.email = `dr.${first}.${last}@test.com`;
  const hospital = await prisma.hospital.findUnique({
    where: {
      name: hospitalName,
    },
  });

  data.hospitals = {
    connect: {
      id: hospital.id,
    },
  };

  await prisma.physician.create({ data });
}

export async function seedPhysicians () {
  const physicians = ['John Smith', 'Jane Smith', 'Bob Smith', 'Alice Smith'];

  const hospitals = ['SF General', 'SF General', 'Kaiser SF', 'UCSF Parnassus'];
  const seedPromises = physicians.map((name, index) => {
    const tuple = name.split(' ');
    return seedPhysician(
      tuple[0],
      tuple[1],
      hospitals[index % hospitals.length]
    );
  });

  await Promise.all(seedPromises);
  console.log('Seeded multiple physicians successfully');
}
