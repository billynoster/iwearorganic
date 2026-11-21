const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const newRule = `
    match /videos/{videoId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.authorId == request.auth.uid;
      allow update, delete: if isAuthenticated() && (request.auth.uid == resource.data.authorId || isAdmin());
    }
    match /creators/{creatorId} {
      allow read: if true;
      allow write: if isOwner(creatorId) || isAdmin();
    }
`;

code = code.replace(
  `    match /reviews/{reviewId} {`,
  `${newRule}\n    match /reviews/{reviewId} {`
);

fs.writeFileSync('firestore.rules', code);
