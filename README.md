# Spotify AI Music Discovery

Uma aplicação web que permite descobrir música através de cores, emojis e emoções usando inteligência artificial.

## 🚀 Funcionalidades

- **Autenticação com Spotify**: Login seguro usando OAuth2
- **Mood por Cores**: Cada cor é mapeada para características específicas de áudio
- **Vibes por Emojis**: Use emojis para expressar seus sentimentos musicais
- **IA Emocional**: Descreva suas emoções e deixe a IA interpretar
- **Mood Graph**: Gráfico interativo 2D para definir seu humor musical
- **Geração de Playlists**: Algoritmos avançados para criar playlists personalizadas
- **Integração com Spotify**: Salve suas playlists diretamente no Spotify
- **Preview de Músicas**: Ouça previews das músicas antes de adicionar

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Clean Architecture
- **Database**: MongoDB com Mongoose
- **APIs**: Spotify Web API, Claude AI API
- **Autenticação**: JWT com cookies seguros

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/spotify-ai-music-discovery.git
cd spotify-ai-music-discovery
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis no arquivo `.env.local`:

```env
# Spotify API Configuration
SPOTIFY_CLIENT_ID=seu_spotify_client_id
SPOTIFY_CLIENT_SECRET=seu_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback

# Claude API Configuration
CLAUDE_API_KEY=sua_claude_api_key

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/spotify-ai-music

# Next Auth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_chave_secreta_jwt

# App Configuration
NODE_ENV=development
```

## 🔧 Configuração das APIs

### Spotify API

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie um novo app
3. Anote o **Client ID** e **Client Secret**
4. Adicione `http://localhost:3000/api/auth/spotify/callback` como Redirect URI

### Claude API

