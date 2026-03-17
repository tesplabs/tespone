// RBAC module
const dbDescriptor = require('./db-descriptor');

let options = {};

const accessConfig = {
  Administrator: {
    Full: ['*'],
    'Read-Only': ['home', 'dashboard', 'profile']
  },
  Guest: {
    Full: ['home', 'profile'],
    'Read-Only': ['home']
  }
};

function setOptions(opts) {
  options = opts || {};
}

function build(app, db) {
  // GET /rs/AccessControl?user=admin&page=home
  app.get('/rs/AccessControl', (req, res) => {
    const { user, page } = req.query;
    const roles = getUserRoles(db, user);
    let access = 'None';
    for (const role of roles) {
      for (const level in accessConfig[role] || {}) {
        if (accessConfig[role][level].includes('*') || accessConfig[role][level].includes(page)) {
          access = level;
          if (level === 'Full') break;
        }
      }
    }
    res.json({ user, page, access });
  });

  // GET /rs/MyProfile?user=admin
  app.get('/rs/MyProfile', (req, res) => {
    const { user } = req.query;
    const profile = db.Users.find(u => u.UserName === user);
    if (!profile) return res.status(404).json({ error: 'User not found' });
    res.json(profile);
  });

  // PUT /rs/MyProfile?user=admin
  app.put('/rs/MyProfile', (req, res) => {
    const { user } = req.query;
    const { Password } = req.body;
    const profile = db.Users.find(u => u.UserName === user);
    if (!profile) return res.status(404).json({ error: 'User not found' });
    if (Password) profile.Password = Password;
    res.json(profile);
  });

  // GET /rs/UserProfile;UserName=:UserName/assoc
  app.get('/rs/UserProfile;UserName=:UserName/assoc', (req, res) => {
    const { UserName } = req.params;
    const roles = db.UserProfilesRoles.filter(r => r.UserName === UserName).map(r => r.RoleName);
    res.json({ UserName, roles });
  });

  // GET /rs/UserProfileRole/instances
  app.get('/rs/UserProfileRole/instances', (req, res) => {
    res.json(db.UserProfilesRoles);
  });

  // POST /rs/UserProfileRole/instances
  app.post('/rs/UserProfileRole/instances', (req, res) => {
    const { UserName, RoleName } = req.body;
    if (!UserName || !RoleName) return res.status(400).json({ error: 'Missing UserName or RoleName' });
    if (db.UserProfilesRoles.find(r => r.UserName === UserName && r.RoleName === RoleName)) {
      return res.status(409).json({ error: 'Association already exists' });
    }
    db.UserProfilesRoles.push({ UserName, RoleName });
    res.status(201).json({ UserName, RoleName });
  });

  // DELETE /rs/UserProfileRole/instances
  app.delete('/rs/UserProfileRole/instances', (req, res) => {
    const { UserName, RoleName } = req.body;
    const idx = db.UserProfilesRoles.findIndex(r => r.UserName === UserName && r.RoleName === RoleName);
    if (idx === -1) return res.status(404).json({ error: 'Association not found' });
    db.UserProfilesRoles.splice(idx, 1);
    res.status(204).send();
  });

  // GET /rs/UserProfileRole;Source=:Source;Target=:Target
  app.get('/rs/UserProfileRole;Source=:Source;Target=:Target', (req, res) => {
    const { Source, Target } = req.params;
    const assoc = db.UserProfilesRoles.find(r => r.UserName === Source && r.RoleName === Target);
    if (!assoc) return res.status(404).json({ error: 'Association not found' });
    res.json(assoc);
  });

  // POST /rs/UserProfileRole;Source=:Source;Target=:Target
  app.post('/rs/UserProfileRole;Source=:Source;Target=:Target', (req, res) => {
    const { Source, Target } = req.params;
    if (db.UserProfilesRoles.find(r => r.UserName === Source && r.RoleName === Target)) {
      return res.status(409).json({ error: 'Association already exists' });
    }
    db.UserProfilesRoles.push({ UserName: Source, RoleName: Target });
    res.status(201).json({ UserName: Source, RoleName: Target });
  });

  // DELETE /rs/UserProfileRole;Source=:Source;Target=:Target
  app.delete('/rs/UserProfileRole;Source=:Source;Target=:Target', (req, res) => {
    const { Source, Target } = req.params;
    const idx = db.UserProfilesRoles.findIndex(r => r.UserName === Source && r.RoleName === Target);
    if (idx === -1) return res.status(404).json({ error: 'Association not found' });
    db.UserProfilesRoles.splice(idx, 1);
    res.status(204).send();
  });
}

// Helper functions
function getUserRoles(db, userName) {
  return db.UserProfilesRoles.filter(r => r.UserName === userName).map(r => r.RoleName);
}

module.exports = {
  setOptions,
  build
};
