Setup rápido do projeto (Windows / dev)

Requisitos
- Node 18.x (recomendado via nvm-windows)
- npm (vem com Node)
- Para Windows: Visual Studio Build Tools (apenas se instalar dependências nativas como `sharp`)

Instalação (recomendado - nvm-windows)
1. Baixe e instale NVM for Windows: https://github.com/coreybutler/nvm-windows/releases
2. Abra um PowerShell (feche e reabra após instalação) e rode:
   - `nvm install 18`
   - `nvm use 18`
3. Verifique:
   - `node -v` (deve mostrar v18.x.x)
   - `npm -v`

Alternativa rápida (winget)
- `winget install --id OpenJS.NodeJS.LTS -e`

Instalar dependências do projeto
1. `cd MedTracker-master`
2. `npm ci`

Checagens locais (após instalar dependências)
- `npx tsc --noEmit` — verificação de tipos
- `npm run lint` — lint
- `npm test` — testes

Dev-scripts (pipelines de imagens)
- Instalar dependências dos scripts: `npm run bootstrap-dev-scripts`
- Gerar ícones (executa em `dev-scripts` com `sharp`): `npm run generate-icons`
- Criar ícone temporário: `npm run create-temp-icon`

Scripts para assets e ícones (antigos, mantidos como wrapper)
- `npm run create-temp-icon` — cria um icon temporário usando `sharp` (opcional)
- `npm run generate-icons` — gera ícones a partir de `assets/images/icon.png`

Notas sobre dependências nativas
- `sharp` foi movido para `devDependencies` e os scripts de ícones agora são opcionais se `sharp` não estiver instalado.
- Se `sharp` falhar em `npm ci`, instale as Visual Studio Build Tools ou siga as instruções de instalação do `sharp` (libvips). Em ambientes CI, prefira não executar `generate-icons` automaticamente.

Configuração do Expo/Native
- `expo-text-recognition` é uma dependência nativa que requer configuração com o SDK do Expo (ver docs do expo).

Sugestões de performance (resumo)
- Migrar OCR para uma solução em nuvem (API) ou usar Tesseract.js com carga sob demanda
- Mover pipelines de imagem para jobs off-line (serverless) para reduzir dependências nativas no app

Se precisar, posso gerar scripts automáticos para preparar ambiente ou criar um container de desenvolvimento para padronizar builds.