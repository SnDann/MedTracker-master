# MedTracker - Gerenciador de Medicamentos

## Descrição
MedTracker é um aplicativo móvel desenvolvido com React Native e Expo para ajudar usuários a gerenciar seus medicamentos e horários de dosagem.

## Tecnologias Utilizadas
- React Native
- Expo
- TypeScript
- Supabase (Autenticação e Banco de Dados)
- React Navigation
- Expo Camera
- React Native Paper
- Expo Text Recognition (OCR)

## Funcionalidades
- Autenticação de usuários
- Gerenciamento de medicamentos
- Agendamento de horários
- Notificações de lembretes
- Câmera para escanear receitas (com OCR)
- Exportação e importação de dados
- Configurações personalizadas

## Novidades
- **Exportação/Importação:** Faça backup ou restaure seus medicamentos em formato JSON.
- **OCR de Receitas:** Extraia automaticamente o texto de receitas médicas usando a câmera.

## Como Usar as Novas Funcionalidades

### Exportar Dados
1. Acesse o menu de configurações.
2. Toque em "Exportar Dados".
3. Compartilhe ou salve o arquivo JSON gerado.

### Importar Dados
1. Acesse o menu de configurações.
2. Toque em "Importar Dados".
3. Selecione um arquivo JSON exportado anteriormente.

#### Exemplo de arquivo de exportação
```json
[
  {
    "id": "1",
    "name": "Losartana",
    "dosage": "50mg",
    "notes": "Tomar após o café da manhã",
    "days": [1,3,5],
    "times": ["08:00", "20:00"],
    "taken": {}
  }
]
```

### OCR de Receitas
1. Acesse a aba "Receita".
2. Fotografe ou selecione uma imagem da receita.
3. O texto será extraído automaticamente e exibido antes de salvar.

## FAQ
- **Posso importar dados de outro app?**
  - Sim, desde que o arquivo esteja no formato JSON exportado pelo MedTracker.
- **O OCR funciona offline?**
  - Sim, o reconhecimento de texto é feito localmente no dispositivo.
- **Meus dados estão seguros?**
  - Sim, utilizamos Supabase e criptografia para proteger suas informações.

## Política de Privacidade (Resumo)
- Seus dados de saúde são armazenados de forma segura e nunca são compartilhados com terceiros.
- O texto extraído de receitas é salvo apenas na sua conta.
- Você pode exportar ou excluir seus dados a qualquer momento.

Para mais detalhes, consulte o arquivo `PRIVACY.md`.

## Configuração do Ambiente

### Pré-requisitos
- Node.js (versão LTS)
- npm ou yarn
- Expo CLI
- Supabase CLI (opcional, para desenvolvimento local)

### Instalação
1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd medication-manager
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Inicie o projeto:
```bash
npm run dev
```

## Estrutura do Projeto
```
medication-manager/
├── app/                    # Diretório principal da aplicação
│   ├── (tabs)/            # Telas principais (tabs)
│   ├── _layout.tsx        # Layout principal
│   └── +not-found.tsx     # Página 404
├── src/
│   ├── components/        # Componentes reutilizáveis
│   ├── lib/              # Utilitários e configurações
│   └── types/            # Definições de tipos TypeScript
├── supabase/             # Configurações e funções do Supabase
└── assets/              # Recursos estáticos
```

## Desenvolvimento

### Scripts Disponíveis
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a build de produção
- `npm run lint`: Executa o linter
- `npm run type-check`: Verifica os tipos TypeScript

### Convenções de Código
- Utilizamos TypeScript para tipagem estática
- Seguimos o padrão de componentes funcionais com hooks
- Utilizamos o sistema de navegação do Expo Router
- Implementamos autenticação via Supabase

## Contribuição

Consulte `CONTRIBUTING.md` para diretrizes de contribuição — **não são permitidas referências a IA nem emojis em docs/PRs**.

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Suporte
Para suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento. 