const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "Die ID von dem Account der Adminw erden soll."; // 🔁 <-- WICHTIG

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Benutzer ${uid} ist jetzt Admin`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fehler beim Setzen des Admin-Claims:", error);
    process.exit(1);
  });
