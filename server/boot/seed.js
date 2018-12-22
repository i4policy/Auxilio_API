const { error } = require("../../common/util");

async function seedCategories(app) {
  const { PostCategory } = app.models;
  const categories = [
    { name: "Infrastructure" },
    { name: "Health" },
    { name: "Other" }
  ];
  for (const category of categories) {
    // eslint-disable-next-line
    await PostCategory.findOrCreate({ name: category.name }, category);
  }
}
async function seedTags(app) {
  const { Tag } = app.models;
  const tags = [
    { name: "Internet" },
    { name: "Social Media" },
    { name: "HIV" },
    { name: "Ebola" },
    { name: "Children" }
  ];
  for (const tag of tags) {
    // eslint-disable-next-line
    await Tag.findOrCreate({ name: tag.name }, tag);
  }
}

async function seedRoles(app) {
  const { UserRole } = app.models;
  const roles = [{ name: "admin" }, { name: "member" }];
  for (const role of roles) {
    // eslint-disable-next-line
    await UserRole.findOrCreate({ where: { name: role.name } }, role);
  }
}

async function seedMembers(app, memberUsers) {
  const { UserAccount, UserRole } = app.models;
  const users = memberUsers;
  if (!users) {
    app.logger.info("member user seed not found");
    return;
  }
  const memberRole = await UserRole.findOne({
    where: { name: "member" }
  });

  if (!memberRole) {
    throw error("Unable to find member role");
  }
  for (const user of users) {
    user.roleId = memberRole.id;
    // eslint-disable-next-line
    await UserAccount.findOrCreate({ where: { email: user.email } }, user);
  }
}
async function seedAdmins(app, adminUsers) {
  const { UserAccount, UserRole } = app.models;
  const users = adminUsers;
  if (!users) {
    app.logger.info("admin user seed not found");
    return;
  }
  const adminRole = await UserRole.findOne({
    where: { name: "admin" }
  });

  if (!adminRole) {
    throw error("Unable to find admin role");
  }
  for (const user of users) {
    user.roleId = adminRole.id;
    // eslint-disable-next-line
    await UserAccount.findOrCreate({ where: { email: user.email } }, user);
  }
}

function loadSeedUsers(app) {
  try {
    // eslint-disable-next-line
    const seed = require("./seed-users.json");
    if (!seed) {
      return null;
    }
    return { adminUsers: seed.adminUsers, memberUsers: seed.memberUsers };
  } catch (err) {
    app.logger.error("Seed users file not found or invalid json ");
    app.logger.error(
      `create seed-users.json file in boot directory and list seed users like the following schema
      {
        'adminUsers':[
          { "fullName": "test", "email": "test@test.com", "password": "test" },
        ],
        'memberRoles':[

        ]
      }
      `
    );
    return null;
  }
}
module.exports = async function(app) {
  app.logger.info("Seeding started");
  await seedRoles(app);
  const users = loadSeedUsers(app);
  if (users) {
    const { adminUsers, memberUsers } = users;
    if (Array.isArray(adminUsers) && adminUsers.length) {
      await seedAdmins(app, adminUsers);
    }
    if (Array.isArray(memberUsers) && memberUsers.length) {
      await seedMembers(app, memberUsers);
    }
  }
  await seedCategories(app);
  await seedTags(app);
  app.logger.info("Seeding complete");
};
