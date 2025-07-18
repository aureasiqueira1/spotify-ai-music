const mongoose = require("mongoose");

// SUBSTITUA pela sua senha real do MongoDB Atlas
const SENHA = "efkvnBJtUgbEsujx";

const uri = `mongodb+srv://spotifyuser:${SENHA}@cluster0.zhjsqdf.mongodb.net/spotify-ai-music?retryWrites=true&w=majority`;

console.log("🔗 Tentando conectar ao MongoDB Atlas...");

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    family: 4,
  })
  .then(() => {
    console.log("✅ SUCESSO! Conectado ao MongoDB Atlas!");
    console.log("📋 Sua connection string funciona!");
    console.log(`\n📝 Adicione isto no seu .env.local:`);
    console.log(`MONGODB_URI=${uri}\n`);

    // Teste básico
    const testCollection = mongoose.connection.db.collection("test");
    return testCollection.insertOne({ teste: "funcionou", data: new Date() });
  })
  .then(() => {
    console.log("✅ Teste de escrita no banco: OK");
    console.log("🎉 MongoDB Atlas está funcionando perfeitamente!");
    process.exit(0);
  })
  .catch((err) => {
    console.log("❌ Erro:", err.message);

    if (err.message.includes("ETIMEOUT") || err.message.includes("ENODATA")) {
      console.log("\n🚨 PROBLEMA DE DNS/REDE DETECTADO");
      console.log(
        "🔍 Parece que sua operadora móvel também está bloqueando MongoDB"
      );
      console.log("\n💡 PRÓXIMAS TENTATIVAS:");
      console.log("1. 🌐 Use VPN gratuita (ProtonVPN, Windscribe)");
      console.log(
        "2. 📡 Tente em rede Wi-Fi diferente (casa de amigo, trabalho)"
      );
      console.log(
        "3. 🏢 Se estiver em empresa, fale com TI sobre MongoDB Atlas"
      );
    } else if (err.message.includes("authentication failed")) {
      console.log("\n🔑 PROBLEMA DE AUTENTICAÇÃO");
      console.log("1. Verifique se a senha está correta no MongoDB Atlas");
      console.log("2. Vá em Database Access → Edit User → Gerar nova senha");
    }

    process.exit(1);
  });