1. Acesse [Anthropic Console](https://console.anthropic.com/)
2. Crie uma conta e obtenha sua API key
3. Adicione a chave no arquivo `.env.local`

### MongoDB

Instale o MongoDB localmente ou use MongoDB Atlas:

**Local:**

```bash
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew install mongodb-community

# Windows
# Baixe do site oficial do MongoDB
```

**MongoDB Atlas:**

1. Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Obtenha a connection string e adicione em `MONGODB_URI`

## 🚀 Executar o Projeto

### 1. Inicie o MongoDB (se local)

```bash
mongod
```

### 2. Execute a aplicação

```bash
npm run dev
```

### 3. Acesse a aplicação

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/spotify/         # Autenticação Spotify
│   │   ├── playlists/            # Endpoints de playlists
│   │   └── recommendations/      # Endpoints de recomendações
│   ├── dashboard/                # Página principal
│   ├── login/                    # Página de login
│   └── layout.tsx                # Layout raiz
├── components/                   # Componentes React
│   ├── forms/                    # Formulários e inputs
│   │   ├── ColorPicker.tsx
│   │   ├── EmojiSelector.tsx
│   │   └── MoodGraph.tsx
│   └── playlists/               # Componentes de playlist
│       └── PlaylistGenerator.tsx
├── lib/                         # Lógica de negócio
│   ├── domain/                  # Camada de domínio
│   │   ├── entities/            # Entidades
│   │   └── services/            # Serviços de domínio
│   ├── application/             # Camada de aplicação
│   │   ├── usecases/            # Casos de uso
│   │   ├── dtos/                # DTOs e Commands
│   │   └── services/            # Serviços de aplicação
│   ├── infrastructure/          # Camada de infraestrutura
│   │   ├── external/            # APIs externas
│   │   ├── models/              # Modelos do banco
│   │   └── database/            # Conexão com banco
│   ├── utils/                   # Utilitários
│   └── types/                   # Tipos TypeScript
└── styles/                      # Estilos globais
```

## 🎨 Como Usar

### 1. Faça Login

- Clique em "Entrar com Spotify"
- Autorize a aplicação a acessar sua conta Spotify

### 2. Escolha seu Mood

- **Cores**: Selecione uma cor que representa seu estado de espírito
- **Emojis**: Escolha até 3 emojis que expressam seu humor
- **Emoções**: Descreva em texto como você está se sentindo
- **Mood Graph**: Clique no gráfico para definir seu humor visualmente

### 3. Gere sua Playlist

- Clique em "Gerar Playlist com IA"
- Aguarde a IA processar seu mood e encontrar músicas compatíveis
- Visualize as músicas geradas com características de áudio

### 4. Ouça e Salve

- Clique no botão play para ouvir previews das músicas
- Clique em "Salvar" para adicionar a playlist ao seu Spotify

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes de coverage
npm run test:coverage
```

## 🔍 Mappings Criativos

### Cores → Características de Áudio

- **🔴 Vermelho**: Alta energia, valência positiva, dançante
- **🔵 Azul**: Baixa energia, calmo, acústico
- **🟡 Amarelo**: Muito dançante, alegre, energético
- **🟣 Roxo**: Misterioso, eletrônico, instrumental
- **🟠 Laranja**: Energético, quente, vibrante
- **🟢 Verde**: Equilibrado, natural, harmônico
- **🩷 Rosa**: Romântico, suave, íntimo
- **⚫ Preto**: Intenso, dramático, poderoso

### Emojis → Vibes Musicais

- **💃 Dança**: Alta danceability, energia, valência
- **😭 Tristeza**: Baixa valência, energia, acústico
- **🔥 Intensidade**: Máxima energia, tempo acelerado
- **🌊 Calma**: Fluido, relaxante, acústico
- **⚡ Energia**: Elétrico, vibrante, não-acústico
- **🌙 Noturno**: Sonhador, baixa energia, misterioso

## 🤖 Inteligência Artificial

### Claude AI Integration

A aplicação usa Claude AI para:

- Interpretar descrições emocionais em texto livre
- Converter sentimentos em parâmetros de áudio
- Gerar descrições criativas para playlists
- Melhorar recomendações baseadas em feedback

### Algoritmos de Recomendação

1. **Cálculo de Compatibilidade**: Analisa a proximidade entre características da música e targets do mood
2. **Diversificação**: Garante variedade na playlist mantendo coerência
3. **Balanceamento**: Organiza músicas por fluxo de energia
4. **Análise de Mood**: Identifica características dominantes da playlist

## 🔐 Segurança

- Autenticação OAuth2 com Spotify
- Tokens JWT com expiração automática
- Cookies seguros e HttpOnly
- Validação de entrada em todas as APIs
- Rate limiting nas requisições externas

## 📊 Características de Áudio Analisadas

- **Danceability**: Quão adequada é para dança (0-100%)
- **Energy**: Intensidade e energia percebida (0-100%)
- **Valence**: Positividade musical (0-100%)
- **Acousticness**: Se a música é acústica (0-100%)
- **Instrumentalness**: Se não tem vocais (0-100%)
- **Speechiness**: Presença de palavras faladas (0-100%)
- **Tempo**: Batidas por minuto (60-200 BPM)
- **Loudness**: Volume em decibéis (-60 a 0 dB)

## 🐛 Solução de Problemas

### Erro de Autenticação

- Verifique se as credenciais do Spotify estão corretas
- Confirme se o Redirect URI está configurado corretamente
- Limpe os cookies e tente novamente

### Erro de Conexão com MongoDB

- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env.local`
- Teste a conexão com MongoDB Compass

### Erro na API do Claude

- Verifique se a API key está correta
- Confirme se você tem créditos disponíveis na conta
- Teste com uma requisição simples

### Músicas não carregam

- Verifique sua conexão com a internet
- Confirme se o token do Spotify não expirou
- Teste com diferentes tipos de mood

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se encontrar problemas ou tiver sugestões:

- Abra uma issue no GitHub
- Entre em contato através do email: support@spotify-ai-music.com
- Consulte a documentação detalhada no wiki

## 🎯 Roadmap

- [ ] Suporte a múltiplos idiomas
- [ ] Integração com Apple Music
- [ ] Análise de letras com IA
- [ ] Recomendações baseadas em horário/clima
- [ ] Modo colaborativo para playlists
- [ ] Aplicativo mobile React Native
- [ ] Análise de sentimento em tempo real
- [ ] Integração com redes sociais

---
