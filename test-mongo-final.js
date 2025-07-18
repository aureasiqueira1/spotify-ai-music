const mongoose = require("mongoose");
const dns = require("dns");

// Configurar DNS para resolver o problema
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1", "1.0.0.1"]);

// SUBSTITUA AQUI pela sua senha real do MongoDB Atlas
const NOVA_SENHA = "efkvnBJtUgbEsujx";

// Múltiplas tentativas de connection string
const connectionStrings = [
  // Primeira tentativa: SRV com DNS configurado
  `mongodb+srv://spotifyuser:${NOVA_SENHA}@cluster0.zhjsqdf.mongodb.net/spotify-ai-music?retryWrites=true&w=majority`,

  // Segunda tentativa: SRV com SSL forçado
  `mongodb+srv://spotifyuser:${NOVA_SENHA}@cluster0.zhjsqdf.mongodb.net/spotify-ai-music?ssl=true&retryWrites=true&w=majority&authSource=admin`,

  // Terceira tentativa: Connection string direta (sem SRV)
  `mongodb://spotifyuser:${NOVA_SENHA}@cluster0-shard-00-00.zhjsqdf.mongodb.net:27017,cluster0-shard-00-01.zhjsqdf.mongodb.net:27017,cluster0-shard-00-02.zhjsqdf.mongodb.net:27017/spotify-ai-music?ssl=true&replicaSet=atlas-14hdty-shard-0&authSource=admin&retryWrites=true&w=majority`,
];

const connectionOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4, // Forçar IPv4
  bufferCommands: false,
  maxPoolSize: 10,
  ssl: true,
  sslValidate: false,
  authSource: "admin",
  directConnection: false,
};

async function testConnections() {
  console.log("🔍 Testando múltiplas connection strings...\n");

  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i];
    const method =
      i === 0 ? "SRV com DNS" : i === 1 ? "SRV com SSL" : "Direct Connection";

    console.log(`📝 Tentativa ${i + 1}: ${method}`);

    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      await mongoose.connect(uri, connectionOptions);
      console.log("✅ SUCESSO! Conexão estabelecida com MongoDB Atlas!");
      console.log(`🎯 Connection string funcionando: Método ${i + 1}`);
      console.log(`📋 Use esta URI no seu .env.local:\n`);
      console.log(`MONGODB_URI=${uri}\n`);

      // Testar uma operação básica
      const testCollection = mongoose.connection.db.collection("test");
      await testCollection.insertOne({
        teste: "funcionou",
        timestamp: new Date(),
      });
      console.log("✅ Teste de escrita no banco: OK");

      await mongoose.disconnect();
      process.exit(0);
    } catch (error) {
      console.log(`❌ Falhou: ${error.message}`);
      if (i < connectionStrings.length - 1) {
        console.log("⏳ Tentando próxima opção...\n");
      }
    }
  }

  console.log(
    "\n❌ Todas as tentativas falharam. Vamos tentar soluções alternativas...\n"
  );

  // Tentar resolver DNS manualmente
  console.log("🔍 Tentando resolver DNS manualmente...");
  try {
    const addresses = await dns.promises.resolve4(
      "cluster0.zhjsqdf.mongodb.net"
    );
    console.log("✅ DNS resolvido:", addresses);

    // Tentar connection string com IP direto
    const directIP = addresses[0];
    const directURI = `mongodb://spotifyuser:${NOVA_SENHA}@${directIP}:27017/spotify-ai-music?ssl=true&authSource=admin`;

    console.log("🔄 Tentando conexão direta por IP...");
    await mongoose.connect(directURI, connectionOptions);
    console.log("✅ Conexão por IP funcionou!");
  } catch (dnsError) {
    console.log("❌ DNS resolution failed:", dnsError.message);
  }

  console.log("\n🚨 SOLUÇÕES ALTERNATIVAS:");
  console.log("1. Use hotspot do celular para testar");
  console.log("2. Configure VPN gratuita (ProtonVPN, Windscribe)");
  console.log("3. Tente em outra rede (casa, trabalho)");
  console.log("4. Verifique se firewall/antivírus está bloqueando");

  process.exit(1);
}

// Executar teste
testConnections().catch(console.error);
